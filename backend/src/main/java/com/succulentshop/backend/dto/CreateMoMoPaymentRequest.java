package com.succulentshop.backend.dto;

public class CreateMoMoPaymentRequest {
    private String orderCode;
    private Long amount;

    public CreateMoMoPaymentRequest() {}

    public CreateMoMoPaymentRequest(String orderCode, Long amount) {
        this.orderCode = orderCode;
        this.amount = amount;
    }

    public String getOrderCode() { return orderCode; }
    public void setOrderCode(String orderCode) { this.orderCode = orderCode; }

    public Long getAmount() { return amount; }
    public void setAmount(Long amount) { this.amount = amount; }
}
