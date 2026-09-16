package com.succulentshop.backend.dto;

import java.util.List;

public class UserResponse {
    private Long id;
    private String publicId;
    private String name;
    private String email;
    private String phone;
    private String address;
    private String role;
    private String avatar;
    private Integer points;
    private String authProvider;
    private String status;
    private List<String> linkedProviders;
    private String createdAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPublicId() { return publicId; }
    public void setPublicId(String publicId) { this.publicId = publicId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    public Integer getPoints() { return points; }
    public void setPoints(Integer points) { this.points = points; }

    public String getAuthProvider() { return authProvider; }
    public void setAuthProvider(String authProvider) { this.authProvider = authProvider; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public List<String> getLinkedProviders() { return linkedProviders; }
    public void setLinkedProviders(List<String> linkedProviders) { this.linkedProviders = linkedProviders; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
