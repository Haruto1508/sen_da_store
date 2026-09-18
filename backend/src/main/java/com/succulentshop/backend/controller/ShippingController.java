package com.succulentshop.backend.controller;

import com.succulentshop.backend.dto.ApiResult;
import com.succulentshop.backend.dto.ShippingConfigResponse;
import com.succulentshop.backend.dto.UpdateShippingConfigRequest;
import com.succulentshop.backend.service.ShippingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class ShippingController {

    private final ShippingService shippingService;

    public ShippingController(ShippingService shippingService) {
        this.shippingService = shippingService;
    }

    /**
     * Khách hàng & giao diện Checkout lấy biểu phí vận chuyển hiện tại
     */
    @GetMapping("/shipping-rates")
    public ResponseEntity<ApiResult<ShippingConfigResponse>> getShippingConfig() {
        return ResponseEntity.ok(ApiResult.ok(
                "Lấy biểu phí vận chuyển thành công",
                shippingService.getShippingConfig()
        ));
    }

    /**
     * Admin cập nhật cấu hình biểu phí & chính sách freeship
     */
    @PutMapping("/admin/shipping-rates")
    public ResponseEntity<ApiResult<ShippingConfigResponse>> updateShippingConfig(
            @RequestBody UpdateShippingConfigRequest request
    ) {
        return ResponseEntity.ok(ApiResult.ok(
                "Cập nhật biểu phí vận chuyển thành công",
                shippingService.updateShippingConfig(request)
        ));
    }

    /**
     * Tính toán phí vận chuyển chính xác theo subtotal và tỉnh thành
     */
    @PostMapping("/shipping-rates/calculate")
    public ResponseEntity<ApiResult<Map<String, Integer>>> calculateShippingFee(
            @RequestBody Map<String, Object> body
    ) {
        int subtotal = body.get("subtotal") instanceof Number
                ? ((Number) body.get("subtotal")).intValue()
                : 0;
        String city = body.get("city") != null ? body.get("city").toString() : null;
        String address = body.get("address") != null ? body.get("address").toString() : null;

        int fee = shippingService.calculateShippingFee(subtotal, city, address);
        return ResponseEntity.ok(ApiResult.ok("Tính phí vận chuyển thành công", Map.of("shippingFee", fee)));
    }
}
