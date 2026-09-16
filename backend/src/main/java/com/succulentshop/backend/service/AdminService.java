package com.succulentshop.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.succulentshop.backend.dto.ProductResponse;
import com.succulentshop.backend.dto.UserResponse;
import com.succulentshop.backend.entity.Coupon;
import com.succulentshop.backend.entity.Order;
import com.succulentshop.backend.entity.OrderItem;
import com.succulentshop.backend.entity.Product;
import com.succulentshop.backend.entity.User;
import com.succulentshop.backend.repository.CouponRepository;
import com.succulentshop.backend.repository.OrderRepository;
import com.succulentshop.backend.repository.ProductRepository;
import com.succulentshop.backend.repository.UserRepository;
import com.succulentshop.backend.service.CloudinaryService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Pattern;

@Service
public class AdminService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CouponRepository couponRepository;
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AdminService(OrderRepository orderRepository,
                        ProductRepository productRepository,
                        CouponRepository couponRepository,
                        UserRepository userRepository,
                        CloudinaryService cloudinaryService) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.couponRepository = couponRepository;
        this.userRepository = userRepository;
        this.cloudinaryService = cloudinaryService;
    }

    public Map<String, Object> getStats() {
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

        return Map.of(
            "totalOrders", totalOrders,
            "pendingOrders", pendingOrders,
            "paidOrders", paidOrders,
            "completedOrders", completedOrders,
            "totalRevenue", totalRevenue,
            "totalProducts", totalProducts,
            "totalCustomers", totalCustomers,
            "totalCoupons", totalCoupons
        );
    }

    public List<Map<String, Object>> getAllOrders(String status) {
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
            map.put("customerEmail", o.getCustomerEmail() != null ? o.getCustomerEmail() : "");
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
        return responseList;
    }

    @Transactional
    public Map<String, Object> updateOrderStatus(Long id, String status) {
        if (status == null || status.isBlank()) {
            throw new IllegalArgumentException("Trạng thái không được để trống");
        }

        List<String> validStatuses = List.of("PENDING", "PAID", "SHIPPING", "COMPLETED", "CANCELLED");
        String formattedStatus = status.trim().toUpperCase();
        if (!validStatuses.contains(formattedStatus)) {
            throw new IllegalArgumentException("Trạng thái không hợp lệ: " + validStatuses);
        }

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn hàng"));
        String oldStatus = order.getStatus();
        if ("CANCELLED".equals(formattedStatus) && !"CANCELLED".equals(oldStatus)) {
            for (OrderItem it : order.getItems()) {
                Optional<Product> pOpt = productRepository.findById(it.getProductId());
                if (pOpt.isPresent()) {
                    Product p = pOpt.get();
                    p.setInStock((p.getInStock() != null ? p.getInStock() : 0) + it.getQuantity());
                    productRepository.save(p);
                }
            }
        }
        order.setStatus(formattedStatus);
        orderRepository.save(order);
        return Map.of("newStatus", formattedStatus);
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
    public ProductResponse createProduct(Map<String, Object> payload) {
        String name = (String) payload.get("name");
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Tên sen đá không được để trống");
        }

        String id = (String) payload.get("id");
        if (id == null || id.isBlank()) {
            id = generateSlug(name) + "-" + (System.currentTimeMillis() % 10000);
        }

        Product p = new Product();
        p.setId(id);
        populateProductFromMap(p, payload);

        if (p.getRating() == null) p.setRating(5.0);
        if (p.getReviewsCount() == null) p.setReviewsCount(1);
        if (p.getInStock() == null) p.setInStock(20);

        productRepository.save(p);
        return convertProductToResponse(p);
    }

    @Transactional
    public ProductResponse updateProduct(String id, Map<String, Object> payload) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy sản phẩm với mã: " + id));

        String oldImage = p.getImage();
        populateProductFromMap(p, payload);
        String newImage = p.getImage();

        if (cloudinaryService != null && oldImage != null && !oldImage.isBlank()
                && newImage != null && !newImage.equals(oldImage)) {
            cloudinaryService.deleteImage(oldImage);
        }

        productRepository.save(p);
        return convertProductToResponse(p);
    }

    @Transactional
    public Map<String, Object> updateProductStock(String id, Map<String, Object> payload) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy sản phẩm"));

        if (payload.containsKey("inStock")) {
            int newStock = ((Number) payload.get("inStock")).intValue();
            p.setInStock(Math.max(0, newStock));
            productRepository.save(p);
        }

        return Map.of("inStock", p.getInStock());
    }

    @Transactional
    public void deleteProduct(String id) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy sản phẩm"));

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
    public Coupon createCoupon(Map<String, Object> payload) {
        String code = (String) payload.get("code");
        if (code == null || code.isBlank()) {
            throw new IllegalArgumentException("Mã giảm giá không được để trống");
        }

        String formattedCode = code.trim().toUpperCase();
        if (couponRepository.existsById(formattedCode)) {
            throw new IllegalArgumentException("Mã giảm giá này đã tồn tại trong hệ thống");
        }

        int discountPercent = payload.containsKey("discountPercent")
                ? ((Number) payload.get("discountPercent")).intValue()
                : 10;
        boolean isActive = !payload.containsKey("isActive") || Boolean.TRUE.equals(payload.get("isActive"));
        String description = (String) payload.get("description");

        Coupon coupon = new Coupon(formattedCode, discountPercent, isActive, description);
        return couponRepository.save(coupon);
    }

    @Transactional
    public Coupon toggleCoupon(String code, Map<String, Object> payload) {
        Coupon coupon = couponRepository.findById(code.toUpperCase())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy mã giảm giá"));

        if (payload != null && payload.containsKey("isActive")) {
            coupon.setIsActive(Boolean.TRUE.equals(payload.get("isActive")));
        } else {
            coupon.setIsActive(!Boolean.TRUE.equals(coupon.getIsActive()));
        }
        return couponRepository.save(coupon);
    }

    @Transactional
    public void deleteCoupon(String code) {
        String formattedCode = code.toUpperCase();
        if (!couponRepository.existsById(formattedCode)) {
            throw new IllegalArgumentException("Không tìm thấy mã giảm giá");
        }
        couponRepository.deleteById(formattedCode);
    }

    public List<UserResponse> getAllCustomers() {
        List<User> users = userRepository.findAll();
        List<UserResponse> safeUsers = new ArrayList<>();
        for (User u : users) {
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
            safeUsers.add(response);
        }
        return safeUsers;
    }

    @Transactional
    public Map<String, Object> updateCustomerRole(Long id, String role) {
        if (role == null || role.isBlank()) {
            throw new IllegalArgumentException("Vai trò không được để trống");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy khách hàng"));
        user.setRole(role.trim());
        userRepository.save(user);
        return Map.of("newRole", role);
    }

    @Transactional
    public Map<String, Object> updateCustomerStatus(Long id, String status) {
        if (status == null || status.isBlank()) {
            throw new IllegalArgumentException("Trạng thái không được để trống");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy khách hàng"));
        user.setStatus(status.trim().toUpperCase());
        userRepository.save(user);
        return Map.of("id", user.getId(), "status", user.getStatus());
    }

    @Transactional
    public Map<String, Object> deleteCustomer(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy khách hàng"));
        user.setStatus("DELETED");
        userRepository.save(user);
        return Map.of("id", user.getId(), "status", "DELETED");
    }

    private void populateProductFromMap(Product p, Map<String, Object> map) {
        if (map.containsKey("name")) p.setName((String) map.get("name"));
        if (map.containsKey("scientificName")) p.setScientificName((String) map.get("scientificName"));
        if (map.containsKey("category")) p.setCategory((String) map.get("category"));
        if (map.containsKey("price")) p.setPrice(((Number) map.get("price")).intValue());
        if (map.containsKey("originalPrice")) p.setOriginalPrice(((Number) map.get("originalPrice")).intValue());
        if (map.containsKey("badge")) p.setBadge((String) map.get("badge"));
        if (map.containsKey("image")) p.setImage((String) map.get("image"));
        if (map.containsKey("difficulty")) p.setDifficulty((String) map.get("difficulty"));
        if (map.containsKey("difficultyLevel")) p.setDifficultyLevel(((Number) map.get("difficultyLevel")).intValue());
        if (map.containsKey("light")) p.setLight((String) map.get("light"));
        if (map.containsKey("lightType")) p.setLightType((String) map.get("lightType"));
        if (map.containsKey("watering")) p.setWatering((String) map.get("watering"));
        if (map.containsKey("wateringDays")) p.setWateringDays(((Number) map.get("wateringDays")).intValue());
        if (map.containsKey("size")) p.setSize((String) map.get("size"));
        if (map.containsKey("idealLocation")) p.setIdealLocation((String) map.get("idealLocation"));
        if (map.containsKey("inStock")) p.setInStock(((Number) map.get("inStock")).intValue());
        if (map.containsKey("description")) p.setDescription((String) map.get("description"));
        if (map.containsKey("meaning")) p.setMeaning((String) map.get("meaning"));

        if (map.containsKey("careTips")) {
            Object tipsObj = map.get("careTips");
            if (tipsObj instanceof List) {
                try {
                    p.setCareTips(objectMapper.writeValueAsString(tipsObj));
                } catch (Exception e) {
                    p.setCareTips(tipsObj.toString());
                }
            } else if (tipsObj instanceof String) {
                p.setCareTips((String) tipsObj);
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

    private String generateSlug(String input) {
        String nfdNormalizedString = Normalizer.normalize(input, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        String noDiacritics = pattern.matcher(nfdNormalizedString).replaceAll("");
        return noDiacritics.toLowerCase()
                .replaceAll("đ", "d")
                .replaceAll("[^a-z0-9\\s]", "")
                .replaceAll("\\s+", "-");
    }
}
