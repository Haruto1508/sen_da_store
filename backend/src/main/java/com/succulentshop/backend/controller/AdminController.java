package com.succulentshop.backend.controller;

import com.succulentshop.backend.dto.*;
import com.succulentshop.backend.entity.Coupon;
import com.succulentshop.backend.repository.CouponRepository;
import com.succulentshop.backend.repository.OrderRepository;
import com.succulentshop.backend.repository.ProductRepository;
import com.succulentshop.backend.repository.UserRepository;
import com.succulentshop.backend.service.AdminService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;
    private final com.succulentshop.backend.service.AdminOrderSseService adminOrderSseService;

    @org.springframework.beans.factory.annotation.Autowired
    public AdminController(AdminService adminService,
                           @org.springframework.beans.factory.annotation.Autowired(required = false) com.succulentshop.backend.service.AdminOrderSseService adminOrderSseService) {
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
     * Giải quyết bài toán bảo mật của native browser EventSource không thể truyền Authorization header
     * mà không phải đặt JWT token trực tiếp lên URL query param.
     */
    @PostMapping("/orders/events/ticket")
    public ResponseEntity<ApiResult<java.util.Map<String, Object>>> getSseTicket(
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        if (adminOrderSseService == null) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(ApiResult.error("Dịch vụ Realtime SSE chưa sẵn sàng"));
        }
        String ticket = adminOrderSseService.createTicket("admin@senxinh.vn");
        return ResponseEntity.ok(ApiResult.ok(
                "Cấp ticket SSE thành công",
                java.util.Map.of("ticket", ticket, "expiresInSeconds", 30)
        ));
    }

    /**
     * Mở luồng Server-Sent Events (SSE) cho Admin
     * Chấp nhận tham số ticket đã được cấp qua /events/ticket hoặc Authorization header.
     */
    @GetMapping(value = "/orders/events", produces = org.springframework.http.MediaType.TEXT_EVENT_STREAM_VALUE)
    public org.springframework.web.servlet.mvc.method.annotation.SseEmitter getOrderEventsStream(
            @RequestParam(value = "ticket", required = false) String ticket,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        if (adminOrderSseService == null) {
            throw new org.springframework.web.server.ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "SSE Service is not available");
        }

        boolean authorized = false;
        if (ticket != null && !ticket.isBlank()) {
            authorized = adminOrderSseService.validateAndConsumeTicket(ticket);
        } else if (authHeader != null && !authHeader.isBlank()) {
            authorized = true;
        }

        if (!authorized) {
            throw new org.springframework.web.server.ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized SSE connection: Missing or expired ticket");
        }

        return adminOrderSseService.subscribe();
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResult<AdminStatsResponse>> getStats() {
        return ResponseEntity.ok(ApiResult.ok("Lấy thống kê hệ thống thành công", adminService.getStats()));
    }

    @GetMapping("/orders")
    public ResponseEntity<ApiResult<List<OrderResponse>>> getAllOrders(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(ApiResult.ok("Lấy danh sách đơn hàng thành công", adminService.getAllOrders(status)));
    }

    @PatchMapping("/orders/{id}/status")
    public ResponseEntity<ApiResult<UpdateOrderStatusResponse>> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody UpdateOrderStatusRequest request
    ) {
        try {
            return ResponseEntity.ok(ApiResult.ok(
                    "Cập nhật trạng thái đơn hàng thành công",
                    adminService.updateOrderStatus(id, request)
            ));
        } catch (IllegalArgumentException e) {
            if ("Không tìm thấy đơn hàng".equals(e.getMessage())) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResult.error(e.getMessage()));
            }
            return ResponseEntity.badRequest().body(ApiResult.error(e.getMessage()));
        }
    }

    @GetMapping("/products")
    public ResponseEntity<ApiResult<List<ProductResponse>>> getAllProducts() {
        return ResponseEntity.ok(ApiResult.ok("Lấy danh sách sản phẩm thành công", adminService.getAllProducts()));
    }

    @PostMapping("/products")
    public ResponseEntity<ApiResult<ProductResponse>> createProduct(@RequestBody ProductUpsertRequest request) {
        try {
            return ResponseEntity.ok(ApiResult.ok("Thêm sen đá mới thành công", adminService.createProduct(request)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResult.error(e.getMessage()));
        }
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<ApiResult<ProductResponse>> updateProduct(
            @PathVariable String id,
            @RequestBody ProductUpsertRequest request
    ) {
        try {
            return ResponseEntity.ok(ApiResult.ok("Cập nhật sản phẩm thành công", adminService.updateProduct(id, request)));
        } catch (IllegalArgumentException e) {
            if (e.getMessage().contains("Không tìm thấy sản phẩm")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResult.error(e.getMessage()));
            }
            return ResponseEntity.badRequest().body(ApiResult.error(e.getMessage()));
        }
    }

    @PatchMapping("/products/{id}/stock")
    public ResponseEntity<ApiResult<UpdateStockResponse>> updateProductStock(
            @PathVariable String id,
            @RequestBody UpdateStockRequest request
    ) {
        try {
            return ResponseEntity.ok(ApiResult.ok("Cập nhật tồn kho thành công", adminService.updateProductStock(id, request)));
        } catch (IllegalArgumentException e) {
            if (e.getMessage().contains("Không tìm thấy sản phẩm")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResult.error(e.getMessage()));
            }
            return ResponseEntity.badRequest().body(ApiResult.error(e.getMessage()));
        }
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<ApiResult<Void>> deleteProduct(@PathVariable String id) {
        try {
            adminService.deleteProduct(id);
            return ResponseEntity.ok(ApiResult.ok("Đã xóa sản phẩm thành công (Soft Delete)", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResult.error(e.getMessage()));
        }
    }

    @GetMapping("/coupons")
    public ResponseEntity<ApiResult<List<Coupon>>> getAllCoupons() {
        return ResponseEntity.ok(ApiResult.ok("Lấy danh sách mã giảm giá thành công", adminService.getAllCoupons()));
    }

    @PostMapping("/coupons")
    public ResponseEntity<ApiResult<Coupon>> createCoupon(@RequestBody CreateCouponRequest request) {
        try {
            return ResponseEntity.ok(ApiResult.ok("Tạo mã giảm giá mới thành công", adminService.createCoupon(request)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResult.error(e.getMessage()));
        }
    }

    @PatchMapping("/coupons/{code}/toggle")
    public ResponseEntity<ApiResult<Coupon>> toggleCoupon(
            @PathVariable String code,
            @RequestBody(required = false) ToggleCouponRequest request
    ) {
        try {
            return ResponseEntity.ok(ApiResult.ok("Cập nhật trạng thái voucher thành công", adminService.toggleCoupon(code, request)));
        } catch (IllegalArgumentException e) {
            if (e.getMessage().contains("Không tìm thấy mã giảm giá")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResult.error(e.getMessage()));
            }
            return ResponseEntity.badRequest().body(ApiResult.error(e.getMessage()));
        }
    }

    @DeleteMapping("/coupons/{code}")
    public ResponseEntity<ApiResult<Void>> deleteCoupon(@PathVariable String code) {
        try {
            adminService.deleteCoupon(code);
            return ResponseEntity.ok(ApiResult.ok("Đã xóa mã voucher thành công", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResult.error(e.getMessage()));
        }
    }

    @GetMapping("/customers")
    public ResponseEntity<ApiResult<List<UserResponse>>> getAllCustomers() {
        return ResponseEntity.ok(ApiResult.ok("Lấy danh sách khách hàng thành công", adminService.getAllCustomers()));
    }

    @PatchMapping("/customers/{id}/role")
    public ResponseEntity<ApiResult<UserResponse>> updateCustomerRole(
            @PathVariable Long id,
            @RequestBody UpdateUserRoleRequest request
    ) {
        try {
            return ResponseEntity.ok(ApiResult.ok("Cập nhật phân quyền khách hàng thành công", adminService.updateCustomerRole(id, request)));
        } catch (IllegalArgumentException e) {
            if (e.getMessage().contains("Không tìm thấy khách hàng")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResult.error(e.getMessage()));
            }
            return ResponseEntity.badRequest().body(ApiResult.error(e.getMessage()));
        }
    }

    @PatchMapping("/customers/{id}/status")
    public ResponseEntity<ApiResult<UserResponse>> updateCustomerStatus(
            @PathVariable Long id,
            @RequestBody UpdateUserStatusRequest request
    ) {
        try {
            return ResponseEntity.ok(ApiResult.ok("Cập nhật trạng thái khách hàng thành công", adminService.updateCustomerStatus(id, request)));
        } catch (IllegalArgumentException e) {
            if (e.getMessage().contains("Không tìm thấy khách hàng")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResult.error(e.getMessage()));
            }
            return ResponseEntity.badRequest().body(ApiResult.error(e.getMessage()));
        }
    }

    @DeleteMapping("/customers/{id}")
    public ResponseEntity<ApiResult<UserResponse>> deleteCustomer(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(ApiResult.ok("Đã vô hiệu hóa (xóa mềm) tài khoản khách hàng thành công", adminService.deleteCustomer(id)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResult.error(e.getMessage()));
        }
    }

    @PostMapping("/admins")
    public ResponseEntity<ApiResult<UserResponse>> createAdmin(@RequestBody CreateAdminRequest request) {
        try {
            UserResponse response = adminService.createAdmin(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResult.ok("Tạo tài khoản quản trị viên mới thành công!", response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResult.error(e.getMessage()));
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResult<UserResponse>> changePassword(@RequestBody ChangePasswordRequest request) {
        try {
            UserResponse response = adminService.changePassword(request);
            return ResponseEntity.ok(ApiResult.ok("Đổi mật khẩu tài khoản thành công!", response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResult.error(e.getMessage()));
        }
    }
}
