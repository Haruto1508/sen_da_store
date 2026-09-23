package com.succulentshop.backend.controller;

import com.succulentshop.backend.dto.ApiResult;
import com.succulentshop.backend.dto.BankTransferWebhookResponse;
import com.succulentshop.backend.dto.SepayWebhookRequest;
import com.succulentshop.backend.service.BankTransferService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment")
public class BankTransferWebhookController {

    private final BankTransferService bankTransferService;

    @Autowired
    public BankTransferWebhookController(BankTransferService bankTransferService) {
        this.bankTransferService = bankTransferService;
    }

    public BankTransferWebhookController(com.succulentshop.backend.config.BankTransferConfig bankTransferConfig,
                                         com.succulentshop.backend.repository.OrderRepository orderRepository) {
        this.bankTransferService = new BankTransferService(bankTransferConfig, orderRepository);
    }

    @PostMapping("/sepay-webhook")
    public ResponseEntity<ApiResult<BankTransferWebhookResponse>> handleSepayWebhook(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody SepayWebhookRequest payload
    ) {
        BankTransferWebhookResponse response = bankTransferService.handleWebhook(authHeader, payload);
        if (!response.isSuccess() && "Unauthorized API Key".equals(response.getMessage())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                   .body(ApiResult.error("Unauthorized API Key"));
        }

        return ResponseEntity.ok(ApiResult.ok(response.getMessage(), response));
    }


}
