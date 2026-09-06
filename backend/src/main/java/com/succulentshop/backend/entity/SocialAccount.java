package com.succulentshop.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "social_accounts", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"provider", "provider_id"})
})
public class SocialAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(nullable = false, length = 50)
    private String provider; // "GOOGLE", "FACEBOOK", etc.

    @Column(name = "provider_id", nullable = false)
    private String providerId; // ID duy nhất do Google trả về (sub)

    private String email;

    @Column(length = 1000)
    private String avatar;

    private LocalDateTime createdAt;

    public SocialAccount() {
        this.createdAt = LocalDateTime.now();
    }

    public SocialAccount(User user, String provider, String providerId, String email, String avatar) {
        this.user = user;
        this.provider = provider;
        this.providerId = providerId;
        this.email = email;
        this.avatar = avatar;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }

    public String getProviderId() { return providerId; }
    public void setProviderId(String providerId) { this.providerId = providerId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
