package com.succulentshop.backend.dto;

public class RejectReturnRequest {
    private String rejectReason;

    public RejectReturnRequest() {}

    public RejectReturnRequest(String rejectReason) {
        this.rejectReason = rejectReason;
    }

    public String getRejectReason() {
        return rejectReason;
    }

    public void setRejectReason(String rejectReason) {
        this.rejectReason = rejectReason;
    }
}
