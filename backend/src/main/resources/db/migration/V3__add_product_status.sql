-- =======================================================
-- V3__add_product_status.sql
-- Thêm cột status cho bảng products hỗ trợ Soft Delete / Deactivate
-- Các trạng thái: 'ACTIVE' (đang bán), 'INACTIVE' (tạm ẩn), 'DELETED' (đã xóa mềm)
-- =======================================================

ALTER TABLE products ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'ACTIVE';

UPDATE products SET status = 'ACTIVE' WHERE status IS NULL;

CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
