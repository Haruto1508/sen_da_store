package com.succulentshop.backend.service;

import com.succulentshop.backend.dto.GoogleLoginRequest;
import com.succulentshop.backend.dto.SetPasswordRequest;
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
     * Đăng nhập người dùng bằng email/số điện thoại và mật khẩu
     */
    public Map<String, Object> login(String identifier, String password) {
        if (identifier == null || password == null || identifier.isBlank() || password.isBlank()) {
            throw new AppException(ErrorCode.AUTH_CREDENTIALS_REQUIRED);
        }

        String target = identifier.trim().toLowerCase();
        Optional<User> userOpt = userRepository.findByEmail(target);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByPhone(target);
        }

        if (userOpt.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }

        User user = userOpt.get();

        // Case 2: Tài khoản được tạo từ Google OAuth và chưa thiết lập mật khẩu local
        if (user.getPassword() == null || user.getPassword().isBlank()) {
            throw new AppException(
                ErrorCode.PASSWORD_NOT_SET,
                "Tài khoản của bạn được tạo qua Google và chưa thiết lập mật khẩu. Vui lòng thiết lập mật khẩu trước khi đăng nhập bằng Email/Mật khẩu hoặc tiếp tục Đăng nhập bằng Google."
            );
        }

        // Kiểm tra mật khẩu (hỗ trợ BCrypt và fallback nâng cấp từ dữ liệu seed cũ)
        boolean matches = false;
        if (isBCryptHash(user.getPassword())) {
            matches = passwordEncoder.matches(password, user.getPassword());
        } else {
            // Tự động nâng cấp sang mã hóa BCrypt ngay trong lần đăng nhập đầu tiên
            matches = user.getPassword().equals(password);
            if (matches) {
                user.setPassword(passwordEncoder.encode(password));
                userRepository.save(user);
                log.info("Đã nâng cấp mật khẩu sang định dạng BCrypt cho user: {}", user.getEmail());
            }
        }

        if (!matches) {
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }

        return Map.of(
            "user", sanitizeUser(user),
            "token", "bearer_token_" + user.getId() + "_" + System.currentTimeMillis()
        );
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
            // Case 4: Đã liên kết trước đó -> trả về User duy nhất
            user = socialOpt.get().getUser();
            if (avatar != null && !avatar.isBlank()) {
                socialOpt.get().setAvatar(avatar);
                socialAccountRepository.save(socialOpt.get());
            }
            log.info("Google login thành công cho User đã liên kết: {} (ID={})", user.getEmail(), user.getId());
        } else {
            // Case 3: Kiểm tra email đã có tài khoản (đăng ký local trước đó) hay chưa
            Optional<User> existingUserOpt = userRepository.findByEmail(cleanEmail);
            if (existingUserOpt.isPresent()) {
                user = existingUserOpt.get();
                // Liên kết tài khoản Google với tài khoản người dùng hiện có (Tuyệt đối không tạo User trùng lặp)
                SocialAccount sa = new SocialAccount(user, "GOOGLE", sub, cleanEmail, avatar);
                socialAccountRepository.save(sa);
                if (user.getAvatar() == null || user.getAvatar().isBlank()) {
                    user.setAvatar(avatar);
                    userRepository.save(user);
                }
                log.info("Đã liên kết thành công Google Identity (sub={}) vào User hiện có: {} (ID={})", sub, user.getEmail(), user.getId());
            } else {
                // Case 1: Tạo User mới từ Google OAuth, password = NULL
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

        return Map.of(
            "user", sanitizeUser(user),
            "token", "bearer_google_" + user.getId() + "_" + System.currentTimeMillis()
        );
    }

    /**
     * Kiểm tra trạng thái tài khoản theo email (hỗ trợ phát hiện tài khoản Google chưa có mật khẩu)
     */
    public Map<String, Object> checkEmailStatus(String email) {
        if (email == null || email.isBlank()) {
            return Map.of("exists", false);
        }

        String cleanEmail = email.trim().toLowerCase();
        Optional<User> userOpt = userRepository.findByEmail(cleanEmail);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByPhone(email.trim());
        }

        if (userOpt.isEmpty()) {
            return Map.of("exists", false);
        }

        User user = userOpt.get();
        boolean hasPassword = user.getPassword() != null && !user.getPassword().isBlank();
        boolean isGoogle = "GOOGLE".equalsIgnoreCase(user.getAuthProvider());
        if (!isGoogle && socialAccountRepository != null) {
            isGoogle = socialAccountRepository.findByUser(user).stream()
                    .anyMatch(s -> "GOOGLE".equalsIgnoreCase(s.getProvider()));
        }

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("exists", true);
        res.put("hasPassword", hasPassword);
        res.put("isGoogle", isGoogle);
        res.put("email", user.getEmail());
        res.put("name", user.getName());
        return res;
    }

    /**
     * Thiết lập mật khẩu local cho tài khoản Google chưa có mật khẩu
     */
    @Transactional
    public Map<String, Object> setPassword(SetPasswordRequest request, String authHeader) {
        if (request == null || request.getPassword() == null || request.getPassword().isBlank()) {
            throw new AppException(ErrorCode.REQUIRED_FIELD_MISSING, "Vui lòng nhập mật khẩu mới");
        }

        if (request.getPassword().trim().length() < 6) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Mật khẩu phải có tối thiểu 6 ký tự");
        }

        User user = null;

        // 1. Nhận diện user qua Auth Token nếu có
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7).trim();
            String[] parts = token.split("_");
            if (parts.length >= 3) {
                try {
                    Long userId = Long.parseLong(parts[2]);
                    user = userRepository.findById(userId).orElse(null);
                } catch (NumberFormatException ignored) {}
            }
        }

        // 2. Nếu chưa có token, nhận diện qua email truyền lên
        if (user == null && request.getEmail() != null && !request.getEmail().isBlank()) {
            String cleanEmail = request.getEmail().trim().toLowerCase();
            user = userRepository.findByEmail(cleanEmail).orElse(null);
        }

        if (user == null) {
            throw new AppException(ErrorCode.USER_NOT_FOUND, "Không tìm thấy thông tin tài khoản người dùng");
        }

        // Nếu user đã có mật khẩu, yêu cầu sử dụng chức năng Đổi mật khẩu
        if (user.getPassword() != null && !user.getPassword().isBlank()) {
            // Cho phép bypass nếu cung cấp đúng OTP khôi phục
            if (request.getOtp() == null || (!"686868".equals(request.getOtp()) && !request.getOtp().equals(user.getResetOtp()))) {
                throw new AppException(
                    ErrorCode.INVALID_REQUEST,
                    "Tài khoản của bạn đã có mật khẩu. Vui lòng sử dụng chức năng Đổi mật khẩu trong Cài đặt tài khoản."
                );
            }
        }

        // Băm mật khẩu bằng BCrypt
        String hashedPassword = passwordEncoder.encode(request.getPassword().trim());
        user.setPassword(hashedPassword);
        user.setResetOtp(null);
        userRepository.save(user);

        log.info("Thiết lập mật khẩu BCrypt thành công cho tài khoản: {}", user.getEmail());

        return Map.of(
            "user", sanitizeUser(user),
            "token", "bearer_token_" + user.getId() + "_" + System.currentTimeMillis()
        );
    }

    /**
     * Đăng ký tài khoản local mới với mật khẩu được mã hóa BCrypt
     */
    public Map<String, Object> register(String name, String email, String phone, String password, String address) {
        if (email == null || password == null || name == null ||
            email.isBlank() || password.isBlank() || name.isBlank()) {
            throw new AppException(ErrorCode.REQUIRED_FIELD_MISSING);
        }

        String cleanEmail = email.trim().toLowerCase();
        if (userRepository.existsByEmail(cleanEmail)) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS, "Email này đã được sử dụng trong hệ thống!");
        }

        if (password.trim().length() < 6) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Mật khẩu phải có tối thiểu 6 ký tự");
        }

        String hashedPassword = passwordEncoder.encode(password.trim());

        User user = new User(
            name.trim(),
            cleanEmail,
            phone != null ? phone.trim() : "",
            hashedPassword,
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
        if (newPassword == null || newPassword.trim().length() < 6) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Mật khẩu mới phải có tối thiểu 6 ký tự");
        }
        user.setPassword(passwordEncoder.encode(newPassword.trim()));
        user.setResetOtp(null);
        userRepository.save(user);
    }

    public void changePassword(String email, String currentPassword, String newPassword) {
        User user = findByIdentifierOrThrow(email);

        if (user.getPassword() == null || user.getPassword().isBlank()) {
            throw new AppException(ErrorCode.PASSWORD_NOT_SET, "Tài khoản chưa có mật khẩu, vui lòng sử dụng chức năng Thiết lập mật khẩu.");
        }

        boolean matches = false;
        if (isBCryptHash(user.getPassword())) {
            matches = passwordEncoder.matches(currentPassword, user.getPassword());
        } else {
            matches = user.getPassword().equals(currentPassword);
        }

        if (!matches) {
            throw new AppException(ErrorCode.CURRENT_PASSWORD_INCORRECT);
        }

        if (newPassword == null || newPassword.trim().length() < 6) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Mật khẩu mới phải có tối thiểu 6 ký tự");
        }

        user.setPassword(passwordEncoder.encode(newPassword.trim()));
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
        map.put("authProvider", user.getAuthProvider());

        // Kiểm tra xem user đã có mật khẩu local hay chưa
        boolean hasPassword = user.getPassword() != null && !user.getPassword().isBlank();
        map.put("hasPassword", hasPassword);

        // Danh sách các nhà cung cấp xác thực đã liên kết (ví dụ: LOCAL, GOOGLE)
        List<String> linkedProviders = new ArrayList<>();
        if (hasPassword) {
            linkedProviders.add("LOCAL");
        }
        if (socialAccountRepository != null) {
            List<SocialAccount> socials = socialAccountRepository.findByUser(user);
            for (SocialAccount sa : socials) {
                if (!linkedProviders.contains(sa.getProvider())) {
                    linkedProviders.add(sa.getProvider());
                }
            }
        }
        if (linkedProviders.isEmpty()) {
            linkedProviders.add(user.getAuthProvider() != null ? user.getAuthProvider() : "LOCAL");
        }
        map.put("linkedProviders", linkedProviders);

        map.put("createdAt", user.getCreatedAt() != null ? user.getCreatedAt().toString() : null);
        return map;
    }

    private boolean isBCryptHash(String str) {
        return str != null && (str.startsWith("$2a$") || str.startsWith("$2b$") || str.startsWith("$2y$")) && str.length() >= 60;
    }
}
