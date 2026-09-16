package com.succulentshop.backend.dto;

import java.util.List;

public class ProductResponse {
    private String id;
    private String publicId;
    private String name;
    private String scientificName;
    private String category;
    private Integer price;
    private Integer originalPrice;
    private Double rating;
    private Integer reviewsCount;
    private String badge;
    private String image;
    private String difficulty;
    private Integer difficultyLevel;
    private String light;
    private String lightType;
    private String watering;
    private Integer wateringDays;
    private String size;
    private String idealLocation;
    private Integer inStock;
    private String description;
    private String meaning;
    private String status;
    private Boolean available;
    private List<String> careTips;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getPublicId() { return publicId; }
    public void setPublicId(String publicId) { this.publicId = publicId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getScientificName() { return scientificName; }
    public void setScientificName(String scientificName) { this.scientificName = scientificName; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Integer getPrice() { return price; }
    public void setPrice(Integer price) { this.price = price; }

    public Integer getOriginalPrice() { return originalPrice; }
    public void setOriginalPrice(Integer originalPrice) { this.originalPrice = originalPrice; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public Integer getReviewsCount() { return reviewsCount; }
    public void setReviewsCount(Integer reviewsCount) { this.reviewsCount = reviewsCount; }

    public String getBadge() { return badge; }
    public void setBadge(String badge) { this.badge = badge; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public Integer getDifficultyLevel() { return difficultyLevel; }
    public void setDifficultyLevel(Integer difficultyLevel) { this.difficultyLevel = difficultyLevel; }

    public String getLight() { return light; }
    public void setLight(String light) { this.light = light; }

    public String getLightType() { return lightType; }
    public void setLightType(String lightType) { this.lightType = lightType; }

    public String getWatering() { return watering; }
    public void setWatering(String watering) { this.watering = watering; }

    public Integer getWateringDays() { return wateringDays; }
    public void setWateringDays(Integer wateringDays) { this.wateringDays = wateringDays; }

    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }

    public String getIdealLocation() { return idealLocation; }
    public void setIdealLocation(String idealLocation) { this.idealLocation = idealLocation; }

    public Integer getInStock() { return inStock; }
    public void setInStock(Integer inStock) { this.inStock = inStock; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getMeaning() { return meaning; }
    public void setMeaning(String meaning) { this.meaning = meaning; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Boolean getAvailable() { return available; }
    public void setAvailable(Boolean available) { this.available = available; }

    public List<String> getCareTips() { return careTips; }
    public void setCareTips(List<String> careTips) { this.careTips = careTips; }
}
