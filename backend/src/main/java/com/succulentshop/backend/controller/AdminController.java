package com.succulentshop.backend.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.succulentshop.backend.entity.Coupon;
import com.succulentshop.backend.entity.Order;
import com.succulentshop.backend.entity.OrderItem;
import com.succulentshop.backend.entity.Product;
import com.succulentshop.backend.entity.User;
import com.succulentshop.backend.repository.CouponRepository;
import com.succulentshop.backend.repository.OrderRepository;
import com.succulentshop.backend.repository.ProductRepository;
import com.succulentshop.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.text.Normalizer;
import java.util.*;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CouponRepository couponRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AdminController(
            OrderRepository orderRepository,
            ProductRepository productRepository,
            CouponRepository couponRepository,
            UserRepository userRepository
    ) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.couponRepository = couponRepository;
        this.userRepository = userRepository;
    }

    // ==========================================
    // 1. STATS & OVERVIEW
    // ==========================================

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

        long totalProducts = productRepository.count();
        long totalCustomers = userRepository.count();
        long totalCoupons = couponRepository.count();

        return ResponseEntity.ok(Map.of(
            "success", true,
            "data", Map.of(
                "totalOrders", totalOrders,
                "pendingOrders", pendingOrders,
                "paidOrders", paidOrders,
                "completedOrders", completedOrders,
                "totalRevenue", totalRevenue,
                "totalProducts", totalProducts,
                "totalCustomers", totalCustomers,
                "totalCoupons", totalCoupons
            )
        ));
    }

    // ==========================================
    // 2. ORDER MANAGEMENT
    // ==========================================

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

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Cập nhật trạng thái đơn hàng thành công",
            "newStatus", formattedStatus
        ));
    }

    // ==========================================
    // 3. PRODUCT CRUD MANAGEMENT
    // ==========================================

    @GetMapping("/products")
    public ResponseEntity<Map<String, Object>> getAllProducts() {
        List<Product> products = productRepository.findAll();
        List<Map<String, Object>> list = new ArrayList<>();
        for (Product p : products) {
            list.add(convertProductToMap(p));
        }
        return ResponseEntity.ok(Map.of(
            "success", true,
            "total", list.size(),
            "data", list
        ));
    }

    @PostMapping("/products")
    public ResponseEntity<Map<String, Object>> createProduct(@RequestBody Map<String, Object> payload) {
        String name = (String) payload.get("name");
        if (name == null || name.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Tên sen đá không được để trống"
            ));
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

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Thêm sen đá mới thành công",
            "data", convertProductToMap(p)
        ));
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<Map<String, Object>> updateProduct(
            @PathVariable String id,
            @RequestBody Map<String, Object> payload
    ) {
        Optional<Product> optionalProduct = productRepository.findById(id);
        if (optionalProduct.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of(
                "success", false,
                "message", "Không tìm thấy sản phẩm với mã: " + id
            ));
        }

        Product p = optionalProduct.get();
        populateProductFromMap(p, payload);
        productRepository.save(p);

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Cập nhật sản phẩm thành công",
            "data", convertProductToMap(p)
        ));
    }

    @PatchMapping("/products/{id}/stock")
    public ResponseEntity<Map<String, Object>> updateProductStock(
            @PathVariable String id,
            @RequestBody Map<String, Object> payload
    ) {
        Optional<Product> optionalProduct = productRepository.findById(id);
        if (optionalProduct.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of(
                "success", false,
                "message", "Không tìm thấy sản phẩm"
            ));
        }

        Product p = optionalProduct.get();
        if (payload.containsKey("inStock")) {
            int newStock = ((Number) payload.get("inStock")).intValue();
            p.setInStock(Math.max(0, newStock));
            productRepository.save(p);
        }

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Cập nhật tồn kho thành công",
            "inStock", p.getInStock()
        ));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<Map<String, Object>> deleteProduct(@PathVariable String id) {
        if (!productRepository.existsById(id)) {
            return ResponseEntity.status(404).body(Map.of(
                "success", false,
                "message", "Không tìm thấy sản phẩm"
            ));
        }

        productRepository.deleteById(id);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Đã xóa sản phẩm thành công"
        ));
    }

    // ==========================================
    // 4. COUPON CRUD MANAGEMENT
    // ==========================================

    @GetMapping("/coupons")
    public ResponseEntity<Map<String, Object>> getAllCoupons() {
        List<Coupon> coupons = couponRepository.findAll();
        return ResponseEntity.ok(Map.of(
            "success", true,
            "total", coupons.size(),
            "data", coupons
        ));
    }

    @PostMapping("/coupons")
    public ResponseEntity<Map<String, Object>> createCoupon(@RequestBody Map<String, Object> payload) {
        String code = (String) payload.get("code");
        if (code == null || code.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Mã giảm giá không được để trống"
            ));
        }

        String formattedCode = code.trim().toUpperCase();
        if (couponRepository.existsById(formattedCode)) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Mã giảm giá này đã tồn tại trong hệ thống"
            ));
        }

        int discountPercent = payload.containsKey("discountPercent") 
                ? ((Number) payload.get("discountPercent")).intValue() 
                : 10;
        boolean isActive = !payload.containsKey("isActive") || Boolean.TRUE.equals(payload.get("isActive"));
        String description = (String) payload.get("description");

        Coupon coupon = new Coupon(formattedCode, discountPercent, isActive, description);
        couponRepository.save(coupon);

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Tạo mã giảm giá mới thành công",
            "data", coupon
        ));
    }

    @PatchMapping("/coupons/{code}/toggle")
    public ResponseEntity<Map<String, Object>> toggleCoupon(
            @PathVariable String code,
            @RequestBody(required = false) Map<String, Object> payload
    ) {
        Optional<Coupon> optionalCoupon = couponRepository.findById(code.toUpperCase());
        if (optionalCoupon.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of(
                "success", false,
                "message", "Không tìm thấy mã giảm giá"
            ));
        }

        Coupon coupon = optionalCoupon.get();
        if (payload != null && payload.containsKey("isActive")) {
            coupon.setIsActive(Boolean.TRUE.equals(payload.get("isActive")));
        } else {
            coupon.setIsActive(!Boolean.TRUE.equals(coupon.getIsActive()));
        }
        couponRepository.save(coupon);

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Cập nhật trạng thái voucher thành công",
            "data", coupon
        ));
    }

    @DeleteMapping("/coupons/{code}")
    public ResponseEntity<Map<String, Object>> deleteCoupon(@PathVariable String code) {
        String formattedCode = code.toUpperCase();
        if (!couponRepository.existsById(formattedCode)) {
            return ResponseEntity.status(404).body(Map.of(
                "success", false,
                "message", "Không tìm thấy mã giảm giá"
            ));
        }

        couponRepository.deleteById(formattedCode);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Đã xóa mã voucher thành công"
        ));
    }

    // ==========================================
    // 5. CUSTOMER / USER MANAGEMENT
    // ==========================================

    @GetMapping("/customers")
    public ResponseEntity<Map<String, Object>> getAllCustomers() {
        List<User> users = userRepository.findAll();
        List<Map<String, Object>> safeUsers = new ArrayList<>();

        for (User u : users) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", u.getId());
            map.put("name", u.getName());
            map.put("email", u.getEmail());
            map.put("phone", u.getPhone());
            map.put("address", u.getAddress());
            map.put("role", u.getRole());
            map.put("avatar", u.getAvatar());
            map.put("points", u.getPoints());
            map.put("createdAt", u.getCreatedAt() != null ? u.getCreatedAt().toString() : null);
            safeUsers.add(map);
        }

        return ResponseEntity.ok(Map.of(
            "success", true,
            "total", safeUsers.size(),
            "data", safeUsers
        ));
    }

    @PatchMapping("/customers/{id}/role")
    public ResponseEntity<Map<String, Object>> updateCustomerRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        String newRole = body.get("role");
        if (newRole == null || newRole.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Vai trò không được để trống"
            ));
        }

        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of(
                "success", false,
                "message", "Không tìm thấy khách hàng"
            ));
        }

        User user = userOpt.get();
        user.setRole(newRole.trim());
        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Cập nhật phân quyền khách hàng thành công",
            "newRole", newRole
        ));
    }

    // ==========================================
    // HELPER METHODS
    // ==========================================

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

    private Map<String, Object> convertProductToMap(Product p) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", p.getId());
        map.put("name", p.getName());
        map.put("scientificName", p.getScientificName());
        map.put("category", p.getCategory());
        map.put("price", p.getPrice());
        map.put("originalPrice", p.getOriginalPrice());
        map.put("rating", p.getRating());
        map.put("reviewsCount", p.getReviewsCount());
        map.put("badge", p.getBadge());
        map.put("image", p.getImage());
        map.put("difficulty", p.getDifficulty());
        map.put("difficultyLevel", p.getDifficultyLevel());
        map.put("light", p.getLight());
        map.put("lightType", p.getLightType());
        map.put("watering", p.getWatering());
        map.put("wateringDays", p.getWateringDays());
        map.put("size", p.getSize());
        map.put("idealLocation", p.getIdealLocation());
        map.put("inStock", p.getInStock());
        map.put("description", p.getDescription());
        map.put("meaning", p.getMeaning());

        List<String> tips = Collections.emptyList();
        if (p.getCareTips() != null && !p.getCareTips().isBlank()) {
            try {
                tips = objectMapper.readValue(p.getCareTips(), new TypeReference<List<String>>() {});
            } catch (Exception e) {
                tips = List.of(p.getCareTips());
            }
        }
        map.put("careTips", tips);

        return map;
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
