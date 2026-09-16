package com.succulentshop.backend.controller;

import com.succulentshop.backend.dto.ApiResult;
import com.succulentshop.backend.dto.BankTransferWebhookResponse;
import com.succulentshop.backend.service.BankTransferService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payment")
public class BankTransferWebhookController {

    private final BankTransferService bankTransferService;

    public BankTransferWebhookController(BankTransferService bankTransferService) {
        this.bankTransferService = bankTransferService;
    }

    @PostMapping("/sepay-webhook")
    public ResponseEntity<ApiResult<BankTransferWebhookResponse>> handleSepayWebhook(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody Map<String, Object> payload
    ) {
        BankTransferWebhookResponse response = bankTransferService.handleWebhook(authHeader, payload);
        if (!response.isSuccess() && "Unauthorized API Key".equals(response.getMessage())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                   .body(ApiResult.error("Unauthorized API Key"));
        }

        return ResponseEntity.ok(ApiResult.ok(response.getMessage(), response));
    }

    @PostMapping("/bank-transfer/simulate")
    public ResponseEntity<ApiResult<BankTransferWebhookResponse>> simulateBankTransferPayment(
            @RequestBody Map<String, String> request
    ) {
        String orderCode = request.get("orderCode");
        BankTransferWebhookResponse response = bankTransferService.simulatePayment(orderCode);
        if (!response.isSuccess()) {
            return ResponseEntity.badRequest().body(ApiResult.error(response.getMessage()));
        }
        return ResponseEntity.ok(ApiResult.ok(response.getMessage(), response));
    }
}
