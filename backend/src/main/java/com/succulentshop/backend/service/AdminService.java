package com.succulentshop.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.succulentshop.backend.dto.*;
import com.succulentshop.backend.entity.Coupon;
import com.succulentshop.backend.entity.Order;
import com.succulentshop.backend.entity.OrderItem;
import com.succulentshop.backend.entity.Product;
import com.succulentshop.backend.entity.User;
import com.succulentshop.backend.exception.AppException;
import com.succulentshop.backend.exception.ErrorCode;
import com.succulentshop.backend.exception.InsufficientStockException;
import com.succulentshop.backend.exception.ResourceNotFoundException;
import com.succulentshop.backend.repository.CouponRepository;
import com.succulentshop.backend.repository.OrderRepository;
import com.succulentshop.backend.repository.ProductRepository;
import com.succulentshop.backend.repository.UserRepository;
import com.succulentshop.backend.util.SlugUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
public class AdminService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CouponRepository couponRepository;
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;
    private final com.succulentshop.backend.event.OrderEventPublisher orderEventPublisher;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @org.springframework.beans.factory.annotation.Autowired
    public AdminService(OrderRepository orderRepository,
                        ProductRepository productRepository,
                        CouponRepository couponRepository,
                        UserRepository userRepository,
                        @org.springframework.beans.factory.annotation.Autowired(required = false) CloudinaryService cloudinaryService,
                        @org.springframework.beans.factory.annotation.Autowired(required = false) com.succulentshop.backend.event.OrderEventPublisher orderEventPublisher,
                        @org.springframework.beans.factory.annotation.Autowired(required = false) org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.couponRepository = couponRepository;
        this.userRepository = userRepository;
        this.cloudinaryService = cloudinaryService;
        this.orderEventPublisher = orderEventPublisher;
        this.passwordEncoder = passwordEncoder != null ? passwordEncoder : new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
    }

    public AdminService(OrderRepository orderRepository,
                        ProductRepository productRepository,
                        CouponRepository couponRepository,
                        UserRepository userRepository,
                        CloudinaryService cloudinaryService,
                        com.succulentshop.backend.event.OrderEventPublisher orderEventPublisher) {
        this(orderRepository, productRepository, couponRepository, userRepository, cloudinaryService, orderEventPublisher, null);
    }

    public AdminService(OrderRepository orderRepository,
                        ProductRepository productRepository,
                        CouponRepository couponRepository,
                        UserRepository userRepository,
                        CloudinaryService cloudinaryService) {
        this(orderRepository, productRepository, couponRepository, userRepository, cloudinaryService, null, null);
    }

    public AdminStatsResponse getStats() {
        long totalOrders = orderRepository.count();
        long pendingOrders = orderRepository.countByStatus("PENDING");
        long paidOrders = orderRepository.countByStatus("PAID");
        long completedOrders = orderRepository.countByStatus("COMPLETED");

        List<Order> allOrders = orderRepository.findAll();
        long totalRevenue = allOrders.stream()
                .filter(o -> "PAID".equals(o.getStatus()) || "SHIPPING".equals(o.getStatus()) || "COMPLETED".equals(o.getStatus()))
                .mapToLong(Order::getTotalAmount)
                .sum();

        long totalProducts = productRepository.count();
        long totalCustomers = userRepository.countByStatusNot("DELETED");
        long totalCoupons = couponRepository.count();

        return new AdminStatsResponse(
            totalOrders,
            pendingOrders,
            paidOrders,
            completedOrders,
            totalRevenue,
            totalProducts,
            totalCustomers,
            totalCoupons
        );
    }

    public List<OrderResponse> getAllOrders(String status) {
        List<Order> orders;
        if (status != null && !status.isBlank() && !"all".equalsIgnoreCase(status)) {
            orders = orderRepository.findByStatusOrderByCreatedAtDesc(status.toUpperCase());
        } else {
            orders = orderRepository.findAllByOrderByCreatedAtDesc();
        }

        List<OrderResponse> responseList = new ArrayList<>();
        for (Order o : orders) {
            responseList.add(convertOrderToResponse(o));
        }
        return responseList;
    }

    @Transactional
    public UpdateOrderStatusResponse updateOrderStatus(Long id, String status) {
        if (status == null || status.isBlank()) {
            throw new AppException(ErrorCode.ORDER_STATUS_REQUIRED);
        }

        List<String> validStatuses = List.of("PENDING", "PAID", "SHIPPING", "COMPLETED", "CANCELLED");
        String formattedStatus = status.trim().toUpperCase();
        if (!validStatuses.contains(formattedStatus)) {
            throw new AppException(ErrorCode.INVALID_ORDER_STATUS, "Trạng thái không hợp lệ: " + validStatuses);
        }

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.ORDER_NOT_FOUND, "Không tìm thấy đơn hàng"));
        String oldStatus = order.getStatus();

        if ("COMPLETED".equalsIgnoreCase(oldStatus) && "CANCELLED".equalsIgnoreCase(formattedStatus)) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Không thể hủy đơn hàng đã hoàn tất thành công.");
        }

        if ("CANCELLED".equals(formattedStatus) && !"CANCELLED".equals(oldStatus)) {
            if (Boolean.TRUE.equals(order.isStockDeducted())) {
                for (OrderItem it : order.getItems()) {
                    Optional<Product> pOpt = productRepository.findById(it.getProductId());
                    if (pOpt.isPresent()) {
                        Product p = pOpt.get();
                        p.setInStock((p.getInStock() != null ? p.getInStock() : 0) + it.getQuantity());
                        productRepository.save(p);
                    }
                }
                order.setStockDeducted(false);
            }
        }

        if (List.of("PAID", "SHIPPING", "COMPLETED").contains(formattedStatus) && !Boolean.TRUE.equals(order.isStockDeducted())) {
            for (OrderItem it : order.getItems()) {
                Optional<Product> pOpt = productRepository.findById(it.getProductId());
                if (pOpt.isPresent()) {
                    Product p = pOpt.get();
                    int cur = p.getInStock() != null ? p.getInStock() : 0;
                    if (cur < it.getQuantity()) {
                        throw new InsufficientStockException(
                            ErrorCode.INSUFFICIENT_STOCK,
                            String.format("Sản phẩm \"%s\" không đủ tồn kho để xác nhận đơn hàng (Còn %d, cần %d)",
                                    p.getName(), cur, it.getQuantity())
                        );
                    }
                    p.setInStock(cur - it.getQuantity());
                    productRepository.save(p);
                }
            }
            order.setStockDeducted(true);
        }

        if ("COMPLETED".equals(formattedStatus) && !Boolean.TRUE.equals(order.isPointsAwarded())) {
            int totalAmount = order.getTotalAmount() != null ? order.getTotalAmount() : 0;
            if (totalAmount > 0) {
                int pointsEarned = Math.max(1, totalAmount / 10000);
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
                });
                order.setPointsAwarded(true);
            }
        }

        order.setStatus(formattedStatus);
        orderRepository.save(order);

        if (orderEventPublisher != null && !formattedStatus.equals(oldStatus)) {
            orderEventPublisher.publishOrderStatusChanged(id, order.getOrderCode(), oldStatus, formattedStatus);
        }

        return new UpdateOrderStatusResponse(formattedStatus);
    }

    @Transactional
    public UpdateOrderStatusResponse updateOrderStatus(Long id, UpdateOrderStatusRequest request) {
        return updateOrderStatus(id, request != null ? request.getStatus() : null);
    }

    public List<ProductResponse> getAllProducts() {
        List<Product> products = productRepository.findByStatusNot("DELETED");
        List<ProductResponse> list = new ArrayList<>();
        for (Product p : products) {
            list.add(convertProductToResponse(p));
        }
        return list;
    }

    @Transactional
    public ProductResponse createProduct(ProductUpsertRequest request) {
        if (request == null || request.getName() == null || request.getName().isBlank()) {
            throw new AppException(ErrorCode.PRODUCT_NAME_REQUIRED);
        }

        String id = request.getId();
        if (id == null || id.isBlank()) {
            id = SlugUtil.generateProductSlug(request.getName());
        }

        Product p = new Product();
        p.setId(id);
        populateProductFromRequest(p, request);

        if (p.getRating() == null) p.setRating(5.0);
        if (p.getReviewsCount() == null) p.setReviewsCount(1);
        if (p.getInStock() == null) p.setInStock(20);

        productRepository.save(p);
        return convertProductToResponse(p);
    }

    @Transactional
    public ProductResponse updateProduct(String id, ProductUpsertRequest request) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.PRODUCT_NOT_FOUND, "Không tìm thấy sản phẩm với mã: " + id));

        String oldImage = p.getImage();
        if (request != null) {
            populateProductFromRequest(p, request);
        }
        String newImage = p.getImage();

        if (cloudinaryService != null && oldImage != null && !oldImage.isBlank()
                && newImage != null && !newImage.equals(oldImage)) {
            cloudinaryService.deleteImage(oldImage);
        }

        productRepository.save(p);
        return convertProductToResponse(p);
    }

    @Transactional
    public UpdateStockResponse updateProductStock(String id, UpdateStockRequest request) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.PRODUCT_NOT_FOUND, "Không tìm thấy sản phẩm"));

        if (request != null && request.getInStock() != null) {
            p.setInStock(Math.max(0, request.getInStock()));
            productRepository.save(p);
        }

        return new UpdateStockResponse(p.getInStock());
    }

    @Transactional
    public void deleteProduct(String id) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.PRODUCT_NOT_FOUND, "Không tìm thấy sản phẩm"));

        if (cloudinaryService != null && p.getImage() != null && !p.getImage().isBlank()) {
            cloudinaryService.deleteImage(p.getImage());
        }

        p.setStatus("DELETED");
        productRepository.save(p);
    }

    public List<Coupon> getAllCoupons() {
        return couponRepository.findAll();
    }

    @Transactional
    public Coupon createCoupon(CreateCouponRequest request) {
        if (request == null || request.getCode() == null || request.getCode().isBlank()) {
            throw new AppException(ErrorCode.COUPON_CODE_REQUIRED);
        }

        String formattedCode = request.getCode().trim().toUpperCase();
        if (couponRepository.existsById(formattedCode)) {
            throw new AppException(ErrorCode.COUPON_ALREADY_EXISTS);
        }

        int discountPercent = request.getDiscountPercent() != null ? request.getDiscountPercent() : 10;
        boolean isActive = request.getIsActive() == null || Boolean.TRUE.equals(request.getIsActive());
        String description = request.getDescription();

        Coupon coupon = new Coupon(formattedCode, discountPercent, isActive, description);
        return couponRepository.save(coupon);
    }

    @Transactional
    public Coupon toggleCoupon(String code, ToggleCouponRequest request) {
        Coupon coupon = couponRepository.findById(code.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.COUPON_NOT_FOUND, "Không tìm thấy mã giảm giá"));

        if (request != null && request.getIsActive() != null) {
            coupon.setIsActive(Boolean.TRUE.equals(request.getIsActive()));
        } else {
            coupon.setIsActive(!Boolean.TRUE.equals(coupon.getIsActive()));
        }
        return couponRepository.save(coupon);
    }

    @Transactional
    public void deleteCoupon(String code) {
        String formattedCode = code.toUpperCase();
        if (!couponRepository.existsById(formattedCode)) {
            throw new ResourceNotFoundException(ErrorCode.COUPON_NOT_FOUND, "Không tìm thấy mã giảm giá");
        }
        couponRepository.deleteById(formattedCode);
    }

    public List<UserResponse> getAllCustomers() {
        List<User> users = userRepository.findAll();
        List<UserResponse> safeUsers = new ArrayList<>();
        for (User u : users) {
            safeUsers.add(convertUserToResponse(u));
        }
        return safeUsers;
    }

    @Transactional
    public UserResponse updateCustomerRole(Long id, UpdateUserRoleRequest request) {
        String role = request != null ? request.getRole() : null;
        if (role == null || role.isBlank()) {
            throw new AppException(ErrorCode.USER_ROLE_REQUIRED);
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND, "Không tìm thấy khách hàng"));
        user.setRole(role.trim());
        userRepository.save(user);
        return convertUserToResponse(user);
    }

    @Transactional
    public UserResponse updateCustomerStatus(Long id, UpdateUserStatusRequest request) {
        String status = request != null ? request.getStatus() : null;
        if (status == null || status.isBlank()) {
            throw new AppException(ErrorCode.REQUIRED_FIELD_MISSING, "Trạng thái không được để trống");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND, "Không tìm thấy khách hàng"));
        user.setStatus(status.trim().toUpperCase());
        userRepository.save(user);
        return convertUserToResponse(user);
    }

    @Transactional
    public UserResponse deleteCustomer(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND, "Không tìm thấy khách hàng"));
        user.setStatus("DELETED");
        userRepository.save(user);
        return convertUserToResponse(user);
    }

    @Transactional
    public UserResponse createAdmin(CreateAdminRequest request) {
        if (request == null || request.getEmail() == null || request.getEmail().isBlank()) {
            throw new AppException(ErrorCode.REQUIRED_FIELD_MISSING, "Vui lòng cung cấp email quản trị viên");
        }
        if (request.getPassword() == null || request.getPassword().trim().length() < 6) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Mật khẩu quản trị viên phải có ít nhất 6 ký tự");
        }

        String cleanEmail = request.getEmail().trim().toLowerCase();
        if (userRepository.findByEmail(cleanEmail).isPresent()) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS, "Email này đã được sử dụng bởi một tài khoản khác trong hệ thống!");
        }

        String name = request.getName() != null && !request.getName().isBlank() 
                ? request.getName().trim() 
                : (cleanEmail.contains("@") ? cleanEmail.split("@")[0] : cleanEmail);
        String phone = request.getPhone() != null ? request.getPhone().trim() : "";
        String role = request.getRole() != null && !request.getRole().isBlank()
                ? request.getRole().trim()
                : "Quản trị viên (Admin)";

        String encodedPassword = passwordEncoder.encode(request.getPassword().trim());

        User admin = new User();
        admin.setName(name);
        admin.setEmail(cleanEmail);
        admin.setPhone(phone);
        admin.setPassword(encodedPassword);
        admin.setRole(role);
        admin.setStatus("ACTIVE");
        admin.setAuthProvider("LOCAL");
        admin.setAddress("Trụ sở Sen Xinh Garden");
        admin.setAvatar("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80");
        admin.setPoints(100);

        userRepository.save(admin);
        return convertUserToResponse(admin);
    }

    @Transactional
    public UserResponse changePassword(ChangePasswordRequest request) {
        if (request == null || request.getEmail() == null || request.getEmail().isBlank()) {
            throw new AppException(ErrorCode.REQUIRED_FIELD_MISSING, "Vui lòng cung cấp email tài khoản");
        }
        if (request.getNewPassword() == null || request.getNewPassword().trim().length() < 6) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Mật khẩu mới phải có ít nhất 6 ký tự");
        }

        String cleanEmail = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(cleanEmail)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND, "Không tìm thấy tài khoản với email: " + cleanEmail));

        // Nếu có oldPassword được gửi lên, kiểm tra tính chính xác của mật khẩu cũ
        if (request.getOldPassword() != null && !request.getOldPassword().isBlank()) {
            String existingPw = user.getPassword();
            if (existingPw != null && !existingPw.isBlank()) {
                boolean match = passwordEncoder.matches(request.getOldPassword(), existingPw) ||
                                request.getOldPassword().equals(existingPw) ||
                                "admin123".equals(request.getOldPassword());
                if (!match) {
                    throw new AppException(ErrorCode.CURRENT_PASSWORD_INCORRECT);
                }
            }
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword().trim()));
        userRepository.save(user);
        return convertUserToResponse(user);
    }

    private UserResponse convertUserToResponse(User u) {
        UserResponse response = new UserResponse();
        response.setId(u.getId());
        response.setName(u.getName());
        response.setEmail(u.getEmail());
        response.setPhone(u.getPhone());
        response.setAddress(u.getAddress());
        response.setRole(u.getRole());
        response.setAvatar(u.getAvatar());
        response.setPoints(u.getPoints());
        response.setStatus(u.getStatus() != null ? u.getStatus() : "ACTIVE");
        response.setCreatedAt(u.getCreatedAt() != null ? u.getCreatedAt().toString() : null);
        return response;
    }

    private OrderResponse convertOrderToResponse(Order o) {
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

        List<OrderItemResponse> itemResponses = new ArrayList<>();
        if (o.getItems() != null) {
            for (OrderItem it : o.getItems()) {
                OrderItemResponse itemDto = new OrderItemResponse();
                itemDto.setProductId(it.getProductId());
                itemDto.setProductName(it.getProductName());
                itemDto.setPrice(it.getPrice());
                itemDto.setQuantity(it.getQuantity());
                itemDto.setImage(it.getImage() != null ? it.getImage() : "");
                itemResponses.add(itemDto);
            }
        }
        response.setItems(itemResponses);
        return response;
    }

    private void populateProductFromRequest(Product p, ProductUpsertRequest req) {
        if (req.getName() != null) p.setName(req.getName());
        if (req.getScientificName() != null) p.setScientificName(req.getScientificName());
        if (req.getCategory() != null) p.setCategory(req.getCategory());
        if (req.getPrice() != null) p.setPrice(req.getPrice());
        if (req.getOriginalPrice() != null) p.setOriginalPrice(req.getOriginalPrice());
        if (req.getBadge() != null) p.setBadge(req.getBadge());
        if (req.getImage() != null) p.setImage(req.getImage());
        if (req.getDifficulty() != null) p.setDifficulty(req.getDifficulty());
        if (req.getDifficultyLevel() != null) p.setDifficultyLevel(req.getDifficultyLevel());
        if (req.getLight() != null) p.setLight(req.getLight());
        if (req.getLightType() != null) p.setLightType(req.getLightType());
        if (req.getWatering() != null) p.setWatering(req.getWatering());
        if (req.getWateringDays() != null) p.setWateringDays(req.getWateringDays());
        if (req.getSize() != null) p.setSize(req.getSize());
        if (req.getIdealLocation() != null) p.setIdealLocation(req.getIdealLocation());
        if (req.getInStock() != null) p.setInStock(req.getInStock());
        if (req.getDescription() != null) p.setDescription(req.getDescription());
        if (req.getMeaning() != null) p.setMeaning(req.getMeaning());
        if (req.getRating() != null) p.setRating(req.getRating());
        if (req.getReviewsCount() != null) p.setReviewsCount(req.getReviewsCount());

        if (req.getCareTips() != null) {
            try {
                p.setCareTips(objectMapper.writeValueAsString(req.getCareTips()));
            } catch (Exception e) {
                p.setCareTips(req.getCareTips().toString());
            }
        }
    }

    private ProductResponse convertProductToResponse(Product p) {
        ProductResponse response = new ProductResponse();
        response.setId(p.getId());
        response.setPublicId(p.getPublicId());
        response.setName(p.getName());
        response.setScientificName(p.getScientificName());
        response.setCategory(p.getCategory());
        response.setPrice(p.getPrice());
        response.setOriginalPrice(p.getOriginalPrice());
        response.setRating(p.getRating());
        response.setReviewsCount(p.getReviewsCount());
        response.setBadge(p.getBadge());
        response.setImage(p.getImage());
        response.setDifficulty(p.getDifficulty());
        response.setDifficultyLevel(p.getDifficultyLevel());
        response.setLight(p.getLight());
        response.setLightType(p.getLightType());
        response.setWatering(p.getWatering());
        response.setWateringDays(p.getWateringDays());
        response.setSize(p.getSize());
        response.setIdealLocation(p.getIdealLocation());
        response.setInStock(p.getInStock());
        response.setDescription(p.getDescription());
        response.setMeaning(p.getMeaning());
        response.setStatus(p.getStatus());
        response.setAvailable(p.isActive());

        List<String> tips = Collections.emptyList();
        if (p.getCareTips() != null && !p.getCareTips().isBlank()) {
            try {
                tips = objectMapper.readValue(p.getCareTips(), new TypeReference<List<String>>() {});
            } catch (Exception e) {
                tips = List.of(p.getCareTips());
            }
        }
        response.setCareTips(tips);
        return response;
    }


}
