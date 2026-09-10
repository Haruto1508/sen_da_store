package com.succulentshop.backend;

import com.succulentshop.backend.config.BankTransferConfig;
import com.succulentshop.backend.controller.BankTransferWebhookController;
import com.succulentshop.backend.dto.ApiResult;
import com.succulentshop.backend.entity.Order;
import com.succulentshop.backend.repository.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BankTransferWebhookTest {

    @Mock
    private BankTransferConfig bankTransferConfig;

    @Mock
    private OrderRepository orderRepository;

    private BankTransferWebhookController controller;

    @BeforeEach
    void setUp() {
        controller = new BankTransferWebhookController(bankTransferConfig, orderRepository);
    }

    @Test
    void testSepayWebhook_SuccessPayment() {
        Order mockOrder = new Order();
        mockOrder.setOrderCode("SX123456");
        mockOrder.setStatus("PENDING");
        mockOrder.setTotalAmount(150000);

        when(orderRepository.findByOrderCode("SX123456")).thenReturn(Optional.of(mockOrder));
        when(orderRepository.save(any(Order.class))).thenReturn(mockOrder);

        Map<String, Object> payload = Map.of(
                "gateway", "Vietcombank",
                "transferType", "in",
                "transferAmount", 150000,
                "content", "Chuyen tien don hang SX123456 sen xinh",
                "referenceCode", "VCB.999"
        );

        ResponseEntity<Map<String, Object>> response = controller.handleSepayWebhook(null, payload);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(true, response.getBody().get("success"));
        assertEquals("PAID", mockOrder.getStatus());
        verify(orderRepository, times(1)).save(mockOrder);
    }

    @Test
    void testSepayWebhook_IgnoreOutTransfer() {
        Map<String, Object> payload = Map.of(
                "transferType", "out",
                "transferAmount", 50000,
                "content", "Rut tien"
        );

        ResponseEntity<Map<String, Object>> response = controller.handleSepayWebhook(null, payload);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(orderRepository, never()).save(any());
    }

    @Test
    void testSepayWebhook_OrderNotFound() {
        when(orderRepository.findByOrderCode("SX999999")).thenReturn(Optional.empty());

        Map<String, Object> payload = Map.of(
                "transferType", "in",
                "transferAmount", 100000,
                "content", "Thanh toan SX999999"
        );

        ResponseEntity<Map<String, Object>> response = controller.handleSepayWebhook(null, payload);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(false, response.getBody().get("success"));
        verify(orderRepository, never()).save(any());
    }

    @Test
    void testSepayWebhook_ApiKeyValidation() {
        when(bankTransferConfig.getSepayApiKey()).thenReturn("secret_token_123");

        Map<String, Object> payload = Map.of(
                "transferType", "in",
                "content", "SX123456"
        );

        // Invalid key
        ResponseEntity<Map<String, Object>> resInvalid = controller.handleSepayWebhook("Apikey wrong_key", payload);
        assertEquals(HttpStatus.UNAUTHORIZED, resInvalid.getStatusCode());

        // Valid key
        Order mockOrder = new Order();
        mockOrder.setOrderCode("SX123456");
        mockOrder.setStatus("PENDING");
        when(orderRepository.findByOrderCode("SX123456")).thenReturn(Optional.of(mockOrder));

        ResponseEntity<Map<String, Object>> resValid = controller.handleSepayWebhook("Apikey secret_token_123", payload);
        assertEquals(HttpStatus.OK, resValid.getStatusCode());
        assertEquals("PAID", mockOrder.getStatus());
    }

    @Test
    void testSimulateBankTransferPayment() {
        Order mockOrder = new Order();
        mockOrder.setOrderCode("SX888888");
        mockOrder.setStatus("PENDING");

        when(orderRepository.findByOrderCode("SX888888")).thenReturn(Optional.of(mockOrder));

        ResponseEntity<ApiResult<Map<String, Object>>> response = controller.simulateBankTransferPayment(
                Map.of("orderCode", "SX888888")
        );

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("PAID", mockOrder.getStatus());
        verify(orderRepository, times(1)).save(mockOrder);
    }
}
