package com.succulentshop.backend;

import com.succulentshop.backend.dto.AuthResponse;
import com.succulentshop.backend.entity.User;
import com.succulentshop.backend.exception.AppException;
import com.succulentshop.backend.exception.ErrorCode;
import com.succulentshop.backend.repository.UserRepository;
import com.succulentshop.backend.service.AuthService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
public class EmailPasswordlessAuthTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Test
    @DisplayName("Đăng nhập email mới: Tự động khởi tạo tài khoản qua OTP và đăng nhập thành công")
    public void testEmailLoginAutoRegistersNewUser() {
        String testEmail = "new_customer_" + System.currentTimeMillis() + "@gmail.com";
        authService.sendOtp(testEmail);
        String otp = authService.getOtpForTesting(testEmail);

        AuthResponse result = authService.login(testEmail, null, otp);
        Assertions.assertNotNull(result);
        Assertions.assertNotNull(result.getUser());
        Assertions.assertNotNull(result.getToken());

        User createdUser = userRepository.findByEmail(testEmail).orElseThrow();
        Assertions.assertEquals(testEmail, createdUser.getEmail());
        Assertions.assertNull(createdUser.getPassword(), "Mật khẩu phải là null");
        Assertions.assertEquals("EMAIL", createdUser.getAuthProvider());
        Assertions.assertEquals(50, createdUser.getPoints());
    }

    @Test
    @DisplayName("Đăng nhập email đã có: Đăng nhập thành công qua OTP không cần mật khẩu")
    public void testExistingUserLoginDirectly() {
        String testEmail = "existing_user_" + System.currentTimeMillis() + "@gmail.com";
        User user = new User("Khách Thân Thiết", testEmail, "0911222333", null, "Hà Nội", "Thành viên thân thiết", null, 100);
        userRepository.save(user);

        authService.sendOtp(testEmail);
        String otp = authService.getOtpForTesting(testEmail);

        AuthResponse result = authService.login(testEmail, null, otp);
        Assertions.assertNotNull(result);

        Assertions.assertEquals(testEmail, result.getUser().getEmail());
        Assertions.assertEquals("Khách Thân Thiết", result.getUser().getName());
    }

    @Test
    @DisplayName("Đăng ký tài khoản không cần mật khẩu")
    public void testRegisterWithoutPassword() {
        String testEmail = "reg_user_" + System.currentTimeMillis() + "@gmail.com";

        AuthResponse registerResult = authService.register(
                "Đặng Thu Thảo",
                testEmail,
                "0988777666",
                "Đà Nẵng"
        );

        Assertions.assertNotNull(registerResult);
        User user = userRepository.findByEmail(testEmail).orElseThrow();
        Assertions.assertNull(user.getPassword(), "Mật khẩu phải là null");
        Assertions.assertEquals("Đặng Thu Thảo", user.getName());
    }

    @Test
    @DisplayName("Tài khoản bị cấm hoặc đã xóa: Đăng nhập bị từ chối")
    public void testBannedOrDeletedUserRejected() {
        String bannedEmail = "banned_" + System.currentTimeMillis() + "@gmail.com";
        User bannedUser = new User("User Banned", bannedEmail, "", null, null, "Thành viên mới", null, 0);
        bannedUser.setStatus("BANNED");
        userRepository.save(bannedUser);

        authService.sendOtp(bannedEmail);
        String otp = authService.getOtpForTesting(bannedEmail);

        AppException ex = Assertions.assertThrows(AppException.class, () -> {
            authService.login(bannedEmail, null, otp);
        });
        Assertions.assertEquals(ErrorCode.ACCOUNT_DISABLED, ex.getErrorCode());
    }

    @Test
    @DisplayName("Chống spam: Yêu cầu OTP liên tiếp trong vòng 60s bị chặn bởi OTP_COOLDOWN")
    public void testSendOtpCooldown60s() {
        String testEmail = "spam_test_" + System.currentTimeMillis() + "@gmail.com";
        authService.sendOtp(testEmail);

        AppException ex = Assertions.assertThrows(AppException.class, () -> {
            authService.sendOtp(testEmail);
        });
        Assertions.assertEquals(ErrorCode.OTP_COOLDOWN, ex.getErrorCode());
    }

    @Test
    @DisplayName("Chống dò mã: Nhập sai OTP quá 5 lần sẽ bị hủy mã với OTP_MAX_ATTEMPTS_EXCEEDED")
    public void testMax5FailedAttemptsInvalidatesOtp() {
        String testEmail = "attempts_test_" + System.currentTimeMillis() + "@gmail.com";
        authService.sendOtp(testEmail);

        // 4 lần đầu nhập sai
        for (int i = 1; i <= 4; i++) {
            final int attempt = i;
            AppException ex = Assertions.assertThrows(AppException.class, () -> {
                authService.login(testEmail, null, "00000" + attempt);
            });
            Assertions.assertEquals(ErrorCode.INVALID_OTP, ex.getErrorCode());
            Assertions.assertTrue(ex.getMessage().contains("lần thử lại"));
        }

        // Lần thứ 5 nhập sai -> Hủy mã
        AppException finalEx = Assertions.assertThrows(AppException.class, () -> {
            authService.login(testEmail, null, "999999");
        });
        Assertions.assertEquals(ErrorCode.OTP_MAX_ATTEMPTS_EXCEEDED, finalEx.getErrorCode());

        // Lần tiếp theo gọi verify -> Báo mã chưa được yêu cầu hoặc đã hết hạn
        AppException notFoundEx = Assertions.assertThrows(AppException.class, () -> {
            authService.login(testEmail, null, "123456");
        });
        Assertions.assertEquals(ErrorCode.INVALID_OTP, notFoundEx.getErrorCode());
    }
}
