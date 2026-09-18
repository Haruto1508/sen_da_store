-- =======================================================
-- V3__create_shipping_rates_table.sql
-- Table & Initial Data for Shipping Rates & Settings
-- Engine: PostgreSQL 12+
-- =======================================================

-- 1. Table: shipping_settings
CREATE TABLE IF NOT EXISTS shipping_settings (
    id INT PRIMARY KEY,
    free_shipping_enabled BOOLEAN DEFAULT TRUE,
    free_shipping_threshold INT DEFAULT 200000,
    default_shipping_fee INT DEFAULT 35000,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed default settings row (id = 1)
INSERT INTO shipping_settings (id, free_shipping_enabled, free_shipping_threshold, default_shipping_fee, updated_at)
VALUES (1, TRUE, 200000, 35000, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- 2. Table: shipping_rates
CREATE TABLE IF NOT EXISTS shipping_rates (
    id VARCHAR(50) PRIMARY KEY,
    province VARCHAR(100) NOT NULL UNIQUE,
    fee INT NOT NULL,
    estimated_days VARCHAR(100),
    note VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed default rates per province
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
