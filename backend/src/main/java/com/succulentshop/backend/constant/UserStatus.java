package com.succulentshop.backend.constant;

import java.util.Arrays;

/**
 * Trạng thái tài khoản người dùng trong hệ thống.
 */
public enum UserStatus {
    ACTIVE("ACTIVE", "Hoạt động"),
    BANNED("BANNED", "Bị khóa"),
    DELETED("DELETED", "Đã xóa");

    private final String code;
    private final String description;

    UserStatus(String code, String description) {
        this.code = code;
        this.description = description;
    }

    public String getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }

    public static boolean isValid(String status) {
        if (status == null) return false;
        return Arrays.stream(values()).anyMatch(e -> e.code.equalsIgnoreCase(status));
    }
}
