package com.succulentshop.backend.controller;

import com.succulentshop.backend.constant.MessageCode;
import com.succulentshop.backend.dto.ApiResult;
import com.succulentshop.backend.dto.CalculateShippingRequest;
import com.succulentshop.backend.dto.CalculateShippingResponse;
import com.succulentshop.backend.dto.ShippingConfigResponse;
import com.succulentshop.backend.dto.UpdateShippingConfigRequest;
import com.succulentshop.backend.service.ShippingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
                MessageCode.SHIPPING_CONFIG_RETRIEVED,
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
                MessageCode.SHIPPING_CONFIG_UPDATED,
                shippingService.updateShippingConfig(request)
        ));
    }

    /**
     * Tính toán phí vận chuyển chính xác theo subtotal và tỉnh thành
     */
    @PostMapping("/shipping-rates/calculate")
    public ResponseEntity<ApiResult<CalculateShippingResponse>> calculateShippingFee(
            @RequestBody CalculateShippingRequest request
    ) {
        int subtotal = (request != null && request.getSubtotal() != null) ? request.getSubtotal() : 0;
        String city = request != null ? request.getCity() : null;
        String address = request != null ? request.getAddress() : null;

        int fee = shippingService.calculateShippingFee(subtotal, city, address);
        return ResponseEntity.ok(ApiResult.ok(MessageCode.SHIPPING_FEE_CALCULATED, new CalculateShippingResponse(fee)));
    }
}
