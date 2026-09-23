package com.succulentshop.backend;

import com.succulentshop.backend.config.BankTransferConfig;
import com.succulentshop.backend.constant.OrderStatus;
import com.succulentshop.backend.controller.BankTransferWebhookController;
import com.succulentshop.backend.dto.ApiResult;
import com.succulentshop.backend.dto.BankTransferWebhookResponse;
import com.succulentshop.backend.dto.SepayWebhookRequest;
import com.succulentshop.backend.dto.SimulatePaymentRequest;
import com.succulentshop.backend.entity.Order;
import com.succulentshop.backend.repository.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

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
        mockOrder.setStatus(OrderStatus.PENDING.getCode());
        mockOrder.setTotalAmount(150000);

        when(orderRepository.findByOrderCode("SX123456")).thenReturn(Optional.of(mockOrder));
        when(orderRepository.save(any(Order.class))).thenReturn(mockOrder);

        SepayWebhookRequest payload = new SepayWebhookRequest();
        payload.setGateway("Vietcombank");
        payload.setTransferType("in");
        payload.setTransferAmount(150000L);
        payload.setContent("Chuyen tien don hang SX123456 sen xinh");
        payload.setReferenceCode("VCB.999");

        ResponseEntity<ApiResult<BankTransferWebhookResponse>> response = controller.handleSepayWebhook(null, payload);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertNotNull(response.getBody().getData());
        assertTrue(response.getBody().getData().isSuccess());
        assertEquals(OrderStatus.PAID.getCode(), mockOrder.getStatus());
        verify(orderRepository, times(1)).save(mockOrder);
    }

    @Test
    void testSepayWebhook_IgnoreOutTransfer() {
        SepayWebhookRequest payload = new SepayWebhookRequest();
        payload.setTransferType("out");
        payload.setTransferAmount(50000L);
        payload.setContent("Rut tien");

        ResponseEntity<ApiResult<BankTransferWebhookResponse>> response = controller.handleSepayWebhook(null, payload);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        verify(orderRepository, never()).save(any());
    }

    @Test
    void testSepayWebhook_OrderNotFound() {
        when(orderRepository.findByOrderCode("SX999999")).thenReturn(Optional.empty());

        SepayWebhookRequest payload = new SepayWebhookRequest();
        payload.setTransferType("in");
        payload.setTransferAmount(100000L);
        payload.setContent("Thanh toan SX999999");

        ResponseEntity<ApiResult<BankTransferWebhookResponse>> response = controller.handleSepayWebhook(null, payload);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertNotNull(response.getBody().getData());
        assertFalse(response.getBody().getData().isSuccess());
        verify(orderRepository, never()).save(any());
    }

    @Test
    void testSepayWebhook_ApiKeyValidation() {
        when(bankTransferConfig.getSepayApiKey()).thenReturn("secret_token_123");

        SepayWebhookRequest payload = new SepayWebhookRequest();
        payload.setTransferType("in");
        payload.setContent("SX123456");

        // Invalid key
        ResponseEntity<ApiResult<BankTransferWebhookResponse>> resInvalid = controller.handleSepayWebhook("Apikey wrong_key", payload);
        assertEquals(HttpStatus.UNAUTHORIZED, resInvalid.getStatusCode());

        // Valid key
        Order mockOrder = new Order();
        mockOrder.setOrderCode("SX123456");
        mockOrder.setStatus(OrderStatus.PENDING.getCode());
        when(orderRepository.findByOrderCode("SX123456")).thenReturn(Optional.of(mockOrder));

        ResponseEntity<ApiResult<BankTransferWebhookResponse>> resValid = controller.handleSepayWebhook("Apikey secret_token_123", payload);
        assertEquals(HttpStatus.OK, resValid.getStatusCode());
        assertEquals(OrderStatus.PAID.getCode(), mockOrder.getStatus());
    }

    @Test
    void testSimulateBankTransferPayment() {
        Order mockOrder = new Order();
        mockOrder.setOrderCode("SX888888");
        mockOrder.setStatus(OrderStatus.PENDING.getCode());

        when(orderRepository.findByOrderCode("SX888888")).thenReturn(Optional.of(mockOrder));

        SimulatePaymentRequest simReq = new SimulatePaymentRequest("SX888888");
        ResponseEntity<ApiResult<BankTransferWebhookResponse>> response = controller.simulateBankTransferPayment(simReq);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(OrderStatus.PAID.getCode(), mockOrder.getStatus());
        verify(orderRepository, times(1)).save(mockOrder);
    }
}
