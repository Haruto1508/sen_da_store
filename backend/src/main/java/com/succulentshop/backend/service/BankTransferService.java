package com.succulentshop.backend.service;

import com.succulentshop.backend.config.BankTransferConfig;
import com.succulentshop.backend.dto.BankTransferWebhookResponse;
import com.succulentshop.backend.entity.Order;
import com.succulentshop.backend.repository.OrderRepository;
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

    public BankTransferWebhookResponse handleWebhook(String authHeader, Map<String, Object> payload) {
        log.info("📩 [SePay Webhook Nhận được]: {}", payload);

        String configuredApiKey = bankTransferConfig.getSepayApiKey();
        if (configuredApiKey != null && !configuredApiKey.isBlank()) {
            boolean validKey = false;
            if (authHeader != null) {
                String cleanHeader = authHeader.replace("Apikey ", "").replace("Bearer ", "").trim();
                validKey = configuredApiKey.equals(cleanHeader);
            }
            if (!validKey) {
                log.warn("⚠️ [SePay Webhook] Từ chối request do sai hoặc thiếu API Key trong Authorization header");
                BankTransferWebhookResponse response = new BankTransferWebhookResponse();
                response.setSuccess(false);
                response.setMessage("Unauthorized API Key");
                return response;
            }
        }

        String transferType = String.valueOf(payload.getOrDefault("transferType", "in"));
        if ("out".equalsIgnoreCase(transferType)) {
            log.info("ℹ️ [SePay Webhook] Bỏ qua giao dịch tiền ra (transferType = out)");
            BankTransferWebhookResponse response = new BankTransferWebhookResponse();
            response.setSuccess(true);
            response.setMessage("Bỏ qua giao dịch tiền ra");
            return response;
        }

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
            } catch (Exception ignored) {
            }
        }
        long transferAmount = amountNum.longValue();

        String foundOrderCode = extractOrderCode(content, description, code);
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
