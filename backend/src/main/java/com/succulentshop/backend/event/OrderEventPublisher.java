package com.succulentshop.backend.event;

import com.succulentshop.backend.entity.Order;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

import java.time.Instant;

/**
 * OrderEventPublisher chịu trách nhiệm phát các sự kiện miền (Domain Events)
 * liên quan đến đơn hàng trong kiến trúc Modular Monolith.
 *
 * Tách biệt hoàn toàn luồng nghiệp vụ Order với luồng thông báo Realtime / SSE / Kafka.
 */
@Component
public class OrderEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(OrderEventPublisher.class);

    private final ApplicationEventPublisher applicationEventPublisher;

    public OrderEventPublisher(ApplicationEventPublisher applicationEventPublisher) {
        this.applicationEventPublisher = applicationEventPublisher;
    }

    /**
     * Phát sự kiện khi đơn hàng mới được tạo thành công
     */
    public void publishOrderCreated(Order order) {
        if (order == null) return;
        OrderCreatedEvent event = new OrderCreatedEvent(
                order.getId(),
                order.getOrderCode(),
                order.getCustomerName(),
                order.getTotalAmount(),
                order.getStatus(),
                order.getCreatedAt() != null ? order.getCreatedAt() : Instant.now()
        );
        log.info("📢 [EVENT] Phát sự kiện OrderCreatedEvent: #{} (Khách: {}, Tổng: {}đ)",
                event.getOrderCode(), event.getCustomerName(), event.getTotalAmount());
        applicationEventPublisher.publishEvent(event);
    }

    /**
     * Phát sự kiện khi trạng thái đơn hàng thay đổi
     */
    public void publishOrderStatusChanged(Long orderId, String orderCode, String oldStatus, String newStatus) {
        OrderStatusChangedEvent event = new OrderStatusChangedEvent(
                orderId,
                orderCode,
                oldStatus,
                newStatus,
                Instant.now()
        );
        log.info("📢 [EVENT] Phát sự kiện OrderStatusChangedEvent: #{} ({} -> {})",
                orderCode, oldStatus, newStatus);
        applicationEventPublisher.publishEvent(event);
    }
}
