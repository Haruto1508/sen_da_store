package com.succulentshop.backend.controller;

import com.succulentshop.backend.constant.MessageCode;
import com.succulentshop.backend.dto.*;
import com.succulentshop.backend.entity.Coupon;
import com.succulentshop.backend.repository.CouponRepository;
import com.succulentshop.backend.repository.OrderRepository;
import com.succulentshop.backend.repository.ProductRepository;
import com.succulentshop.backend.repository.UserRepository;
import com.succulentshop.backend.service.AdminOrderSseService;
import com.succulentshop.backend.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;
    private final AdminOrderSseService adminOrderSseService;

    @Autowired
    public AdminController(AdminService adminService,
                           @Autowired(required = false) AdminOrderSseService adminOrderSseService) {
        this.adminService = adminService;
        this.adminOrderSseService = adminOrderSseService;
    }

    public AdminController(OrderRepository orderRepository,
                           ProductRepository productRepository,
                           CouponRepository couponRepository,
                           UserRepository userRepository) {
        this.adminService = new AdminService(orderRepository, productRepository, couponRepository, userRepository, null);
        this.adminOrderSseService = null;
    }

    /**
     * Cấp mã vé xác thực một lần (Ticket) để kết nối SSE cho Admin.
     */
    @PostMapping("/orders/events/ticket")
    public ResponseEntity<ApiResult<Map<String, Object>>> getSseTicket(
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        if (adminOrderSseService == null) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(ApiResult.error("Dịch vụ Realtime SSE chưa sẵn sàng"));
        }
        String ticket = adminOrderSseService.createTicket("admin@senxinh.vn");
        return ResponseEntity.ok(ApiResult.ok(
                MessageCode.SSE_TICKET_ISSUED,
                Map.of("ticket", ticket, "expiresInSeconds", 30)
        ));
    }

    /**
     * Mở luồng Server-Sent Events (SSE) cho Admin
     */
    @GetMapping(value = "/orders/events", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public org.springframework.web.servlet.mvc.method.annotation.SseEmitter getOrderEventsStream(
            @RequestParam(value = "ticket", required = false) String ticket,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        if (adminOrderSseService == null) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "SSE Service is not available");
        }

        boolean authorized = false;
        if (ticket != null && !ticket.isBlank()) {
            authorized = adminOrderSseService.validateAndConsumeTicket(ticket);
        } else if (authHeader != null && !authHeader.isBlank()) {
            authorized = true;
        }

        if (!authorized) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized SSE connection: Missing or expired ticket");
        }

        return adminOrderSseService.subscribe();
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResult<AdminStatsResponse>> getStats() {
        return ResponseEntity.ok(ApiResult.ok(MessageCode.ADMIN_STATS_SUCCESS, adminService.getStats()));
    }

    @GetMapping("/orders")
    public ResponseEntity<ApiResult<List<OrderResponse>>> getAllOrders(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(ApiResult.ok(MessageCode.ORDER_LIST_SUCCESS, adminService.getAllOrders(status)));
    }

    @PatchMapping("/orders/{id}/status")
    public ResponseEntity<ApiResult<UpdateOrderStatusResponse>> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody UpdateOrderStatusRequest request
    ) {
        return ResponseEntity.ok(ApiResult.ok(
                MessageCode.ORDER_STATUS_UPDATED,
                adminService.updateOrderStatus(id, request)
        ));
    }

    @GetMapping("/products")
    public ResponseEntity<ApiResult<List<ProductResponse>>> getAllProducts() {
        return ResponseEntity.ok(ApiResult.ok(MessageCode.PRODUCT_LIST_SUCCESS, adminService.getAllProducts()));
    }

    @PostMapping("/products")
    public ResponseEntity<ApiResult<ProductResponse>> createProduct(@RequestBody ProductUpsertRequest request) {
        return ResponseEntity.ok(ApiResult.ok(MessageCode.PRODUCT_CREATED, adminService.createProduct(request)));
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<ApiResult<ProductResponse>> updateProduct(
            @PathVariable String id,
            @RequestBody ProductUpsertRequest request
    ) {
        return ResponseEntity.ok(ApiResult.ok(MessageCode.PRODUCT_UPDATED, adminService.updateProduct(id, request)));
    }

    @PatchMapping("/products/{id}/stock")
    public ResponseEntity<ApiResult<UpdateStockResponse>> updateProductStock(
            @PathVariable String id,
            @RequestBody UpdateStockRequest request
    ) {
        return ResponseEntity.ok(ApiResult.ok(MessageCode.PRODUCT_STOCK_UPDATED, adminService.updateProductStock(id, request)));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<ApiResult<Void>> deleteProduct(@PathVariable String id) {
        adminService.deleteProduct(id);
        return ResponseEntity.ok(ApiResult.ok(MessageCode.PRODUCT_DELETED, null));
    }

    @GetMapping("/coupons")
    public ResponseEntity<ApiResult<List<Coupon>>> getAllCoupons() {
        return ResponseEntity.ok(ApiResult.ok(MessageCode.COUPON_LIST_SUCCESS, adminService.getAllCoupons()));
    }

    @PostMapping("/coupons")
    public ResponseEntity<ApiResult<Coupon>> createCoupon(@RequestBody CreateCouponRequest request) {
        return ResponseEntity.ok(ApiResult.ok(MessageCode.COUPON_CREATED, adminService.createCoupon(request)));
    }

    @PatchMapping("/coupons/{code}/toggle")
    public ResponseEntity<ApiResult<Coupon>> toggleCoupon(
            @PathVariable String code,
            @RequestBody(required = false) ToggleCouponRequest request
    ) {
        return ResponseEntity.ok(ApiResult.ok(MessageCode.COUPON_TOGGLED, adminService.toggleCoupon(code, request)));
    }

    @DeleteMapping("/coupons/{code}")
    public ResponseEntity<ApiResult<Void>> deleteCoupon(@PathVariable String code) {
        adminService.deleteCoupon(code);
        return ResponseEntity.ok(ApiResult.ok(MessageCode.COUPON_DELETED, null));
    }

    @GetMapping("/customers")
    public ResponseEntity<ApiResult<List<UserResponse>>> getAllCustomers() {
        return ResponseEntity.ok(ApiResult.ok(MessageCode.CUSTOMER_LIST_RETRIEVED, adminService.getAllCustomers()));
    }

    @PatchMapping("/customers/{id}/role")
    public ResponseEntity<ApiResult<UserResponse>> updateCustomerRole(
            @PathVariable Long id,
            @RequestBody UpdateUserRoleRequest request
    ) {
        return ResponseEntity.ok(ApiResult.ok(MessageCode.USER_ROLE_UPDATED, adminService.updateCustomerRole(id, request)));
    }

    @PatchMapping("/customers/{id}/status")
    public ResponseEntity<ApiResult<UserResponse>> updateCustomerStatus(
            @PathVariable Long id,
            @RequestBody UpdateUserStatusRequest request
    ) {
        return ResponseEntity.ok(ApiResult.ok(MessageCode.USER_STATUS_UPDATED, adminService.updateCustomerStatus(id, request)));
    }

    @DeleteMapping("/customers/{id}")
    public ResponseEntity<ApiResult<UserResponse>> deleteCustomer(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResult.ok(MessageCode.USER_DELETED, adminService.deleteCustomer(id)));
    }

    @PostMapping("/admins")
    public ResponseEntity<ApiResult<UserResponse>> createAdmin(@RequestBody CreateAdminRequest request) {
        UserResponse response = adminService.createAdmin(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResult.ok(MessageCode.ADMIN_CREATED, response));
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResult<UserResponse>> changePassword(@RequestBody ChangePasswordRequest request) {
        UserResponse response = adminService.changePassword(request);
        return ResponseEntity.ok(ApiResult.ok(MessageCode.PASSWORD_CHANGED, response));
    }
}
