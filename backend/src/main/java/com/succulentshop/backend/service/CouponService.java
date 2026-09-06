package com.succulentshop.backend.service;

import com.succulentshop.backend.entity.Coupon;
import com.succulentshop.backend.exception.ResourceNotFoundException;
import com.succulentshop.backend.repository.CouponRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CouponService {

    private final CouponRepository couponRepository;

    public CouponService(CouponRepository couponRepository) {
        this.couponRepository = couponRepository;
    }

    public Optional<Coupon> validateCoupon(String code) {
        if (code == null || code.trim().isEmpty()) {
            return Optional.empty();
        }
        return couponRepository.findByCodeIgnoreCaseAndIsActiveTrue(code.trim());
    }

    public List<Coupon> getAllCoupons() {
        return couponRepository.findAll();
    }

    public Coupon findByCodeOrThrow(String code) {
        return couponRepository.findById(code.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy mã giảm giá: " + code));
    }

    public Coupon createCoupon(String code, Integer discountPercent, Boolean isActive, String description) {
        String formatted = code.trim().toUpperCase();
        if (couponRepository.existsById(formatted)) {
            throw new IllegalArgumentException("Mã giảm giá \"" + formatted + "\" đã tồn tại trong hệ thống");
        }
        Coupon c = new Coupon(formatted, discountPercent != null ? discountPercent : 10, isActive != null ? isActive : true, description);
        return couponRepository.save(c);
    }

    public Coupon toggleCoupon(String code, Boolean desiredState) {
        Coupon c = findByCodeOrThrow(code);
        if (desiredState != null) {
            c.setIsActive(desiredState);
        } else {
            c.setIsActive(!Boolean.TRUE.equals(c.getIsActive()));
        }
        return couponRepository.save(c);
    }

    public void deleteCoupon(String code) {
        Coupon c = findByCodeOrThrow(code);
        couponRepository.delete(c);
    }
}
