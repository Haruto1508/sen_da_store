package com.succulentshop.backend;

import com.succulentshop.backend.service.otp.OtpStore;
import com.succulentshop.backend.service.otp.RedisOtpStore;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

public class RedisOtpStoreTest {

    private OtpStore otpStore;
    private final String testEmail = "test_redis@senxinh.vn";

    @BeforeEach
    void setUp() {
        // Khởi tạo RedisOtpStore không có RedisTemplate để test cơ chế In-Memory Fallback
        otpStore = new RedisOtpStore();
    }

    @Test
    @DisplayName("Lưu và lấy mã OTP thành công")
    void testSaveAndGetOtp() {
        otpStore.saveOtp(testEmail, "123456", 120);

        Assertions.assertTrue(otpStore.exists(testEmail));
        Assertions.assertEquals("123456", otpStore.getOtp(testEmail));
    }

    @Test
    @DisplayName("Kiểm tra thời gian cooldown chống spam yêu cầu OTP")
    void testCooldownCheck() {
        otpStore.saveOtp(testEmail, "888999", 120);
        otpStore.setCooldown(testEmail, 60);

        long remaining = otpStore.getCooldownSecondsRemaining(testEmail, 60);
        Assertions.assertTrue(remaining > 0 && remaining <= 60,
                "Thời gian cooldown còn lại phải nằm trong khoảng (0, 60]");
    }

    @Test
    @DisplayName("Tăng số lần thử sai OTP theo từng lần")
    void testIncrementFailedAttempts() {
        otpStore.saveOtp(testEmail, "654321", 120);

        int attempt1 = otpStore.incrementFailedAttempts(testEmail, 120);
        int attempt2 = otpStore.incrementFailedAttempts(testEmail, 120);
        int attempt3 = otpStore.incrementFailedAttempts(testEmail, 120);

        Assertions.assertEquals(1, attempt1);
        Assertions.assertEquals(2, attempt2);
        Assertions.assertEquals(3, attempt3);
    }

    @Test
    @DisplayName("Xóa OTP sau khi hoàn tất xác thực")
    void testRemoveOtp() {
        otpStore.saveOtp(testEmail, "999111", 120);
        Assertions.assertTrue(otpStore.exists(testEmail));

        otpStore.removeOtp(testEmail);
        Assertions.assertNull(otpStore.getOtp(testEmail));
        Assertions.assertFalse(otpStore.exists(testEmail));
    }
}
