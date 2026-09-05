package com.succulentshop.backend.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.succulentshop.backend.entity.Product;
import com.succulentshop.backend.repository.ProductRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductRepository productRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ProductController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String light,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false, defaultValue = "featured") String sort
    ) {
        List<Product> products = productRepository.filterProducts(category, search, light, difficulty);

        // Sorting
        if ("price-asc".equalsIgnoreCase(sort)) {
            products.sort(Comparator.comparingInt(Product::getPrice));
        } else if ("price-desc".equalsIgnoreCase(sort)) {
            products.sort(Comparator.comparingInt(Product::getPrice).reversed());
        } else if ("rating".equalsIgnoreCase(sort)) {
            products.sort(Comparator.comparingDouble(Product::getRating).reversed());
        }

        // Convert Product entities to format compatible with Frontend
        List<Map<String, Object>> responseList = new ArrayList<>();
        for (Product p : products) {
            responseList.add(convertProductToMap(p));
        }

        return ResponseEntity.ok(Map.of(
            "success", true,
            "total", responseList.size(),
            "data", responseList
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getProductById(@PathVariable String id) {
        Optional<Product> optionalProduct = productRepository.findById(id);

        if (optionalProduct.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of(
                "success", false,
                "message", "Không tìm thấy sản phẩm"
            ));
        }

        return ResponseEntity.ok(Map.of(
            "success", true,
            "data", convertProductToMap(optionalProduct.get())
        ));
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
}
