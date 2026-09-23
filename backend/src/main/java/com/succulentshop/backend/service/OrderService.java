package com.succulentshop.backend.service;

import com.succulentshop.backend.config.BankTransferConfig;
import com.succulentshop.backend.constant.OrderStatus;
import com.succulentshop.backend.constant.PaymentMethod;

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
import com.succulentshop.backend.dto.ReturnOrderRequest;
import com.succulentshop.backend.dto.ReturnPolicyResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;
    private final ProductService productService;
    private final CouponService couponService;
    private final UserRepository userRepository;
    private final BankTransferConfig bankTransferConfig;
    private final ShippingService shippingService;
    private final com.succulentshop.backend.event.OrderEventPublisher orderEventPublisher;

    @Value("${order.return.window-days:7}")
    private int returnWindowDays = 7;

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

        OrderItemsResult itemsResult = processOrderItemsAndValidateStock(request.getItems());
        int subtotal = itemsResult.subtotal;
        List<OrderItem> orderItems = itemsResult.orderItems;

        CouponDiscountResult couponResult = calculateCouponDiscount(request.getDiscountCode(), subtotal);
        int shippingFee = calculateShippingFee(request, subtotal);
        int totalAmount = Math.max(0, subtotal - couponResult.discountAmount + shippingFee);

        String orderCode = generateUniqueOrderCode(request.getOrderCode());

        Order order = buildOrderEntity(request, orderCode, subtotal, couponResult, shippingFee, totalAmount, orderItems);
        Order saved = orderRepository.save(order);

        // Option B: Kho và Điểm Sen chỉ được xử lý khi đơn được thanh toán / duyệt / hoàn tất

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

    private OrderItemsResult processOrderItemsAndValidateStock(List<CreateOrderRequest.OrderItemDto> itemDtos) {
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
            // Option B: Chỉ kiểm tra tồn kho, không trừ kho tại bước tạo đơn
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
        order.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : PaymentMethod.VIETQR.getCode());
        order.setSubtotal(subtotal);
        order.setDiscountAmount(couponResult.discountAmount);
        order.setDiscountCode(couponResult.validCouponCode);
        order.setShippingFee(shippingFee);
        order.setTotalAmount(totalAmount);
        order.setStatus(OrderStatus.PENDING.getCode());
        order.setStockDeducted(false);
        order.setPointsAwarded(false);


        for (OrderItem it : orderItems) {
            order.addItem(it);
        }
        return order;
    }

    /**
     * Tích lũy Điểm Sen thưởng cho khách hàng khi đơn hàng đạt trạng thái COMPLETED
     * Tỷ lệ chuẩn: 10.000đ = 1 điểm Sen, tối thiểu 1 điểm nếu đơn > 0đ
     * Đảm bảo idempotent: Không cộng trùng lặp nhờ cờ pointsAwarded
     */
    @Transactional
    public void awardLoyaltyPoints(Order order) {
        if (order == null || Boolean.TRUE.equals(order.isPointsAwarded())) {
            return;
        }
        int totalAmount = order.getTotalAmount() != null ? order.getTotalAmount() : 0;
        if (totalAmount <= 0) {
            return;
        }

        int pointsEarned = Math.max(1, totalAmount / 10000);

        // Ưu tiên tìm tài khoản theo Email, nếu không có thì tìm theo Phone
        Optional<User> customerOpt = Optional.empty();
        if (order.getCustomerEmail() != null && !order.getCustomerEmail().isBlank()) {
            customerOpt = userRepository.findByEmail(order.getCustomerEmail().trim().toLowerCase());
        }
        if (customerOpt.isEmpty() && order.getCustomerPhone() != null && !order.getCustomerPhone().isBlank()) {
            customerOpt = userRepository.findByPhone(order.getCustomerPhone().trim());
        }

        customerOpt.ifPresent(customer -> {
            int currentPoints = customer.getPoints() != null ? customer.getPoints() : 0;
            customer.setPoints(currentPoints + pointsEarned);
            userRepository.save(customer);
            log.info("🎉 Tích lũy {} điểm Sen cho khách hàng {} từ đơn hàng #{}",
                    pointsEarned, customer.getEmail() != null ? customer.getEmail() : customer.getPhone(), order.getOrderCode());
        });

        order.setPointsAwarded(true);
        orderRepository.save(order);
    }

    /**
     * Thu hồi Điểm Sen thưởng đã tích lũy khi đơn hàng bị hoàn trả (RETURNED)
     * Đảm bảo idempotent: Chỉ thu hồi khi pointsAwarded == true, không làm âm số dư điểm của khách
     */
    @Transactional
    public void revokeLoyaltyPoints(Order order) {
        if (order == null || !Boolean.TRUE.equals(order.isPointsAwarded())) {
            return;
        }
        int totalAmount = order.getTotalAmount() != null ? order.getTotalAmount() : 0;
        if (totalAmount <= 0) {
            order.setPointsAwarded(false);
            orderRepository.save(order);
            return;
        }

        int pointsRevoked = Math.max(1, totalAmount / 10000);

        Optional<User> customerOpt = Optional.empty();
        if (order.getCustomerEmail() != null && !order.getCustomerEmail().isBlank()) {
            customerOpt = userRepository.findByEmail(order.getCustomerEmail().trim().toLowerCase());
        }
        if (customerOpt.isEmpty() && order.getCustomerPhone() != null && !order.getCustomerPhone().isBlank()) {
            customerOpt = userRepository.findByPhone(order.getCustomerPhone().trim());
        }

        customerOpt.ifPresent(customer -> {
            int currentPoints = customer.getPoints() != null ? customer.getPoints() : 0;
            customer.setPoints(Math.max(0, currentPoints - pointsRevoked));
            userRepository.save(customer);
            log.info("↩️ Đã thu hồi {} điểm Sen của khách hàng {} do đơn #{} hoàn trả",
                    pointsRevoked, customer.getEmail() != null ? customer.getEmail() : customer.getPhone(), order.getOrderCode());
        });

        order.setPointsAwarded(false);
        orderRepository.save(order);
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

    public org.springframework.data.domain.Page<OrderResponse> getOrdersByCustomerPaginated(String phone, String email, String status, int page, int limit) {
        String cleanPhone = (phone != null && !phone.isBlank()) ? phone.trim() : null;
        String cleanEmail = (email != null && !email.isBlank()) ? email.trim().toLowerCase() : null;

        if (cleanPhone == null && cleanEmail == null) {
            return org.springframework.data.domain.Page.empty();
        }

        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(Math.max(0, page - 1), limit);
        
        String queryStatus = (status == null || status.isBlank() || "all".equalsIgnoreCase(status)) ? null : status;
        org.springframework.data.domain.Page<Order> orderPage = orderRepository.findByCustomerAndStatus(cleanPhone, cleanEmail, queryStatus, pageable);

        return orderPage.map(this::convertOrderToResponse);
    }

    /**
     * Trừ tồn kho sản phẩm khi đơn được thanh toán hoặc duyệt giao hàng (PAID, SHIPPING, COMPLETED)
     * Đảm bảo idempotent: Không trừ trùng lặp nếu stockDeducted đã là true
     */
    @Transactional
    public void deductOrderStock(Order order) {
        if (order == null || order.getItems() == null || Boolean.TRUE.equals(order.isStockDeducted())) {
            return;
        }

        for (OrderItem it : order.getItems()) {
            Product p = productService.findByIdOrThrow(it.getProductId());
            int currentStock = p.getInStock() != null ? p.getInStock() : 0;
            if (currentStock < it.getQuantity()) {
                throw new InsufficientStockException(
                    ErrorCode.INSUFFICIENT_STOCK,
                    String.format("Sản phẩm \"%s\" không đủ tồn kho để xác nhận đơn hàng (Còn %d, cần %d)",
                            p.getName(), currentStock, it.getQuantity())
                );
            }
            productService.deductStock(it.getProductId(), it.getQuantity());
        }

        order.setStockDeducted(true);
        orderRepository.save(order);
        log.info("📦 Đã trừ tồn kho thành công cho đơn hàng #{}", order.getOrderCode());
    }

    /**
     * Hoàn trả tồn kho cho tất cả sản phẩm trong đơn hàng
     * Chỉ hoàn trả nếu đơn hàng thực sự đã bị trừ kho trước đó (stockDeducted == true)
     */
    @Transactional
    public void restoreOrderStock(Order order) {
        if (order == null || order.getItems() == null || !Boolean.TRUE.equals(order.isStockDeducted())) {
            return;
        }
        for (OrderItem it : order.getItems()) {
            try {
                productService.restoreStock(it.getProductId(), it.getQuantity());
            } catch (Exception e) {
                log.warn("Không thể hoàn tồn kho cho sản phẩm ID={}: {}", it.getProductId(), e.getMessage());
            }
        }
        order.setStockDeducted(false);
        orderRepository.save(order);
        log.info("🔄 Đã hoàn trả tồn kho thành công cho đơn hàng #{}", order.getOrderCode());
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, String newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.ORDER_NOT_FOUND, "Không tìm thấy đơn hàng ID: " + orderId));

        String oldStatus = order.getStatus();
        String formatted = newStatus.trim().toUpperCase();

        // Chặn không cho hủy đơn đã hoàn tất
        if (OrderStatus.COMPLETED.getCode().equalsIgnoreCase(oldStatus) && OrderStatus.CANCELLED.getCode().equalsIgnoreCase(formatted)) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Không thể hủy đơn hàng đã hoàn tất thành công.");
        }

        // Xử lý hoàn kho khi hủy đơn
        if (OrderStatus.CANCELLED.getCode().equals(formatted) && !OrderStatus.CANCELLED.getCode().equals(oldStatus)) {
            restoreOrderStock(order);
        }

        // Xử lý hoàn trả đơn hàng (RETURNED)
        if (OrderStatus.RETURNED.getCode().equals(formatted) && !OrderStatus.RETURNED.getCode().equals(oldStatus)) {
            restoreOrderStock(order);
            revokeLoyaltyPoints(order);
            order.setReturnedAt(Instant.now());
        }

        // Xử lý trừ kho khi đơn được duyệt / thanh toán / giao hàng (PAID, SHIPPING, COMPLETED)
        if (List.of(OrderStatus.PAID.getCode(), OrderStatus.SHIPPING.getCode(), OrderStatus.COMPLETED.getCode()).contains(formatted) && !Boolean.TRUE.equals(order.isStockDeducted())) {
            deductOrderStock(order);
        }

        // Xử lý tích điểm và mốc hoàn tất khi đơn hoàn tất
        if (OrderStatus.COMPLETED.getCode().equals(formatted)) {
            if (order.getCompletedAt() == null) {
                order.setCompletedAt(Instant.now());
            }
            awardLoyaltyPoints(order);
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

        if (OrderStatus.COMPLETED.getCode().equalsIgnoreCase(order.getStatus())) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Đơn hàng đã hoàn tất, không thể hủy.");
        }
        if (OrderStatus.CANCELLED.getCode().equalsIgnoreCase(order.getStatus())) {
            return convertOrderToResponse(order);
        }

        String oldStatus = order.getStatus();

        // Hoàn trả tồn kho nếu đơn đã bị trừ kho
        restoreOrderStock(order);

        order.setStatus(OrderStatus.CANCELLED.getCode());
        if (reason != null && !reason.isBlank()) {
            String currentNote = order.getNote() != null ? order.getNote() : "";
            order.setNote((currentNote + " [Lý do hủy: " + reason.trim() + "]").trim());
        }
        orderRepository.save(order);

        if (orderEventPublisher != null) {
            orderEventPublisher.publishOrderStatusChanged(orderId, order.getOrderCode(), oldStatus, OrderStatus.CANCELLED.getCode());
        }

        return convertOrderToResponse(order);
    }

    @Transactional
    public OrderResponse confirmReceived(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.ORDER_NOT_FOUND, "Không tìm thấy đơn hàng ID: " + orderId));

        if (OrderStatus.CANCELLED.getCode().equalsIgnoreCase(order.getStatus())) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Đơn hàng đã bị hủy, không thể xác nhận nhận hàng.");
        }

        String oldStatus = order.getStatus();

        // Đảm bảo tồn kho đã được trừ
        if (!Boolean.TRUE.equals(order.isStockDeducted())) {
            deductOrderStock(order);
        }

        order.setStatus(OrderStatus.COMPLETED.getCode());
        if (order.getCompletedAt() == null) {
            order.setCompletedAt(Instant.now());
        }
        orderRepository.save(order);

        // Tích lũy Điểm Sen thưởng cho khách hàng
        awardLoyaltyPoints(order);

        if (orderEventPublisher != null && !OrderStatus.COMPLETED.getCode().equalsIgnoreCase(oldStatus)) {
            orderEventPublisher.publishOrderStatusChanged(orderId, order.getOrderCode(), oldStatus, OrderStatus.COMPLETED.getCode());
        }

        return convertOrderToResponse(order);
    }

    @Transactional
    public void deleteOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.ORDER_NOT_FOUND, "Không tìm thấy đơn hàng ID: " + orderId));

        // Hoàn trả tồn kho nếu đơn đã từng bị trừ kho
        if (Boolean.TRUE.equals(order.isStockDeducted())) {
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

    @Transactional
    public OrderResponse requestReturn(Long orderId, ReturnOrderRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.ORDER_NOT_FOUND, "Không tìm thấy đơn hàng ID: " + orderId));

        if (!OrderStatus.COMPLETED.getCode().equalsIgnoreCase(order.getStatus())) {
            throw new AppException(ErrorCode.ORDER_CANNOT_BE_RETURNED, "Chỉ đơn hàng đã giao thành công (COMPLETED) mới có thể gửi yêu cầu hoàn trả.");
        }

        if (request == null || request.getReason() == null || request.getReason().trim().isBlank()) {
            throw new AppException(ErrorCode.RETURN_REASON_REQUIRED, "Vui lòng chọn hoặc nhập lý do hoàn trả.");
        }

        // Kiểm tra thời hạn đổi trả
        Instant refTime = order.getCompletedAt() != null ? order.getCompletedAt() : order.getCreatedAt();
        if (refTime != null) {
            long daysPassed = ChronoUnit.DAYS.between(refTime, Instant.now());
            if (daysPassed > returnWindowDays) {
                throw new AppException(ErrorCode.RETURN_WINDOW_EXPIRED,
                    String.format("Đơn hàng đã hoàn tất quá thời hạn %d ngày theo quy định của shop (đã qua %d ngày). Không thể yêu cầu hoàn trả.", returnWindowDays, daysPassed));
            }
        }

        String oldStatus = order.getStatus();
        order.setStatus(OrderStatus.RETURN_REQUESTED.getCode());
        order.setReturnReason(request.getReason().trim());
        if (request.getNote() != null && !request.getNote().trim().isBlank()) {
            order.setReturnNote(request.getNote().trim());
        }
        if (request.getBankInfo() != null && !request.getBankInfo().trim().isBlank()) {
            order.setRefundBankInfo(request.getBankInfo().trim());
        }
        order.setReturnRequestedAt(Instant.now());
        orderRepository.save(order);

        if (orderEventPublisher != null) {
            orderEventPublisher.publishOrderStatusChanged(orderId, order.getOrderCode(), oldStatus, OrderStatus.RETURN_REQUESTED.getCode());
        }

        return convertOrderToResponse(order);
    }

    @Transactional
    public OrderResponse approveReturn(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.ORDER_NOT_FOUND, "Không tìm thấy đơn hàng ID: " + orderId));

        if (!OrderStatus.RETURN_REQUESTED.getCode().equalsIgnoreCase(order.getStatus()) && !OrderStatus.COMPLETED.getCode().equalsIgnoreCase(order.getStatus())) {
            throw new AppException(ErrorCode.ORDER_CANNOT_BE_RETURNED, "Đơn hàng không ở trạng thái yêu cầu hoàn trả.");
        }

        String oldStatus = order.getStatus();

        // Hoàn trả tồn kho nếu đã từng trừ
        restoreOrderStock(order);

        // Thu hồi điểm Sen thưởng đã tích lũy cho đơn này
        revokeLoyaltyPoints(order);

        order.setStatus(OrderStatus.RETURNED.getCode());
        order.setReturnedAt(Instant.now());
        orderRepository.save(order);

        if (orderEventPublisher != null) {
            orderEventPublisher.publishOrderStatusChanged(orderId, order.getOrderCode(), oldStatus, OrderStatus.RETURNED.getCode());
        }

        return convertOrderToResponse(order);
    }

    @Transactional
    public OrderResponse rejectReturn(Long orderId, String rejectReason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.ORDER_NOT_FOUND, "Không tìm thấy đơn hàng ID: " + orderId));

        if (!OrderStatus.RETURN_REQUESTED.getCode().equalsIgnoreCase(order.getStatus())) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Đơn hàng hiện không có yêu cầu hoàn trả để từ chối.");
        }

        String oldStatus = order.getStatus();
        order.setStatus(OrderStatus.COMPLETED.getCode());
        order.setReturnRejectReason(rejectReason != null && !rejectReason.trim().isBlank() ? rejectReason.trim() : "Shop từ chối yêu cầu đổi trả theo chính sách.");
        orderRepository.save(order);

        if (orderEventPublisher != null) {
            orderEventPublisher.publishOrderStatusChanged(orderId, order.getOrderCode(), oldStatus, OrderStatus.COMPLETED.getCode());
        }

        return convertOrderToResponse(order);
    }

    public ReturnPolicyResponse getReturnPolicy() {
        return new ReturnPolicyResponse(returnWindowDays,
            String.format("Chính sách bảo hành & đổi trả Sen Xinh Garden hỗ trợ đổi trả hoặc hoàn tiền trong vòng %d ngày kể từ khi đơn hàng giao thành công.", returnWindowDays));
    }

    public int getReturnWindowDays() {
        return returnWindowDays;
    }

    public void setReturnWindowDays(int returnWindowDays) {
        this.returnWindowDays = returnWindowDays;
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
        response.setStockDeducted(o.isStockDeducted());
        response.setPointsAwarded(o.isPointsAwarded());
        response.setCreatedAt(o.getCreatedAt() != null ? o.getCreatedAt().toString() : null);
        response.setCompletedAt(o.getCompletedAt() != null ? o.getCompletedAt().toString() : null);
        response.setReturnReason(o.getReturnReason());
        response.setReturnNote(o.getReturnNote());
        response.setRefundBankInfo(o.getRefundBankInfo());
        response.setReturnRequestedAt(o.getReturnRequestedAt() != null ? o.getReturnRequestedAt().toString() : null);
        response.setReturnedAt(o.getReturnedAt() != null ? o.getReturnedAt().toString() : null);
        response.setReturnRejectReason(o.getReturnRejectReason());

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
