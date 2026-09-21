-- =======================================================
-- V5__add_return_order_fields.sql
-- Thêm các trường hỗ trợ chính sách hoàn trả 7 ngày và quản lý đổi trả đơn hàng
-- Engine: PostgreSQL 12+
-- =======================================================

ALTER TABLE orders ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS return_reason VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS return_note VARCHAR(1000);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS refund_bank_info VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS return_requested_at TIMESTAMP;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS returned_at TIMESTAMP;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS return_reject_reason VARCHAR(500);
