package com.succulentshop.backend.constant;

import java.util.Arrays;

/**
 * Phương thức thanh toán được hỗ trợ trong hệ thống.
 */
public enum PaymentMethod {
    VIETQR("vietqr", "Chuyển khoản QR ngân hàng (VietQR / SePay)"),
    COD("cod", "Thanh toán khi nhận hàng (COD)");

    private final String code;
    private final String description;

    PaymentMethod(String code, String description) {
        this.code = code;
        this.description = description;
    }

    public String getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }

    public static boolean isValid(String method) {
        if (method == null) return false;
        return Arrays.stream(values()).anyMatch(e -> e.code.equalsIgnoreCase(method));
    }
}
