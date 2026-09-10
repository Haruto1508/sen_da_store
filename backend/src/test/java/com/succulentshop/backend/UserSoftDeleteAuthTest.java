package com.succulentshop.backend;

import com.succulentshop.backend.controller.AdminController;
import com.succulentshop.backend.dto.ApiResult;
import com.succulentshop.backend.entity.User;
import com.succulentshop.backend.exception.AppException;
import com.succulentshop.backend.exception.ErrorCode;
import com.succulentshop.backend.repository.CouponRepository;
import com.succulentshop.backend.repository.OrderRepository;
import com.succulentshop.backend.repository.ProductRepository;
import com.succulentshop.backend.repository.SocialAccountRepository;
import com.succulentshop.backend.repository.UserRepository;
import com.succulentshop.backend.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserSoftDeleteAuthTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private SocialAccountRepository socialAccountRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CouponRepository couponRepository;

    private AuthService authService;
    private AdminController adminController;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, socialAccountRepository, passwordEncoder);
        adminController = new AdminController(orderRepository, productRepository, couponRepository, userRepository);
    }

    @Test
    @DisplayName("Test 1: User ACTIVE đăng nhập thành công")
    void testActiveUserCanLogin() {
        User user = new User();
        user.setId(10L);
        user.setEmail("user.active@gmail.com");
        user.setPassword(passwordEncoder.encode("secret123"));
        user.setStatus("ACTIVE");

        when(userRepository.findByEmail("user.active@gmail.com")).thenReturn(Optional.of(user));

        Map<String, Object> result = authService.login("user.active@gmail.com", "secret123");
        assertNotNull(result);
        assertNotNull(result.get("user"));

        @SuppressWarnings("unchecked")
        Map<String, Object> userMap = (Map<String, Object>) result.get("user");
        assertEquals("ACTIVE", userMap.get("status"));
    }

    @Test
    @DisplayName("Test 2: User bị Soft Delete (DELETED) đăng nhập bị từ chối với mã lỗi ACCOUNT_DISABLED")
    void testDeletedUserLoginRejected() {
        User user = new User();
        user.setId(11L);
        user.setEmail("user.deleted@gmail.com");
        user.setPassword(passwordEncoder.encode("secret123"));
        user.setStatus("DELETED");

        when(userRepository.findByEmail("user.deleted@gmail.com")).thenReturn(Optional.of(user));

        AppException ex = assertThrows(AppException.class, () -> 
            authService.login("user.deleted@gmail.com", "secret123")
        );

        assertEquals(ErrorCode.ACCOUNT_DISABLED, ex.getErrorCode());
        assertTrue(ex.getMessage().contains("bị khóa hoặc ngừng hoạt động"));
    }

    @Test
    @DisplayName("Test 3: User bị khóa (BANNED) đăng nhập bị từ chối với mã lỗi ACCOUNT_DISABLED")
    void testBannedUserLoginRejected() {
        User user = new User();
        user.setId(12L);
        user.setEmail("user.banned@gmail.com");
        user.setPassword(passwordEncoder.encode("secret123"));
        user.setStatus("BANNED");

        when(userRepository.findByEmail("user.banned@gmail.com")).thenReturn(Optional.of(user));

        AppException ex = assertThrows(AppException.class, () -> 
            authService.login("user.banned@gmail.com", "secret123")
        );

        assertEquals(ErrorCode.ACCOUNT_DISABLED, ex.getErrorCode());
        assertTrue(ex.getMessage().contains("bị khóa"));
    }

    @Test
    @DisplayName("Test 4: Admin Soft Delete Customer -> user.setStatus('DELETED'), không xóa vật lý khỏi DB")
    void testAdminSoftDeleteCustomer() {
        User user = new User();
        user.setId(20L);
        user.setEmail("cust.todelete@gmail.com");
        user.setStatus("ACTIVE");

        when(userRepository.findById(20L)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);

        ResponseEntity<ApiResult<Map<String, Object>>> response = adminController.deleteCustomer(20L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("DELETED", user.getStatus());
        verify(userRepository, times(1)).save(user);
        verify(userRepository, never()).delete(any(User.class));
        verify(userRepository, never()).deleteById(anyLong());
    }

    @Test
    @DisplayName("Test 5: Admin cập nhật trạng thái Customer (BANNED / ACTIVE)")
    void testAdminUpdateCustomerStatus() {
        User user = new User();
        user.setId(21L);
        user.setEmail("cust.status@gmail.com");
        user.setStatus("ACTIVE");

        when(userRepository.findById(21L)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);

        ResponseEntity<ApiResult<Map<String, Object>>> response = adminController.updateCustomerStatus(
            21L, Map.of("status", "BANNED")
        );

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("BANNED", user.getStatus());
        verify(userRepository, times(1)).save(user);
    }
}
