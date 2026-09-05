package com.succulentshop.backend.controller;

import com.succulentshop.backend.entity.Order;
import com.succulentshop.backend.entity.OrderItem;
import com.succulentshop.backend.repository.OrderRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final OrderRepository orderRepository;

    public AdminController(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @GetMapping("/orders")
    public ResponseEntity<Map<String, Object>> getAllOrders(@RequestParam(required = false) String status) {
        List<Order> orders;
        if (status != null && !status.isBlank() && !"all".equalsIgnoreCase(status)) {
            orders = orderRepository.findByStatusOrderByCreatedAtDesc(status.toUpperCase());
        } else {
            orders = orderRepository.findAllByOrderByCreatedAtDesc();
        }

        List<Map<String, Object>> responseList = new ArrayList<>();
        for (Order o : orders) {
            List<Map<String, Object>> items = new ArrayList<>();
            for (OrderItem it : o.getItems()) {
                items.add(Map.of(
                    "productId", it.getProductId(),
                    "productName", it.getProductName(),
                    "price", it.getPrice(),
                    "quantity", it.getQuantity(),
                    "image", it.getImage() != null ? it.getImage() : ""
                ));
            }

            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", o.getId());
            map.put("orderCode", o.getOrderCode());
            map.put("customerName", o.getCustomerName());
            map.put("customerPhone", o.getCustomerPhone());
            map.put("customerAddress", o.getCustomerAddress());
            map.put("note", o.getNote());
            map.put("paymentMethod", o.getPaymentMethod());
            map.put("items", items);
            map.put("subtotal", o.getSubtotal());
            map.put("discountAmount", o.getDiscountAmount());
            map.put("discountCode", o.getDiscountCode());
            map.put("shippingFee", o.getShippingFee());
            map.put("totalAmount", o.getTotalAmount());
            map.put("status", o.getStatus());
            map.put("createdAt", o.getCreatedAt().toString());

            responseList.add(map);
        }

        return ResponseEntity.ok(Map.of(
            "success", true,
            "total", responseList.size(),
            "data", responseList
        ));
    }

    @PatchMapping("/orders/{id}/status")
    public ResponseEntity<Map<String, Object>> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        String status = body.get("status");
        if (status == null || status.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Trạng thái không được để trống"
            ));
        }

        List<String> validStatuses = List.of("PENDING", "PAID", "SHIPPING", "COMPLETED", "CANCELLED");
        String formattedStatus = status.trim().toUpperCase();

        if (!validStatuses.contains(formattedStatus)) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Trạng thái không hợp lệ: " + validStatuses
            ));
        }

        Optional<Order> orderOpt = orderRepository.findById(id);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of(
                "success", false,
                "message", "Không tìm thấy đơn hàng"
            ));
        }

        Order order = orderOpt.get();
        order.setStatus(formattedStatus);
        orderRepository.save(order);

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Cập nhật trạng thái đơn hàng thành công",
            "newStatus", formattedStatus
        ));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        long totalOrders = orderRepository.count();
        long pendingOrders = orderRepository.countByStatus("PENDING");
        long paidOrders = orderRepository.countByStatus("PAID");
        long completedOrders = orderRepository.countByStatus("COMPLETED");

        List<Order> allOrders = orderRepository.findAll();
        long totalRevenue = allOrders.stream()
                .filter(o -> "PAID".equals(o.getStatus()) || "SHIPPING".equals(o.getStatus()) || "COMPLETED".equals(o.getStatus()))
                .mapToLong(Order::getTotalAmount)
                .sum();

        return ResponseEntity.ok(Map.of(
            "success", true,
            "data", Map.of(
                "totalOrders", totalOrders,
                "pendingOrders", pendingOrders,
                "paidOrders", paidOrders,
                "completedOrders", completedOrders,
                "totalRevenue", totalRevenue
            )
        ));
    }
}
