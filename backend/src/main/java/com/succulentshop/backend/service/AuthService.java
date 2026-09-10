package com.succulentshop.backend.service;

import com.succulentshop.backend.dto.GoogleLoginRequest;
import com.succulentshop.backend.dto.UpdateProfileRequest;
import com.succulentshop.backend.entity.SocialAccount;
import com.succulentshop.backend.entity.User;
import com.succulentshop.backend.exception.AppException;
import com.succulentshop.backend.exception.ErrorCode;
import com.succulentshop.backend.exception.ResourceNotFoundException;
import com.succulentshop.backend.repository.SocialAccountRepository;
import com.succulentshop.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final SocialAccountRepository socialAccountRepository;
    private final RestTemplate restTemplate;

    @Value("${google.client-id:}")
    private String configuredClientId;

    public AuthService(UserRepository userRepository) {
        this(userRepository, null);
    }

    @org.springframework.beans.factory.annotation.Autowired
    public AuthService(UserRepository userRepository, SocialAccountRepository socialAccountRepository) {
        this.userRepository = userRepository;
        this.socialAccountRepository = socialAccountRepository;
        this.restTemplate = new RestTemplate();
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

    /**
     * Xác thực và đăng nhập người dùng bằng Google OAuth2
     */
    @Transactional
    @SuppressWarnings("unchecked")
    public Map<String, Object> loginWithGoogle(GoogleLoginRequest request) {
        if (request == null) {
            throw new AppException(ErrorCode.REQUIRED_FIELD_MISSING, "Dữ liệu yêu cầu không hợp lệ");
        }

        String email = null;
        String name = null;
        String avatar = null;
        String sub = null;

        // 1. Kiểm tra xác thực Google ID Token nếu có
        if (request.getIdToken() != null && !request.getIdToken().isBlank()) {
            try {
                String verifyUrl = "https://oauth2.googleapis.com/tokeninfo?id_token=" + request.getIdToken().trim();
                Map<String, Object> tokenInfo = restTemplate.getForObject(verifyUrl, Map.class);
                if (tokenInfo != null && tokenInfo.containsKey("email")) {
                    email = (String) tokenInfo.get("email");
                    name = (String) tokenInfo.get("name");
                    avatar = (String) tokenInfo.get("picture");
                    sub = (String) tokenInfo.get("sub");
                }
            } catch (Exception e) {
                System.err.println("Google ID Token verification failed: " + e.getMessage());
            }
        }

        // 2. Kiểm tra xác thực qua Access Token nếu có và chưa lấy được email
        if (email == null && request.getAccessToken() != null && !request.getAccessToken().isBlank()) {
            try {
                HttpHeaders headers = new HttpHeaders();
                headers.setBearerAuth(request.getAccessToken().trim());
                HttpEntity<?> entity = new HttpEntity<>(headers);
                ResponseEntity<Map> resp = restTemplate.exchange(
                    "https://www.googleapis.com/oauth2/v3/userinfo",
                    HttpMethod.GET,
                    entity,
                    Map.class
                );
                Map<String, Object> userInfo = resp.getBody();
                if (userInfo != null && userInfo.containsKey("email")) {
                    email = (String) userInfo.get("email");
                    name = (String) userInfo.get("name");
                    avatar = (String) userInfo.get("picture");
                    sub = (String) userInfo.get("sub");
                }
            } catch (Exception e) {
                System.err.println("Google UserInfo verification failed: " + e.getMessage());
            }
        }

        // 3. Fallback lấy từ profile gửi lên (trong môi trường mock/offline)
        if (email == null && request.getProfile() != null && request.getProfile().containsKey("email")) {
            email = (String) request.getProfile().get("email");
            if (name == null) name = (String) request.getProfile().get("name");
            if (avatar == null) avatar = (String) request.getProfile().get("picture");
            if (sub == null) sub = (String) request.getProfile().get("sub");
        }

        if (email == null || email.isBlank()) {
            throw new AppException(ErrorCode.INVALID_CREDENTIALS, "Không thể xác thực danh tính Google. Vui lòng thử lại!");
        }

        String cleanEmail = email.trim().toLowerCase();
        if (sub == null || sub.isBlank()) {
            sub = "google_" + cleanEmail;
        }

        // 4. Tìm kiếm người dùng qua SocialAccount hoặc Email
        User user;
        Optional<SocialAccount> socialOpt = socialAccountRepository.findByProviderAndProviderId("GOOGLE", sub);

        if (socialOpt.isPresent()) {
            user = socialOpt.get().getUser();
            if (avatar != null && !avatar.isBlank()) {
                socialOpt.get().setAvatar(avatar);
                socialAccountRepository.save(socialOpt.get());
            }
        } else {
            Optional<User> existingUserOpt = userRepository.findByEmail(cleanEmail);
            if (existingUserOpt.isPresent()) {
                user = existingUserOpt.get();
                // Liên kết tài khoản Google với tài khoản người dùng hiện có
                SocialAccount sa = new SocialAccount(user, "GOOGLE", sub, cleanEmail, avatar);
                socialAccountRepository.save(sa);
            } else {
                // Tạo tài khoản người dùng mới
                String displayName = (name != null && !name.isBlank()) ? name.trim() : cleanEmail.split("@")[0];
                String userAvatar = (avatar != null && !avatar.isBlank()) 
                    ? avatar 
                    : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80";
                
                User newUser = new User(
                    displayName,
                    cleanEmail,
                    "",
                    null,
                    null,
                    "Thành viên mới",
                    userAvatar,
                    50
                );
                newUser.setAuthProvider("GOOGLE");
                user = userRepository.save(newUser);

                SocialAccount sa = new SocialAccount(user, "GOOGLE", sub, cleanEmail, avatar);
                socialAccountRepository.save(sa);
            }
        }

        return Map.of(
            "user", sanitizeUser(user),
            "token", "bearer_google_" + user.getId() + "_" + System.currentTimeMillis()
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
