package com.succulentshop.backend.dto;

public class ReviewResponse {
    private String productId;
    private Double rating;
    private Integer reviewsCount;
    private Integer newRatingAdded;
    private String reviewerName;
    private String comment;

    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public Integer getReviewsCount() { return reviewsCount; }
    public void setReviewsCount(Integer reviewsCount) { this.reviewsCount = reviewsCount; }

    public Integer getNewRatingAdded() { return newRatingAdded; }
    public void setNewRatingAdded(Integer newRatingAdded) { this.newRatingAdded = newRatingAdded; }

    public String getReviewerName() { return reviewerName; }
    public void setReviewerName(String reviewerName) { this.reviewerName = reviewerName; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
}
