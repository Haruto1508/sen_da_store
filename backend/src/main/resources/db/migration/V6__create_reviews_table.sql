-- =======================================================
-- V6__create_reviews_table.sql
-- Table: reviews & Sample Seeds
-- Engine: PostgreSQL
-- =======================================================

CREATE TABLE IF NOT EXISTS reviews (
    id BIGSERIAL PRIMARY KEY,
    product_id VARCHAR(100) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    reviewer_name VARCHAR(255) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- Seed realistic reviews for top products
INSERT INTO reviews (product_id, rating, reviewer_name, comment, created_at)
VALUES
('sen-da-kim-cuong', 5, 'Mai Anh (Hà Nội)', 'Cây kim cương trong suốt rất đẹp, rễ khỏe, đóng gói kỹ 4 lớp không bị dập một cánh nào luôn. Chắc chắn sẽ ủng hộ tiếp!', CURRENT_TIMESTAMP - INTERVAL '3 days'),
('sen-da-kim-cuong', 5, 'Trần Minh Tuấn', 'Hàng giao nhanh, cây mập mạp và rễ rất tươi. Shop tặng thêm phân tan chậm rất chu đáo.', CURRENT_TIMESTAMP - INTERVAL '5 days'),
('sen-da-kim-cuong', 4, 'Thu Hằng', 'Cây đẹp nhưng chậu hơi nhỏ so với mình tưởng tượng, tuy nhiên lên bàn làm việc nhìn rất xinh xắn.', CURRENT_TIMESTAMP - INTERVAL '8 days'),

('sen-da-nau', 5, 'Lê Hoàng Long', 'Sen nâu màu cánh gián đậm chuẩn Đà Lạt, form cánh xếp dày đẹp mắt. Mua về 1 tuần đã bén rễ con.', CURRENT_TIMESTAMP - INTERVAL '2 days'),
('sen-da-nau', 5, 'Thảo Nhi', 'Giá hợp lý, cây khỏe dễ chăm sóc cho người mới bắt đầu như mình. 10/10.', CURRENT_TIMESTAMP - INTERVAL '6 days'),

('sen-da-ngoc-bich', 5, 'Bảo Châu', 'Cây ngọc bích mọng nước lá xanh mướt, phong thủy rất tốt, để bàn làm việc rất hút tài lộc.', CURRENT_TIMESTAMP - INTERVAL '4 days'),
('sen-da-ngoc-bich', 5, 'Văn Hùng', 'Đóng thùng xốp và bọc giấy tổ ong rất chuyên nghiệp, cây đi 3 ngày vào Sài Gòn vẫn tươi nguyên.', CURRENT_TIMESTAMP - INTERVAL '7 days'),

('sen-da-hoa-hong-trang', 5, 'Phương Uyên', 'Dáng hoa hồng xếp lớp tinh tế như hoa thật, màu phấn trắng thanh khiết. Rất ưng ý!', CURRENT_TIMESTAMP - INTERVAL '1 day'),
('sen-da-mong-rong', 4, 'Đức Thắng', 'Móng rồng vân trắng sắc nét, cây cứng cáp khỏe mạnh. Shop tư vấn nhiệt tình.', CURRENT_TIMESTAMP - INTERVAL '10 days');
