import React from 'react';
import { User, Mail, Phone, MapPin, Package, Heart, Edit3, Check, ArrowRight } from 'lucide-react';

export default function AccountProfileTab({
  user,
  formData,
  setFormData,
  isEditing,
  setIsEditing,
  handleSave,
  savedSuccess,
  setActiveTab,
  onLogout
}) {
  if (!user) {
    return (
      <div className="account-tab-content">
        <div className="account-card" style={{ textAlign: 'center', padding: '60px 24px' }}>
          <User size={48} style={{ opacity: 0.35, color: 'var(--primary)', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>Bạn Chưa Đăng Nhập Tài Khoản</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '480px', margin: '0 auto 24px' }}>
            Vui lòng đăng nhập để xem và cập nhật thông tin cá nhân, địa chỉ nhận cây mặc định và tích lũy Điểm Sen thưởng.
          </p>
          <button className="btn-primary" onClick={onLogout} style={{ padding: '12px 28px' }}>
            <span>Đăng Nhập Ngay</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="account-tab-content">
      <div className="account-card">
        <div className="account-card-header">
          <div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Thông Tin Người Dùng</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '2px' }}>
              Quản lý thông tin liên hệ và địa chỉ nhận cây mặc định của bạn
            </p>
          </div>

          {!isEditing && (
            <button 
              className="btn-secondary" 
              onClick={() => setIsEditing(true)}
              style={{ padding: '8px 16px', fontSize: '0.88rem' }}
            >
              <Edit3 size={16} />
              <span>Chỉnh Sửa</span>
            </button>
          )}
        </div>

        {savedSuccess && (
          <div className="save-success-banner">
            <Check size={18} />
            <span>Cập nhật thông tin tài khoản thành công!</span>
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleSave} className="form-grid" style={{ marginTop: '20px' }}>
            <div className="form-group">
              <label className="form-label">Họ và tên</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Số điện thoại</label>
              <input
                type="tel"
                className="form-input"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>

            <div className="form-group full-width">
              <label className="form-label">Địa chỉ giao hàng mặc định</label>
              <input
                type="text"
                className="form-input"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <button type="submit" className="btn-primary" style={{ padding: '10px 24px' }}>
                <Check size={16} />
                <span>Lưu Thay Đổi</span>
              </button>
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => setIsEditing(false)}
                style={{ padding: '10px 20px' }}
              >
                Hủy Bỏ
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-details-grid">
            <div className="detail-item">
              <div className="detail-icon"><User size={18} /></div>
              <div>
                <span className="detail-label">Họ và tên:</span>
                <strong className="detail-value">{formData.name}</strong>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-icon"><Mail size={18} /></div>
              <div>
                <span className="detail-label">Địa chỉ email:</span>
                <strong className="detail-value">{formData.email}</strong>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-icon"><Phone size={18} /></div>
              <div>
                <span className="detail-label">Số điện thoại:</span>
                <strong className="detail-value">{formData.phone}</strong>
              </div>
            </div>

            <div className="detail-item full-width">
              <div className="detail-icon"><MapPin size={18} /></div>
              <div>
                <span className="detail-label">Địa chỉ nhận hàng mặc định:</span>
                <strong className="detail-value">{formData.address}</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Access Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '24px' }}>
        <div className="quick-card" onClick={() => setActiveTab('orders')}>
          <div className="quick-card-icon" style={{ background: '#EBF4EE', color: 'var(--primary)' }}>
            <Package size={24} />
          </div>
          <div>
            <h4>Quản Lý & Xem Đơn Hàng</h4>
            <p>Xem tiến trình vận chuyển, lịch sử giao hàng và hóa đơn theo thời gian thực.</p>
          </div>
          <ArrowRight size={18} className="quick-card-arrow" />
        </div>

        <div className="quick-card" onClick={() => setActiveTab('wishlist')}>
          <div className="quick-card-icon" style={{ background: '#FFF4E5', color: 'var(--accent)' }}>
            <Heart size={24} />
          </div>
          <div>
            <h4>Mục Yêu Thích Của Bạn</h4>
            <p>Xem lại các giống sen đá bạn đã lưu và nhanh chóng thêm vào giỏ hàng.</p>
          </div>
          <ArrowRight size={18} className="quick-card-arrow" />
        </div>
      </div>
    </div>
  );
}
