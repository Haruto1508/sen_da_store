package com.succulentshop.backend.dto;

public class ReturnOrderRequest {
    private String reason;
    private String note;
    private String bankInfo;

    public ReturnOrderRequest() {}

    public ReturnOrderRequest(String reason, String note, String bankInfo) {
        this.reason = reason;
        this.note = note;
        this.bankInfo = bankInfo;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public String getBankInfo() {
        return bankInfo;
    }

    public void setBankInfo(String bankInfo) {
        this.bankInfo = bankInfo;
    }
}
