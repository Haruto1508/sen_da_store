import React, { useState, useEffect } from 'react';
import { X, Truck, Check, AlertTriangle } from 'lucide-react';

export const POPULAR_PROVINCES = [
  'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Lạt - Lâm Đồng', 'Đà Nẵng', 'Hải Phòng',
  'Cần Thơ', 'An Giang', 'Bà Rịa – Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu',
  'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước', 'Bình Thuận',
  'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Đắk Nông', 'Điện Biên', 'Đồng Nai',
  'Đồng Tháp', 'Gia Lai', 'Hà Giang', 'Hà Nam', 'Hà Tĩnh', 'Hải Dương',
  'Hậu Giang', 'Hòa Bình', 'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 'Kon Tum',
  'Lai Châu', 'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định', 'Nghệ An',
  'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Phú Yên', 'Quảng Bình', 'Quảng Nam',
  'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị', 'Sóc Trăng', 'Sơn La', 'Tây Ninh',
  'Thái Bình', 'Thái Nguyên', 'Thanh Hóa', 'Thừa Thiên Huế', 'Tiền Giang',
  'Trà Vinh', 'Tuyên Quang', 'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái'
];

export default function ShippingRateModal({
  isOpen,
  onClose,
  onSave,
  initialData = null,
  existingProvinces = []
}) {
  const isEditing = Boolean(initialData && initialData.id);

  const [formData, setFormData] = useState({
    province: '',
    fee: 30000,
    estimatedDays: '2 - 3 ngày',
    note: ''
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          province: initialData.province || '',
          fee: initialData.fee !== undefined ? initialData.fee : 30000,
          estimatedDays: initialData.estimatedDays || '2 - 3 ngày',
          note: initialData.note || ''
        });
      } else {
        setFormData({
          province: '',
          fee: 30000,
          estimatedDays: '2 - 3 ngày',
          note: ''
        });
      }
      setError('');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanProvince = formData.province.trim();
    if (!cleanProvince) {
      setError('Vui lòng nhập hoặc chọn Tỉnh / Thành phố!');
      return;
    }

    // Kiểm tra trùng tên tỉnh nếu là thêm mới
    if (!isEditing && existingProvinces.some(p => p.toLowerCase() === cleanProvince.toLowerCase())) {
      setError(`Tỉnh / Thành phố "${cleanProvince}" đã có trong biểu phí! Hãy chọn tỉnh khác hoặc sửa mục hiện có.`);
      return;
    }

    const feeNum = Number(formData.fee);
    if (isNaN(feeNum) || feeNum < 0) {
      setError('Phí vận chuyển phải là một số không âm (từ 0đ trở lên)!');
      return;
    }

    onSave({
      id: initialData?.id || `rate_${Date.now()}`,
      province: cleanProvince,
      fee: Math.round(feeNum),
      estimatedDays: formData.estimatedDays.trim() || '2 - 3 ngày',
      note: formData.note.trim()
    });
    onClose();
  };

  const formatPrice = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal-container" style={{ maxWidth: '540px' }}>
        <div className="admin-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Truck size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                {isEditing ? 'Chỉnh Sửa Phí Vận Chuyển' : 'Thêm Phí Ship Tỉnh / Thành Phố'}
              </h3>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {isEditing ? `Cập nhật biểu phí giao hàng cho ${initialData.province}` : 'Thiết lập mức cước và thời gian giao hàng dự kiến'}
              </span>
            </div>
          </div>
          <button type="button" className="admin-modal-close-btn" onClick={onClose} aria-label="Đóng">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="admin-modal-body">
          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626', padding: '10px 14px', borderRadius: '8px', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <AlertTriangle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Province Name */}
          <div className="admin-form-group" style={{ marginBottom: '16px' }}>
            <label className="admin-form-label" style={{ fontWeight: 700, fontSize: '0.88rem', display: 'block', marginBottom: '6px' }}>
              Tỉnh / Thành phố <span style={{ color: '#E63946' }}>*</span>
            </label>
            <input
              type="text"
              required
              list="provinces-list"
              className="admin-form-input"
              placeholder="Chọn hoặc nhập tên Tỉnh / Thành phố..."
              value={formData.province}
              onChange={(e) => setFormData({ ...formData, province: e.target.value })}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid var(--border-light)', fontSize: '0.92rem' }}
            />
            <datalist id="provinces-list">
              {POPULAR_PROVINCES.map((prov) => (
                <option key={prov} value={prov} />
              ))}
            </datalist>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
              💡 Có thể gõ để tìm kiếm nhanh trong 63 tỉnh thành Việt Nam
            </span>
          </div>

          {/* Shipping Fee */}
          <div className="admin-form-group" style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="admin-form-label" style={{ fontWeight: 700, fontSize: '0.88rem' }}>
                Cước phí giao hàng (VNĐ) <span style={{ color: '#E63946' }}>*</span>
              </label>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)' }}>
                {formatPrice(formData.fee)}
              </span>
            </div>
            <input
              type="number"
              required
              min="0"
              step="1000"
              className="admin-form-input"
              placeholder="Ví dụ: 25000"
              value={formData.fee}
              onChange={(e) => setFormData({ ...formData, fee: Number(e.target.value) })}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid var(--border-light)', fontSize: '0.92rem' }}
            />
            <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
              {[15000, 20000, 25000, 30000, 35000, 40000].map(amt => (
                <button
                  type="button"
                  key={amt}
                  onClick={() => setFormData({ ...formData, fee: amt })}
                  style={{
                    fontSize: '0.75rem',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-light)',
                    background: formData.fee === amt ? 'var(--primary)' : 'var(--bg-alt)',
                    color: formData.fee === amt ? '#fff' : 'var(--text-muted)',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  {amt / 1000}k
                </button>
              ))}
            </div>
          </div>

          {/* Estimated Days */}
          <div className="admin-form-group" style={{ marginBottom: '16px' }}>
            <label className="admin-form-label" style={{ fontWeight: 700, fontSize: '0.88rem', display: 'block', marginBottom: '6px' }}>
              Thời gian giao hàng dự kiến
            </label>
            <input
              type="text"
              className="admin-form-input"
              placeholder="Ví dụ: 1 - 2 ngày, Trong ngày..."
              value={formData.estimatedDays}
              onChange={(e) => setFormData({ ...formData, estimatedDays: e.target.value })}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid var(--border-light)', fontSize: '0.92rem' }}
            />
          </div>

          {/* Note */}
          <div className="admin-form-group" style={{ marginBottom: '24px' }}>
            <label className="admin-form-label" style={{ fontWeight: 700, fontSize: '0.88rem', display: 'block', marginBottom: '6px' }}>
              Ghi chú khu vực (Tùy chọn)
            </label>
            <input
              type="text"
              className="admin-form-input"
              placeholder="Ví dụ: Áp dụng nội thành, Gần kho vườn..."
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid var(--border-light)', fontSize: '0.92rem' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              style={{ padding: '10px 20px', fontSize: '0.9rem' }}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ padding: '10px 24px', fontSize: '0.9rem' }}
            >
              <Check size={16} />
              <span>{isEditing ? 'Cập Nhật' : 'Lưu Tỉnh Thành'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
