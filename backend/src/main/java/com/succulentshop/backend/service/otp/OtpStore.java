package com.succulentshop.backend.service.otp;

public interface OtpStore {

    /**
     * Lưu mã OTP mới với thời gian hết hạn (giây)
     */
    void saveOtp(String email, String code, int expirySeconds);

    /**
     * Lấy mã OTP hiện tại (phục vụ xác thực hoặc test)
     */
    String getOtp(String email);

    /**
     * Kiểm tra thời gian cooldown chống spam.
     * @return số giây còn lại phải chờ nếu đang trong thời gian cooldown, 0 nếu không bị chặn.
     */
    long getCooldownSecondsRemaining(String email, int cooldownSeconds);

    /**
     * Đánh dấu mốc cooldown cho email
     */
    void setCooldown(String email, int cooldownSeconds);

    /**
     * Tăng số lần nhập sai OTP
     * @return tổng số lần nhập sai hiện tại
     */
    int incrementFailedAttempts(String email, int expirySeconds);

    /**
     * Xóa mã OTP và các dữ liệu liên quan
     */
    void removeOtp(String email);

    /**
     * Kiểm tra xem mã OTP của email có tồn tại không
     */
    boolean exists(String email);
}
