package com.succulentshop.backend.dto;

public class MoMoIpnResponse {
    private int resultCode;
    private String message;

    public MoMoIpnResponse() {}

    public MoMoIpnResponse(int resultCode, String message) {
        this.resultCode = resultCode;
        this.message = message;
    }

    public int getResultCode() { return resultCode; }
    public void setResultCode(int resultCode) { this.resultCode = resultCode; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
