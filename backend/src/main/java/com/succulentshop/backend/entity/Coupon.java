package com.succulentshop.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "coupons")
public class Coupon {

    @Id
    private String code;

    private Integer discountPercent;
    private Boolean isActive;
    private String description;

    public Coupon() {
    }

    public Coupon(String code, Integer discountPercent, Boolean isActive, String description) {
        this.code = code;
        this.discountPercent = discountPercent;
        this.isActive = isActive;
        this.description = description;
    }

    // Getters and Setters
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public Integer getDiscountPercent() { return discountPercent; }
    public void setDiscountPercent(Integer discountPercent) { this.discountPercent = discountPercent; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
