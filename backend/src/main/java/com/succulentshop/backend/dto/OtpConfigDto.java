package com.succulentshop.backend.dto;

public class OtpConfigDto {
    private int expirySeconds = 120;      // Mặc định 2 phút (120 giây)
    private int cooldownSeconds = 60;     // Mặc định 60 giây chống spam
    private int maxFailedAttempts = 5;    // Tối đa 5 lần thử sai

    public OtpConfigDto() {}

    public OtpConfigDto(int expirySeconds, int cooldownSeconds, int maxFailedAttempts) {
        this.expirySeconds = expirySeconds;
        this.cooldownSeconds = cooldownSeconds;
        this.maxFailedAttempts = maxFailedAttempts;
    }

    public int getExpirySeconds() {
        return expirySeconds;
    }

    public void setExpirySeconds(int expirySeconds) {
        this.expirySeconds = expirySeconds;
    }

    public int getCooldownSeconds() {
        return cooldownSeconds;
    }

    public void setCooldownSeconds(int cooldownSeconds) {
        this.cooldownSeconds = cooldownSeconds;
    }

    public int getMaxFailedAttempts() {
        return maxFailedAttempts;
    }

    public void setMaxFailedAttempts(int maxFailedAttempts) {
        this.maxFailedAttempts = maxFailedAttempts;
    }
}
