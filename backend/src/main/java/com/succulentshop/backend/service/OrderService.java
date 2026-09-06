package com.succulentshop.backend.service;

import com.succulentshop.backend.dto.CreateOrderRequest;
import com.succulentshop.backend.entity.Coupon;
import com.succulentshop.backend.entity.Order;
import com.succulentshop.backend.entity.OrderItem;
import com.succulentshop.backend.entity.Product;
import com.succulentshop.backend.entity.User;
import com.succulentshop.backend.exception.AppException;
import com.succulentshop.backend.exception.ErrorCode;
import com.succulentshop.backend.exception.ResourceNotFoundException;
import com.succulentshop.backend.repository.OrderRepository;
import com.succulentshop.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductService productService;
    private final CouponService couponService;
    private final UserRepository userRepository;

    private static final String BANK_NAME = "Vietcombank";
    private static final String BANK_CODE = "VCB";
    private static final String ACCOUNT_NUMBER = "1028889999";
    private static final String ACCOUNT_NAME = "NGUYEN HOANG LONG";

    public OrderService(OrderRepository orderRepository,
                        ProductService productService,
                        CouponService couponService,
                        UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.productService = productService;
        this.couponService = couponService;
        this.userRepository = userRepository;
    }

    @Transactional
    public Map<String, Object> createOrder(CreateOrderRequest request) {
        if (request.getCustomerName() == null || request.getCustomerName().trim().isEmpty() ||
            request.getCustomerPhone() == null || request.getCustomerPhone().trim().isEmpty() ||
            request.getCustomerAddress() == null || request.getCustomerAddress().trim().isEmpty()) {
            throw new AppException(ErrorCode.ORDER_CUSTOMER_INFO_REQUIRED);
        }

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new AppException(ErrorCode.CART_EMPTY);
        }

        // 1. Verify and deduct stock for all items atomically
        List<OrderItem> orderItems = new ArrayList<>();
        int subtotal = 0;
        List<Map<String, Object>> itemResponses = new ArrayList<>();

        for (CreateOrderRequest.OrderItemDto itemDto : request.getItems()) {
            Product p = productService.findByIdOrThrow(itemDto.getId());
            int qty = Math.max(1, itemDto.getQuantity() != null ? itemDto.getQuantity() : 1);
            int price = p.getPrice() != null ? p.getPrice() : (itemDto.getPrice() != null ? itemDto.getPrice() : 0);

            // Deduct stock
            productService.deductStock(p.getId(), qty);

            subtotal += price * qty;
            OrderItem item = new OrderItem(p.getId(), p.getName(), price, qty, p.getImage());
            orderItems.add(item);

            itemResponses.add(Map.of(
                "id", p.getId(),
                "name", p.getName(),
                "price", price,
                "quantity", qty,
                "image", p.getImage() != null ? p.getImage() : ""
            ));
        }

        // 2. Validate coupon
        int discountPercent = 0;
        String validCouponCode = null;
        if (request.getDiscountCode() != null && !request.getDiscountCode().trim().isEmpty()) {
            Optional<Coupon> cOpt = couponService.validateCoupon(request.getDiscountCode());
            if (cOpt.isPresent()) {
                discountPercent = cOpt.get().getDiscountPercent();
                validCouponCode = cOpt.get().getCode();
            }
        }

        int discountAmount = (int) Math.round(subtotal * (discountPercent / 100.0));
        int shippingFee = subtotal >= 200000 ? 0 : 30000;
        int totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);

        // 3. Build & save order
        Order order = new Order();
        int randomDigits = 100000 + new Random().nextInt(900000);
        String orderCode = "SX" + randomDigits;

        order.setOrderCode(orderCode);
        order.setCustomerName(request.getCustomerName().trim());
        order.setCustomerPhone(request.getCustomerPhone().trim());
        order.setCustomerAddress(request.getCustomerAddress().trim());
        order.setNote(request.getNote());
        order.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "vietqr");
        order.setSubtotal(subtotal);
        order.setDiscountAmount(discountAmount);
        order.setDiscountCode(validCouponCode);
        order.setShippingFee(shippingFee);
        order.setTotalAmount(totalAmount);
        order.setStatus("PENDING");

        for (OrderItem it : orderItems) {
            order.addItem(it);
        }

        Order saved = orderRepository.save(order);

        // 4. Reward Sen Points to registered customer
        Optional<User> userOpt = userRepository.findByPhone(saved.getCustomerPhone());
        if (userOpt.isPresent()) {
            User customer = userOpt.get();
            int pointsEarned = Math.max(10, totalAmount / 10000);
            customer.setPoints((customer.getPoints() != null ? customer.getPoints() : 0) + pointsEarned);
            userRepository.save(customer);
        }

        // 5. Generate VietQR if needed
        Map<String, Object> vietQrData = null;
        if ("vietqr".equalsIgnoreCase(saved.getPaymentMethod())) {
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

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("order", convertOrderToMap(saved));
        if (vietQrData != null) {
            response.put("vietQr", vietQrData);
        }

        return response;
    }

    public Map<String, Object> getOrderByCode(String orderCode) {
        Order o = orderRepository.findByOrderCode(orderCode.trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.ORDER_NOT_FOUND, "Không tìm thấy đơn hàng: " + orderCode));
        return convertOrderToMap(o);
    }

    public List<Map<String, Object>> getOrdersByCustomer(String phone) {
        if (phone == null || phone.isBlank()) return Collections.emptyList();
        List<Order> list = orderRepository.findByCustomerPhoneOrderByCreatedAtDesc(phone.trim());
        List<Map<String, Object>> result = new ArrayList<>();
        for (Order o : list) {
            result.add(convertOrderToMap(o));
        }
        return result;
    }

    @Transactional
    public Map<String, Object> updateOrderStatus(Long orderId, String newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.ORDER_NOT_FOUND, "Không tìm thấy đơn hàng ID: " + orderId));

        String oldStatus = order.getStatus();
        String formatted = newStatus.trim().toUpperCase();

        // If order was cancelled, restore inventory stock
        if ("CANCELLED".equals(formatted) && !"CANCELLED".equals(oldStatus)) {
            for (OrderItem it : order.getItems()) {
                productService.restoreStock(it.getProductId(), it.getQuantity());
            }
        }

        order.setStatus(formatted);
        orderRepository.save(order);
        return convertOrderToMap(order);
    }

    public Map<String, Object> convertOrderToMap(Order o) {
        List<Map<String, Object>> items = new ArrayList<>();
        if (o.getItems() != null) {
            for (OrderItem it : o.getItems()) {
                items.add(Map.of(
                    "productId", it.getProductId() != null ? it.getProductId() : "",
                    "productName", it.getProductName() != null ? it.getProductName() : "",
                    "price", it.getPrice() != null ? it.getPrice() : 0,
                    "quantity", it.getQuantity() != null ? it.getQuantity() : 1,
                    "image", it.getImage() != null ? it.getImage() : ""
                ));
            }
        }

        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", o.getId());
        map.put("publicId", o.getPublicId());
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
        map.put("createdAt", o.getCreatedAt() != null ? o.getCreatedAt().toString() : null);

        return map;
    }
}
