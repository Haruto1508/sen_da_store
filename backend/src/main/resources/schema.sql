-- =======================================================
-- SCHEMA.SQL
-- Standalone Database Creation Script for Sen Xinh Garden
-- Database Engine: PostgreSQL 12+
-- Synchronized with Flyway Migrations (V1, V2, V3, V4, V5)
-- =======================================================

DROP TABLE IF EXISTS shipping_rates CASCADE;
DROP TABLE IF EXISTS shipping_settings CASCADE;
DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TABLE IF EXISTS social_accounts CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Table: users
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,                   -- Khóa chính nội bộ tự tăng (PostgreSQL BIGSERIAL)
    public_id VARCHAR(36) NOT NULL UNIQUE,      -- Khóa công khai UUID
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    password VARCHAR(255),                     -- NULL khi đăng nhập Google OAuth2
    auth_provider VARCHAR(50) DEFAULT 'LOCAL', -- 'LOCAL', 'GOOGLE', 'FACEBOOK',...
    address VARCHAR(500),
    role VARCHAR(100),
    avatar VARCHAR(1000),
    points INT DEFAULT 0,
    reset_otp VARCHAR(20),
    status VARCHAR(50) DEFAULT 'ACTIVE',       -- 'ACTIVE', 'BANNED', 'DELETED'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table: products
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(100) PRIMARY KEY,
    public_id VARCHAR(36) UNIQUE,               -- Khóa công khai UUID
    name VARCHAR(255) NOT NULL,
    scientific_name VARCHAR(255),
    category VARCHAR(100),
    price INT,
    original_price INT,
    rating DOUBLE PRECISION,
    reviews_count INT,
    badge VARCHAR(100),
    image VARCHAR(1000),
    difficulty VARCHAR(50),
    difficulty_level INT,
    light VARCHAR(100),
    light_type VARCHAR(50),
    watering VARCHAR(100),
    watering_days INT,
    size VARCHAR(50),
    ideal_location VARCHAR(255),
    in_stock INT,
    description VARCHAR(2000),
    meaning VARCHAR(255),
    care_tips VARCHAR(2000),
    status VARCHAR(50) DEFAULT 'ACTIVE'
);

-- 3. Table: coupons
CREATE TABLE IF NOT EXISTS coupons (
    code VARCHAR(50) PRIMARY KEY,
    discount_percent INT,
    is_active BOOLEAN DEFAULT TRUE,
    description VARCHAR(500)
);

-- 4. Table: orders
CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,                   -- Khóa chính nội bộ tự tăng (PostgreSQL BIGSERIAL)
    public_id VARCHAR(36) NOT NULL UNIQUE,      -- Khóa công khai UUID
    order_code VARCHAR(50) NOT NULL UNIQUE,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_address VARCHAR(500) NOT NULL,
    customer_email VARCHAR(255),
    note VARCHAR(1000),
    payment_method VARCHAR(50),
    subtotal INT,
    discount_amount INT,
    discount_code VARCHAR(50),
    shipping_fee INT,
    total_amount INT,
    status VARCHAR(50),
    stock_deducted BOOLEAN NOT NULL DEFAULT FALSE,
    points_awarded BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMP,
    return_reason VARCHAR(255),
    return_note VARCHAR(1000),
    refund_bank_info VARCHAR(255),
    return_requested_at TIMESTAMP,
    returned_at TIMESTAMP,
    return_reject_reason VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Table: order_items
CREATE TABLE IF NOT EXISTS order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT,
    product_id VARCHAR(100),
    product_name VARCHAR(255),
    price INT,
    quantity INT,
    image VARCHAR(1000),
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- 6. Table: social_accounts (Google OAuth2 & Mạng xã hội)
CREATE TABLE IF NOT EXISTS social_accounts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    provider VARCHAR(50) NOT NULL,            -- 'GOOGLE', 'FACEBOOK', etc.
    provider_id VARCHAR(255) NOT NULL,        -- ID duy nhất do Google cấp (sub)
    email VARCHAR(255),                       -- Email tài khoản Google
    avatar VARCHAR(1000),                     -- Ảnh đại diện Google
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_social_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uk_provider_provider_id UNIQUE (provider, provider_id)
);

-- 7. Table: refresh_tokens (Bảo mật xác thực JWT)
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token VARCHAR(500) NOT NULL UNIQUE,       -- Chuỗi Refresh Token JWT
    expiry_date TIMESTAMP NOT NULL,           -- Thời hạn hiệu lực của token
    revoked BOOLEAN DEFAULT FALSE,            -- Trạng thái thu hồi token
    device_info VARCHAR(255),                 -- Thiết bị đăng nhập (Chrome, Safari, Mobile,...)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_refresh_token_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 8. Table: shipping_settings (Đồng bộ từ Flyway V3)
CREATE TABLE IF NOT EXISTS shipping_settings (
    id INT PRIMARY KEY,
    free_shipping_enabled BOOLEAN DEFAULT TRUE,
    free_shipping_threshold INT DEFAULT 200000,
    default_shipping_fee INT DEFAULT 35000,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Table: shipping_rates (Đồng bộ từ Flyway V3)
CREATE TABLE IF NOT EXISTS shipping_rates (
    id VARCHAR(50) PRIMARY KEY,
    province VARCHAR(100) NOT NULL UNIQUE,
    fee INT NOT NULL,
    estimated_days VARCHAR(100),
    note VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_public_id ON users(public_id);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_orders_public_id ON orders(public_id);
CREATE INDEX IF NOT EXISTS idx_products_public_id ON products(public_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_refresh_token ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_social_provider_id ON social_accounts(provider_id);

-- =======================================================
-- INITIAL SEED DATA (Đồng bộ từ Flyway V2 & V3)
-- =======================================================

-- 1. Seed Users (Admin & Default Customer)
INSERT INTO users (public_id, name, email, phone, password, address, role, avatar, points, created_at)
VALUES 
('e2b3c4d5-6789-4012-a345-6789abcdef01', 'Nguyễn Hoàng Long', 'long.senxinh@gmail.com', '0988123456', '123456', '123 Phố Trúc Bạch, Quận Ba Đình, Hà Nội', 'Thành viên thân thiết', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', 240, CURRENT_TIMESTAMP),
('f3c4d5e6-7890-4123-b456-789abcdef012', 'Quản Trị Viên Sen Xinh', 'admin@senxinh.vn', '0901234567', 'admin123', 'Vườn Sen Xinh, Tây Hồ, Hà Nội', 'Quản trị viên (Admin)', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', 9999, CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;

-- 2. Seed Default Coupons
INSERT INTO coupons (code, discount_percent, is_active, description)
VALUES
('SENXANH10', 10, TRUE, 'Giảm 10% cho đơn hàng đầu tiên'),
('SENXANH20', 20, TRUE, 'Giảm 20% cho khách hàng thân thiết'),
('SENMOI50', 15, TRUE, 'Voucher chào mừng thành viên mới'),
('FREESHIP', 5, TRUE, 'Hỗ trợ 5% phí giao vận toàn quốc')
ON CONFLICT (code) DO NOTHING;

-- 3. Seed Default Settings Row (id = 1)
INSERT INTO shipping_settings (id, free_shipping_enabled, free_shipping_threshold, default_shipping_fee, updated_at)
VALUES (1, TRUE, 200000, 35000, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- 4. Seed Default Rates Per Province
INSERT INTO shipping_rates (id, province, fee, estimated_days, note, created_at)
VALUES
('rate_hn', 'Hà Nội', 25000, '1 - 2 ngày', 'Nội & ngoại thành Hà Nội', CURRENT_TIMESTAMP),
('rate_hcm', 'TP. Hồ Chí Minh', 30000, '2 - 3 ngày', 'Toàn khu vực TP. Hồ Chí Minh', CURRENT_TIMESTAMP),
('rate_dl', 'Đà Lạt - Lâm Đồng', 20000, 'Trong ngày / 1 ngày', 'Khu vực gần nhà vườn ươm', CURRENT_TIMESTAMP),
('rate_dn', 'Đà Nẵng', 28000, '2 - 3 ngày', 'Khu vực miền Trung', CURRENT_TIMESTAMP),
('rate_hp', 'Hải Phòng', 26000, '1 - 2 ngày', 'Khu vực duyên hải Bắc Bộ', CURRENT_TIMESTAMP),
('rate_ct', 'Cần Thơ', 32000, '2 - 3 ngày', 'Khu vực Tây Nam Bộ', CURRENT_TIMESTAMP),
('rate_bd', 'Bình Dương', 28000, '2 ngày', 'Khu vực Đông Nam Bộ', CURRENT_TIMESTAMP),
('rate_dna', 'Đồng Nai', 28000, '2 ngày', 'Khu vực Đông Nam Bộ', CURRENT_TIMESTAMP),
('rate_kh', 'Khánh Hòa (Nha Trang)', 25000, '1 - 2 ngày', 'Khu vực Nam Trung Bộ', CURRENT_TIMESTAMP),
('rate_other', 'Khác', 35000, '2 - 4 ngày', 'Áp dụng cho các tỉnh thành khác toàn quốc', CURRENT_TIMESTAMP)
ON CONFLICT (province) DO NOTHING;
