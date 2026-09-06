package com.succulentshop.backend.controller;

import com.succulentshop.backend.dto.ValidateCouponRequest;
import com.succulentshop.backend.entity.Coupon;
import com.succulentshop.backend.exception.ErrorCode;
import com.succulentshop.backend.service.CouponService;
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
    public ResponseEntity<Map<String, Object>> validateCoupon(@RequestBody ValidateCouponRequest request) {
        if (request.getCode() == null || request.getCode().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "valid", false,
                "errorCode", ErrorCode.COUPON_CODE_REQUIRED.getCode(),
                "message", ErrorCode.COUPON_CODE_REQUIRED.getMessage()
            ));
        }

        Optional<Coupon> optionalCoupon = couponService.validateCoupon(request.getCode());

        if (optionalCoupon.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of(
                "success", false,
                "valid", false,
                "errorCode", ErrorCode.COUPON_INVALID_OR_EXPIRED.getCode(),
                "message", ErrorCode.COUPON_INVALID_OR_EXPIRED.getMessage()
            ));
        }

        Coupon coupon = optionalCoupon.get();
        return ResponseEntity.ok(Map.of(
            "success", true,
            "valid", true,
            "code", coupon.getCode(),
            "discountPercent", coupon.getDiscountPercent(),
            "description", coupon.getDescription() != null ? coupon.getDescription() : ""
        ));
    }
}
