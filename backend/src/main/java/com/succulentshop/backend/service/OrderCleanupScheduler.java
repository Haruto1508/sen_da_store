package com.succulentshop.backend.service;

import com.succulentshop.backend.entity.Order;
import com.succulentshop.backend.entity.OrderItem;
import com.succulentshop.backend.repository.OrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Tự động hủy các đơn hàng PENDING (chưa thanh toán) sau một khoảng thời gian nhất định.
 * - Mặc định: 30 phút (cấu hình qua application.properties)
 * - Chỉ hủy đơn thanh toán online (vietqr, momo), KHÔNG hủy đơn COD
 * - Hoàn trả tồn kho khi hủy
 * - Chạy mỗi 10 phút
 */
@Component
public class OrderCleanupScheduler {

    private static final Logger log = LoggerFactory.getLogger(OrderCleanupScheduler.class);

    private final OrderRepository orderRepository;
    private final ProductService productService;

    @Value("${order.pending.timeout-minutes}")
    private int pendingTimeoutMinutes;

    public OrderCleanupScheduler(OrderRepository orderRepository, ProductService productService) {
        this.orderRepository = orderRepository;
        this.productService = productService;
    }

    /**
     * Chạy mỗi 10 phút: quét các đơn PENDING quá hạn và tự động hủy + hoàn kho.
     */
    @Scheduled(fixedRate = 600_000) // 10 phút
    @Transactional
    public void cancelStalePendingOrders() {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(pendingTimeoutMinutes);
        List<Order> staleOrders = orderRepository.findByStatusAndCreatedAtBefore("PENDING", cutoff);

        if (staleOrders.isEmpty()) {
            return;
        }

        int cancelledCount = 0;

        for (Order order : staleOrders) {
            // Chỉ tự động hủy đơn thanh toán online (vietqr, momo)
            // Đơn COD vẫn giữ PENDING vì khách trả tiền mặt khi nhận hàng
            String method = order.getPaymentMethod();
            if ("cod".equalsIgnoreCase(method)) {
                continue;
            }

            // Hoàn trả tồn kho
            for (OrderItem item : order.getItems()) {
                try {
                    productService.restoreStock(item.getProductId(), item.getQuantity());
                } catch (Exception e) {
                    log.warn("⚠️ Không thể hoàn kho cho sản phẩm {} (đơn {}): {}",
                            item.getProductName(), order.getOrderCode(), e.getMessage());
                }
            }

            order.setStatus("CANCELLED");
            String currentNote = order.getNote() != null ? order.getNote() : "";
            order.setNote((currentNote + " [Tự động hủy: Chưa thanh toán sau " + pendingTimeoutMinutes + " phút]").trim());
            orderRepository.save(order);
            cancelledCount++;

            log.info("🗑️ Tự động hủy đơn hàng #{} (tạo lúc {}, phương thức: {}) — quá {} phút chưa thanh toán",
                    order.getOrderCode(), order.getCreatedAt(), method, pendingTimeoutMinutes);
        }

        if (cancelledCount > 0) {
            log.info("✅ Đã tự động hủy {} đơn hàng PENDING quá hạn (>{} phút)", cancelledCount, pendingTimeoutMinutes);
        }
    }
}
