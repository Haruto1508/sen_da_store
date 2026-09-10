package com.succulentshop.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "public_id", nullable = false, unique = true, length = 36)
    private String publicId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    private String phone;

    private String password; // Nullable cho người dùng đăng nhập qua Google OAuth2

    @Column(name = "auth_provider")
    private String authProvider = "LOCAL"; // "LOCAL", "GOOGLE"

    private String address;

    private String role; // "Thành viên thân thiết", "Quản trị viên (Admin)", "Thành viên mới"

    private String avatar;

    private Integer points;

    private String resetOtp;

    @Column(length = 50)
    private String status = "ACTIVE"; // "ACTIVE", "BANNED", "DELETED"

    private LocalDateTime createdAt;

    public User() {
        this.publicId = UUID.randomUUID().toString();
        this.createdAt = LocalDateTime.now();
        this.points = 0;
        this.authProvider = "LOCAL";
        this.status = "ACTIVE";
    }

    public User(String name, String email, String phone, String password, String address, String role, String avatar, Integer points) {
        this.publicId = UUID.randomUUID().toString();
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.password = password;
        this.address = address;
        this.role = role;
        this.avatar = avatar;
        this.points = points != null ? points : 0;
        this.authProvider = "LOCAL";
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
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

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    public Integer getPoints() { return points; }
    public void setPoints(Integer points) { this.points = points; }

    public String getResetOtp() { return resetOtp; }
    public void setResetOtp(String resetOtp) { this.resetOtp = resetOtp; }

    public String getAuthProvider() { return authProvider; }
    public void setAuthProvider(String authProvider) { this.authProvider = authProvider; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public boolean isActive() {
        return status == null || "ACTIVE".equalsIgnoreCase(this.status);
    }

    public boolean isBanned() {
        return "BANNED".equalsIgnoreCase(this.status);
    }

    public boolean isDeleted() {
        return "DELETED".equalsIgnoreCase(this.status);
    }
}
