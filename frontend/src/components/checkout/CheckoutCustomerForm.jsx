import React from 'react';
import { Sparkles } from 'lucide-react';

export default function CheckoutCustomerForm({
  user,
  formData,
  setFormData,
  shippingConfig,
  formatPrice,
  navigate
}) {
  return (
    <>
      {/* Guest Checkout Notice Banner */}
      {!user && (
        <div className="chk-guest-banner">
          <div className="chk-guest-banner-left">
            <Sparkles size={16} color="var(--primary)" />
            <span>Mua nhanh không cần tạo tài khoản.</span>
          </div>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="chk-guest-login-btn"
          >
            Đăng nhập để tự động điền
          </button>
        </div>
      )}

      {/* Customer Details Form Card */}
      <div className="chk-card">
        <div className="chk-card-head">
          <h2 className="chk-card-title">
            Thông Tin Nhận Hàng
            {user?.name && <span className="chk-autofill-badge">✓ Đã điền sẵn</span>}
          </h2>
        </div>

        <div className="chk-form-grid">
          <div className="chk-form-group">
            <label className="chk-form-label">Họ và tên người nhận <span>*</span></label>
            <input
              type="text"
              required
              className="chk-form-input"
              placeholder="Nguyễn Văn An"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="chk-form-group">
            <label className="chk-form-label">Số điện thoại liên hệ <span>*</span></label>
            <input
              type="tel"
              required
              className="chk-form-input"
              placeholder="0988 123 456"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="chk-form-group full">
            <label className="chk-form-label">Tỉnh / Thành phố</label>
            <select
              className="chk-form-input"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            >
              {(shippingConfig?.provinceRates || []).map((r) => (
                <option key={r.id || r.province} value={r.province}>
                  {r.province} ({formatPrice(r.fee)})
                </option>
              ))}
              {formData.city && !(shippingConfig?.provinceRates || []).some(r => r.province.toLowerCase() === formData.city.toLowerCase()) && (
                <option value={formData.city}>{formData.city} ({formatPrice(shippingConfig?.defaultShippingFee || 35000)})</option>
              )}
            </select>
          </div>

          <div className="chk-form-group full">
            <label className="chk-form-label">Địa chỉ nhận hàng chi tiết <span>*</span></label>
            <input
              type="text"
              required
              className="chk-form-input"
              placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="chk-form-group full">
            <label className="chk-form-label">Ghi chú giao hàng (Tùy chọn)</label>
            <input
              type="text"
              className="chk-form-input"
              placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi giao..."
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            />
          </div>
        </div>
      </div>
    </>
  );
}
