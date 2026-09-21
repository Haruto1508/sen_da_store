package com.succulentshop.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.succulentshop.backend.dto.ProductResponse;
import com.succulentshop.backend.dto.ReviewResponse;
import com.succulentshop.backend.entity.Product;
import com.succulentshop.backend.exception.AppException;
import com.succulentshop.backend.exception.ErrorCode;
import com.succulentshop.backend.exception.InsufficientStockException;
import com.succulentshop.backend.exception.ResourceNotFoundException;
import com.succulentshop.backend.repository.ProductRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
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

    @Cacheable(value = "products_filtered", key = "(#category ?: 'all') + '_' + (#search ?: '') + '_' + (#light ?: 'all') + '_' + (#difficulty ?: 'all') + '_' + (#sort ?: 'default')")
    public List<ProductResponse> getFilteredProducts(String category, String search, String light, String difficulty, String sort) {
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
                : productRepository.findByStatusNot("DELETED");

        products = new ArrayList<>(products.stream().filter(Product::isActive).toList());

        if ("price-asc".equalsIgnoreCase(sort)) {
            products.sort(Comparator.comparingInt(Product::getPrice));
        } else if ("price-desc".equalsIgnoreCase(sort)) {
            products.sort(Comparator.comparingInt(Product::getPrice).reversed());
        } else if ("rating".equalsIgnoreCase(sort)) {
            products.sort(Comparator.comparingDouble(Product::getRating).reversed());
        }

        List<ProductResponse> responseList = new ArrayList<>();
        for (Product p : products) {
            responseList.add(convertProductToResponse(p));
        }
        return responseList;
    }

    @Cacheable(value = "product_detail", key = "#id")
    public ProductResponse getProductDetail(String id) {
        Product p = findByIdOrThrow(id);
        return convertProductToResponse(p);
    }

    public Product findByIdOrThrow(String id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.PRODUCT_NOT_FOUND, "Không tìm thấy sen đá với mã: " + id));
    }

    /**
     * Tìm kiếm sản phẩm bắt buộc phải ở trạng thái ACTIVE (dùng cho Cart và Checkout)
     */
    public Product findActiveByIdOrThrow(String id) {
        Product p = findByIdOrThrow(id);
        if (!p.isActive()) {
            throw new AppException(ErrorCode.PRODUCT_UNAVAILABLE,
                    String.format("Sản phẩm \"%s\" không còn được bán hoặc đã ngừng kinh doanh", p.getName()));
        }
        return p;
    }

    @Transactional
    @CacheEvict(value = {"product_detail", "products_filtered"}, allEntries = true)
    public void deductStock(String productId, int quantity) {
        Product p = findActiveByIdOrThrow(productId);
        int currentStock = p.getInStock() != null ? p.getInStock() : 0;
        if (currentStock <= 0) {
            throw new InsufficientStockException(
                ErrorCode.INSUFFICIENT_STOCK,
                String.format("Sản phẩm \"%s\" hiện đã hết hàng trong kho", p.getName())
            );
        }
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
    @CacheEvict(value = {"product_detail", "products_filtered"}, allEntries = true)
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
    @CacheEvict(value = {"product_detail", "products_filtered"}, allEntries = true)
    public ReviewResponse addReview(String productId, int newRating, String comment, String reviewerName) {
        Product p = findByIdOrThrow(productId);
        int clampedRating = Math.max(1, Math.min(5, newRating));

        double currentRating = p.getRating() != null ? p.getRating() : 5.0;
        int currentReviews = p.getReviewsCount() != null ? p.getReviewsCount() : 0;

        double updatedRating = ((currentRating * currentReviews) + clampedRating) / (currentReviews + 1);
        updatedRating = Math.round(updatedRating * 10.0) / 10.0;

        p.setRating(updatedRating);
        p.setReviewsCount(currentReviews + 1);
        productRepository.save(p);

        ReviewResponse response = new ReviewResponse();
        response.setProductId(p.getId());
        response.setRating(p.getRating());
        response.setReviewsCount(p.getReviewsCount());
        response.setNewRatingAdded(clampedRating);
        response.setReviewerName(reviewerName != null ? reviewerName : "Khách yêu sen đá");
        response.setComment(comment != null ? comment : "");
        return response;
    }

    public ProductResponse convertProductToResponse(Product p) {
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
