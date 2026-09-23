package com.succulentshop.backend.service;

import com.succulentshop.backend.dto.OtpConfigDto;
import com.succulentshop.backend.dto.SendOtpResponse;
import com.succulentshop.backend.exception.AppException;
import com.succulentshop.backend.exception.ErrorCode;
import com.succulentshop.backend.service.otp.OtpStore;
import com.succulentshop.backend.service.otp.RedisOtpStore;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Random;

/**
 * Quản lý toàn bộ lifecycle của mã OTP:
 * <ul>
 *   <li>Gửi và lưu trữ mã OTP</li>
 *   <li>Xác thực mã OTP đầu vào</li>
 *   <li>Cấu hình thông số OTP (Admin)</li>
 * </ul>
 */
@Service
public class OtpService {

    private static final Logger log = LoggerFactory.getLogger(OtpService.class);

    // =========================================================================
    // Fields
    // =========================================================================

    private final OtpStore otpStore;
    private final EmailService emailService;

    /** Cấu hình OTP linh hoạt – có thể chỉnh qua Admin Panel */
    private volatile int otpExpirySeconds   = 120;  // Mặc định 2 phút
    private volatile int otpCooldownSeconds = 60;   // Mặc định 60 giây chống spam
    private volatile int maxFailedAttempts  = 5;    // Tối đa 5 lần thử sai

    // =========================================================================
    // Constructors
    // =========================================================================

    @Autowired
    public OtpService(@Autowired(required = false) OtpStore otpStore,
                      @Autowired(required = false) EmailService emailService) {
        this.otpStore     = otpStore != null ? otpStore : new RedisOtpStore();
        this.emailService = emailService;
    }

    // =========================================================================
    // Public API – Gửi OTP
    // =========================================================================

    /**
     * Tạo và gửi mã OTP 6 số về email của người dùng.
     * <p>Áp dụng cooldown chống spam và thời gian hiệu lực theo cấu hình Admin.</p>
     *
     * @param email địa chỉ email nhận mã OTP
     * @return thông tin kết quả gửi OTP
     */
    public SendOtpResponse sendOtp(String email) {
        if (email == null || email.isBlank()) {
            throw new AppException(ErrorCode.REQUIRED_FIELD_MISSING, "Vui lòng nhập email để nhận mã xác thực OTP");
        }
        String cleanEmail = email.trim().toLowerCase();

        long waitSeconds = otpStore.getCooldownSecondsRemaining(cleanEmail, otpCooldownSeconds);
        if (waitSeconds > 0) {
            throw new AppException(
                ErrorCode.OTP_COOLDOWN,
                "Bạn đang gửi yêu cầu quá nhanh. Vui lòng đợi " + waitSeconds + " giây trước khi yêu cầu mã mới!"
            );
        }

        String otpCode = String.format("%06d", new Random().nextInt(999999));
        otpStore.saveOtp(cleanEmail, otpCode, otpExpirySeconds);
        otpStore.setCooldown(cleanEmail, otpCooldownSeconds);
        log.info("🔑 [SEN XINH OTP] Mã xác thực OTP cho [{}]: {} (Hiệu lực {} giây)",
                cleanEmail, otpCode, otpExpirySeconds);

        if (emailService != null) {
            emailService.sendOtpEmail(cleanEmail, otpCode, otpExpirySeconds);
        }

        String expiryDesc = (otpExpirySeconds % 60 == 0)
                ? (otpExpirySeconds / 60) + " phút"
                : otpExpirySeconds + " giây";
        String message = "Mã xác thực OTP gồm 6 chữ số (hiệu lực " + expiryDesc + ") đã được gửi đến "
                + cleanEmail + ". Quý khách vui lòng kiểm tra hộp thư!";

        return new SendOtpResponse(true, message, cleanEmail, otpExpirySeconds, null);
    }

    // =========================================================================
    // Public API – Xác thực OTP
    // =========================================================================

    /**
     * Xác thực mã OTP người dùng nhập vào.
     * <p>Tự động xóa mã sau khi xác thực thành công.
     * Hủy mã ngay khi vượt quá số lần thử sai cho phép.</p>
     *
     * @param email    email tương ứng với mã OTP
     * @param otpInput mã OTP người dùng nhập
     * @throws AppException nếu OTP không hợp lệ, hết hạn hoặc vượt số lần thử
     */
    public void verifyOtp(String email, String otpInput) {
        if (otpInput == null || otpInput.isBlank()) {
            throw new AppException(ErrorCode.INVALID_OTP, "Vui lòng nhập mã OTP xác thực");
        }
        String cleanEmail = email.trim().toLowerCase();
        String currentOtp = otpStore.getOtp(cleanEmail);
        if (currentOtp == null) {
            throw new AppException(ErrorCode.INVALID_OTP,
                    "Mã OTP chưa được yêu cầu hoặc đã hết hạn. Vui lòng nhấn gửi lại mã!");
        }

        if (!currentOtp.equals(otpInput.trim())) {
            int currentFailures = otpStore.incrementFailedAttempts(cleanEmail, otpExpirySeconds);
            int remaining = maxFailedAttempts - currentFailures;

            if (remaining <= 0) {
                otpStore.removeOtp(cleanEmail);
                throw new AppException(
                    ErrorCode.OTP_MAX_ATTEMPTS_EXCEEDED,
                    "Bạn đã nhập sai mã OTP quá " + maxFailedAttempts
                            + " lần. Mã đã bị hủy để đảm bảo an toàn. Vui lòng yêu cầu mã mới!"
                );
            }

            throw new AppException(ErrorCode.INVALID_OTP,
                    "Mã OTP không chính xác. Bạn còn " + remaining + " lần thử lại!");
        }

        otpStore.removeOtp(cleanEmail);
    }

    // =========================================================================
    // Public API – Cấu hình OTP (Admin)
    // =========================================================================

    /**
     * Trả về cấu hình OTP hiện tại (thời gian hiệu lực, cooldown, số lần thử sai tối đa).
     */
    public OtpConfigDto getConfig() {
        return new OtpConfigDto(otpExpirySeconds, otpCooldownSeconds, maxFailedAttempts);
    }

    /**
     * Cập nhật cấu hình OTP từ Admin Panel.
     * <p>Chỉ áp dụng giá trị nằm trong giới hạn hợp lệ; bỏ qua giá trị ngoài khoảng.</p>
     *
     * @param dto cấu hình mới cần áp dụng
     * @return cấu hình OTP sau khi cập nhật
     */
    public OtpConfigDto updateConfig(OtpConfigDto dto) {
        if (dto != null) {
            if (dto.getExpirySeconds() >= 30 && dto.getExpirySeconds() <= 1800) {
                this.otpExpirySeconds = dto.getExpirySeconds();
            }
            if (dto.getCooldownSeconds() >= 10 && dto.getCooldownSeconds() <= 600) {
                this.otpCooldownSeconds = dto.getCooldownSeconds();
            }
            if (dto.getMaxFailedAttempts() >= 1 && dto.getMaxFailedAttempts() <= 20) {
                this.maxFailedAttempts = dto.getMaxFailedAttempts();
            }
        }
        log.info("⚙️ [CẤU HÌNH OTP] Đã cập nhật: Hiệu lực = {}s, Cooldown = {}s, Max sai = {} lần",
                otpExpirySeconds, otpCooldownSeconds, maxFailedAttempts);
        return getConfig();
    }
}
