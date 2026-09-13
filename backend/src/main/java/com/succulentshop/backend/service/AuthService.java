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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final SocialAccountRepository socialAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final RestTemplate restTemplate;

    @Value("${google.client-id:}")
    private String configuredClientId;

    public AuthService(UserRepository userRepository) {
        this(userRepository, null, new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder());
    }

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this(userRepository, null, passwordEncoder != null ? passwordEncoder : new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder());
    }

    @org.springframework.beans.factory.annotation.Autowired
    public AuthService(UserRepository userRepository, SocialAccountRepository socialAccountRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.socialAccountRepository = socialAccountRepository;
        this.passwordEncoder = passwordEncoder != null ? passwordEncoder : new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
        this.restTemplate = new RestTemplate();
    }

    /**
     * Đăng nhập người dùng bằng email hoặc số điện thoại (Passwordless Authentication)
     * Nếu tài khoản chưa tồn tại, tự động tạo mới tài khoản với quyền Thành viên mới
     */
    public Map<String, Object> login(String identifier) {
        if (identifier == null || identifier.isBlank()) {
            throw new AppException(ErrorCode.REQUIRED_FIELD_MISSING, "Vui lòng nhập email hoặc số điện thoại để đăng nhập");
        }

        String target = identifier.trim().toLowerCase();
        Optional<User> userOpt = userRepository.findByEmail(target);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByPhone(target);
        }

        User user;
        if (userOpt.isPresent()) {
            user = userOpt.get();
            // Kiểm tra trạng thái tài khoản
            if (user.isBanned() || user.isDeleted()) {
                throw new AppException(ErrorCode.ACCOUNT_DISABLED);
            }
        } else {
            // Tự động tạo tài khoản mới nếu chưa tồn tại
            String displayName = target.contains("@") ? target.split("@")[0] : target;
            User newUser = new User(
                displayName,
                target,
                "",
                null, // Không lưu mật khẩu
                "Hà Nội, Việt Nam",
                "Thành viên mới",
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
                50
            );
            newUser.setAuthProvider("EMAIL");
            user = userRepository.save(newUser);
            log.info("Tự động tạo tài khoản người dùng mới từ email: {}", target);
        }

        return Map.of(
            "user", sanitizeUser(user),
            "token", "bearer_token_" + user.getId() + "_" + System.currentTimeMillis()
        );
    }

    /**
     * Overload tương thích ngược cho các lời gọi cũ có truyền password
     */
    public Map<String, Object> login(String identifier, String password) {
        return login(identifier);
    }

    /**
     * Xác thực và đăng nhập người dùng bằng Google OAuth2
     * Hợp nhất tài khoản: Cùng 1 email chỉ tồn tại duy nhất 1 User
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
                log.warn("Google ID Token verification failed: {}", e.getMessage());
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
                log.warn("Google UserInfo verification failed: {}", e.getMessage());
            }
        }

        // 3. Fallback lấy từ profile gửi lên
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
            log.info("Google login thành công cho User đã liên kết: {} (ID={})", user.getEmail(), user.getId());
        } else {
            Optional<User> existingUserOpt = userRepository.findByEmail(cleanEmail);
            if (existingUserOpt.isPresent()) {
                user = existingUserOpt.get();
                SocialAccount sa = new SocialAccount(user, "GOOGLE", sub, cleanEmail, avatar);
                socialAccountRepository.save(sa);
                if (user.getAvatar() == null || user.getAvatar().isBlank()) {
                    user.setAvatar(avatar);
                    userRepository.save(user);
                }
                log.info("Đã liên kết thành công Google Identity (sub={}) vào User hiện có: {} (ID={})", sub, user.getEmail(), user.getId());
            } else {
                String displayName = (name != null && !name.isBlank()) ? name.trim() : cleanEmail.split("@")[0];
                String userAvatar = (avatar != null && !avatar.isBlank()) 
                    ? avatar 
                    : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80";
                
                User newUser = new User(
                    displayName,
                    cleanEmail,
                    "",
                    null, // password = NULL
                    null,
                    "Thành viên mới",
                    userAvatar,
                    50
                );
                newUser.setAuthProvider("GOOGLE");
                user = userRepository.save(newUser);

                SocialAccount sa = new SocialAccount(user, "GOOGLE", sub, cleanEmail, avatar);
                socialAccountRepository.save(sa);
                log.info("Tạo User mới từ Google OAuth2: {} (ID={})", user.getEmail(), user.getId());
            }
        }

        // Kiểm tra trạng thái tài khoản
        if (user.isBanned() || user.isDeleted()) {
            throw new AppException(ErrorCode.ACCOUNT_DISABLED);
        }

        return Map.of(
            "user", sanitizeUser(user),
            "token", "bearer_google_" + user.getId() + "_" + System.currentTimeMillis()
        );
    }

    /**
     * Đăng ký tài khoản mới không cần mật khẩu
     */
    public Map<String, Object> register(String name, String email, String phone, String address) {
        if (email == null || name == null || email.isBlank() || name.isBlank()) {
            throw new AppException(ErrorCode.REQUIRED_FIELD_MISSING);
        }

        String cleanEmail = email.trim().toLowerCase();
        if (userRepository.existsByEmail(cleanEmail)) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS, "Email này đã được sử dụng trong hệ thống!");
        }

        User user = new User(
            name.trim(),
            cleanEmail,
            phone != null ? phone.trim() : "",
            null, // Không dùng mật khẩu
            address != null ? address.trim() : "Hà Nội, Việt Nam",
            "Thành viên mới",
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
            50
        );
        user.setAuthProvider("EMAIL");

        User saved = userRepository.save(user);
        return Map.of(
            "user", sanitizeUser(saved),
            "token", "bearer_token_" + saved.getId() + "_" + System.currentTimeMillis()
        );
    }

    /**
     * Overload tương thích ngược có truyền tham số password
     */
    public Map<String, Object> register(String name, String email, String phone, String password, String address) {
        return register(name, email, phone, address);
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
        map.put("authProvider", user.getAuthProvider());
        map.put("status", user.getStatus() != null ? user.getStatus() : "ACTIVE");

        // Danh sách các nhà cung cấp xác thực đã liên kết (EMAIL, GOOGLE)
        List<String> linkedProviders = new ArrayList<>();
        if ("GOOGLE".equalsIgnoreCase(user.getAuthProvider())) {
            linkedProviders.add("GOOGLE");
        } else {
            linkedProviders.add("EMAIL");
        }
        if (socialAccountRepository != null) {
            List<SocialAccount> socials = socialAccountRepository.findByUser(user);
            for (SocialAccount sa : socials) {
                if (!linkedProviders.contains(sa.getProvider())) {
                    linkedProviders.add(sa.getProvider());
                }
            }
        }
        map.put("linkedProviders", linkedProviders);

        map.put("createdAt", user.getCreatedAt() != null ? user.getCreatedAt().toString() : null);
        return map;
    }
}
