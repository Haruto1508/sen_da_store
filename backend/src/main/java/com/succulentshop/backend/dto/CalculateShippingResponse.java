package com.succulentshop.backend.dto;

public class CalculateShippingResponse {
    private Integer shippingFee;

    public CalculateShippingResponse() {}

    public CalculateShippingResponse(Integer shippingFee) {
        this.shippingFee = shippingFee;
    }

    public Integer getShippingFee() { return shippingFee; }
    public void setShippingFee(Integer shippingFee) { this.shippingFee = shippingFee; }
}
