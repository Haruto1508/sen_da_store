package com.succulentshop.backend.dto;

public class UpdateUserStatusRequest {
    private String status;

    public UpdateUserStatusRequest() {}

    public UpdateUserStatusRequest(String status) {
        this.status = status;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
