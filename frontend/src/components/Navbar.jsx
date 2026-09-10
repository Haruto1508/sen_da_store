import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Sprout, 
  ShoppingBag, 
  Heart, 
  Search,
  SlidersHorizontal,
  X,
  ArrowRight,
  ShieldCheck, 
  User, 
  Package, 
  LogOut, 
  ChevronDown, 
  LogIn,
  Sun,
  Layers
} from 'lucide-react';
import { CATEGORIES } from '../data/products';

export default function Navbar({ 
  currentRoute,
  cartCount, 
  wishlistCount, 
  user,
  onLogout,
  onOpenWishlist, 
  onNavigate,
  searchQuery = '',
  onSearchChange,
  products = [],
  selectedCategory = 'all',
  onSelectCategory,
  selectedLight = 'all',
  onSelectLight,
  selectedDifficulty = 'all',
  onSelectDifficulty,
  onResetFilters
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const menuRef = useRef(null);
  const searchRef = useRef(null);
  const filterRef = useRef(null);

  const currentUser = user;

  // Sync local search with external prop when it changes externally
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchFocused(false);
      }
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Matching products for live instant search suggestions
  const matchingSuggestions = useMemo(() => {
    if (!localSearch || !localSearch.trim()) return [];
    const q = localSearch.toLowerCase().trim();
    return products.filter((p) => {
      const matchName = (p.name || '').toLowerCase().includes(q);
      const matchSci = (p.scientificName || '').toLowerCase().includes(q);
      return matchName || matchSci;
    }).slice(0, 5);
  }, [localSearch, products]);

  // Calculate number of active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory && selectedCategory !== 'all') count++;
    if (selectedLight && selectedLight !== 'all') count++;
    if (selectedDifficulty && selectedDifficulty !== 'all') count++;
    return count;
  }, [selectedCategory, selectedLight, selectedDifficulty]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (onSearchChange) onSearchChange(localSearch);
    setIsSearchFocused(false);
    onNavigate('shop');
  };

  const handleClearSearch = () => {
    setLocalSearch('');
    if (onSearchChange) onSearchChange('');
  };

  const handleSelectSuggestion = (productId) => {
    setIsSearchFocused(false);
    onNavigate('product-detail', productId);
  };

  const handleFilterSelect = (type, val) => {
    if (type === 'category' && onSelectCategory) onSelectCategory(val);
    if (type === 'light' && onSelectLight) onSelectLight(val);
    if (type === 'difficulty' && onSelectDifficulty) onSelectDifficulty(val);
  };

  const handleApplyFilterAndGo = () => {
    setIsFilterOpen(false);
    onNavigate('shop');
  };

  const handleResetQuickFilter = () => {
    if (onResetFilters) {
      onResetFilters();
    } else {
      if (onSelectCategory) onSelectCategory('all');
      if (onSelectLight) onSelectLight('all');
      if (onSelectDifficulty) onSelectDifficulty('all');
    }
  };

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
            href="#/" 
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
                href="#/" 
                className={`nav-link ${currentRoute === 'home' ? 'active' : ''}`} 
                onClick={(e) => { e.preventDefault(); onNavigate('home'); }}
              >
                Trang Chủ
              </a>
            </li>
            <li>
              <a 
                href="#/shop" 
                className={`nav-link ${currentRoute === 'shop' || currentRoute === 'product-detail' ? 'active' : ''}`} 
                onClick={(e) => { e.preventDefault(); onNavigate('shop'); }}
              >
                Cửa Hàng
              </a>
            </li>
            <li>
              <a 
                href="#/news" 
                className={`nav-link ${currentRoute === 'news' || currentRoute === 'news-detail' ? 'active' : ''}`} 
                onClick={(e) => { e.preventDefault(); onNavigate('news'); }}
              >
                Tin Tức & Cẩm Nang
              </a>
            </li>
          </ul>

          {/* Plant Search & Quick Filter Box */}
          <div className="navbar-search-wrapper" ref={searchRef}>
            <form className="navbar-search-bar" onSubmit={handleSearchSubmit}>
              <Search size={16} className="navbar-search-icon" />
              <input
                type="text"
                placeholder="Tìm sen đá, tiểu cảnh..."
                value={localSearch}
                onChange={(e) => {
                  setLocalSearch(e.target.value);
                  if (onSearchChange) onSearchChange(e.target.value);
                }}
                onFocus={() => setIsSearchFocused(true)}
                aria-label="Tìm kiếm cây sen đá"
              />
              {localSearch && (
                <button
                  type="button"
                  className="navbar-search-clear-btn"
                  onClick={handleClearSearch}
                  title="Xóa từ khóa"
                >
                  <X size={14} />
                </button>
              )}

              {/* Quick Filter Button in search bar */}
              <div className="navbar-filter-wrapper" ref={filterRef}>
                <button
                  type="button"
                  className={`navbar-filter-btn ${isFilterOpen || activeFiltersCount > 0 ? 'active' : ''}`}
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  title="Bộ lọc nhanh theo ánh sáng, độ khó, danh mục"
                  aria-label="Bộ lọc cây"
                >
                  <SlidersHorizontal size={15} />
                  {activeFiltersCount > 0 && (
                    <span className="navbar-filter-badge">{activeFiltersCount}</span>
                  )}
                </button>

                {/* Filter Popover Dropdown */}
                {isFilterOpen && (
                  <div className="navbar-filter-popover">
                    <div className="filter-popover-header">
                      <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <SlidersHorizontal size={14} color="var(--primary)" />
                        Bộ Lọc Cây Nhanh
                      </span>
                      {activeFiltersCount > 0 && (
                        <button type="button" className="filter-popover-reset" onClick={handleResetQuickFilter}>
                          Đặt lại ({activeFiltersCount})
                        </button>
                      )}
                    </div>

                    <div className="filter-popover-body">
                      {/* Category */}
                      <div className="popover-group">
                        <label>Danh mục</label>
                        <select 
                          value={selectedCategory} 
                          onChange={(e) => handleFilterSelect('category', e.target.value)}
                        >
                          {CATEGORIES.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Light */}
                      <div className="popover-group">
                        <label>Ánh sáng & Vị trí</label>
                        <select 
                          value={selectedLight} 
                          onChange={(e) => handleFilterSelect('light', e.target.value)}
                        >
                          <option value="all">Mọi loại ánh sáng</option>
                          <option value="indoor">Bàn làm việc / Trong nhà</option>
                          <option value="indirect">Nắng tán xạ / Nắng dịu</option>
                          <option value="full_sun">Full nắng trực tiếp</option>
                        </select>
                      </div>

                      {/* Difficulty */}
                      <div className="popover-group">
                        <label>Độ khó chăm sóc</label>
                        <select 
                          value={selectedDifficulty} 
                          onChange={(e) => handleFilterSelect('difficulty', e.target.value)}
                        >
                          <option value="all">Mọi cấp độ</option>
                          <option value="easy">Cực dễ cho người mới</option>
                          <option value="medium">Cần chú ý một chút</option>
                        </select>
                      </div>
                    </div>

                    <div className="filter-popover-footer">
                      <button 
                        type="button" 
                        className="btn-primary" 
                        style={{ width: '100%', padding: '10px', fontSize: '0.88rem', justifyContent: 'center' }}
                        onClick={handleApplyFilterAndGo}
                      >
                        Áp Dụng & Đến Cửa Hàng
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </form>

            {/* Instant Search Suggestions Dropdown */}
            {isSearchFocused && localSearch.trim().length > 0 && (
              <div className="navbar-search-dropdown">
                {matchingSuggestions.length > 0 ? (
                  <>
                    <div className="search-dropdown-header">
                      <span>Gợi ý sen đá ({matchingSuggestions.length})</span>
                    </div>
                    <div className="search-dropdown-list">
                      {matchingSuggestions.map((item) => (
                        <div 
                          key={item.id} 
                          className="search-dropdown-item"
                          onClick={() => handleSelectSuggestion(item.id)}
                        >
                          <img src={item.image} alt={item.name} className="search-item-thumb" />
                          <div className="search-item-details">
                            <span className="search-item-title">{item.name}</span>
                            <div className="search-item-bottom">
                              <span className="search-item-price">{(item.price || 0).toLocaleString('vi-VN')}₫</span>
                              <span className="search-item-tag">{item.category}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button 
                      type="button" 
                      className="search-dropdown-footer-btn"
                      onClick={handleSearchSubmit}
                    >
                      <span>Xem tất cả kết quả trong Cửa Hàng</span>
                      <ArrowRight size={14} />
                    </button>
                  </>
                ) : (
                  <div className="search-dropdown-empty">
                    <span>Không tìm thấy sen đá phù hợp với "{localSearch}"</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="nav-actions">
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

            {/* User Login Button or Avatar Dropdown */}
            {!currentUser ? (
              <button 
                id="navbar-login-btn"
                className={`navbar-auth-btn ${currentRoute === 'login' || currentRoute === 'register' ? 'active' : ''}`}
                onClick={() => onNavigate('login')}
                title="Đăng nhập hoặc đăng ký tài khoản"
              >
                <LogIn size={16} />
                <span>Đăng Nhập</span>
              </button>
            ) : (
              <div className="user-dropdown-container" ref={menuRef}>
                <button 
                  id="user-avatar-btn"
                  className={`user-avatar-btn ${isMenuOpen ? 'open' : ''} ${currentRoute === 'account' ? 'active' : ''}`}
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  title={`Tài khoản: ${currentUser.name}`}
                  aria-label="Menu tài khoản"
                  aria-expanded={isMenuOpen}
                >
                  <div className="navbar-account-icon">
                    <User size={18} />
                  </div>
                  <ChevronDown size={14} className={`navbar-avatar-chevron ${isMenuOpen ? 'open' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div className="user-dropdown-menu">
                    {/* User Info Header in Dropdown */}
                    <div style={{ padding: '12px 16px 10px', borderBottom: '1px solid var(--border-light)' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {currentUser.name}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                        {currentUser.role || 'Thành viên'}
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="user-menu-items">
                      {/* Item Admin (Nếu là Admin) */}
                      {(currentUser.role?.includes('Admin') || currentUser.email === 'admin@senxinh.vn') && (
                        <button 
                          id="menu-admin-btn"
                          className={`user-menu-item ${currentRoute === 'admin' ? 'active' : ''}`}
                          onClick={() => handleMenuItemClick('admin')}
                          style={{ background: 'rgba(220, 38, 38, 0.05)' }}
                        >
                          <div className="menu-item-icon" style={{ color: '#DC2626' }}><ShieldCheck size={17} /></div>
                          <span className="menu-item-label" style={{ fontWeight: 700, color: '#DC2626' }}>Quản Trị Nhà Vườn</span>
                          <span className="menu-item-tag" style={{ background: '#DC2626', color: '#fff' }}>Admin</span>
                        </button>
                      )}

                      {/* Item 1: Xem giỏ hàng */}
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

                      {/* Item 2: Tài khoản */}
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

                    {/* Item 3: Đăng xuất */}
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
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
