package com.succulentshop.backend.constant;

import java.util.Arrays;
import java.util.Set;

/**
 * Trạng thái đơn hàng trong hệ thống Sen Xinh Garden.
 */
public enum OrderStatus {
    PENDING("PENDING", "Chờ xác nhận / Chờ thanh toán"),
    PAID("PAID", "Đã thanh toán"),
    SHIPPING("SHIPPING", "Đang vận chuyển"),
    COMPLETED("COMPLETED", "Giao hàng thành công"),
    CANCELLED("CANCELLED", "Đã hủy đơn"),
    RETURN_REQUESTED("RETURN_REQUESTED", "Chờ duyệt trả hàng"),
    RETURNED("RETURNED", "Đã hoàn trả thành công"),
    RETURN_REJECTED("RETURN_REJECTED", "Từ chối trả hàng");

    private final String code;
    private final String description;

    OrderStatus(String code, String description) {
        this.code = code;
        this.description = description;
    }

    public String getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }

    private static final Set<String> ACTIVE_STATUSES = Set.of(
            PENDING.code, PAID.code, SHIPPING.code
    );

    private static final Set<String> CANCELLABLE_STATUSES = Set.of(
            PENDING.code, PAID.code
    );

    public static boolean isValid(String status) {
        if (status == null) return false;
        return Arrays.stream(values()).anyMatch(e -> e.code.equalsIgnoreCase(status));
    }

    public static boolean isActive(String status) {
        return status != null && ACTIVE_STATUSES.contains(status.toUpperCase());
    }

    public static boolean canCancel(String status) {
        return status != null && CANCELLABLE_STATUSES.contains(status.toUpperCase());
    }
}
