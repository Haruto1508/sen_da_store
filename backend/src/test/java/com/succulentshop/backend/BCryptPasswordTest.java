package com.succulentshop.backend;

import com.succulentshop.backend.dto.RegisterRequest;
import com.succulentshop.backend.dto.SetPasswordRequest;
import com.succulentshop.backend.entity.User;
import com.succulentshop.backend.exception.AppException;
import com.succulentshop.backend.exception.ErrorCode;
import com.succulentshop.backend.repository.UserRepository;
import com.succulentshop.backend.service.AuthService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@SpringBootTest
@Transactional
public class BCryptPasswordTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    public void testRegisterHashesWithBCrypt() {
        String testEmail = "bcrypt_test_" + System.currentTimeMillis() + "@gmail.com";
        String rawPassword = "mySecurePassword123";

        Map<String, Object> registerResult = authService.register(
                "Test User",
                testEmail,
                "0911222333",
                rawPassword,
                "Hanoi"
        );

        Assertions.assertNotNull(registerResult);
        User user = userRepository.findByEmail(testEmail).orElseThrow();

        // 1. Password must NOT be plaintext
        Assertions.assertNotEquals(rawPassword, user.getPassword());

        // 2. Password must start with $2a$ or $2b$ (BCrypt prefix)
        Assertions.assertTrue(user.getPassword().startsWith("$2a$") || user.getPassword().startsWith("$2b$"),
                "Mật khẩu phải được lưu dưới dạng mã băm BCrypt ($2a$ / $2b$)");

        // 3. PasswordEncoder must match raw password against stored hash
        Assertions.assertTrue(passwordEncoder.matches(rawPassword, user.getPassword()));

        // 4. Login must succeed with raw password
        Map<String, Object> loginResult = authService.login(testEmail, rawPassword);
        Assertions.assertNotNull(loginResult);
    }

    @Test
    public void testSetPasswordHashesWithBCrypt() {
        String testEmail = "google_user_" + System.currentTimeMillis() + "@gmail.com";
        User googleUser = new User("Google User", testEmail, "", null, null, "Thành viên mới", null, 0);
        googleUser.setAuthProvider("GOOGLE");
        googleUser = userRepository.save(googleUser);

        // Ban đầu password là null
        Assertions.assertNull(googleUser.getPassword());

        // Thử đăng nhập bằng email/password khi chưa set password -> Phải ném PASSWORD_NOT_SET
        AppException ex = Assertions.assertThrows(AppException.class, () -> {
            authService.login(testEmail, "123456");
        });
        Assertions.assertEquals(ErrorCode.PASSWORD_NOT_SET, ex.getErrorCode());

        // Set password mới
        String rawPassword = "newPassword999";
        SetPasswordRequest req = new SetPasswordRequest(testEmail, rawPassword);
        authService.setPassword(req, null);

        User updatedUser = userRepository.findByEmail(testEmail).orElseThrow();

        // Password phải là BCrypt hash
        Assertions.assertNotEquals(rawPassword, updatedUser.getPassword());
        Assertions.assertTrue(updatedUser.getPassword().startsWith("$2a$") || updatedUser.getPassword().startsWith("$2b$"));
        Assertions.assertTrue(passwordEncoder.matches(rawPassword, updatedUser.getPassword()));

        // Sau khi set password, đăng nhập bằng email/password phải thành công
        Map<String, Object> loginRes = authService.login(testEmail, rawPassword);
        Assertions.assertNotNull(loginRes);
    }
}
