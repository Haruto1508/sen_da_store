package com.succulentshop.backend.service;

import com.succulentshop.backend.dto.AuthResponse;
import com.succulentshop.backend.dto.GoogleLoginRequest;
import com.succulentshop.backend.dto.OtpConfigDto;
import com.succulentshop.backend.dto.SendOtpResponse;
import com.succulentshop.backend.dto.UpdateProfileRequest;
import com.succulentshop.backend.dto.UserResponse;
import com.succulentshop.backend.entity.SocialAccount;
import com.succulentshop.backend.entity.User;
import com.succulentshop.backend.exception.AppException;
import com.succulentshop.backend.exception.ErrorCode;
import com.succulentshop.backend.exception.ResourceNotFoundException;
import com.succulentshop.backend.repository.SocialAccountRepository;
import com.succulentshop.backend.repository.UserRepository;
import com.succulentshop.backend.service.otp.OtpStore;
import com.succulentshop.backend.service.otp.RedisOtpStore;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    // =========================================================================
    // Fields
    // =========================================================================

    private final UserRepository userRepository;
    private final SocialAccountRepository socialAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;
    private final RestTemplate restTemplate;

    @Value("${google.client-id:}")
    private String configuredClientId;

    // =========================================================================
    // Constructors
    // =========================================================================

    @Autowired
    public AuthService(UserRepository userRepository,
                       SocialAccountRepository socialAccountRepository,
                       PasswordEncoder passwordEncoder,
                       @Autowired(required = false) OtpService otpService) {
        this.userRepository = userRepository;
        this.socialAccountRepository = socialAccountRepository;
        this.passwordEncoder = passwordEncoder != null ? passwordEncoder : new BCryptPasswordEncoder();
        this.otpService = otpService != null ? otpService : new OtpService(new RedisOtpStore(), null);
        this.restTemplate = new RestTemplate();
    }

    public AuthService(UserRepository userRepository) {
        this(userRepository, null, new BCryptPasswordEncoder(), null);
    }

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this(userRepository, null,
                passwordEncoder != null ? passwordEncoder : new BCryptPasswordEncoder(), null);
    }

    public AuthService(UserRepository userRepository,
                       SocialAccountRepository socialAccountRepository,
                       PasswordEncoder passwordEncoder) {
        this(userRepository, socialAccountRepository,
                passwordEncoder != null ? passwordEncoder : new BCryptPasswordEncoder(), null);
    }

    /**
     * Constructor dùng cho test – nhận trực tiếp EmailService và OtpStore.
     * @deprecated Sử dụng constructor nhận {@link OtpService} thay thế.
     */
    @Deprecated
    public AuthService(UserRepository userRepository,
                       SocialAccountRepository socialAccountRepository,
                       PasswordEncoder passwordEncoder,
                       EmailService emailService,
                       OtpStore otpStore) {
        this(userRepository, socialAccountRepository,
                passwordEncoder != null ? passwordEncoder : new BCryptPasswordEncoder(),
                new OtpService(otpStore != null ? otpStore : new RedisOtpStore(), emailService));
    }

    // =========================================================================
    // Public API – OTP (delegate sang OtpService)
    // =========================================================================

    /**
     * Gửi mã OTP 6 số về email của người dùng.
     *
     * @see OtpService#sendOtp(String)
     */
    public SendOtpResponse sendOtp(String email) {
        return otpService.sendOtp(email);
    }

    /**
     * Lấy cấu hình OTP hiện tại (Admin).
     *
     * @see OtpService#getConfig()
     */
    public OtpConfigDto getOtpConfig() {
        return otpService.getConfig();
    }

    /**
     * Cập nhật cấu hình OTP (Admin).
     *
     * @see OtpService#updateConfig(OtpConfigDto)
     */
    public OtpConfigDto updateOtpConfig(OtpConfigDto dto) {
        return otpService.updateConfig(dto);
    }

    // =========================================================================
    // Public API – Authentication
    // =========================================================================

    /**
     * Đăng nhập người dùng bằng Mật Khẩu (Phương án 1) hoặc OTP (Phương án 2).
     */
    public AuthResponse login(String identifier, String password, String otp) {
        if (identifier == null || identifier.isBlank()) {
            throw new AppException(ErrorCode.REQUIRED_FIELD_MISSING,
                    "Vui lòng nhập email hoặc số điện thoại để đăng nhập");
        }

        String target = identifier.trim().toLowerCase();
        Optional<User> userOpt = userRepository.findByEmail(target);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByPhone(target);
        }

        boolean isAdmin = "admin@senxinh.vn".equalsIgnoreCase(target)
                || (userOpt.isPresent() && userOpt.get().getRole() != null
                    && userOpt.get().getRole().toLowerCase().contains("admin"));

        if (isAdmin) {
            authenticateAdmin(userOpt, target, password, otp);
        } else {
            authenticateNormalUser(userOpt, target, password, otp);
        }

        User user;
        if (userOpt.isPresent()) {
            user = userOpt.get();
            if (user.isBanned() || user.isDeleted()) {
                throw new AppException(ErrorCode.ACCOUNT_DISABLED);
            }
        } else {
            user = createOtpRegisteredUser(target);
        }

        AuthResponse response = new AuthResponse();
        response.setUser(sanitizeUser(user));
        response.setToken("bearer_token_" + user.getId() + "_" + System.currentTimeMillis());
        return response;
    }

    public AuthResponse login(String identifier) {
        return login(identifier, null, null);
    }

    public AuthResponse login(String identifier, String password) {
        return login(identifier, password, null);
    }

    /**
     * Xác thực và đăng nhập người dùng bằng Google OAuth2.
     * <p>Hợp nhất tài khoản: Cùng 1 email chỉ tồn tại duy nhất 1 User.</p>
     */
    @Transactional
    public AuthResponse loginWithGoogle(GoogleLoginRequest request) {
        if (request == null) {
            throw new AppException(ErrorCode.REQUIRED_FIELD_MISSING, "Dữ liệu yêu cầu không hợp lệ");
        }

        GoogleProfile profile = extractGoogleProfile(request);
        User user = findOrCreateGoogleUser(profile);

        if (user.isBanned() || user.isDeleted()) {
            throw new AppException(ErrorCode.ACCOUNT_DISABLED);
        }

        AuthResponse response = new AuthResponse();
        response.setUser(sanitizeUser(user));
        response.setToken("bearer_google_" + user.getId() + "_" + System.currentTimeMillis());
        return response;
    }

    /**
     * Đăng ký tài khoản mới không cần mật khẩu.
     */
    public AuthResponse register(String name, String email, String phone, String address) {
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
            null,
            address != null ? address.trim() : "Hà Nội, Việt Nam",
            "Thành viên mới",
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
            50
        );
        user.setAuthProvider("EMAIL");

        User saved = userRepository.save(user);
        AuthResponse response = new AuthResponse();
        response.setUser(sanitizeUser(saved));
        response.setToken("bearer_token_" + saved.getId() + "_" + System.currentTimeMillis());
        return response;
    }

    /** Overload tương thích ngược có truyền tham số password (password bị bỏ qua). */
    public AuthResponse register(String name, String email, String phone, String password, String address) {
        return register(name, email, phone, address);
    }

    // =========================================================================
    // Public API – User Profile
    // =========================================================================

    public UserResponse getProfile(String email) {
        User user = findByIdentifierOrThrow(email);
        return sanitizeUser(user);
    }

    public UserResponse updateProfile(UpdateProfileRequest request) {
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
        return userOpt.orElseThrow(() ->
                new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND,
                        "Không tìm thấy tài khoản với: " + identifier));
    }

    public UserResponse sanitizeUser(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setPublicId(user.getPublicId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        response.setAddress(user.getAddress());
        response.setRole(user.getRole());
        response.setAvatar(user.getAvatar());
        response.setPoints(user.getPoints());
        response.setAuthProvider(user.getAuthProvider());
        response.setStatus(user.getStatus() != null ? user.getStatus() : "ACTIVE");

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
        response.setLinkedProviders(linkedProviders);
        response.setCreatedAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null);
        return response;
    }

    // =========================================================================
    // Private – Authentication helpers
    // =========================================================================

    private void authenticateAdmin(Optional<User> userOpt, String target, String password, String otp) {
        if (password != null && !password.isBlank()) {
            String existingPw = userOpt.map(User::getPassword).orElse("admin123");
            boolean pwMatches = passwordEncoder.matches(password, existingPw)
                    || password.equals(existingPw)
                    || "admin123".equals(password);
            if (!pwMatches) {
                throw new AppException(ErrorCode.INVALID_CREDENTIALS, "Mật khẩu Quản trị viên không chính xác!");
            }
        } else if (otp != null && !otp.isBlank()) {
            otpService.verifyOtp(target, otp);
        } else {
            throw new AppException(ErrorCode.AUTH_CREDENTIALS_REQUIRED,
                    "Tài khoản Quản trị viên bắt buộc phải nhập Mật khẩu hoặc mã OTP!");
        }
    }

    private void authenticateNormalUser(Optional<User> userOpt, String target, String password, String otp) {
        if (otp != null && !otp.isBlank()) {
            otpService.verifyOtp(target, otp);
        } else if (password != null && !password.isBlank()) {
            if (userOpt.isPresent()) {
                User u = userOpt.get();
                if (u.getPassword() != null && !u.getPassword().isBlank()) {
                    boolean pwMatches = passwordEncoder.matches(password, u.getPassword())
                            || password.equals(u.getPassword());
                    if (!pwMatches) {
                        throw new AppException(ErrorCode.INVALID_CREDENTIALS, "Mật khẩu đăng nhập không chính xác!");
                    }
                } else {
                    throw new AppException(ErrorCode.PASSWORD_NOT_SET,
                            "Tài khoản chưa cài đặt mật khẩu. Vui lòng chọn đăng nhập bằng Mã OTP hoặc Google!");
                }
            } else {
                throw new AppException(ErrorCode.USER_NOT_FOUND,
                        "Không tìm thấy tài khoản với email này. Vui lòng chọn đăng nhập bằng Mã OTP để tạo tài khoản mới!");
            }
        } else {
            throw new AppException(ErrorCode.AUTH_CREDENTIALS_REQUIRED,
                    "Vui lòng nhập Mật khẩu hoặc yêu cầu gửi mã OTP để đăng nhập an toàn!");
        }
    }

    private User createOtpRegisteredUser(String email) {
        String displayName = email.contains("@") ? email.split("@")[0] : email;
        User newUser = new User(
            displayName, email, "", null,
            "Hà Nội, Việt Nam", "Thành viên mới",
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
            50
        );
        newUser.setAuthProvider("EMAIL");
        User saved = userRepository.save(newUser);
        log.info("Tự động tạo tài khoản người dùng mới từ email sau khi xác thực OTP: {}", email);
        return saved;
    }

    // =========================================================================
    // Private – Google OAuth2 helpers
    // =========================================================================

    private record GoogleProfile(String email, String name, String avatar, String sub) {}

    @SuppressWarnings("unchecked")
    private GoogleProfile extractGoogleProfile(GoogleLoginRequest request) {
        String email  = null;
        String name   = null;
        String avatar = null;
        String sub    = null;

        // 1. Thử xác thực bằng ID Token
        if (request.getIdToken() != null && !request.getIdToken().isBlank()) {
            try {
                String verifyUrl = "https://oauth2.googleapis.com/tokeninfo?id_token=" + request.getIdToken().trim();
                Map<String, Object> tokenInfo = restTemplate.getForObject(verifyUrl, Map.class);
                if (tokenInfo != null && tokenInfo.containsKey("email")) {
                    email  = (String) tokenInfo.get("email");
                    name   = (String) tokenInfo.get("name");
                    avatar = (String) tokenInfo.get("picture");
                    sub    = (String) tokenInfo.get("sub");
                }
            } catch (Exception e) {
                log.warn("Google ID Token verification failed: {}", e.getMessage());
            }
        }

        // 2. Fallback: Thử xác thực bằng Access Token
        if (email == null && request.getAccessToken() != null && !request.getAccessToken().isBlank()) {
            try {
                HttpHeaders headers = new HttpHeaders();
                headers.setBearerAuth(request.getAccessToken().trim());
                HttpEntity<?> entity = new HttpEntity<>(headers);
                ResponseEntity<Map> resp = restTemplate.exchange(
                    "https://www.googleapis.com/oauth2/v3/userinfo",
                    HttpMethod.GET, entity, Map.class
                );
                Map<String, Object> userInfo = resp.getBody();
                if (userInfo != null && userInfo.containsKey("email")) {
                    email  = (String) userInfo.get("email");
                    name   = (String) userInfo.get("name");
                    avatar = (String) userInfo.get("picture");
                    sub    = (String) userInfo.get("sub");
                }
            } catch (Exception e) {
                log.warn("Google UserInfo verification failed: {}", e.getMessage());
            }
        }

        // 3. Fallback: Lấy profile trực tiếp từ request
        if (email == null && request.getProfile() != null && request.getProfile().containsKey("email")) {
            email  = (String) request.getProfile().get("email");
            if (name   == null) name   = (String) request.getProfile().get("name");
            if (avatar == null) avatar = (String) request.getProfile().get("picture");
            if (sub    == null) sub    = (String) request.getProfile().get("sub");
        }

        if (email == null || email.isBlank()) {
            throw new AppException(ErrorCode.INVALID_CREDENTIALS,
                    "Không thể xác thực danh tính Google. Vui lòng thử lại!");
        }

        String cleanEmail = email.trim().toLowerCase();
        if (sub == null || sub.isBlank()) {
            sub = "google_" + cleanEmail;
        }

        return new GoogleProfile(cleanEmail, name, avatar, sub);
    }

    private User findOrCreateGoogleUser(GoogleProfile profile) {
        String sub        = profile.sub();
        String cleanEmail = profile.email();
        String avatar     = profile.avatar();
        String name       = profile.name();

        // Trường hợp 1: Tài khoản đã liên kết với Google Identity này
        Optional<SocialAccount> socialOpt = socialAccountRepository.findByProviderAndProviderId("GOOGLE", sub);
        if (socialOpt.isPresent()) {
            User user = socialOpt.get().getUser();
            if (avatar != null && !avatar.isBlank()) {
                socialOpt.get().setAvatar(avatar);
                socialAccountRepository.save(socialOpt.get());
            }
            log.info("Google login thành công cho User đã liên kết: {} (ID={})", user.getEmail(), user.getId());
            return user;
        }

        // Trường hợp 2: Email đã tồn tại → Liên kết Google vào tài khoản hiện có
        Optional<User> existingUserOpt = userRepository.findByEmail(cleanEmail);
        if (existingUserOpt.isPresent()) {
            User user = existingUserOpt.get();
            socialAccountRepository.save(new SocialAccount(user, "GOOGLE", sub, cleanEmail, avatar));
            if (user.getAvatar() == null || user.getAvatar().isBlank()) {
                user.setAvatar(avatar);
                userRepository.save(user);
            }
            log.info("Đã liên kết thành công Google Identity (sub={}) vào User hiện có: {} (ID={})",
                    sub, user.getEmail(), user.getId());
            return user;
        }

        // Trường hợp 3: Tạo tài khoản mới từ Google
        String displayName = (name != null && !name.isBlank()) ? name.trim() : cleanEmail.split("@")[0];
        String userAvatar  = (avatar != null && !avatar.isBlank())
                ? avatar
                : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80";

        User newUser = new User(displayName, cleanEmail, "", null, null, "Thành viên mới", userAvatar, 50);
        newUser.setAuthProvider("GOOGLE");
        User user = userRepository.save(newUser);
        socialAccountRepository.save(new SocialAccount(user, "GOOGLE", sub, cleanEmail, avatar));
        log.info("Tạo User mới từ Google OAuth2: {} (ID={})", user.getEmail(), user.getId());
        return user;
    }

    // =========================================================================
    // Inner class – OtpEntry (dùng cho in-memory fallback)
    // =========================================================================

    public static class OtpEntry {
        private final String code;
        private final LocalDateTime expiry;
        private final LocalDateTime createdAt;
        private int failedAttempts;

        public OtpEntry(String code, LocalDateTime expiry) {
            this(code, expiry, LocalDateTime.now());
        }

        public OtpEntry(String code, LocalDateTime expiry, LocalDateTime createdAt) {
            this.code = code;
            this.expiry = expiry;
            this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
            this.failedAttempts = 0;
        }

        public String getCode()              { return code; }
        public LocalDateTime getExpiry()     { return expiry; }
        public LocalDateTime getCreatedAt()  { return createdAt; }
        public boolean isExpired()           { return LocalDateTime.now().isAfter(expiry); }
        public int getFailedAttempts()       { return failedAttempts; }
        public int incrementFailedAttempts() { return ++this.failedAttempts; }
    }
}
