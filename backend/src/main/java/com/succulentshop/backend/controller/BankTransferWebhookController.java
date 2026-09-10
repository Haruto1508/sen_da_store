package com.succulentshop.backend.controller;

import com.succulentshop.backend.config.BankTransferConfig;
import com.succulentshop.backend.dto.ApiResult;
import com.succulentshop.backend.entity.Order;
import com.succulentshop.backend.repository.OrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/payment")
public class BankTransferWebhookController {

    private static final Logger log = LoggerFactory.getLogger(BankTransferWebhookController.class);

    private final BankTransferConfig bankTransferConfig;
    private final OrderRepository orderRepository;

    // Pattern nhận diện mã đơn hàng Sen Xinh (SX + chữ số/ký tự hoa thường, độ dài 4-12 ký tự)
    private static final Pattern ORDER_CODE_PATTERN = Pattern.compile("(?i)(SX[A-Z0-9]{4,12})");

    public BankTransferWebhookController(BankTransferConfig bankTransferConfig, OrderRepository orderRepository) {
        this.bankTransferConfig = bankTransferConfig;
        this.orderRepository = orderRepository;
    }

    /**
     * Webhook chính thức nhận biến động số dư chuyển khoản từ SePay (sepay.vn)
     * POST /api/payment/sepay-webhook
     */
    @PostMapping("/sepay-webhook")
    public ResponseEntity<Map<String, Object>> handleSepayWebhook(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody Map<String, Object> payload
    ) {
        log.info("📩 [SePay Webhook Nhận được]: {}", payload);

        // 1. Kiểm tra API Key (nếu cấu hình sepay.api-key có giá trị)
        String configuredApiKey = bankTransferConfig.getSepayApiKey();
        if (configuredApiKey != null && !configuredApiKey.isBlank()) {
            boolean validKey = false;
            if (authHeader != null) {
                String cleanHeader = authHeader.replace("Apikey ", "").replace("Bearer ", "").trim();
                validKey = configuredApiKey.equals(cleanHeader);
            }
            if (!validKey) {
                log.warn("⚠️ [SePay Webhook] Từ chối request do sai hoặc thiếu API Key trong Authorization header");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("success", false, "message", "Unauthorized API Key"));
            }
        }

        // 2. Kiểm tra loại giao dịch (tiền vào "in")
        String transferType = String.valueOf(payload.getOrDefault("transferType", "in"));
        if ("out".equalsIgnoreCase(transferType)) {
            log.info("ℹ️ [SePay Webhook] Bỏ qua giao dịch tiền ra (transferType = out)");
            return ResponseEntity.ok(Map.of("success", true, "message", "Bỏ qua giao dịch tiền ra"));
        }

        // 3. Trích xuất nội dung và số tiền
        String content = String.valueOf(payload.getOrDefault("content", ""));
        String description = String.valueOf(payload.getOrDefault("description", ""));
        String code = String.valueOf(payload.getOrDefault("code", ""));

        Number amountNum = 0;
        Object transferAmountObj = payload.get("transferAmount");
        if (transferAmountObj instanceof Number) {
            amountNum = (Number) transferAmountObj;
        } else if (transferAmountObj != null) {
            try {
                amountNum = Long.parseLong(transferAmountObj.toString().replaceAll("[^0-9]", ""));
            } catch (Exception ignored) {}
        }
        long transferAmount = amountNum.longValue();

        // 4. Tìm mã đơn hàng từ nội dung giao dịch
        String foundOrderCode = extractOrderCode(content, description, code);
        if (foundOrderCode == null) {
            log.warn("⚠️ [SePay Webhook] Không tìm thấy mã đơn hàng SX... trong nội dung: content='{}', desc='{}'",
                    content, description);
            return ResponseEntity.ok(Map.of(
                    "success", false,
                    "message", "Không tìm thấy mã đơn hàng phù hợp trong nội dung chuyển khoản"
            ));
        }

        // 5. Tra cứu đơn hàng trong Database
        Optional<Order> orderOpt = orderRepository.findByOrderCode(foundOrderCode.toUpperCase());
        if (orderOpt.isEmpty()) {
            log.warn("⚠️ [SePay Webhook] Không tìm thấy đơn hàng trong Database với mã: {}", foundOrderCode);
            return ResponseEntity.ok(Map.of(
                    "success", false,
                    "message", "Đơn hàng không tồn tại: " + foundOrderCode
            ));
        }

        Order order = orderOpt.get();

        // Nếu đơn hàng đã thanh toán trước đó -> Trả về thành công luôn (Idempotent)
        if ("PAID".equalsIgnoreCase(order.getStatus()) || "COMPLETED".equalsIgnoreCase(order.getStatus())) {
            log.info("ℹ️ [SePay Webhook] Đơn hàng #{} đã ở trạng thái {}", foundOrderCode, order.getStatus());
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Đơn hàng đã được xác nhận thanh toán từ trước",
                    "orderCode", order.getOrderCode(),
                    "status", order.getStatus()
            ));
        }

        // Kiểm tra số tiền chuyển có đủ không
        if (transferAmount > 0 && order.getTotalAmount() != null && transferAmount < order.getTotalAmount()) {
            log.warn("⚠️ [SePay Webhook] Số tiền chuyển ({}) nhỏ hơn giá trị đơn hàng ({})",
                    transferAmount, order.getTotalAmount());
        }

        // 6. Cập nhật trạng thái đơn hàng sang PAID
        order.setStatus("PAID");
        orderRepository.save(order);

        log.info("🎉 [SePay Webhook THÀNH CÔNG] Đơn hàng #{} đã tự động cập nhật sang trạng thái PAID!",
                order.getOrderCode());

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Xác nhận thanh toán đơn hàng thành công",
                "orderCode", order.getOrderCode(),
                "status", "PAID",
                "transferAmount", transferAmount
        ));
    }

    /**
     * API Test / Demo: Mô phỏng bắn Webhook chuyển khoản thành công trên Localhost
     * POST /api/payment/bank-transfer/simulate
     */
    @PostMapping("/bank-transfer/simulate")
    public ResponseEntity<ApiResult<Map<String, Object>>> simulateBankTransferPayment(
            @RequestBody Map<String, String> request
    ) {
        String orderCode = request.get("orderCode");
        if (orderCode == null || orderCode.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResult.error("Thiếu orderCode"));
        }

        Optional<Order> orderOpt = orderRepository.findByOrderCode(orderCode.trim().toUpperCase());
        if (orderOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResult.error("Không tìm thấy đơn hàng: " + orderCode));
        }

        Order order = orderOpt.get();
        order.setStatus("PAID");
        orderRepository.save(order);

        log.info("⚡ [Simulate Webhook] Đơn hàng #{} đã được mô phỏng thanh toán chuyển khoản thành công!", orderCode);

        return ResponseEntity.ok(ApiResult.ok(
                "Mô phỏng thanh toán chuyển khoản thành công cho đơn hàng #" + orderCode,
                Map.of("orderCode", order.getOrderCode(), "status", "PAID")
        ));
    }

    /**
     * Hàm trích xuất mã đơn hàng dạng SX... từ các trường nội dung
     */
    private String extractOrderCode(String content, String description, String code) {
        String fullText = (content + " " + description + " " + code).trim();
        Matcher matcher = ORDER_CODE_PATTERN.matcher(fullText);
        if (matcher.find()) {
            return matcher.group(1).toUpperCase();
        }
        return null;
    }
}
