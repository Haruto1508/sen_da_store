package com.succulentshop.backend.controller;

import com.succulentshop.backend.dto.ApiResult;
import com.succulentshop.backend.dto.ValidateCouponRequest;
import com.succulentshop.backend.entity.Coupon;
import com.succulentshop.backend.exception.ErrorCode;
import com.succulentshop.backend.service.CouponService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/coupons")
public class CouponController {

    private final CouponService couponService;

    public CouponController(CouponService couponService) {
        this.couponService = couponService;
    }

    @PostMapping("/validate")
    public ResponseEntity<ApiResult<Map<String, Object>>> validateCoupon(@RequestBody ValidateCouponRequest request) {
        if (request.getCode() == null || request.getCode().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResult.error(ErrorCode.COUPON_CODE_REQUIRED));
        }

        Optional<Coupon> optionalCoupon = couponService.validateCoupon(request.getCode());

        if (optionalCoupon.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResult.error(ErrorCode.COUPON_INVALID_OR_EXPIRED));
        }

        Coupon coupon = optionalCoupon.get();
        Map<String, Object> data = Map.of(
            "valid", true,
            "code", coupon.getCode(),
            "discountPercent", coupon.getDiscountPercent(),
            "description", coupon.getDescription() != null ? coupon.getDescription() : ""
        );
        return ResponseEntity.ok(ApiResult.ok("Áp dụng mã giảm giá thành công", data));
    }
}
