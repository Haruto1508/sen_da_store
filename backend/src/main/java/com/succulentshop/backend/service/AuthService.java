package com.succulentshop.backend.service;

import com.succulentshop.backend.dto.UpdateProfileRequest;
import com.succulentshop.backend.entity.User;
import com.succulentshop.backend.exception.AppException;
import com.succulentshop.backend.exception.ErrorCode;
import com.succulentshop.backend.exception.ResourceNotFoundException;
import com.succulentshop.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AuthService {

    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Map<String, Object> login(String identifier, String password) {
        if (identifier == null || password == null || identifier.isBlank() || password.isBlank()) {
            throw new AppException(ErrorCode.AUTH_CREDENTIALS_REQUIRED);
        }

        String target = identifier.trim().toLowerCase();
        Optional<User> userOpt = userRepository.findByEmail(target);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByPhone(target);
        }

        if (userOpt.isEmpty() || !userOpt.get().getPassword().equals(password)) {
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }

        User user = userOpt.get();
        return Map.of(
            "user", sanitizeUser(user),
            "token", "bearer_token_" + user.getId() + "_" + System.currentTimeMillis()
        );
    }

    public Map<String, Object> register(String name, String email, String phone, String password, String address) {
        if (email == null || password == null || name == null ||
            email.isBlank() || password.isBlank() || name.isBlank()) {
            throw new AppException(ErrorCode.REQUIRED_FIELD_MISSING);
        }

        String cleanEmail = email.trim().toLowerCase();
        if (userRepository.existsByEmail(cleanEmail)) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        User user = new User(
            name.trim(),
            cleanEmail,
            phone != null ? phone.trim() : "",
            password,
            address != null ? address.trim() : "Hà Nội, Việt Nam",
            "Thành viên mới",
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
            50
        );

        User saved = userRepository.save(user);
        return Map.of(
            "user", sanitizeUser(saved),
            "token", "bearer_token_" + saved.getId() + "_" + System.currentTimeMillis()
        );
    }

    public String requestOtp(String emailOrPhone) {
        User user = findByIdentifierOrThrow(emailOrPhone);
        String demoOtp = "686868";
        user.setResetOtp(demoOtp);
        userRepository.save(user);
        return demoOtp;
    }

    public void resetPassword(String emailOrPhone, String otp, String newPassword) {
        User user = findByIdentifierOrThrow(emailOrPhone);
        if (!"686868".equals(otp) && !otp.equals(user.getResetOtp())) {
            throw new AppException(ErrorCode.INVALID_OTP);
        }
        user.setPassword(newPassword);
        user.setResetOtp(null);
        userRepository.save(user);
    }

    public void changePassword(String email, String currentPassword, String newPassword) {
        User user = findByIdentifierOrThrow(email);
        if (!user.getPassword().equals(currentPassword)) {
            throw new AppException(ErrorCode.CURRENT_PASSWORD_INCORRECT);
        }
        user.setPassword(newPassword);
        userRepository.save(user);
    }

    public Map<String, Object> getProfile(String email) {
        User user = findByIdentifierOrThrow(email);
        return sanitizeUser(user);
    }

    public Map<String, Object> updateProfile(UpdateProfileRequest request) {
        User user = findByIdentifierOrThrow(request.getEmail());
        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName().trim());
        }
        if (request.getPhone() != null && !request.getPhone().isBlank()) {
            user.setPhone(request.getPhone().trim());
        }
        if (request.getAddress() != null && !request.getAddress().isBlank()) {
            user.setAddress(request.getAddress().trim());
        }
        if (request.getAvatar() != null && !request.getAvatar().isBlank()) {
            user.setAvatar(request.getAvatar().trim());
        }
        userRepository.save(user);
        return sanitizeUser(user);
    }

    public User findByIdentifierOrThrow(String identifier) {
        if (identifier == null || identifier.isBlank()) {
            throw new AppException(ErrorCode.REQUIRED_FIELD_MISSING, "Vui lòng nhập email hoặc số điện thoại");
        }
        String clean = identifier.trim().toLowerCase();
        Optional<User> userOpt = userRepository.findByEmail(clean);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByPhone(clean);
        }
        return userOpt.orElseThrow(() -> new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND, "Không tìm thấy tài khoản với: " + identifier));
    }

    public Map<String, Object> sanitizeUser(User user) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", user.getId());
        map.put("publicId", user.getPublicId());
        map.put("name", user.getName());
        map.put("email", user.getEmail());
        map.put("phone", user.getPhone());
        map.put("address", user.getAddress());
        map.put("role", user.getRole());
        map.put("avatar", user.getAvatar());
        map.put("points", user.getPoints());
        map.put("createdAt", user.getCreatedAt() != null ? user.getCreatedAt().toString() : null);
        return map;
    }
}
