package com.succulentshop.backend.service;

import com.succulentshop.backend.config.BankTransferConfig;
import com.succulentshop.backend.dto.CreateOrderRequest;
import com.succulentshop.backend.dto.CreateOrderResponse;
import com.succulentshop.backend.dto.OrderItemResponse;
import com.succulentshop.backend.dto.OrderResponse;
import com.succulentshop.backend.dto.VietQrResponse;
import com.succulentshop.backend.entity.Coupon;
import com.succulentshop.backend.entity.Order;
import com.succulentshop.backend.entity.OrderItem;
import com.succulentshop.backend.entity.Product;
import com.succulentshop.backend.entity.User;
import com.succulentshop.backend.exception.AppException;
import com.succulentshop.backend.exception.ErrorCode;
import com.succulentshop.backend.exception.InsufficientStockException;
import com.succulentshop.backend.exception.ResourceNotFoundException;
import com.succulentshop.backend.repository.OrderRepository;
import com.succulentshop.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
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
    private final BankTransferConfig bankTransferConfig;
    private final ShippingService shippingService;
    private final com.succulentshop.backend.event.OrderEventPublisher orderEventPublisher;

    private static final String BANK_NAME = "MBBank";
    private static final String BANK_CODE = "MBBank";
    private static final String ACCOUNT_NUMBER = "VQRQALYXL6596";
    private static final String ACCOUNT_NAME = "NGUYEN HOANG THAI VINH";

    @Autowired
    public OrderService(OrderRepository orderRepository,
                        ProductService productService,
                        CouponService couponService,
                        UserRepository userRepository,
                        @Autowired(required = false) BankTransferConfig bankTransferConfig,
                        @Autowired(required = false) ShippingService shippingService,
                        @Autowired(required = false) com.succulentshop.backend.event.OrderEventPublisher orderEventPublisher) {
        this.orderRepository = orderRepository;
        this.productService = productService;
        this.couponService = couponService;
        this.userRepository = userRepository;
        this.bankTransferConfig = bankTransferConfig;
        this.shippingService = shippingService;
        this.orderEventPublisher = orderEventPublisher;
    }

    public OrderService(OrderRepository orderRepository,
                        ProductService productService,
                        CouponService couponService,
                        UserRepository userRepository) {
        this(orderRepository, productService, couponService, userRepository, null, null, null);
    }

    @Transactional
    public CreateOrderResponse createOrder(CreateOrderRequest request) {
        validateCreateOrderRequest(request);

        OrderItemsResult itemsResult = processOrderItemsAndDeductStock(request.getItems());
        int subtotal = itemsResult.subtotal;
        List<OrderItem> orderItems = itemsResult.orderItems;

        CouponDiscountResult couponResult = calculateCouponDiscount(request.getDiscountCode(), subtotal);
        int shippingFee = calculateShippingFee(request, subtotal);
        int totalAmount = Math.max(0, subtotal - couponResult.discountAmount + shippingFee);

        String orderCode = generateUniqueOrderCode(request.getOrderCode());

        Order order = buildOrderEntity(request, orderCode, subtotal, couponResult, shippingFee, totalAmount, orderItems);
        Order saved = orderRepository.save(order);

        awardLoyaltyPoints(saved.getCustomerPhone(), totalAmount);

        VietQrResponse vietQrResponse = null;
        if ("vietqr".equalsIgnoreCase(saved.getPaymentMethod())) {
            vietQrResponse = buildVietQrResponse(orderCode, totalAmount);
        }

        CreateOrderResponse response = new CreateOrderResponse();
        response.setOrder(convertOrderToResponse(saved));
        response.setVietQr(vietQrResponse);

        if (orderEventPublisher != null) {
            orderEventPublisher.publishOrderCreated(saved);
        }

        return response;
    }

    private void validateCreateOrderRequest(CreateOrderRequest request) {
        if (request == null ||
            request.getCustomerName() == null || request.getCustomerName().trim().isEmpty() ||
            request.getCustomerPhone() == null || request.getCustomerPhone().trim().isEmpty() ||
            request.getCustomerAddress() == null || request.getCustomerAddress().trim().isEmpty()) {
            throw new AppException(ErrorCode.ORDER_CUSTOMER_INFO_REQUIRED);
        }
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new AppException(ErrorCode.CART_EMPTY);
        }
    }

    private record OrderItemsResult(List<OrderItem> orderItems, int subtotal) {}

    private OrderItemsResult processOrderItemsAndDeductStock(List<CreateOrderRequest.OrderItemDto> itemDtos) {
        List<OrderItem> orderItems = new ArrayList<>();
        int subtotal = 0;

        for (CreateOrderRequest.OrderItemDto itemDto : itemDtos) {
            Product p = productService.findActiveByIdOrThrow(itemDto.getId());
            int qty = Math.max(1, itemDto.getQuantity() != null ? itemDto.getQuantity() : 1);
            int currentStock = p.getInStock() != null ? p.getInStock() : 0;

            if (currentStock <= 0) {
                throw new InsufficientStockException(
                    ErrorCode.INSUFFICIENT_STOCK,
                    String.format("Sản phẩm \"%s\" trong giỏ hàng hiện đã hết hàng trong kho", p.getName())
                );
            }
            if (currentStock < qty) {
                throw new InsufficientStockException(
                    ErrorCode.INSUFFICIENT_STOCK,
                    String.format("Cây \"%s\" hiện chỉ còn %d cây trong kho, không đủ số lượng %d bạn yêu cầu",
                            p.getName(), currentStock, qty)
                );
            }

            int price = p.getPrice() != null ? p.getPrice() : (itemDto.getPrice() != null ? itemDto.getPrice() : 0);
            productService.deductStock(p.getId(), qty);

            subtotal += price * qty;
            orderItems.add(new OrderItem(p.getId(), p.getName(), price, qty, p.getImage()));
        }

        return new OrderItemsResult(orderItems, subtotal);
    }

    private record CouponDiscountResult(String validCouponCode, int discountAmount) {}

    private CouponDiscountResult calculateCouponDiscount(String discountCode, int subtotal) {
        int discountPercent = 0;
        String validCouponCode = null;
        if (discountCode != null && !discountCode.trim().isEmpty()) {
            Optional<Coupon> cOpt = couponService.validateCoupon(discountCode);
            if (cOpt.isPresent()) {
                discountPercent = cOpt.get().getDiscountPercent();
                validCouponCode = cOpt.get().getCode();
            }
        }
        int discountAmount = (int) Math.round(subtotal * (discountPercent / 100.0));
        return new CouponDiscountResult(validCouponCode, discountAmount);
    }

    private int calculateShippingFee(CreateOrderRequest request, int subtotal) {
        if (shippingService != null) {
            return shippingService.calculateShippingFee(subtotal, request.getCity(), request.getCustomerAddress());
        }
        return request.getShippingFee() != null ? request.getShippingFee() : (subtotal >= 200000 ? 0 : 35000);
    }

    private String generateUniqueOrderCode(String requestOrderCode) {
        if (requestOrderCode != null && !requestOrderCode.trim().isEmpty() &&
                requestOrderCode.trim().toUpperCase().startsWith("SX")) {
            String orderCode = requestOrderCode.trim().toUpperCase();
            if (orderRepository.findByOrderCode(orderCode).isEmpty()) {
                return orderCode;
            }
        }
        int randomDigits = 100000 + new Random().nextInt(900000);
        return "SX" + randomDigits;
    }

    private Order buildOrderEntity(CreateOrderRequest request, String orderCode, int subtotal,
                                   CouponDiscountResult couponResult, int shippingFee, int totalAmount,
                                   List<OrderItem> orderItems) {
        Order order = new Order();
        order.setOrderCode(orderCode);
        order.setCustomerName(request.getCustomerName().trim());
        order.setCustomerPhone(request.getCustomerPhone().trim());
        order.setCustomerAddress(request.getCustomerAddress().trim());
        if (request.getCustomerEmail() != null && !request.getCustomerEmail().isBlank()) {
            order.setCustomerEmail(request.getCustomerEmail().trim());
        }
        order.setNote(request.getNote());
        order.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "vietqr");
        order.setSubtotal(subtotal);
        order.setDiscountAmount(couponResult.discountAmount);
        order.setDiscountCode(couponResult.validCouponCode);
        order.setShippingFee(shippingFee);
        order.setTotalAmount(totalAmount);
        order.setStatus("PENDING");

        for (OrderItem it : orderItems) {
            order.addItem(it);
        }
        return order;
    }

    private void awardLoyaltyPoints(String phone, int totalAmount) {
        if (phone == null || phone.isBlank()) return;
        Optional<User> userOpt = userRepository.findByPhone(phone);
        if (userOpt.isPresent()) {
            User customer = userOpt.get();
            int pointsEarned = Math.max(10, totalAmount / 10000);
            customer.setPoints((customer.getPoints() != null ? customer.getPoints() : 0) + pointsEarned);
            userRepository.save(customer);
        }
    }

    private VietQrResponse buildVietQrResponse(String orderCode, int totalAmount) {
        String activeBankCode = (bankTransferConfig != null && bankTransferConfig.getBankCode() != null && !bankTransferConfig.getBankCode().isBlank())
                ? bankTransferConfig.getBankCode() : BANK_CODE;
        String activeAccountNumber = (bankTransferConfig != null && bankTransferConfig.getAccountNumber() != null && !bankTransferConfig.getAccountNumber().isBlank())
                ? bankTransferConfig.getAccountNumber() : ACCOUNT_NUMBER;
        String activeAccountName = (bankTransferConfig != null && bankTransferConfig.getAccountName() != null && !bankTransferConfig.getAccountName().isBlank())
                ? bankTransferConfig.getAccountName() : ACCOUNT_NAME;

        String encodedName = URLEncoder.encode(activeAccountName, StandardCharsets.UTF_8);
        String qrUrl = String.format("https://vietqr.app/img?bank=%s&acc=%s&template=compact&amount=%d&des=%s&showinfo=true&fullacc=true&holder=%s&store=Sen%%20Xinh%%20Garden",
                activeBankCode, activeAccountNumber, totalAmount, orderCode, encodedName);

        VietQrResponse response = new VietQrResponse();
        response.setBankName(BANK_NAME);
        response.setBankCode(activeBankCode);
        response.setAccountNumber(activeAccountNumber);
        response.setAccountName(activeAccountName);
        response.setAmount(totalAmount);
        response.setOrderCode(orderCode);
        response.setQrImageUrl(qrUrl);
        return response;
    }

    public OrderResponse getOrderByCode(String orderCode) {
        Order o = orderRepository.findByOrderCode(orderCode.trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.ORDER_NOT_FOUND, "Không tìm thấy đơn hàng: " + orderCode));
        return convertOrderToResponse(o);
    }

    public List<OrderResponse> getOrdersByCustomer(String phone, String email) {
        String cleanPhone = (phone != null && !phone.isBlank()) ? phone.trim() : null;
        String cleanEmail = (email != null && !email.isBlank()) ? email.trim().toLowerCase() : null;

        if (cleanPhone == null && cleanEmail == null) return Collections.emptyList();

        List<Order> list;
        if (cleanPhone != null && cleanEmail != null) {
            list = orderRepository.findByCustomerPhoneOrCustomerEmailOrderByCreatedAtDesc(cleanPhone, cleanEmail);
        } else if (cleanPhone != null) {
            list = orderRepository.findByCustomerPhoneOrderByCreatedAtDesc(cleanPhone);
        } else {
            list = orderRepository.findByCustomerEmailOrderByCreatedAtDesc(cleanEmail);
        }

        List<OrderResponse> result = new ArrayList<>();
        for (Order o : list) {
            result.add(convertOrderToResponse(o));
        }
        return result;
    }

    public List<OrderResponse> getOrdersByCustomer(String phone) {
        return getOrdersByCustomer(phone, null);
    }

    /**
     * Hoàn trả tồn kho cho tất cả sản phẩm trong đơn hàng (khi hủy đơn hoặc xóa đơn pending)
     */
    public void restoreOrderStock(Order order) {
        if (order == null || order.getItems() == null) return;
        for (OrderItem it : order.getItems()) {
            try {
                productService.restoreStock(it.getProductId(), it.getQuantity());
            } catch (Exception ignored) {
            }
        }
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, String newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.ORDER_NOT_FOUND, "Không tìm thấy đơn hàng ID: " + orderId));

        String oldStatus = order.getStatus();
        String formatted = newStatus.trim().toUpperCase();

        if ("CANCELLED".equals(formatted) && !"CANCELLED".equals(oldStatus)) {
            restoreOrderStock(order);
        }

        order.setStatus(formatted);
        orderRepository.save(order);

        if (orderEventPublisher != null && !formatted.equals(oldStatus)) {
            orderEventPublisher.publishOrderStatusChanged(orderId, order.getOrderCode(), oldStatus, formatted);
        }

        return convertOrderToResponse(order);
    }

    @Transactional
    public OrderResponse cancelOrder(Long orderId, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.ORDER_NOT_FOUND, "Không tìm thấy đơn hàng ID: " + orderId));

        if ("COMPLETED".equals(order.getStatus())) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Đơn hàng đã hoàn tất, không thể hủy.");
        }
        if ("CANCELLED".equals(order.getStatus())) {
            return convertOrderToResponse(order);
        }

        String oldStatus = order.getStatus();

        // Hoàn trả tồn kho cho các sản phẩm
        restoreOrderStock(order);

        order.setStatus("CANCELLED");
        if (reason != null && !reason.isBlank()) {
            String currentNote = order.getNote() != null ? order.getNote() : "";
            order.setNote((currentNote + " [Lý do hủy: " + reason.trim() + "]").trim());
        }
        orderRepository.save(order);

        if (orderEventPublisher != null) {
            orderEventPublisher.publishOrderStatusChanged(orderId, order.getOrderCode(), oldStatus, "CANCELLED");
        }

        return convertOrderToResponse(order);
    }

    @Transactional
    public OrderResponse confirmReceived(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.ORDER_NOT_FOUND, "Không tìm thấy đơn hàng ID: " + orderId));

        if ("CANCELLED".equals(order.getStatus())) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Đơn hàng đã bị hủy, không thể xác nhận nhận hàng.");
        }

        String oldStatus = order.getStatus();
        order.setStatus("COMPLETED");

        // Tích lũy Điểm Sen thưởng cho khách hàng (10.000đ = 1 điểm Sen)
        if (order.getCustomerEmail() != null && !order.getCustomerEmail().isBlank()) {
            Optional<User> uOpt = userRepository.findByEmail(order.getCustomerEmail().trim().toLowerCase());
            uOpt.ifPresent(u -> {
                int earnedPoints = Math.max(5, (order.getTotalAmount() != null ? order.getTotalAmount() : 0) / 10000);
                u.setPoints((u.getPoints() != null ? u.getPoints() : 0) + earnedPoints);
                userRepository.save(u);
            });
        }

        orderRepository.save(order);

        if (orderEventPublisher != null) {
            orderEventPublisher.publishOrderStatusChanged(orderId, order.getOrderCode(), oldStatus, "COMPLETED");
        }

        return convertOrderToResponse(order);
    }

    @Transactional
    public void deleteOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.ORDER_NOT_FOUND, "Không tìm thấy đơn hàng ID: " + orderId));

        // Hoàn trả tồn kho nếu đơn đang PENDING
        if ("PENDING".equals(order.getStatus())) {
            restoreOrderStock(order);
        }

        orderRepository.delete(order);
    }

    @Transactional
    public void deleteOrdersBulk(List<Long> orderIds) {
        if (orderIds == null || orderIds.isEmpty()) return;
        for (Long id : orderIds) {
            deleteOrder(id);
        }
    }

    public OrderResponse convertOrderToResponse(Order o) {
        OrderResponse response = new OrderResponse();
        response.setId(o.getId());
        response.setPublicId(o.getPublicId());
        response.setOrderCode(o.getOrderCode());
        response.setCustomerName(o.getCustomerName());
        response.setCustomerPhone(o.getCustomerPhone());
        response.setCustomerAddress(o.getCustomerAddress());
        response.setCustomerEmail(o.getCustomerEmail() != null ? o.getCustomerEmail() : "");
        response.setNote(o.getNote());
        response.setPaymentMethod(o.getPaymentMethod());
        response.setSubtotal(o.getSubtotal());
        response.setDiscountAmount(o.getDiscountAmount());
        response.setDiscountCode(o.getDiscountCode());
        response.setShippingFee(o.getShippingFee());
        response.setTotalAmount(o.getTotalAmount());
        response.setStatus(o.getStatus());
        response.setCreatedAt(o.getCreatedAt() != null ? o.getCreatedAt().toString() : null);

        List<OrderItemResponse> items = new ArrayList<>();
        if (o.getItems() != null) {
            for (OrderItem it : o.getItems()) {
                OrderItemResponse item = new OrderItemResponse();
                item.setProductId(it.getProductId() != null ? it.getProductId() : "");
                item.setProductName(it.getProductName() != null ? it.getProductName() : "");
                item.setPrice(it.getPrice() != null ? it.getPrice() : 0);
                item.setQuantity(it.getQuantity() != null ? it.getQuantity() : 1);
                item.setImage(it.getImage() != null ? it.getImage() : "");
                items.add(item);
            }
        }
        response.setItems(items);
        return response;
    }
}
