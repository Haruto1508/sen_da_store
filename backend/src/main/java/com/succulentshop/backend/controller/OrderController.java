package com.succulentshop.backend.controller;

import com.succulentshop.backend.dto.ApiResult;
import com.succulentshop.backend.dto.CreateOrderRequest;
import com.succulentshop.backend.service.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<ApiResult<Map<String, Object>>> createOrder(@RequestBody CreateOrderRequest request) {
        Map<String, Object> result = orderService.createOrder(request);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("order", result.get("order"));
        if (result.containsKey("vietQr")) {
            data.put("vietQr", result.get("vietQr"));
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResult.ok("Đặt hàng thành công!", data));
    }

    @GetMapping("/{orderCode}")
    public ResponseEntity<ApiResult<Map<String, Object>>> getOrderByCode(@PathVariable String orderCode) {
        Map<String, Object> orderData = orderService.getOrderByCode(orderCode);
        return ResponseEntity.ok(ApiResult.ok("Lấy thông tin đơn hàng thành công", orderData));
    }

    @GetMapping("/customer")
    public ResponseEntity<ApiResult<List<Map<String, Object>>>> getOrdersByCustomer(@RequestParam String phone) {
        List<Map<String, Object>> list = orderService.getOrdersByCustomer(phone);
        return ResponseEntity.ok(ApiResult.ok("Tải danh sách đơn hàng thành công", list));
    }
}
