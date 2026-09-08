import React from 'react';
import { Tag, X, Check } from 'lucide-react';

export default function CouponModal({
  isOpen,
  couponFormData,
  setCouponFormData,
  onClose,
  onSave
}) {
  if (!isOpen) return null;

  return (
    <div
      className="admin-modal-overlay"
      onClick={onClose}
      onWheel={(e) => {
        if (e.target === e.currentTarget) e.preventDefault();
      }}
    >
      <div
        className="admin-modal-container"
        style={{ maxWidth: '520px' }}
        onClick={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
      >
        <div className="admin-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Tag size={20} color="var(--primary)" />
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)' }}>
              Tạo Mã Voucher Giảm Giá
            </h3>
          </div>
          <button
            className="btn-icon-action"
            onClick={onClose}
            title="Đóng cửa sổ"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSave}>
          <div className="admin-modal-body">
            <div className="admin-form-control">
              <label>Mã Voucher (Code) *</label>
              <input
                type="text"
                required
                placeholder="VD: SENXINHVIP25, FREESHIP..."
                value={couponFormData.code}
                onChange={(e) =>
                  setCouponFormData({
                    ...couponFormData,
                    code: e.target.value.toUpperCase().replace(/\s+/g, '')
                  })
                }
                style={{ textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}
              />
            </div>

            <div className="admin-form-control">
              <label>Phần Trăm Chiết Khấu (%) *</label>
              <input
                type="number"
                required
                min="1"
                max="100"
                value={couponFormData.discountPercent}
                onChange={(e) =>
                  setCouponFormData({
                    ...couponFormData,
                    discountPercent: Number(e.target.value)
                  })
                }
              />
            </div>

            <div className="admin-form-control">
              <label>Mô Tả / Điều Kiện Áp Dụng</label>
              <textarea
                rows={2}
                placeholder="VD: Giảm 25% cho đơn hàng từ 200k, áp dụng toàn quốc..."
                value={couponFormData.description}
                onChange={(e) =>
                  setCouponFormData({ ...couponFormData, description: e.target.value })
                }
              />
            </div>
          </div>

          <div className="admin-modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
            >
              Hủy Bỏ
            </button>
            <button type="submit" className="btn-primary">
              <Check size={16} />
              <span>Kích Hoạt Mã Ngay</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
