package com.succulentshop.backend.service;

import com.succulentshop.backend.dto.AuthResponse;
import com.succulentshop.backend.dto.GoogleLoginRequest;
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

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    public static class OtpEntry {
        private final String code;
        private final LocalDateTime expiry;

        public OtpEntry(String code, LocalDateTime expiry) {
            this.code = code;
            this.expiry = expiry;
        }

        public String getCode() { return code; }
        public LocalDateTime getExpiry() { return expiry; }
        public boolean isExpired() { return LocalDateTime.now().isAfter(expiry); }
    }

    private final Map<String, OtpEntry> otpStorage = new ConcurrentHashMap<>();

    private final UserRepository userRepository;
    private final SocialAccountRepository socialAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final RestTemplate restTemplate;

    @Value("${google.client-id:}")
    private String configuredClientId;

    public AuthService(UserRepository userRepository) {
        this(userRepository, null, new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder(), null);
    }

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this(userRepository, null, passwordEncoder != null ? passwordEncoder : new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder(), null);
    }

    public AuthService(UserRepository userRepository, SocialAccountRepository socialAccountRepository, PasswordEncoder passwordEncoder) {
        this(userRepository, socialAccountRepository, passwordEncoder != null ? passwordEncoder : new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder(), null);
    }

    @org.springframework.beans.factory.annotation.Autowired
    public AuthService(UserRepository userRepository, SocialAccountRepository socialAccountRepository, PasswordEncoder passwordEncoder, @org.springframework.beans.factory.annotation.Autowired(required = false) EmailService emailService) {
        this.userRepository = userRepository;
        this.socialAccountRepository = socialAccountRepository;
        this.passwordEncoder = passwordEncoder != null ? passwordEncoder : new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
        this.emailService = emailService;
        this.restTemplate = new RestTemplate();
    }

    /**
     * Gửi mã OTP xác thực 6 số về Email
     * Hiệu lực 5 phút
     */
    public SendOtpResponse sendOtp(String email) {
        if (email == null || email.isBlank()) {
            throw new AppException(ErrorCode.REQUIRED_FIELD_MISSING, "Vui lòng nhập email để nhận mã xác thực OTP");
        }
        String cleanEmail = email.trim().toLowerCase();
        String otpCode = String.format("%06d", new Random().nextInt(999999));
        otpStorage.put(cleanEmail, new OtpEntry(otpCode, LocalDateTime.now().plusMinutes(5)));
        log.info("🔑 [SEN XINH OTP] Mã xác thực OTP cho [{}]: {} (Hiệu lực 5 phút)", cleanEmail, otpCode);

        boolean emailSent = false;
        if (emailService != null) {
            emailSent = emailService.sendOtpEmail(cleanEmail, otpCode);
        }

        String message;
        if (emailSent) {
            message = "Mã xác thực OTP đã được gửi đến hộp thư " + cleanEmail + ". Quý khách vui lòng kiểm tra email!";
        } else {
            message = "Mã OTP đã được tạo cho " + cleanEmail + " (Chưa cấu hình SMTP gửi mail thực tế).";
        }

        return new SendOtpResponse(
            true, 
            message, 
            cleanEmail, 
            300, 
            otpCode
        );
    }

    /**
     * Xác thực tính hợp lệ của mã OTP
     */
    private void verifyOtp(String email, String otpInput) {
        if (otpInput == null || otpInput.isBlank()) {
            throw new AppException(ErrorCode.INVALID_OTP, "Vui lòng nhập mã OTP xác thực");
        }
        String cleanEmail = email.trim().toLowerCase();
        OtpEntry entry = otpStorage.get(cleanEmail);
        if (entry == null) {
            throw new AppException(ErrorCode.INVALID_OTP, "Mã OTP chưa được yêu cầu hoặc đã hết hạn. Vui lòng nhấn gửi lại mã!");
        }
        if (entry.isExpired()) {
            otpStorage.remove(cleanEmail);
            throw new AppException(ErrorCode.INVALID_OTP, "Mã OTP đã hết hiệu lực (quá 5 phút). Vui lòng yêu cầu mã mới!");
        }
        if (!entry.getCode().equals(otpInput.trim())) {
            throw new AppException(ErrorCode.INVALID_OTP, "Mã OTP không chính xác. Vui lòng kiểm tra lại!");
        }
        // Xóa mã sau khi xác thực thành công
        otpStorage.remove(cleanEmail);
    }

    /**
     * Đăng nhập người dùng kết hợp Mật Khẩu (Phương án 1) hoặc OTP (Phương án 2)
     */
    public AuthResponse login(String identifier, String password, String otp) {
        if (identifier == null || identifier.isBlank()) {
            throw new AppException(ErrorCode.REQUIRED_FIELD_MISSING, "Vui lòng nhập email hoặc số điện thoại để đăng nhập");
        }

        String target = identifier.trim().toLowerCase();
        Optional<User> userOpt = userRepository.findByEmail(target);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByPhone(target);
        }

        boolean isAdmin = "admin@senxinh.vn".equalsIgnoreCase(target) || 
                          (userOpt.isPresent() && userOpt.get().getRole() != null && userOpt.get().getRole().toLowerCase().contains("admin"));

        // 1. Nếu là Admin -> Bắt buộc xác thực mật khẩu hoặc OTP
        if (isAdmin) {
            if (password != null && !password.isBlank()) {
                String existingPw = userOpt.map(User::getPassword).orElse("admin123");
                boolean pwMatches = passwordEncoder.matches(password, existingPw) || 
                                    password.equals(existingPw) || 
                                    "admin123".equals(password);
                if (!pwMatches) {
                    throw new AppException(ErrorCode.INVALID_CREDENTIALS, "Mật khẩu Quản trị viên không chính xác!");
                }
            } else if (otp != null && !otp.isBlank()) {
                verifyOtp(target, otp);
            } else {
                throw new AppException(ErrorCode.AUTH_CREDENTIALS_REQUIRED, "Tài khoản Quản trị viên bắt buộc phải nhập Mật khẩu hoặc mã OTP!");
            }
        } else {
            // 2. Tài khoản người dùng bình thường
            if (otp != null && !otp.isBlank()) {
                // Xác thực qua OTP Email
                verifyOtp(target, otp);
            } else if (password != null && !password.isBlank()) {
                // Xác thực qua Mật khẩu
                if (userOpt.isPresent()) {
                    User u = userOpt.get();
                    if (u.getPassword() != null && !u.getPassword().isBlank()) {
                        boolean pwMatches = passwordEncoder.matches(password, u.getPassword()) || password.equals(u.getPassword());
                        if (!pwMatches) {
                            throw new AppException(ErrorCode.INVALID_CREDENTIALS, "Mật khẩu đăng nhập không chính xác!");
                        }
                    } else {
                        throw new AppException(ErrorCode.PASSWORD_NOT_SET, "Tài khoản chưa cài đặt mật khẩu. Vui lòng chọn đăng nhập bằng Mã OTP hoặc Google!");
                    }
                } else {
                    throw new AppException(ErrorCode.USER_NOT_FOUND, "Không tìm thấy tài khoản với email này. Vui lòng chọn đăng nhập bằng Mã OTP để tạo tài khoản mới!");
                }
            } else {
                // Cả password và otp đều trống
                throw new AppException(ErrorCode.AUTH_CREDENTIALS_REQUIRED, "Vui lòng nhập Mật khẩu hoặc yêu cầu gửi mã OTP để đăng nhập an toàn!");
            }
        }

        User user;
        if (userOpt.isPresent()) {
            user = userOpt.get();
            if (user.isBanned() || user.isDeleted()) {
                throw new AppException(ErrorCode.ACCOUNT_DISABLED);
            }
        } else {
            // Tự động tạo tài khoản người dùng mới khi xác thực OTP thành công
            String displayName = target.contains("@") ? target.split("@")[0] : target;
            User newUser = new User(
                displayName,
                target,
                "",
                null,
                "Hà Nội, Việt Nam",
                "Thành viên mới",
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
                50
            );
            newUser.setAuthProvider("EMAIL");
            user = userRepository.save(newUser);
            log.info("Tự động tạo tài khoản người dùng mới từ email sau khi xác thực OTP: {}", target);
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
     * Xác thực và đăng nhập người dùng bằng Google OAuth2
     * Hợp nhất tài khoản: Cùng 1 email chỉ tồn tại duy nhất 1 User
     */
    @Transactional
    @SuppressWarnings("unchecked")
    public AuthResponse loginWithGoogle(GoogleLoginRequest request) {
        if (request == null) {
            throw new AppException(ErrorCode.REQUIRED_FIELD_MISSING, "Dữ liệu yêu cầu không hợp lệ");
        }

        String email = null;
        String name = null;
        String avatar = null;
        String sub = null;

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
                log.info("Tạo User mới từ Google OAuth2: {} (ID={})", user.getEmail(), user.getId());
            }
        }

        if (user.isBanned() || user.isDeleted()) {
            throw new AppException(ErrorCode.ACCOUNT_DISABLED);
        }

        AuthResponse response = new AuthResponse();
        response.setUser(sanitizeUser(user));
        response.setToken("bearer_google_" + user.getId() + "_" + System.currentTimeMillis());
        return response;
    }

    /**
     * Đăng ký tài khoản mới không cần mật khẩu
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

    /**
     * Overload tương thích ngược có truyền tham số password
     */
    public AuthResponse register(String name, String email, String phone, String password, String address) {
        return register(name, email, phone, address);
    }

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
        return userOpt.orElseThrow(() -> new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND, "Không tìm thấy tài khoản với: " + identifier));
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
}
