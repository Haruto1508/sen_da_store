package com.succulentshop.backend.dto;

public class CouponValidationResponse {
    private boolean valid;
    private String code;
    private Integer discountPercent;
    private String description;

    public boolean isValid() { return valid; }
    public void setValid(boolean valid) { this.valid = valid; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public Integer getDiscountPercent() { return discountPercent; }
    public void setDiscountPercent(Integer discountPercent) { this.discountPercent = discountPercent; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
