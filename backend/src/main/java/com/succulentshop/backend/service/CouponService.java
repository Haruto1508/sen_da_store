package com.succulentshop.backend.service;

import com.succulentshop.backend.dto.CouponValidationResponse;
import com.succulentshop.backend.entity.Coupon;
import com.succulentshop.backend.exception.AppException;
import com.succulentshop.backend.exception.ErrorCode;
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

    public CouponValidationResponse validateCouponResponse(String code) {
        Optional<Coupon> optionalCoupon = validateCoupon(code);
        CouponValidationResponse response = new CouponValidationResponse();
        if (optionalCoupon.isEmpty()) {
            response.setValid(false);
            response.setCode(code != null ? code.trim() : "");
            response.setDiscountPercent(0);
            response.setDescription("");
            return response;
        }

        Coupon coupon = optionalCoupon.get();
        response.setValid(true);
        response.setCode(coupon.getCode());
        response.setDiscountPercent(coupon.getDiscountPercent());
        response.setDescription(coupon.getDescription() != null ? coupon.getDescription() : "");
        return response;
    }

    public List<Coupon> getAllCoupons() {
        return couponRepository.findAll();
    }

    public Coupon findByCodeOrThrow(String code) {
        return couponRepository.findById(code.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.COUPON_NOT_FOUND, "Không tìm thấy mã giảm giá: " + code));
    }

    public Coupon createCoupon(String code, Integer discountPercent, Boolean isActive, String description) {
        String formatted = code.trim().toUpperCase();
        if (couponRepository.existsById(formatted)) {
            throw new AppException(ErrorCode.COUPON_ALREADY_EXISTS, "Mã giảm giá \"" + formatted + "\" đã tồn tại trong hệ thống");
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
