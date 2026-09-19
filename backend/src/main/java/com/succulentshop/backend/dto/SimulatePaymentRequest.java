package com.succulentshop.backend.dto;

public class SimulatePaymentRequest {
    private String orderCode;

    public SimulatePaymentRequest() {}

    public SimulatePaymentRequest(String orderCode) {
        this.orderCode = orderCode;
    }

    public String getOrderCode() { return orderCode; }
    public void setOrderCode(String orderCode) { this.orderCode = orderCode; }
}
