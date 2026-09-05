import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Package, 
  Heart, 
  Sparkles, 
  LogOut, 
  Check, 
  Edit3, 
  ArrowRight,
  ShoppingBag
} from 'lucide-react';

export default function AccountPage({
  user,
  wishlistCount,
  cartCount,
  onNavigateShop,
  onNavigateCart,
  onNavigateAdmin,
  onNavigateHome,
  onLogout,
  onUpdateUser
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || 'Nguyễn Hoàng Long',
    email: user?.email || 'long.senxinh@gmail.com',
    phone: user?.phone || '0988 123 456',
    address: user?.address || '123 Phố Trúc Bạch, Quận Ba Đình, Hà Nội'
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    if (onUpdateUser) {
      onUpdateUser(formData);
    }
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="account-page">
      {/* Header Banner */}
      <div className="page-header-banner">
        <div className="container">
          <div className="breadcrumb">
            <button className="breadcrumb-link" onClick={onNavigateHome}>Trang Chủ</button>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Tài Khoản Của Tôi</span>
          </div>

          <div style={{ marginTop: '14px' }}>
            <span className="section-subtitle" style={{ color: 'var(--accent)' }}>Trung Tâm Thành Viên</span>
            <h1 className="page-title" style={{ fontSize: '2.4rem', marginTop: '4px' }}>
              Hồ Sơ & Quản Lý Tài Khoản
            </h1>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '36px 24px 80px' }}>
        <div className="account-layout">
          {/* Left Column: User Profile Card */}
          <div className="account-sidebar">
            <div className="profile-card">
              <div className="profile-avatar-wrap">
                <img 
                  src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"} 
                  alt={formData.name} 
                  className="profile-avatar-img" 
                />
                <span className="profile-online-badge" />
              </div>

              <h2 className="profile-name">{formData.name}</h2>
              <p className="profile-email">{formData.email}</p>

              <div className="profile-membership-pill">
                <Sparkles size={15} color="#D97757" />
                <span>Thành Viên Thân Thiết</span>
              </div>

              <div className="profile-stats">
                <div className="profile-stat-item" onClick={onNavigateCart} style={{ cursor: 'pointer' }}>
                  <strong>{cartCount}</strong>
                  <span>Giỏ hàng</span>
                </div>
                <div className="profile-stat-divider" />
                <div className="profile-stat-item">
                  <strong>{wishlistCount}</strong>
                  <span>Yêu thích</span>
                </div>
                <div className="profile-stat-divider" />
                <div className="profile-stat-item">
                  <strong>240</strong>
                  <span>Điểm Sen</span>
                </div>
              </div>

              <div className="profile-nav-list">
                <button 
                  className="profile-nav-btn active"
                  onClick={() => setIsEditing(false)}
                >
                  <User size={18} />
                  <span>Thông Tin Cá Nhân</span>
                </button>

                <button 
                  className="profile-nav-btn"
                  onClick={onNavigateAdmin}
                >
                  <Package size={18} />
                  <span>Xem Đơn Hàng</span>
                  <span className="profile-nav-badge">Java API</span>
                </button>

                <button 
                  className="profile-nav-btn"
                  onClick={onNavigateCart}
                >
                  <ShoppingBag size={18} />
                  <span>Xem Giỏ Hàng ({cartCount})</span>
                </button>

                <button 
                  className="profile-nav-btn logout"
                  onClick={onLogout}
                >
                  <LogOut size={18} />
                  <span>Đăng Xuất Tài Khoản</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Information & Edit Form */}
          <div className="account-main">
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
                /* Edit Form */
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
                /* Read-Only Details */
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

            {/* Quick Actions Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '24px' }}>
              <div className="quick-card" onClick={onNavigateAdmin}>
                <div className="quick-card-icon" style={{ background: '#EBF4EE', color: 'var(--primary)' }}>
                  <Package size={24} />
                </div>
                <div>
                  <h4>Quản Lý & Xem Đơn Hàng</h4>
                  <p>Xem trạng thái vận chuyển, hóa đơn và doanh thu thời gian thực.</p>
                </div>
                <ArrowRight size={18} className="quick-card-arrow" />
              </div>

              <div className="quick-card" onClick={onNavigateShop}>
                <div className="quick-card-icon" style={{ background: '#FFF4E5', color: 'var(--accent)' }}>
                  <Sparkles size={24} />
                </div>
                <div>
                  <h4>Bộ Sưu Tập Cửa Hàng</h4>
                  <p>Khám phá thêm các giống sen đá quý hiếm tại vườn ươm.</p>
                </div>
                <ArrowRight size={18} className="quick-card-arrow" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
