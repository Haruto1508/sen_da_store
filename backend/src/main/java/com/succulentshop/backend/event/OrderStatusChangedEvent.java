package com.succulentshop.backend.event;

import java.time.Instant;

public class OrderStatusChangedEvent {
    private final Long orderId;
    private final String orderCode;
    private final String oldStatus;
    private final String status;
    private final Instant updatedAt;

    public OrderStatusChangedEvent(Long orderId, String orderCode, String oldStatus, String status, Instant updatedAt) {
        this.orderId = orderId;
        this.orderCode = orderCode;
        this.oldStatus = oldStatus;
        this.status = status;
        this.updatedAt = updatedAt != null ? updatedAt : Instant.now();
    }

    public Long getOrderId() { return orderId; }
    public String getOrderCode() { return orderCode; }
    public String getOldStatus() { return oldStatus; }
    public String getStatus() { return status; }
    public Instant getUpdatedAt() { return updatedAt; }

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
