package com.succulentshop.backend.controller;

import com.succulentshop.backend.dto.ApiResult;
import com.succulentshop.backend.dto.CartValidateRequest;
import com.succulentshop.backend.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    /**
     * API kiểm tra tính hợp lệ của giỏ hàng trước khi Checkout
     * Không bao giờ ném lỗi 500/EntityNotFound nếu có sản phẩm bị xóa hoặc hết hàng
     */
    @PostMapping("/validate")
    public ResponseEntity<ApiResult<Map<String, Object>>> validateCart(
            @RequestBody(required = false) CartValidateRequest request
    ) {
        Map<String, Object> response = cartService.validateCart(request);
        return ResponseEntity.ok(ApiResult.ok("Kiểm tra giỏ hàng thành công", response));
    }
}
