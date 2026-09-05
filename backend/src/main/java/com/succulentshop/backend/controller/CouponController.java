package com.succulentshop.backend.controller;

import com.succulentshop.backend.dto.ValidateCouponRequest;
import com.succulentshop.backend.entity.Coupon;
import com.succulentshop.backend.repository.CouponRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/coupons")
public class CouponController {

    private final CouponRepository couponRepository;

    public CouponController(CouponRepository couponRepository) {
        this.couponRepository = couponRepository;
    }

    @PostMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateCoupon(@RequestBody ValidateCouponRequest request) {
        if (request.getCode() == null || request.getCode().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "valid", false,
                "message", "Vui lòng nhập mã giảm giá"
            ));
        }

        Optional<Coupon> optionalCoupon = couponRepository.findByCodeIgnoreCaseAndIsActiveTrue(request.getCode().trim());

        if (optionalCoupon.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of(
                "success", false,
                "valid", false,
                "message", "Mã giảm giá không hợp lệ hoặc đã hết hạn"
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
