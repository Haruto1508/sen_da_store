package com.succulentshop.backend.dto;

public class UpdateOrderStatusResponse {
    private String newStatus;

    public UpdateOrderStatusResponse() {}

    public UpdateOrderStatusResponse(String newStatus) {
        this.newStatus = newStatus;
    }

    public String getNewStatus() { return newStatus; }
    public void setNewStatus(String newStatus) { this.newStatus = newStatus; }
}
