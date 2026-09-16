package com.succulentshop.backend.controller;

import com.succulentshop.backend.dto.ApiResult;
import com.succulentshop.backend.dto.ProductResponse;
import com.succulentshop.backend.dto.UserResponse;
import com.succulentshop.backend.entity.Coupon;
import com.succulentshop.backend.service.AdminService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResult<Map<String, Object>>> getStats() {
        return ResponseEntity.ok(ApiResult.ok("Lấy thống kê hệ thống thành công", adminService.getStats()));
    }

    @GetMapping("/orders")
    public ResponseEntity<ApiResult<List<Map<String, Object>>>> getAllOrders(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(ApiResult.ok("Lấy danh sách đơn hàng thành công", adminService.getAllOrders(status)));
    }

    @PatchMapping("/orders/{id}/status")
    public ResponseEntity<ApiResult<Map<String, Object>>> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        try {
            return ResponseEntity.ok(ApiResult.ok(
                    "Cập nhật trạng thái đơn hàng thành công",
                    adminService.updateOrderStatus(id, body.get("status"))
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
    public ResponseEntity<ApiResult<ProductResponse>> createProduct(@RequestBody Map<String, Object> payload) {
        try {
            return ResponseEntity.ok(ApiResult.ok("Thêm sen đá mới thành công", adminService.createProduct(payload)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResult.error(e.getMessage()));
        }
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<ApiResult<ProductResponse>> updateProduct(
            @PathVariable String id,
            @RequestBody Map<String, Object> payload
    ) {
        try {
            return ResponseEntity.ok(ApiResult.ok("Cập nhật sản phẩm thành công", adminService.updateProduct(id, payload)));
        } catch (IllegalArgumentException e) {
            if (e.getMessage().contains("Không tìm thấy sản phẩm")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResult.error(e.getMessage()));
            }
            return ResponseEntity.badRequest().body(ApiResult.error(e.getMessage()));
        }
    }

    @PatchMapping("/products/{id}/stock")
    public ResponseEntity<ApiResult<Map<String, Object>>> updateProductStock(
            @PathVariable String id,
            @RequestBody Map<String, Object> payload
    ) {
        try {
            return ResponseEntity.ok(ApiResult.ok("Cập nhật tồn kho thành công", adminService.updateProductStock(id, payload)));
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
    public ResponseEntity<ApiResult<Coupon>> createCoupon(@RequestBody Map<String, Object> payload) {
        try {
            return ResponseEntity.ok(ApiResult.ok("Tạo mã giảm giá mới thành công", adminService.createCoupon(payload)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResult.error(e.getMessage()));
        }
    }

    @PatchMapping("/coupons/{code}/toggle")
    public ResponseEntity<ApiResult<Coupon>> toggleCoupon(
            @PathVariable String code,
            @RequestBody(required = false) Map<String, Object> payload
    ) {
        try {
            return ResponseEntity.ok(ApiResult.ok("Cập nhật trạng thái voucher thành công", adminService.toggleCoupon(code, payload)));
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
    public ResponseEntity<ApiResult<Map<String, Object>>> updateCustomerRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        try {
            return ResponseEntity.ok(ApiResult.ok("Cập nhật phân quyền khách hàng thành công", adminService.updateCustomerRole(id, body.get("role"))));
        } catch (IllegalArgumentException e) {
            if (e.getMessage().contains("Không tìm thấy khách hàng")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResult.error(e.getMessage()));
            }
            return ResponseEntity.badRequest().body(ApiResult.error(e.getMessage()));
        }
    }

    @PatchMapping("/customers/{id}/status")
    public ResponseEntity<ApiResult<Map<String, Object>>> updateCustomerStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        try {
            return ResponseEntity.ok(ApiResult.ok("Cập nhật trạng thái khách hàng thành công", adminService.updateCustomerStatus(id, body.get("status"))));
        } catch (IllegalArgumentException e) {
            if (e.getMessage().contains("Không tìm thấy khách hàng")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResult.error(e.getMessage()));
            }
            return ResponseEntity.badRequest().body(ApiResult.error(e.getMessage()));
        }
    }

    @DeleteMapping("/customers/{id}")
    public ResponseEntity<ApiResult<Map<String, Object>>> deleteCustomer(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(ApiResult.ok("Đã vô hiệu hóa (xóa mềm) tài khoản khách hàng thành công", adminService.deleteCustomer(id)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResult.error(e.getMessage()));
        }
    }
}
