import React, { useState, useEffect, useRef } from 'react';
import { 
  Sprout, 
  ShoppingBag, 
  Heart, 
  Sparkles, 
  ShieldCheck, 
  User, 
  Package, 
  LogOut, 
  ChevronDown 
} from 'lucide-react';

export default function Navbar({ 
  currentRoute,
  cartCount, 
  wishlistCount, 
  user,
  onLogout,
  onOpenWishlist,
  onNavigate 
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Default demo user if not passed
  const currentUser = user || {
    name: 'Nguyễn Hoàng Long',
    email: 'long.senxinh@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    role: 'Thành viên thân thiết'
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuItemClick = (route) => {
    setIsMenuOpen(false);
    onNavigate(route);
  };

  const handleLogoutClick = () => {
    setIsMenuOpen(false);
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <header className="header">
      <div className="container">
        <nav className="nav-container">
          {/* Logo */}
          <a 
            href="#home" 
            className="logo" 
            onClick={(e) => { 
              e.preventDefault(); 
              onNavigate('home'); 
            }}
          >
            <div className="logo-icon">
              <Sprout size={24} />
            </div>
            <span>Sen Xinh <span style={{ color: 'var(--accent)', fontSize: '0.9em' }}>Garden</span></span>
          </a>

          {/* Navigation links */}
          <ul className="nav-menu">
            <li>
              <a 
                href="#home" 
                className={`nav-link ${currentRoute === 'home' ? 'active' : ''}`} 
                onClick={(e) => { e.preventDefault(); onNavigate('home'); }}
              >
                Trang Chủ
              </a>
            </li>
            <li>
              <a 
                href="#shop" 
                className={`nav-link ${currentRoute === 'shop' || currentRoute === 'product-detail' ? 'active' : ''}`} 
                onClick={(e) => { e.preventDefault(); onNavigate('shop'); }}
              >
                Cửa Hàng
              </a>
            </li>
            <li>
              <a 
                href="#news" 
                className={`nav-link ${currentRoute === 'news' || currentRoute === 'news-detail' ? 'active' : ''}`} 
                onClick={(e) => { e.preventDefault(); onNavigate('news'); }}
              >
                Tin Tức & Cẩm Nang
              </a>
            </li>
            <li>
              <a 
                href="#admin" 
                className={`nav-link ${currentRoute === 'admin' ? 'active' : ''}`} 
                onClick={(e) => { e.preventDefault(); onNavigate('admin'); }}
              >
                Quản Lý Đơn
              </a>
            </li>
          </ul>

          {/* Actions */}
          <div className="nav-actions">
            {/* Quiz shortcut */}
            <button 
              className={`btn-quiz ${currentRoute === 'quiz' ? 'active' : ''}`} 
              onClick={() => onNavigate('quiz')} 
              title="Trắc nghiệm chọn cây"
            >
              <Sparkles size={16} />
              <span>Tìm Cây Hợp Bạn</span>
            </button>

            {/* Wishlist Button */}
            <button 
              className="icon-btn" 
              onClick={onOpenWishlist}
              title="Mục yêu thích"
              aria-label="Danh sách yêu thích"
            >
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="cart-badge" style={{ background: '#E63946' }}>
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button 
              className={`icon-btn ${currentRoute === 'cart' || currentRoute === 'checkout' ? 'active' : ''}`} 
              onClick={() => onNavigate('cart')} 
              title="Xem giỏ hàng"
              aria-label="Giỏ hàng"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="cart-badge">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Avatar & Dropdown Menu */}
            <div className="user-dropdown-container" ref={menuRef}>
              <button 
                id="user-avatar-btn"
                className={`user-avatar-btn ${isMenuOpen ? 'open' : ''} ${currentRoute === 'account' ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                title="Tài khoản cá nhân"
                aria-label="Menu tài khoản"
                aria-expanded={isMenuOpen}
              >
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name} 
                  className="navbar-avatar-img" 
                />
                <span className="navbar-avatar-status" />
                <ChevronDown size={14} className={`navbar-avatar-chevron ${isMenuOpen ? 'open' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div className="user-dropdown-menu">
                  {/* User info head */}
                  <div className="user-menu-header" onClick={() => handleMenuItemClick('account')}>
                    <img 
                      src={currentUser.avatar} 
                      alt={currentUser.name} 
                      className="menu-header-avatar" 
                    />
                    <div className="menu-header-text">
                      <strong className="menu-header-name">{currentUser.name}</strong>
                      <span className="menu-header-email">{currentUser.email}</span>
                      <span className="menu-header-badge">🌿 {currentUser.role}</span>
                    </div>
                  </div>

                  <div className="menu-divider" />

                  {/* Menu Items */}
                  <div className="user-menu-items">
                    {/* Item 1: Xem đơn hàng */}
                    <button 
                      id="menu-orders-btn"
                      className={`user-menu-item ${currentRoute === 'admin' ? 'active' : ''}`}
                      onClick={() => handleMenuItemClick('admin')}
                    >
                      <div className="menu-item-icon"><Package size={17} /></div>
                      <span className="menu-item-label">Xem Đơn Hàng</span>
                      <span className="menu-item-tag">Java API</span>
                    </button>

                    {/* Item 2: Xem giỏ hàng */}
                    <button 
                      id="menu-cart-btn"
                      className={`user-menu-item ${currentRoute === 'cart' ? 'active' : ''}`}
                      onClick={() => handleMenuItemClick('cart')}
                    >
                      <div className="menu-item-icon"><ShoppingBag size={17} /></div>
                      <span className="menu-item-label">Xem Giỏ Hàng</span>
                      {cartCount > 0 && (
                        <span className="menu-item-count">{cartCount}</span>
                      )}
                    </button>

                    {/* Item 3: Tài khoản */}
                    <button 
                      id="menu-account-btn"
                      className={`user-menu-item ${currentRoute === 'account' ? 'active' : ''}`}
                      onClick={() => handleMenuItemClick('account')}
                    >
                      <div className="menu-item-icon"><User size={17} /></div>
                      <span className="menu-item-label">Thông Tin Tài Khoản</span>
                    </button>
                  </div>

                  <div className="menu-divider" />

                  {/* Item 4: Đăng xuất */}
                  <div className="user-menu-footer">
                    <button 
                      id="menu-logout-btn"
                      className="user-menu-item logout"
                      onClick={handleLogoutClick}
                    >
                      <div className="menu-item-icon"><LogOut size={17} /></div>
                      <span className="menu-item-label">Đăng Xuất</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
