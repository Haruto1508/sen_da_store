package com.succulentshop.backend.controller;

import com.succulentshop.backend.dto.ApiResult;
import com.succulentshop.backend.dto.CouponValidationResponse;
import com.succulentshop.backend.dto.ValidateCouponRequest;
import com.succulentshop.backend.exception.ErrorCode;
import com.succulentshop.backend.service.CouponService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/coupons")
public class CouponController {

    private final CouponService couponService;

    public CouponController(CouponService couponService) {
        this.couponService = couponService;
    }

    @PostMapping("/validate")
    public ResponseEntity<ApiResult<CouponValidationResponse>> validateCoupon(@RequestBody ValidateCouponRequest request) {
        if (request.getCode() == null || request.getCode().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResult.error(ErrorCode.COUPON_CODE_REQUIRED));
        }

        CouponValidationResponse response = couponService.validateCouponResponse(request.getCode());
        if (!response.isValid()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResult.error(ErrorCode.COUPON_INVALID_OR_EXPIRED));
        }

        return ResponseEntity.ok(ApiResult.ok("Áp dụng mã giảm giá thành công", response));
    }
}
