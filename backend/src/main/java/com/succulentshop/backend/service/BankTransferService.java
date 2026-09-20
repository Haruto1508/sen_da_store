package com.succulentshop.backend.service;

import com.succulentshop.backend.config.BankTransferConfig;
import com.succulentshop.backend.dto.BankTransferWebhookResponse;
import com.succulentshop.backend.entity.Order;
import com.succulentshop.backend.repository.OrderRepository;
import com.succulentshop.backend.dto.SepayWebhookRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class BankTransferService {

    private static final Logger log = LoggerFactory.getLogger(BankTransferService.class);
    private static final Pattern ORDER_CODE_PATTERN = Pattern.compile("(?i)(SX[A-Z0-9]{4,12})");

    private final BankTransferConfig bankTransferConfig;
    private final OrderRepository orderRepository;

    public BankTransferService(BankTransferConfig bankTransferConfig, OrderRepository orderRepository) {
        this.bankTransferConfig = bankTransferConfig;
        this.orderRepository = orderRepository;
    }

    public BankTransferWebhookResponse handleWebhook(String authHeader, SepayWebhookRequest request) {
        log.info("📩 [SePay Webhook Nhận được DTO]: id={}, transferAmount={}, content={}",
                request != null ? request.getId() : null,
                request != null ? request.getTransferAmount() : null,
                request != null ? request.getContent() : null);

        if (!validateApiKey(authHeader)) {
            return unauthorizedResponse();
        }

        if (request == null) {
            return emptyPayloadResponse();
        }

        String transferType = request.getTransferType() != null ? request.getTransferType() : "in";
        if ("out".equalsIgnoreCase(transferType)) {
            return ignoreTransferOutResponse();
        }

        String content = request.getContent() != null ? request.getContent() : "";
        String description = request.getDescription() != null ? request.getDescription() : "";
        String code = request.getCode() != null ? request.getCode() : "";
        long transferAmount = request.getTransferAmount() != null ? request.getTransferAmount() : 0L;

        String foundOrderCode = extractOrderCode(content, description, code);
        return processSuccessfulTransfer(foundOrderCode, transferAmount, content, description);
    }

    public BankTransferWebhookResponse handleWebhook(String authHeader, Map<String, Object> payload) {
        log.info("📩 [SePay Webhook Nhận được]: {}", payload);

        if (!validateApiKey(authHeader)) {
            return unauthorizedResponse();
        }

        if (payload == null || payload.isEmpty()) {
            return emptyPayloadResponse();
        }

        String transferType = String.valueOf(payload.getOrDefault("transferType", "in"));
        if ("out".equalsIgnoreCase(transferType)) {
            return ignoreTransferOutResponse();
        }

        String content = String.valueOf(payload.getOrDefault("content", ""));
        String description = String.valueOf(payload.getOrDefault("description", ""));
        String code = String.valueOf(payload.getOrDefault("code", ""));

        long transferAmount = parseAmountFromObject(payload.get("transferAmount"));
        String foundOrderCode = extractOrderCode(content, description, code);
        return processSuccessfulTransfer(foundOrderCode, transferAmount, content, description);
    }

    private boolean validateApiKey(String authHeader) {
        String configuredApiKey = bankTransferConfig.getSepayApiKey();
        if (configuredApiKey == null || configuredApiKey.isBlank()) {
            return true;
        }
        if (authHeader == null) {
            log.warn("⚠️ [SePay Webhook] Thiếu Authorization header");
            return false;
        }
        String cleanHeader = authHeader.replace("Apikey ", "").replace("Bearer ", "").trim();
        boolean valid = configuredApiKey.equals(cleanHeader);
        if (!valid) {
            log.warn("⚠️ [SePay Webhook] Sai API Key trong Authorization header");
        }
        return valid;
    }

    private BankTransferWebhookResponse unauthorizedResponse() {
        BankTransferWebhookResponse response = new BankTransferWebhookResponse();
        response.setSuccess(false);
        response.setMessage("Unauthorized API Key");
        return response;
    }

    private BankTransferWebhookResponse emptyPayloadResponse() {
        BankTransferWebhookResponse response = new BankTransferWebhookResponse();
        response.setSuccess(false);
        response.setMessage("Payload trống");
        return response;
    }

    private BankTransferWebhookResponse ignoreTransferOutResponse() {
        log.info("ℹ️ [SePay Webhook] Bỏ qua giao dịch tiền ra (transferType = out)");
        BankTransferWebhookResponse response = new BankTransferWebhookResponse();
        response.setSuccess(true);
        response.setMessage("Bỏ qua giao dịch tiền ra");
        return response;
    }

    private long parseAmountFromObject(Object transferAmountObj) {
        if (transferAmountObj instanceof Number) {
            return ((Number) transferAmountObj).longValue();
        } else if (transferAmountObj != null) {
            try {
                return Long.parseLong(transferAmountObj.toString().replaceAll("[^0-9]", ""));
            } catch (Exception ignored) {
            }
        }
        return 0L;
    }

    private BankTransferWebhookResponse processSuccessfulTransfer(String foundOrderCode, long transferAmount,
                                                                   String content, String description) {
        if (foundOrderCode == null) {
            log.warn("⚠️ [SePay Webhook] Không tìm thấy mã đơn hàng SX... trong nội dung: content='{}', desc='{}'",
                    content, description);
            BankTransferWebhookResponse response = new BankTransferWebhookResponse();
            response.setSuccess(false);
            response.setMessage("Không tìm thấy mã đơn hàng phù hợp trong nội dung chuyển khoản");
            return response;
        }

        Optional<Order> orderOpt = orderRepository.findByOrderCode(foundOrderCode.toUpperCase());
        if (orderOpt.isEmpty()) {
            log.warn("⚠️ [SePay Webhook] Không tìm thấy đơn hàng trong Database với mã: {}", foundOrderCode);
            BankTransferWebhookResponse response = new BankTransferWebhookResponse();
            response.setSuccess(false);
            response.setMessage("Đơn hàng không tồn tại: " + foundOrderCode);
            return response;
        }

        Order order = orderOpt.get();
        if ("PAID".equalsIgnoreCase(order.getStatus()) || "COMPLETED".equalsIgnoreCase(order.getStatus())) {
            log.info("ℹ️ [SePay Webhook] Đơn hàng #{} đã ở trạng thái {}", foundOrderCode, order.getStatus());
            BankTransferWebhookResponse response = new BankTransferWebhookResponse();
            response.setSuccess(true);
            response.setMessage("Đơn hàng đã được xác nhận thanh toán từ trước");
            response.setOrderCode(order.getOrderCode());
            response.setStatus(order.getStatus());
            return response;
        }

        if (transferAmount > 0 && order.getTotalAmount() != null && transferAmount < order.getTotalAmount()) {
            log.warn("⚠️ [SePay Webhook] Số tiền chuyển ({}) nhỏ hơn giá trị đơn hàng ({})",
                    transferAmount, order.getTotalAmount());
        }

        order.setStatus("PAID");
        orderRepository.save(order);

        log.info("🎉 [SePay Webhook THÀNH CÔNG] Đơn hàng #{} đã tự động cập nhật sang trạng thái PAID!",
                order.getOrderCode());

        BankTransferWebhookResponse response = new BankTransferWebhookResponse();
        response.setSuccess(true);
        response.setMessage("Xác nhận thanh toán đơn hàng thành công");
        response.setOrderCode(order.getOrderCode());
        response.setStatus("PAID");
        response.setTransferAmount(transferAmount);
        return response;
    }

    public BankTransferWebhookResponse simulatePayment(String orderCode) {
        if (orderCode == null || orderCode.trim().isEmpty()) {
            BankTransferWebhookResponse response = new BankTransferWebhookResponse();
            response.setSuccess(false);
            response.setMessage("Thiếu orderCode");
            return response;
        }

        Optional<Order> orderOpt = orderRepository.findByOrderCode(orderCode.trim().toUpperCase());
        if (orderOpt.isEmpty()) {
            BankTransferWebhookResponse response = new BankTransferWebhookResponse();
            response.setSuccess(false);
            response.setMessage("Không tìm thấy đơn hàng: " + orderCode);
            return response;
        }

        Order order = orderOpt.get();
        order.setStatus("PAID");
        orderRepository.save(order);

        log.info("⚡ [Simulate Webhook] Đơn hàng #{} đã được mô phỏng thanh toán chuyển khoản thành công!", orderCode);

        BankTransferWebhookResponse response = new BankTransferWebhookResponse();
        response.setSuccess(true);
        response.setMessage("Mô phỏng thanh toán chuyển khoản thành công cho đơn hàng #" + orderCode);
        response.setOrderCode(order.getOrderCode());
        response.setStatus("PAID");
        return response;
    }

    private String extractOrderCode(String content, String description, String code) {
        String fullText = (content + " " + description + " " + code).trim();
        Matcher matcher = ORDER_CODE_PATTERN.matcher(fullText);
        if (matcher.find()) {
            return matcher.group(1).toUpperCase();
        }
        return null;
    }
}
