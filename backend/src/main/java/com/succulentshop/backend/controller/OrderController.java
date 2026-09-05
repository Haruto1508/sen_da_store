package com.succulentshop.backend.controller;

import com.succulentshop.backend.dto.CreateOrderRequest;
import com.succulentshop.backend.entity.Coupon;
import com.succulentshop.backend.entity.Order;
import com.succulentshop.backend.entity.OrderItem;
import com.succulentshop.backend.entity.Product;
import com.succulentshop.backend.repository.CouponRepository;
import com.succulentshop.backend.repository.OrderRepository;
import com.succulentshop.backend.repository.ProductRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CouponRepository couponRepository;

    private static final String BANK_NAME = "Vietcombank";
    private static final String BANK_CODE = "VCB";
    private static final String ACCOUNT_NUMBER = "1028889999";
    private static final String ACCOUNT_NAME = "NGUYEN HOANG LONG";

    public OrderController(OrderRepository orderRepository,
                           ProductRepository productRepository,
                           CouponRepository couponRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.couponRepository = couponRepository;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createOrder(@RequestBody CreateOrderRequest request) {
        if (request.getCustomerName() == null || request.getCustomerName().trim().isEmpty() ||
            request.getCustomerPhone() == null || request.getCustomerPhone().trim().isEmpty() ||
            request.getCustomerAddress() == null || request.getCustomerAddress().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Vui lòng cung cấp đầy đủ họ tên, số điện thoại và địa chỉ nhận hàng"
            ));
        }

        if (request.getItems() == null || request.getItems().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Giỏ hàng đang trống, không thể tạo đơn hàng"
            ));
        }

        Order order = new Order();
        int randomDigits = 100000 + new Random().nextInt(900000);
        String orderCode = "SX" + randomDigits;

        order.setOrderCode(orderCode);
        order.setCustomerName(request.getCustomerName().trim());
        order.setCustomerPhone(request.getCustomerPhone().trim());
        order.setCustomerAddress(request.getCustomerAddress().trim());
        order.setNote(request.getNote());
        order.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "vietqr");

        int subtotal = 0;
        List<Map<String, Object>> itemResponses = new ArrayList<>();

        for (CreateOrderRequest.OrderItemDto itemDto : request.getItems()) {
            Optional<Product> pOpt = productRepository.findById(itemDto.getId());
            int price = pOpt.isPresent() ? pOpt.get().getPrice() : (itemDto.getPrice() != null ? itemDto.getPrice() : 0);
            String name = pOpt.isPresent() ? pOpt.get().getName() : itemDto.getName();
            String image = pOpt.isPresent() ? pOpt.get().getImage() : itemDto.getImage();
            int qty = Math.max(1, itemDto.getQuantity() != null ? itemDto.getQuantity() : 1);

            subtotal += price * qty;

            OrderItem item = new OrderItem(itemDto.getId(), name, price, qty, image);
            order.addItem(item);

            itemResponses.add(Map.of(
                "id", itemDto.getId(),
                "name", name,
                "price", price,
                "quantity", qty,
                "image", image != null ? image : ""
            ));
        }

        // Validate coupon
        int discountPercent = 0;
        String validCouponCode = null;
        if (request.getDiscountCode() != null && !request.getDiscountCode().trim().isEmpty()) {
            Optional<Coupon> cOpt = couponRepository.findByCodeIgnoreCaseAndIsActiveTrue(request.getDiscountCode().trim());
            if (cOpt.isPresent()) {
                discountPercent = cOpt.get().getDiscountPercent();
                validCouponCode = cOpt.get().getCode();
            }
        }

        int discountAmount = (int) Math.round(subtotal * (discountPercent / 100.0));
        int shippingFee = subtotal >= 200000 ? 0 : 30000;
        int totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);

        order.setSubtotal(subtotal);
        order.setDiscountAmount(discountAmount);
        order.setDiscountCode(validCouponCode);
        order.setShippingFee(shippingFee);
        order.setTotalAmount(totalAmount);
        order.setStatus("PENDING");

        orderRepository.save(order);

        // VietQR Info
        Map<String, Object> vietQrData = null;
        if ("vietqr".equalsIgnoreCase(order.getPaymentMethod())) {
            String encodedName = URLEncoder.encode(ACCOUNT_NAME, StandardCharsets.UTF_8);
            String qrUrl = String.format("https://img.vietqr.io/image/%s-%s-compact2.png?amount=%d&addInfo=%s&accountName=%s",
                    BANK_CODE, ACCOUNT_NUMBER, totalAmount, orderCode, encodedName);

            vietQrData = Map.of(
                "bankName", BANK_NAME,
                "accountNumber", ACCOUNT_NUMBER,
                "accountName", ACCOUNT_NAME,
                "amount", totalAmount,
                "orderCode", orderCode,
                "qrImageUrl", qrUrl
            );
        }

        Map<String, Object> orderData = new LinkedHashMap<>();
        orderData.put("id", order.getId());
        orderData.put("orderCode", order.getOrderCode());
        orderData.put("customerName", order.getCustomerName());
        orderData.put("customerPhone", order.getCustomerPhone());
        orderData.put("customerAddress", order.getCustomerAddress());
        orderData.put("note", order.getNote());
        orderData.put("paymentMethod", order.getPaymentMethod());
        orderData.put("items", itemResponses);
        orderData.put("subtotal", order.getSubtotal());
        orderData.put("discountAmount", order.getDiscountAmount());
        orderData.put("shippingFee", order.getShippingFee());
        orderData.put("totalAmount", order.getTotalAmount());
        orderData.put("status", order.getStatus());
        orderData.put("createdAt", order.getCreatedAt().toString());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("message", "Đặt hàng thành công!");
        response.put("order", orderData);
        if (vietQrData != null) {
            response.put("vietQr", vietQrData);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{orderCode}")
    public ResponseEntity<Map<String, Object>> getOrderByCode(@PathVariable String orderCode) {
        Optional<Order> orderOpt = orderRepository.findByOrderCode(orderCode.trim().toUpperCase());

        if (orderOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of(
                "success", false,
                "message", "Không tìm thấy đơn hàng với mã: " + orderCode
            ));
        }

        Order o = orderOpt.get();
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

        Map<String, Object> orderData = new LinkedHashMap<>();
        orderData.put("id", o.getId());
        orderData.put("orderCode", o.getOrderCode());
        orderData.put("customerName", o.getCustomerName());
        orderData.put("customerPhone", o.getCustomerPhone());
        orderData.put("customerAddress", o.getCustomerAddress());
        orderData.put("note", o.getNote());
        orderData.put("paymentMethod", o.getPaymentMethod());
        orderData.put("items", items);
        orderData.put("subtotal", o.getSubtotal());
        orderData.put("discountAmount", o.getDiscountAmount());
        orderData.put("discountCode", o.getDiscountCode());
        orderData.put("shippingFee", o.getShippingFee());
        orderData.put("totalAmount", o.getTotalAmount());
        orderData.put("status", o.getStatus());
        orderData.put("createdAt", o.getCreatedAt().toString());

        return ResponseEntity.ok(Map.of(
            "success", true,
            "data", orderData
        ));
    }
}
