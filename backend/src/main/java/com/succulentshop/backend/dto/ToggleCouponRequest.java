package com.succulentshop.backend.dto;

public class ToggleCouponRequest {
    private Boolean isActive;

    public ToggleCouponRequest() {}

    public ToggleCouponRequest(Boolean isActive) {
        this.isActive = isActive;
    }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
