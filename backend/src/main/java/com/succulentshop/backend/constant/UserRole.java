package com.succulentshop.backend.constant;

import java.util.Arrays;

/**
 * Vai trò phân quyền người dùng.
 */
public enum UserRole {
    CUSTOMER("CUSTOMER", "Khách hàng"),
    ADMIN("ADMIN", "Quản trị viên");

    private final String code;
    private final String description;

    UserRole(String code, String description) {
        this.code = code;
        this.description = description;
    }

    public String getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }

    public static boolean isValid(String role) {
        if (role == null) return false;
        return Arrays.stream(values()).anyMatch(e -> e.code.equalsIgnoreCase(role));
    }
}
