package com.succulentshop.backend;

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

import java.util.Map;

@SpringBootTest
@Transactional
public class EmailPasswordlessAuthTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Test
    @DisplayName("Đăng nhập email mới: Tự động khởi tạo tài khoản và đăng nhập thành công")
    public void testEmailLoginAutoRegistersNewUser() {
        String testEmail = "new_customer_" + System.currentTimeMillis() + "@gmail.com";

        Map<String, Object> result = authService.login(testEmail);
        Assertions.assertNotNull(result);
        Assertions.assertTrue(result.containsKey("user"));
        Assertions.assertTrue(result.containsKey("token"));

        User createdUser = userRepository.findByEmail(testEmail).orElseThrow();
        Assertions.assertEquals(testEmail, createdUser.getEmail());
        Assertions.assertNull(createdUser.getPassword(), "Mật khẩu phải là null");
        Assertions.assertEquals("EMAIL", createdUser.getAuthProvider());
        Assertions.assertEquals(50, createdUser.getPoints());
    }

    @Test
    @DisplayName("Đăng nhập email đã có: Đăng nhập thành công ngay lập tức không cần mật khẩu")
    public void testExistingUserLoginDirectly() {
        String testEmail = "existing_user_" + System.currentTimeMillis() + "@gmail.com";
        User user = new User("Khách Thân Thiết", testEmail, "0911222333", null, "Hà Nội", "Thành viên thân thiết", null, 100);
        userRepository.save(user);

        Map<String, Object> result = authService.login(testEmail);
        Assertions.assertNotNull(result);

        @SuppressWarnings("unchecked")
        Map<String, Object> userData = (Map<String, Object>) result.get("user");
        Assertions.assertEquals(testEmail, userData.get("email"));
        Assertions.assertEquals("Khách Thân Thiết", userData.get("name"));
    }

    @Test
    @DisplayName("Đăng ký tài khoản không cần mật khẩu")
    public void testRegisterWithoutPassword() {
        String testEmail = "reg_user_" + System.currentTimeMillis() + "@gmail.com";

        Map<String, Object> registerResult = authService.register(
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

        AppException ex = Assertions.assertThrows(AppException.class, () -> {
            authService.login(bannedEmail);
        });
        Assertions.assertEquals(ErrorCode.ACCOUNT_DISABLED, ex.getErrorCode());
    }
}
