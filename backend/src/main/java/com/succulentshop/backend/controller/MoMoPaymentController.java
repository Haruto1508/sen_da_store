package com.succulentshop.backend.controller;

import com.succulentshop.backend.entity.Order;
import com.succulentshop.backend.repository.OrderRepository;
import com.succulentshop.backend.service.MoMoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/payment")
public class MoMoPaymentController {

    private final MoMoService moMoService;
    private final OrderRepository orderRepository;

    public MoMoPaymentController(MoMoService moMoService, OrderRepository orderRepository) {
        this.moMoService = moMoService;
        this.orderRepository = orderRepository;
    }

    /**
     * Khởi tạo giao dịch thanh toán qua Cổng MoMo (Ví MoMo / VietQR MoMo)
     */
    @PostMapping("/momo/create")
    public ResponseEntity<Map<String, Object>> createMoMoPayment(@RequestBody Map<String, String> request) {
        String orderCode = request.get("orderCode");
        if (orderCode == null || orderCode.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Thiếu mã đơn hàng orderCode"
            ));
        }

        Optional<Order> orderOpt = orderRepository.findByOrderCode(orderCode.trim());
        if (orderOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "success", false,
                    "message", "Không tìm thấy đơn hàng: " + orderCode
            ));
        }

        Order order = orderOpt.get();
        Map<String, Object> moMoResponse = moMoService.createPayment(order);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", moMoResponse
        ));
    }

    /**
     * Webhook IPN chính thức từ Server MoMo gọi về khi khách chuyển khoản thành công
     */
    @PostMapping("/momo-ipn")
    public ResponseEntity<Map<String, Object>> handleMoMoIpn(@RequestBody Map<String, Object> ipnData) {
        System.out.println("📩 [MoMo Webhook IPN Nhận được]: " + ipnData);
        boolean success = moMoService.processIpn(ipnData);

        if (success) {
            return ResponseEntity.ok(Map.of(
                    "resultCode", 0,
                    "message", "Xác nhận IPN MoMo thành công"
            ));
        } else {
            return ResponseEntity.badRequest().body(Map.of(
                    "resultCode", 99,
                    "message", "Xử lý IPN thất bại hoặc chữ ký không hợp lệ"
            ));
        }
    }

    /**
     * API Hỗ trợ kiểm thử/demo nhanh trên Localhost (Mô phỏng Webhook MoMo xác nhận tiền về)
     */
    @PostMapping("/momo/simulate-ipn")
    public ResponseEntity<Map<String, Object>> simulateMoMoPayment(@RequestBody Map<String, String> request) {
        String orderCode = request.get("orderCode");
        if (orderCode == null || orderCode.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Thiếu orderCode"));
        }

        Optional<Order> orderOpt = orderRepository.findByOrderCode(orderCode.trim());
        if (orderOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Không tìm thấy đơn hàng"));
        }

        Order order = orderOpt.get();
        order.setStatus("PAID");
        orderRepository.save(order);

        System.out.println("⚡ [Demo Simulation] Đơn hàng #" + orderCode + " đã được xác nhận thanh toán MoMo!");

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Mô phỏng thanh toán MoMo thành công cho đơn hàng #" + orderCode,
                "orderCode", orderCode,
                "status", "PAID"
        ));
    }
}
