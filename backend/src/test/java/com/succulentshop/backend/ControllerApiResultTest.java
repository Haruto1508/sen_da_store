package com.succulentshop.backend;

import com.succulentshop.backend.controller.*;
import com.succulentshop.backend.dto.*;
import com.succulentshop.backend.entity.Coupon;
import com.succulentshop.backend.repository.CouponRepository;
import com.succulentshop.backend.repository.OrderRepository;
import com.succulentshop.backend.repository.ProductRepository;
import com.succulentshop.backend.repository.UserRepository;
import com.succulentshop.backend.service.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class ControllerApiResultTest {

    @Test
    @DisplayName("ProductController trả về ApiResult thành công")
    void testProductController() {
        ProductService productService = mock(ProductService.class);
        ProductResponse p1 = new ProductResponse();
        p1.setId("sen-1");
        p1.setName("Sen Đá Kim Cương");

        when(productService.getFilteredProducts(any(), any(), any(), any(), any()))
                .thenReturn(List.of(p1));
        when(productService.getProductDetail("sen-1"))
                .thenReturn(p1);

        ProductController controller = new ProductController(productService);

        ResponseEntity<ApiResult<List<ProductResponse>>> listResp = controller.getProducts(null, null, null, null, "featured");
        assertEquals(HttpStatus.OK, listResp.getStatusCode());
        assertNotNull(listResp.getBody());
        assertTrue(listResp.getBody().isSuccess());
        assertEquals(1, listResp.getBody().getData().size());

        ResponseEntity<ApiResult<ProductResponse>> detailResp = controller.getProductById("sen-1");
        assertEquals(HttpStatus.OK, detailResp.getStatusCode());
        assertNotNull(detailResp.getBody());
        assertTrue(detailResp.getBody().isSuccess());
        assertEquals("Sen Đá Kim Cương", detailResp.getBody().getData().getName());
    }

    @Test
    @DisplayName("OrderController trả về ApiResult thành công")
    void testOrderController() {
        OrderService orderService = mock(OrderService.class);
        OrderResponse mockOrder = new OrderResponse();
        mockOrder.setOrderCode("SX-12345");
        mockOrder.setTotalAmount(100000);

        CreateOrderResponse mockCreateResp = new CreateOrderResponse();
        mockCreateResp.setOrder(mockOrder);
        VietQrResponse qr = new VietQrResponse();
        qr.setQrImageUrl("https://api.vietqr.io/image");
        mockCreateResp.setVietQr(qr);

        when(orderService.createOrder(any())).thenReturn(mockCreateResp);
        when(orderService.getOrderByCode("SX-12345")).thenReturn(mockOrder);

        OrderController controller = new OrderController(orderService);

        CreateOrderRequest req = new CreateOrderRequest();
        ResponseEntity<ApiResult<CreateOrderResponse>> createResp = controller.createOrder(req);
        assertEquals(HttpStatus.CREATED, createResp.getStatusCode());
        assertNotNull(createResp.getBody());
        assertTrue(createResp.getBody().isSuccess());
        assertNotNull(createResp.getBody().getData().getOrder());
        assertNotNull(createResp.getBody().getData().getVietQr());

        ResponseEntity<ApiResult<OrderResponse>> getResp = controller.getOrderByCode("SX-12345");
        assertEquals(HttpStatus.OK, getResp.getStatusCode());
        assertTrue(getResp.getBody().isSuccess());
        assertEquals("SX-12345", getResp.getBody().getData().getOrderCode());
    }

    @Test
    @DisplayName("CouponController trả về ApiResult với mã hợp lệ và không hợp lệ")
    void testCouponController() {
        CouponService couponService = mock(CouponService.class);
        CouponValidationResponse validSample = new CouponValidationResponse();
        validSample.setValid(true);
        validSample.setCode("GIAM10");
        validSample.setDiscountPercent(10);
        validSample.setDescription("Giảm 10%");

        CouponValidationResponse invalidSample = new CouponValidationResponse();
        invalidSample.setValid(false);

        when(couponService.validateCouponResponse("GIAM10")).thenReturn(validSample);
        when(couponService.validateCouponResponse("INVALID")).thenReturn(invalidSample);

        CouponController controller = new CouponController(couponService);

        ValidateCouponRequest validReq = new ValidateCouponRequest();
        validReq.setCode("GIAM10");
        ResponseEntity<ApiResult<CouponValidationResponse>> validResp = controller.validateCoupon(validReq);
        assertEquals(HttpStatus.OK, validResp.getStatusCode());
        assertTrue(validResp.getBody().isSuccess());
        assertEquals("GIAM10", validResp.getBody().getData().getCode());

        ValidateCouponRequest invalidReq = new ValidateCouponRequest();
        invalidReq.setCode("INVALID");
        ResponseEntity<ApiResult<CouponValidationResponse>> invalidResp = controller.validateCoupon(invalidReq);
        assertEquals(HttpStatus.NOT_FOUND, invalidResp.getStatusCode());
        assertFalse(invalidResp.getBody().isSuccess());
    }

    @Test
    @DisplayName("UserController trả về ApiResult thành công")
    void testUserController() {
        AuthService authService = mock(AuthService.class);
        OrderService orderService = mock(OrderService.class);

        UserResponse userResp = new UserResponse();
        userResp.setEmail("user@gmail.com");
        userResp.setName("User 1");
        when(authService.getProfile("user@gmail.com")).thenReturn(userResp);

        OrderResponse orderItem = new OrderResponse();
        orderItem.setOrderCode("SX-001");
        when(orderService.getOrdersByCustomer("0988123456")).thenReturn(List.of(orderItem));

        UserController controller = new UserController(authService, orderService);

        ResponseEntity<ApiResult<UserResponse>> profileResp = controller.getProfile("user@gmail.com");
        assertEquals(HttpStatus.OK, profileResp.getStatusCode());
        assertTrue(profileResp.getBody().isSuccess());
        assertEquals("user@gmail.com", profileResp.getBody().getData().getEmail());

        ResponseEntity<ApiResult<List<OrderResponse>>> ordersResp = controller.getMyOrders("0988123456");
        assertEquals(HttpStatus.OK, ordersResp.getStatusCode());
        assertTrue(ordersResp.getBody().isSuccess());
        assertEquals(1, ordersResp.getBody().getData().size());
    }

    @Test
    @DisplayName("AuthController trả về ApiResult thành công")
    void testAuthController() {
        AuthService authService = mock(AuthService.class);
        UserResponse u = new UserResponse();
        u.setEmail("admin@senxinh.vn");
        u.setRole("ROLE_ADMIN");
        AuthResponse authResp = new AuthResponse("mock-token", u);

        when(authService.login(eq("admin@senxinh.vn"), any(), any())).thenReturn(authResp);

        AuthController controller = new AuthController(authService);

        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail("admin@senxinh.vn");

        ResponseEntity<ApiResult<AuthResponse>> loginResp = controller.login(loginReq);
        assertEquals(HttpStatus.OK, loginResp.getStatusCode());
        assertTrue(loginResp.getBody().isSuccess());
        assertEquals("admin@senxinh.vn", loginResp.getBody().getData().getUser().getEmail());
        assertEquals("mock-token", loginResp.getBody().getData().getToken());
    }

    @Test
    @DisplayName("HealthController trả về ApiResult với status OK")
    void testHealthController() {
        HealthController controller = new HealthController();
        ResponseEntity<ApiResult<HealthResponse>> resp = controller.healthCheck();

        assertEquals(HttpStatus.OK, resp.getStatusCode());
        assertTrue(resp.getBody().isSuccess());
        assertEquals("ok", resp.getBody().getData().getStatus());
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
        when(userRepository.countByStatusNot(anyString())).thenReturn(8L);

        AdminController controller = new AdminController(orderRepository, productRepository, couponRepository, userRepository);
        ResponseEntity<ApiResult<AdminStatsResponse>> statsResp = controller.getStats();

        assertEquals(HttpStatus.OK, statsResp.getStatusCode());
        assertTrue(statsResp.getBody().isSuccess());
        assertEquals(10L, statsResp.getBody().getData().getTotalOrders());
        assertEquals(20L, statsResp.getBody().getData().getTotalProducts());
    }

    @Test
    @DisplayName("AdminController trả về ApiResult thành công trên otp-config")
    void testAdminControllerOtpConfig() {
        AdminService adminService = mock(AdminService.class);
        AdminOrderSseService sseService = mock(AdminOrderSseService.class);
        AuthService authService = mock(AuthService.class);

        OtpConfigDto mockConfig = new OtpConfigDto(120, 60, 5);
        when(authService.getOtpConfig()).thenReturn(mockConfig);
        when(authService.updateOtpConfig(any(OtpConfigDto.class))).thenReturn(new OtpConfigDto(180, 45, 3));

        AdminController controller = new AdminController(adminService, sseService, authService);

        ResponseEntity<ApiResult<OtpConfigDto>> getResp = controller.getOtpConfig();
        assertEquals(HttpStatus.OK, getResp.getStatusCode());
        assertTrue(getResp.getBody().isSuccess());
        assertEquals(120, getResp.getBody().getData().getExpirySeconds());
        assertEquals(60, getResp.getBody().getData().getCooldownSeconds());
        assertEquals(5, getResp.getBody().getData().getMaxFailedAttempts());

        ResponseEntity<ApiResult<OtpConfigDto>> putResp = controller.updateOtpConfig(new OtpConfigDto(180, 45, 3));
        assertEquals(HttpStatus.OK, putResp.getStatusCode());
        assertTrue(putResp.getBody().isSuccess());
        assertEquals(180, putResp.getBody().getData().getExpirySeconds());
        assertEquals(45, putResp.getBody().getData().getCooldownSeconds());
        assertEquals(3, putResp.getBody().getData().getMaxFailedAttempts());
    }
}
