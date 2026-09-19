package com.succulentshop.backend.dto;

public class CreateCouponRequest {
    private String code;
    private Integer discountPercent;
    private Boolean isActive;
    private String description;

    public CreateCouponRequest() {}

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public Integer getDiscountPercent() { return discountPercent; }
    public void setDiscountPercent(Integer discountPercent) { this.discountPercent = discountPercent; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
