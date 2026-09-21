package com.succulentshop.backend.event;

import java.time.Instant;

public class OrderCreatedEvent {
    private final Long orderId;
    private final String orderCode;
    private final String customerName;
    private final Integer totalAmount;
    private final String status;
    private final Instant createdAt;

    public OrderCreatedEvent(Long orderId, String orderCode, String customerName, Integer totalAmount, String status, Instant createdAt) {
        this.orderId = orderId;
        this.orderCode = orderCode;
        this.customerName = customerName;
        this.totalAmount = totalAmount;
        this.status = status;
        this.createdAt = createdAt != null ? createdAt : Instant.now();
    }

    public Long getOrderId() { return orderId; }
    public String getOrderCode() { return orderCode; }
    public String getCustomerName() { return customerName; }
    public Integer getTotalAmount() { return totalAmount; }
    public String getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }

    @Override
    public String toString() {
        return "OrderCreatedEvent{" +
                "orderId=" + orderId +
                ", orderCode='" + orderCode + '\'' +
                ", customerName='" + customerName + '\'' +
                ", totalAmount=" + totalAmount +
                ", status='" + status + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }
}
