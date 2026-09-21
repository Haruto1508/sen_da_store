package com.succulentshop.backend.dto;

public class ReturnPolicyResponse {
    private int returnWindowDays;
    private String description;

    public ReturnPolicyResponse() {}

    public ReturnPolicyResponse(int returnWindowDays, String description) {
        this.returnWindowDays = returnWindowDays;
        this.description = description;
    }

    public int getReturnWindowDays() {
        return returnWindowDays;
    }

    public void setReturnWindowDays(int returnWindowDays) {
        this.returnWindowDays = returnWindowDays;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
