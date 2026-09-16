package com.succulentshop.backend.dto;

public class BankTransferWebhookResponse {
    private boolean success;
    private String message;
    private String orderCode;
    private String status;
    private Long transferAmount;

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getOrderCode() { return orderCode; }
    public void setOrderCode(String orderCode) { this.orderCode = orderCode; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getTransferAmount() { return transferAmount; }
    public void setTransferAmount(Long transferAmount) { this.transferAmount = transferAmount; }
}
