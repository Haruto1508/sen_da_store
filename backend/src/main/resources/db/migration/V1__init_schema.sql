-- =======================================================
-- V1__init_schema.sql
-- Database Schema for Sen Xinh Garden (SucculentShop)
-- Engine: PostgreSQL 12+
-- =======================================================

-- 1. Table: users
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    public_id VARCHAR(36) NOT NULL UNIQUE,
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table: products
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(100) PRIMARY KEY,
    public_id VARCHAR(36) UNIQUE,
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
    care_tips VARCHAR(2000)
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
    id BIGSERIAL PRIMARY KEY,
    public_id VARCHAR(36) NOT NULL UNIQUE,
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

-- 6. Table: social_accounts (Đăng nhập Google OAuth2 & Mạng xã hội)
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

CREATE INDEX IF NOT EXISTS idx_users_public_id ON users(public_id);
CREATE INDEX IF NOT EXISTS idx_orders_public_id ON orders(public_id);
CREATE INDEX IF NOT EXISTS idx_products_public_id ON products(public_id);
CREATE INDEX IF NOT EXISTS idx_refresh_token ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_social_provider_id ON social_accounts(provider_id);
