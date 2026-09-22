package com.succulentshop.backend.controller;

import com.succulentshop.backend.constant.MessageCode;
import com.succulentshop.backend.dto.ApiResult;
import com.succulentshop.backend.dto.OrderResponse;
import com.succulentshop.backend.dto.UpdateProfileRequest;
import com.succulentshop.backend.dto.UserResponse;
import com.succulentshop.backend.service.AuthService;
import com.succulentshop.backend.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    public ResponseEntity<ApiResult<UserResponse>> getProfile(@RequestParam String email) {
        UserResponse profile = authService.getProfile(email);
        return ResponseEntity.ok(ApiResult.ok(MessageCode.PROFILE_RETRIEVED, profile));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResult<UserResponse>> updateProfile(@RequestBody UpdateProfileRequest request) {
        UserResponse updated = authService.updateProfile(request);
        return ResponseEntity.ok(ApiResult.ok(MessageCode.PROFILE_UPDATED, updated));
    }

    @GetMapping("/my-orders")
    public ResponseEntity<?> getMyOrders(
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String status,
            @RequestParam(required = false, defaultValue = "1") Integer page,
            @RequestParam(required = false, defaultValue = "0") Integer limit
    ) {
        if (limit > 0) {
            org.springframework.data.domain.Page<OrderResponse> ordersPage = orderService.getOrdersByCustomerPaginated(phone, email, status, page, limit);
            return ResponseEntity.ok(ApiResult.ok(MessageCode.ORDER_LIST_SUCCESS, ordersPage));
        } else {
            List<OrderResponse> orders;
            if (email != null && !email.isBlank()) {
                orders = orderService.getOrdersByCustomer(phone, email);
            } else {
                orders = orderService.getOrdersByCustomer(phone);
            }
            return ResponseEntity.ok(ApiResult.ok(MessageCode.ORDER_LIST_SUCCESS, orders));
        }
    }

    public ResponseEntity<?> getMyOrders(String phone) {
        return getMyOrders(phone, null, 1, 0);
    }
}
