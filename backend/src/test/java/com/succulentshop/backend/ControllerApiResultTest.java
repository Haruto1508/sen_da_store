package com.succulentshop.backend;

import com.succulentshop.backend.controller.*;
import com.succulentshop.backend.dto.*;
import com.succulentshop.backend.entity.Coupon;
import com.succulentshop.backend.entity.Order;
import com.succulentshop.backend.entity.Product;
import com.succulentshop.backend.entity.User;
import com.succulentshop.backend.repository.CouponRepository;
import com.succulentshop.backend.repository.OrderRepository;
import com.succulentshop.backend.repository.ProductRepository;
import com.succulentshop.backend.repository.UserRepository;
import com.succulentshop.backend.service.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class ControllerApiResultTest {

    @Test
    @DisplayName("ProductController trả về ApiResult thành công")
    void testProductController() {
        ProductService productService = mock(ProductService.class);
        when(productService.getFilteredProducts(any(), any(), any(), any(), any()))
                .thenReturn(List.of(Map.of("id", "sen-1", "name", "Sen Đá Kim Cương")));
        when(productService.getProductDetail("sen-1"))
                .thenReturn(Map.of("id", "sen-1", "name", "Sen Đá Kim Cương"));

        ProductController controller = new ProductController(productService);

        ResponseEntity<ApiResult<List<Map<String, Object>>>> listResp = controller.getProducts(null, null, null, null, "featured");
        assertEquals(HttpStatus.OK, listResp.getStatusCode());
        assertNotNull(listResp.getBody());
        assertTrue(listResp.getBody().isSuccess());
        assertEquals(1, listResp.getBody().getData().size());

        ResponseEntity<ApiResult<Map<String, Object>>> detailResp = controller.getProductById("sen-1");
        assertEquals(HttpStatus.OK, detailResp.getStatusCode());
        assertNotNull(detailResp.getBody());
        assertTrue(detailResp.getBody().isSuccess());
        assertEquals("Sen Đá Kim Cương", detailResp.getBody().getData().get("name"));
    }

    @Test
    @DisplayName("OrderController trả về ApiResult thành công")
    void testOrderController() {
        OrderService orderService = mock(OrderService.class);
        when(orderService.createOrder(any())).thenReturn(Map.of(
                "order", Map.of("orderCode", "SX-12345", "totalAmount", 100000),
                "vietQr", "https://api.vietqr.io/image"
        ));
        when(orderService.getOrderByCode("SX-12345")).thenReturn(Map.of("orderCode", "SX-12345"));

        OrderController controller = new OrderController(orderService);

        CreateOrderRequest req = new CreateOrderRequest();
        ResponseEntity<ApiResult<Map<String, Object>>> createResp = controller.createOrder(req);
        assertEquals(HttpStatus.CREATED, createResp.getStatusCode());
        assertNotNull(createResp.getBody());
        assertTrue(createResp.getBody().isSuccess());
        assertNotNull(createResp.getBody().getData().get("order"));
        assertNotNull(createResp.getBody().getData().get("vietQr"));

        ResponseEntity<ApiResult<Map<String, Object>>> getResp = controller.getOrderByCode("SX-12345");
        assertEquals(HttpStatus.OK, getResp.getStatusCode());
        assertTrue(getResp.getBody().isSuccess());
    }

    @Test
    @DisplayName("CouponController trả về ApiResult với mã hợp lệ và không hợp lệ")
    void testCouponController() {
        CouponService couponService = mock(CouponService.class);
        Coupon sampleCoupon = new Coupon("GIAM10", 10, true, "Giảm 10%");
        when(couponService.validateCoupon("GIAM10")).thenReturn(Optional.of(sampleCoupon));
        when(couponService.validateCoupon("INVALID")).thenReturn(Optional.empty());

        CouponController controller = new CouponController(couponService);

        ValidateCouponRequest validReq = new ValidateCouponRequest();
        validReq.setCode("GIAM10");
        ResponseEntity<ApiResult<Map<String, Object>>> validResp = controller.validateCoupon(validReq);
        assertEquals(HttpStatus.OK, validResp.getStatusCode());
        assertTrue(validResp.getBody().isSuccess());
        assertEquals("GIAM10", validResp.getBody().getData().get("code"));

        ValidateCouponRequest invalidReq = new ValidateCouponRequest();
        invalidReq.setCode("INVALID");
        ResponseEntity<ApiResult<Map<String, Object>>> invalidResp = controller.validateCoupon(invalidReq);
        assertEquals(HttpStatus.NOT_FOUND, invalidResp.getStatusCode());
        assertFalse(invalidResp.getBody().isSuccess());
    }

    @Test
    @DisplayName("UserController trả về ApiResult thành công")
    void testUserController() {
        AuthService authService = mock(AuthService.class);
        OrderService orderService = mock(OrderService.class);
        when(authService.getProfile("user@gmail.com")).thenReturn(Map.of("email", "user@gmail.com", "name", "User 1"));
        when(orderService.getOrdersByCustomer("0988123456")).thenReturn(List.of(Map.of("orderCode", "SX-001")));

        UserController controller = new UserController(authService, orderService);

        ResponseEntity<ApiResult<Map<String, Object>>> profileResp = controller.getProfile("user@gmail.com");
        assertEquals(HttpStatus.OK, profileResp.getStatusCode());
        assertTrue(profileResp.getBody().isSuccess());
        assertEquals("user@gmail.com", profileResp.getBody().getData().get("email"));

        ResponseEntity<ApiResult<List<Map<String, Object>>>> ordersResp = controller.getMyOrders("0988123456");
        assertEquals(HttpStatus.OK, ordersResp.getStatusCode());
        assertTrue(ordersResp.getBody().isSuccess());
        assertEquals(1, ordersResp.getBody().getData().size());
    }

    @Test
    @DisplayName("AuthController trả về ApiResult thành công")
    void testAuthController() {
        AuthService authService = mock(AuthService.class);
        when(authService.login("admin@senxinh.vn", "admin123")).thenReturn(Map.of(
                "user", Map.of("email", "admin@senxinh.vn", "role", "ROLE_ADMIN"),
                "token", "mock-token"
        ));

        AuthController controller = new AuthController(authService);

        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail("admin@senxinh.vn");
        loginReq.setPassword("admin123");

        ResponseEntity<ApiResult<Map<String, Object>>> loginResp = controller.login(loginReq);
        assertEquals(HttpStatus.OK, loginResp.getStatusCode());
        assertTrue(loginResp.getBody().isSuccess());
        assertEquals("admin@senxinh.vn", loginResp.getBody().getData().get("email"));
        assertEquals("mock-token", loginResp.getBody().getData().get("token"));
    }

    @Test
    @DisplayName("HealthController trả về ApiResult với status OK")
    void testHealthController() {
        HealthController controller = new HealthController();
        ResponseEntity<ApiResult<Map<String, Object>>> resp = controller.healthCheck();

        assertEquals(HttpStatus.OK, resp.getStatusCode());
        assertTrue(resp.getBody().isSuccess());
        assertEquals("ok", resp.getBody().getData().get("status"));
    }

    @Test
    @DisplayName("AdminController trả về ApiResult thành công trên stats")
    void testAdminControllerStats() {
        OrderRepository orderRepository = mock(OrderRepository.class);
        ProductRepository productRepository = mock(ProductRepository.class);
        CouponRepository couponRepository = mock(CouponRepository.class);
        UserRepository userRepository = mock(UserRepository.class);

        when(orderRepository.count()).thenReturn(10L);
        when(orderRepository.countByStatus(anyString())).thenReturn(2L);
        when(orderRepository.findAll()).thenReturn(Collections.emptyList());
        when(productRepository.count()).thenReturn(20L);
        when(couponRepository.count()).thenReturn(5L);
        when(userRepository.count()).thenReturn(8L);

        AdminController controller = new AdminController(orderRepository, productRepository, couponRepository, userRepository);
        ResponseEntity<ApiResult<Map<String, Object>>> statsResp = controller.getStats();

        assertEquals(HttpStatus.OK, statsResp.getStatusCode());
        assertTrue(statsResp.getBody().isSuccess());
        assertEquals(10L, statsResp.getBody().getData().get("totalOrders"));
        assertEquals(20L, statsResp.getBody().getData().get("totalProducts"));
    }
}
