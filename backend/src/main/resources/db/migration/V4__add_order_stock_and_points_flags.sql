-- =======================================================
-- V4__add_order_stock_and_points_flags.sql
-- Thêm cờ trạng thái trừ kho (stock_deducted) và tích điểm (points_awarded) cho bảng orders
-- Engine: PostgreSQL 12+
-- =======================================================

ALTER TABLE orders ADD COLUMN IF NOT EXISTS stock_deducted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS points_awarded BOOLEAN NOT NULL DEFAULT FALSE;
