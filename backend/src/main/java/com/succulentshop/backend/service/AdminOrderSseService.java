package com.succulentshop.backend.service;

import com.succulentshop.backend.event.OrderCreatedEvent;
import com.succulentshop.backend.event.OrderStatusChangedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * AdminOrderSseService quản lý các kết nối Server-Sent Events (SSE) của Quản Trị Viên,
 * lắng nghe các Domain Events từ Order module và phát thông báo Realtime về Admin browser.
 */
@Service
public class AdminOrderSseService {

    private static final Logger log = LoggerFactory.getLogger(AdminOrderSseService.class);

    // Thời gian timeout của một kết nối SSE: 5 phút (300.000 ms)
    private static final long SSE_TIMEOUT = 300_000L;

    // Danh sách các kết nối SSE đang hoạt động
    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    // Lưu trữ vé xác thực dùng một lần (Ticket-based SSE Authentication)
    public static class TicketEntry {
        private final String adminEmail;
        private final LocalDateTime expiry;

        public TicketEntry(String adminEmail, LocalDateTime expiry) {
            this.adminEmail = adminEmail;
            this.expiry = expiry;
        }

        public String getAdminEmail() { return adminEmail; }
        public boolean isExpired() { return LocalDateTime.now().isAfter(expiry); }
    }

    private final Map<String, TicketEntry> ticketStorage = new ConcurrentHashMap<>();

    /**
     * Cấp mã vé xác thực dùng một lần (Single-use ticket) có hiệu lực 30 giây
     * Giải quyết bài toán bảo mật của native browser EventSource không thể truyền Authorization header
     * mà KHÔNG làm lộ JWT trên URL query string.
     */
    public String createTicket(String adminEmail) {
        String ticket = UUID.randomUUID().toString();
        ticketStorage.put(ticket, new TicketEntry(adminEmail, LocalDateTime.now().plusSeconds(30)));
        log.info("🎫 [SSE AUTH] Cấp ticket SSE cho admin [{}]: {} (hiệu lực 30s)", adminEmail, ticket);
        return ticket;
    }

    /**
     * Xác thực và hủy vé ngay lập tức (Burn on first use)
     */
    public boolean validateAndConsumeTicket(String ticket) {
        if (ticket == null || ticket.isBlank()) return false;
        TicketEntry entry = ticketStorage.remove(ticket.trim());
        if (entry == null) {
            log.warn("❌ [SSE AUTH] Ticket không hợp lệ hoặc đã được sử dụng: {}", ticket);
            return false;
        }
        if (entry.isExpired()) {
            log.warn("❌ [SSE AUTH] Ticket đã hết hạn (quá 30s): {}", ticket);
            return false;
        }
        log.info("✅ [SSE AUTH] Ticket hợp lệ cho admin [{}], mở kết nối SSE", entry.getAdminEmail());
        return true;
    }

    /**
     * Mở kết nối SSE mới cho trình duyệt Admin
     */
    public SseEmitter subscribe() {
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT);

        emitter.onCompletion(() -> {
            emitters.remove(emitter);
            log.debug("🔌 [SSE] Kết nối SSE hoàn tất, số kết nối còn lại: {}", emitters.size());
        });

        emitter.onTimeout(() -> {
            emitters.remove(emitter);
            emitter.complete();
            log.debug("⏰ [SSE] Kết nối SSE timeout, số kết nối còn lại: {}", emitters.size());
        });

        emitter.onError((e) -> {
            emitters.remove(emitter);
            log.debug("⚠️ [SSE] Lỗi kết nối SSE: {}, số kết nối còn lại: {}", e.getMessage(), emitters.size());
        });

        // Gửi handshake ban đầu
        try {
            emitter.send(SseEmitter.event()
                    .name("INIT")
                    .data(Map.of(
                            "message", "Connected to Admin Order Realtime Stream",
                            "timestamp", System.currentTimeMillis()
                    )));
        } catch (IOException e) {
            log.warn("Không thể gửi handshake SSE: {}", e.getMessage());
            return emitter;
        }

        emitters.add(emitter);
        log.info("📡 [SSE] Admin kết nối thành công. Tổng kết nối SSE đang mở: {}", emitters.size());
        return emitter;
    }

    /**
     * Lắng nghe sự kiện OrderCreatedEvent từ Order module
     */
    @EventListener
    public void handleOrderCreated(OrderCreatedEvent event) {
        log.info("⚡ [SSE DISPATCH] Gửi thông báo ORDER_CREATED cho {} kết nối admin", emitters.size());
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("type", "ORDER_CREATED");
        payload.put("orderId", event.getOrderId());
        payload.put("orderCode", event.getOrderCode());
        payload.put("status", event.getStatus());
        payload.put("customerName", event.getCustomerName());
        payload.put("totalAmount", event.getTotalAmount());
        payload.put("createdAt", event.getCreatedAt() != null ? event.getCreatedAt().toString() : null);

        broadcast("order_event", payload);
    }

    /**
     * Lắng nghe sự kiện OrderStatusChangedEvent từ Order/Admin module
     */
    @EventListener
    public void handleOrderStatusChanged(OrderStatusChangedEvent event) {
        log.info("⚡ [SSE DISPATCH] Gửi thông báo ORDER_STATUS_CHANGED cho {} kết nối admin", emitters.size());
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("type", "ORDER_STATUS_CHANGED");
        payload.put("orderId", event.getOrderId());
        payload.put("orderCode", event.getOrderCode());
        payload.put("oldStatus", event.getOldStatus());
        payload.put("status", event.getStatus());
        payload.put("updatedAt", event.getUpdatedAt() != null ? event.getUpdatedAt().toString() : null);

        broadcast("order_event", payload);
    }

    /**
     * Phát dữ liệu tới tất cả các emitter đang kết nối
     */
    private void broadcast(String eventName, Object data) {
        List<SseEmitter> deadEmitters = new ArrayList<>();
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name(eventName)
                        .data(data));
            } catch (Exception e) {
                deadEmitters.add(emitter);
            }
        }
        if (!deadEmitters.isEmpty()) {
            emitters.removeAll(deadEmitters);
            log.debug("Đã dọn dẹp {} kết nối SSE bị ngắt", deadEmitters.size());
        }
    }

    /**
     * Heartbeat định kỳ 25s gửi ping duy trì kết nối
     */
    @Scheduled(fixedRate = 25000)
    public void sendHeartbeat() {
        if (emitters.isEmpty()) return;
        List<SseEmitter> deadEmitters = new ArrayList<>();
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name("ping")
                        .data("keep-alive"));
            } catch (Exception e) {
                deadEmitters.add(emitter);
            }
        }
        if (!deadEmitters.isEmpty()) {
            emitters.removeAll(deadEmitters);
        }
    }
}
