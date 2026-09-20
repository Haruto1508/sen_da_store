package com.succulentshop.backend.controller;

import com.succulentshop.backend.constant.MessageCode;
import com.succulentshop.backend.dto.*;
import com.succulentshop.backend.entity.Order;
import com.succulentshop.backend.repository.OrderRepository;
import com.succulentshop.backend.service.MoMoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<ApiResult<MoMoPaymentResponse>> createMoMoPayment(@RequestBody CreateMoMoPaymentRequest request) {
        String orderCode = request != null ? request.getOrderCode() : null;
        if (orderCode == null || orderCode.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResult.error("Thiếu mã đơn hàng orderCode"));
        }

        Optional<Order> orderOpt = orderRepository.findByOrderCode(orderCode.trim());
        if (orderOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResult.error("Không tìm thấy đơn hàng: " + orderCode));
        }

        Order order = orderOpt.get();
        MoMoPaymentResponse moMoResponse = moMoService.createPayment(order);

        return ResponseEntity.ok(ApiResult.ok(MessageCode.MOMO_PAYMENT_INITIALIZED, moMoResponse));
    }

    /**
     * Webhook IPN chính thức từ Server MoMo gọi về khi khách chuyển khoản thành công
     * (Tuân thủ đặc tả giao thức MoMo IPN: trả về resultCode và message)
     */
    @PostMapping("/momo-ipn")
    public ResponseEntity<MoMoIpnResponse> handleMoMoIpn(@RequestBody MoMoIpnRequest ipnData) {
        System.out.println("📩 [MoMo Webhook IPN Nhận được]: " + ipnData);
        boolean success = moMoService.processIpn(ipnData);

        if (success) {
            return ResponseEntity.ok(new MoMoIpnResponse(0, "Xác nhận IPN MoMo thành công"));
        } else {
            return ResponseEntity.badRequest().body(new MoMoIpnResponse(99, "Xử lý IPN thất bại hoặc chữ ký không hợp lệ"));
        }
    }

    /**
     * API Hỗ trợ kiểm thử/demo nhanh trên Localhost (Mô phỏng Webhook MoMo xác nhận tiền về)
     */
    @PostMapping("/momo/simulate-ipn")
    public ResponseEntity<ApiResult<MoMoPaymentResponse>> simulateMoMoPayment(@RequestBody SimulatePaymentRequest request) {
        String orderCode = request != null ? request.getOrderCode() : null;
        if (orderCode == null || orderCode.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResult.error("Thiếu orderCode"));
        }

        boolean confirmed = moMoService.confirmMoMoPayment(orderCode.trim());
        if (!confirmed) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResult.error("Không tìm thấy đơn hàng: " + orderCode));
        }

        Order order = orderRepository.findByOrderCode(orderCode.trim()).get();

        System.out.println("⚡ [Demo Simulation] Đơn hàng #" + orderCode + " đã được xác nhận thanh toán MoMo!");

        MoMoPaymentResponse response = new MoMoPaymentResponse();
        response.setOrderId(order.getOrderCode());
        response.setAmount(order.getTotalAmount() != null ? Long.valueOf(order.getTotalAmount()) : null);
        response.setResultCode(0);
        response.setMessage("Mô phỏng thanh toán MoMo thành công cho đơn hàng #" + orderCode);
        return ResponseEntity.ok(ApiResult.ok(MessageCode.MOMO_SIMULATED, response));
    }
}
