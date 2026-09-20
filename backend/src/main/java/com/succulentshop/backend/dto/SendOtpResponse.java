package com.succulentshop.backend.dto;

public class SendOtpResponse {
    private boolean success;
    private String message;
    private String email;
    private Integer expiresInSeconds;
    private String devOtp; // Hiển thị khi môi trường dev/local để kiểm thử nhanh

    public SendOtpResponse() {}

    public SendOtpResponse(boolean success, String message, String email, Integer expiresInSeconds, String devOtp) {
        this.success = success;
        this.message = message;
        this.email = email;
        this.expiresInSeconds = expiresInSeconds;
        this.devOtp = devOtp;
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Integer getExpiresInSeconds() { return expiresInSeconds; }
    public void setExpiresInSeconds(Integer expiresInSeconds) { this.expiresInSeconds = expiresInSeconds; }

    public String getDevOtp() { return devOtp; }
    public void setDevOtp(String devOtp) { this.devOtp = devOtp; }
}
