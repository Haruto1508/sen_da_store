package com.succulentshop.backend.dto;

import java.io.Serializable;
import java.time.LocalDateTime;

public class ReviewItemDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id;
    private String productId;
    private Integer rating;
    private String reviewerName;
    private String comment;
    private LocalDateTime createdAt;

    public ReviewItemDto() {}

    public ReviewItemDto(Long id, String productId, Integer rating, String reviewerName, String comment, LocalDateTime createdAt) {
        this.id = id;
        this.productId = productId;
        this.rating = rating;
        this.reviewerName = reviewerName;
        this.comment = comment;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getReviewerName() { return reviewerName; }
    public void setReviewerName(String reviewerName) { this.reviewerName = reviewerName; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
