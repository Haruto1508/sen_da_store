-- =======================================================
-- V2__seed_initial_data.sql
-- Initial Seed Data for Users & Coupons
-- Engine: PostgreSQL
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
