package com.succulentshop.backend.controller;

import com.succulentshop.backend.dto.ApiResponse;
import com.succulentshop.backend.dto.UpdateProfileRequest;
import com.succulentshop.backend.service.AuthService;
import com.succulentshop.backend.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final AuthService authService;
    private final OrderService orderService;

    public UserController(AuthService authService, OrderService orderService) {
        this.authService = authService;
        this.orderService = orderService;
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProfile(@RequestParam String email) {
        Map<String, Object> profile = authService.getProfile(email);
        return ResponseEntity.ok(ApiResponse.ok("Lấy thông tin tài khoản thành công", profile));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateProfile(@RequestBody UpdateProfileRequest request) {
        Map<String, Object> updated = authService.updateProfile(request);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật thông tin tài khoản thành công", updated));
    }

    @GetMapping("/my-orders")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getMyOrders(@RequestParam String phone) {
        List<Map<String, Object>> orders = orderService.getOrdersByCustomer(phone);
        return ResponseEntity.ok(ApiResponse.ok("Tải danh sách đơn hàng thành công", orders));
    }
}
