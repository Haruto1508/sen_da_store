package com.succulentshop.backend.dto;

public class ReviewRequest {
    private Integer rating;
    private String comment;
    private String reviewerName;

    public ReviewRequest() {}

    public ReviewRequest(Integer rating, String comment, String reviewerName) {
        this.rating = rating;
        this.comment = comment;
        this.reviewerName = reviewerName;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public String getReviewerName() {
        return reviewerName;
    }

    public void setReviewerName(String reviewerName) {
        this.reviewerName = reviewerName;
    }
}
