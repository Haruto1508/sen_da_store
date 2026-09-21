package com.succulentshop.backend.controller;

import com.succulentshop.backend.constant.MessageCode;
import com.succulentshop.backend.dto.ApiResult;
import com.succulentshop.backend.dto.CancelOrderRequest;
import com.succulentshop.backend.dto.CreateOrderRequest;
import com.succulentshop.backend.dto.CreateOrderResponse;
import com.succulentshop.backend.dto.OrderResponse;
import com.succulentshop.backend.dto.ReturnOrderRequest;
import com.succulentshop.backend.dto.ReturnPolicyResponse;
import com.succulentshop.backend.service.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<ApiResult<CreateOrderResponse>> createOrder(@RequestBody CreateOrderRequest request) {
        CreateOrderResponse result = orderService.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED)
               .body(ApiResult.ok(MessageCode.ORDER_CREATED, result));
    }

    @GetMapping("/{orderCode}")
    public ResponseEntity<ApiResult<OrderResponse>> getOrderByCode(@PathVariable String orderCode) {
        OrderResponse orderData = orderService.getOrderByCode(orderCode);
        return ResponseEntity.ok(ApiResult.ok(MessageCode.ORDER_DETAIL_SUCCESS, orderData));
    }

    @GetMapping("/customer")
    public ResponseEntity<ApiResult<List<OrderResponse>>> getOrdersByCustomer(
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) String email
    ) {
        List<OrderResponse> list;
        if (email != null && !email.isBlank()) {
            list = orderService.getOrdersByCustomer(phone, email);
        } else {
            list = orderService.getOrdersByCustomer(phone);
        }
        return ResponseEntity.ok(ApiResult.ok(MessageCode.ORDER_LIST_SUCCESS, list));
    }

    public ResponseEntity<ApiResult<List<OrderResponse>>> getOrdersByCustomer(String phone) {
        return getOrdersByCustomer(phone, null);
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResult<OrderResponse>> cancelOrder(
            @PathVariable Long id,
            @RequestBody(required = false) CancelOrderRequest body
    ) {
        String reason = (body != null) ? body.getReason() : null;
        OrderResponse result = orderService.cancelOrder(id, reason);
        return ResponseEntity.ok(ApiResult.ok(MessageCode.ORDER_CANCELLED, result));
    }

    @GetMapping("/policy")
    public ResponseEntity<ApiResult<ReturnPolicyResponse>> getReturnPolicy() {
        ReturnPolicyResponse result = orderService.getReturnPolicy();
        return ResponseEntity.ok(ApiResult.ok(MessageCode.POLICY_CONFIG_RETRIEVED, result));
    }

    @PatchMapping("/{id}/receive")
    public ResponseEntity<ApiResult<OrderResponse>> confirmReceived(
            @PathVariable Long id
    ) {
        OrderResponse result = orderService.confirmReceived(id);
        return ResponseEntity.ok(ApiResult.ok(MessageCode.ORDER_RECEIVED, result));
    }

    @PatchMapping("/{id}/return-request")
    public ResponseEntity<ApiResult<OrderResponse>> requestReturn(
            @PathVariable Long id,
            @RequestBody ReturnOrderRequest request
    ) {
        OrderResponse result = orderService.requestReturn(id, request);
        return ResponseEntity.ok(ApiResult.ok(MessageCode.ORDER_RETURN_REQUESTED, result));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResult<Void>> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.ok(ApiResult.ok(MessageCode.ORDER_DELETED, null));
    }

    @DeleteMapping("/bulk")
    public ResponseEntity<ApiResult<Void>> deleteOrdersBulk(@RequestBody List<Long> ids) {
        orderService.deleteOrdersBulk(ids);
        return ResponseEntity.ok(ApiResult.ok(MessageCode.ORDERS_BULK_DELETED, null));
    }
}
