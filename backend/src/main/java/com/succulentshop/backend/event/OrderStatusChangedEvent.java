package com.succulentshop.backend.event;

import java.time.LocalDateTime;

public class OrderStatusChangedEvent {
    private final Long orderId;
    private final String orderCode;
    private final String oldStatus;
    private final String status;
    private final LocalDateTime updatedAt;

    public OrderStatusChangedEvent(Long orderId, String orderCode, String oldStatus, String status, LocalDateTime updatedAt) {
        this.orderId = orderId;
        this.orderCode = orderCode;
        this.oldStatus = oldStatus;
        this.status = status;
        this.updatedAt = updatedAt != null ? updatedAt : LocalDateTime.now();
    }

    public Long getOrderId() { return orderId; }
    public String getOrderCode() { return orderCode; }
    public String getOldStatus() { return oldStatus; }
    public String getStatus() { return status; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    @Override
    public String toString() {
        return "OrderStatusChangedEvent{" +
                "orderId=" + orderId +
                ", orderCode='" + orderCode + '\'' +
                ", oldStatus='" + oldStatus + '\'' +
                ", status='" + status + '\'' +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
