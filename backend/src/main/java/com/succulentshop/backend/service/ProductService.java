package com.succulentshop.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.succulentshop.backend.entity.Product;
import com.succulentshop.backend.exception.ErrorCode;
import com.succulentshop.backend.exception.InsufficientStockException;
import com.succulentshop.backend.exception.ResourceNotFoundException;
import com.succulentshop.backend.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Map<String, Object>> getFilteredProducts(String category, String search, String light, String difficulty, String sort) {
        boolean hasFilter = (category != null && !category.isBlank() && !"all".equalsIgnoreCase(category))
                || (search != null && !search.isBlank())
                || (light != null && !light.isBlank() && !"all".equalsIgnoreCase(light))
                || (difficulty != null && !difficulty.isBlank() && !"all".equalsIgnoreCase(difficulty));

        List<Product> products = hasFilter
                ? productRepository.filterProducts(
                    (category != null && !category.isBlank() && !"all".equalsIgnoreCase(category)) ? category.trim() : null,
                    (search != null && !search.isBlank()) ? search.trim() : null,
                    (light != null && !light.isBlank() && !"all".equalsIgnoreCase(light)) ? light.trim() : null,
                    (difficulty != null && !difficulty.isBlank() && !"all".equalsIgnoreCase(difficulty)) ? difficulty.trim() : null
                )
                : productRepository.findAll();

        if ("price-asc".equalsIgnoreCase(sort)) {
            products.sort(Comparator.comparingInt(Product::getPrice));
        } else if ("price-desc".equalsIgnoreCase(sort)) {
            products.sort(Comparator.comparingInt(Product::getPrice).reversed());
        } else if ("rating".equalsIgnoreCase(sort)) {
            products.sort(Comparator.comparingDouble(Product::getRating).reversed());
        }

        List<Map<String, Object>> responseList = new ArrayList<>();
        for (Product p : products) {
            responseList.add(convertProductToMap(p));
        }
        return responseList;
    }

    public Map<String, Object> getProductDetail(String id) {
        Product p = findByIdOrThrow(id);
        return convertProductToMap(p);
    }

    public Product findByIdOrThrow(String id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.PRODUCT_NOT_FOUND, "Không tìm thấy sen đá với mã: " + id));
    }

    @Transactional
    public void deductStock(String productId, int quantity) {
        Product p = findByIdOrThrow(productId);
        int currentStock = p.getInStock() != null ? p.getInStock() : 0;
        if (currentStock < quantity) {
            throw new InsufficientStockException(
                ErrorCode.INSUFFICIENT_STOCK,
                String.format("Cây \"%s\" hiện chỉ còn %d cây trong kho, không đủ số lượng %d bạn yêu cầu",
                        p.getName(), currentStock, quantity)
            );
        }
        p.setInStock(currentStock - quantity);
        productRepository.save(p);
    }

    @Transactional
    public void restoreStock(String productId, int quantity) {
        Optional<Product> pOpt = productRepository.findById(productId);
        if (pOpt.isPresent()) {
            Product p = pOpt.get();
            int currentStock = p.getInStock() != null ? p.getInStock() : 0;
            p.setInStock(currentStock + quantity);
            productRepository.save(p);
        }
    }

    @Transactional
    public Map<String, Object> addReview(String productId, int newRating, String comment, String reviewerName) {
        Product p = findByIdOrThrow(productId);
        int clampedRating = Math.max(1, Math.min(5, newRating));

        double currentRating = p.getRating() != null ? p.getRating() : 5.0;
        int currentReviews = p.getReviewsCount() != null ? p.getReviewsCount() : 0;

        double updatedRating = ((currentRating * currentReviews) + clampedRating) / (currentReviews + 1);
        updatedRating = Math.round(updatedRating * 10.0) / 10.0;

        p.setRating(updatedRating);
        p.setReviewsCount(currentReviews + 1);
        productRepository.save(p);

        return Map.of(
            "productId", p.getId(),
            "rating", p.getRating(),
            "reviewsCount", p.getReviewsCount(),
            "newRatingAdded", clampedRating,
            "reviewerName", reviewerName != null ? reviewerName : "Khách yêu sen đá",
            "comment", comment != null ? comment : ""
        );
    }

    public Map<String, Object> convertProductToMap(Product p) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", p.getId());
        map.put("publicId", p.getPublicId());
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
