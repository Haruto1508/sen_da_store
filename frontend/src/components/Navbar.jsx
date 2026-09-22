import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
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
  History,
  LogOut, 
  ChevronDown, 
  ChevronRight,
  LogIn,
  Sun,
  Layers,
  Menu,
  Home,
  Flower2,
  Gem,
  Gift,
  Sparkles,
  Star,
  Truck,
  CheckCircle2,
  PhoneCall
} from 'lucide-react';
import { CATEGORIES } from '../data/products';
import webLogo from '../assets/logo/web_logo.png';

// Metadata ánh xạ cho danh mục cây từ database
export const CATEGORY_META = {
  all: { name: 'Tất Cả Cây', desc: 'Trọn bộ sản phẩm hiện có', icon: Sparkles, color: 'var(--primary)', bg: 'var(--primary-light)' },
  echeveria: { name: 'Sen Đài & Hoa Hồng', desc: 'Cánh hoa nhiều tầng xếp lớp', icon: Flower2, color: '#E11D48', bg: 'rgba(225, 29, 72, 0.08)' },
  haworthia: { name: 'Sen Kim Cương & Mọng Nước', desc: 'Đầu cánh pha lê trong suốt', icon: Gem, color: '#0284C7', bg: 'rgba(2, 132, 199, 0.08)' },
  cactus: { name: 'Xương Rồng & Phong Thủy', desc: 'Chiêu tài hút lộc may mắn', icon: Sun, color: '#D97706', bg: 'rgba(217, 119, 6, 0.08)' },
  combo: { name: 'Combo Quà Tặng & Tiểu Cảnh', desc: 'Phối chậu nghệ thuật độc đáo', icon: Gift, color: '#7C3AED', bg: 'rgba(124, 58, 237, 0.08)' },
  accessories: { name: 'Chậu Gốm & Đất Trồng', desc: 'Giá thể thoát nước, chậu gốm', icon: Layers, color: '#059669', bg: 'rgba(5, 150, 105, 0.08)' },
};

// Danh sách các chủng loại sen đá đặc trưng của Sen Xinh Garden
export const SUCCULENT_TYPES = [
  {
    id: 'echeveria',
    name: 'Sen Đài & Hoa Hồng',
    scientific: 'Echeveria',
    desc: 'Cánh xếp tầng đều đặn, sắc màu phong phú',
    icon: Flower2,
    color: '#E11D48',
    bg: 'rgba(225, 29, 72, 0.08)'
  },
  {
    id: 'haworthia',
    name: 'Sen Mọng Nước & Kim Cương',
    scientific: 'Haworthia',
    desc: 'Lá mọng nước, đầu cánh trong suốt như pha lê',
    icon: Gem,
    color: '#0284C7',
    bg: 'rgba(2, 132, 199, 0.08)'
  },
  {
    id: 'cactus',
    name: 'Xương Rồng & Phong Thủy',
    scientific: 'Cactus & Euphorbia',
    desc: 'Gai tơ mềm, rễ khỏe, chiêu tài hút lộc may mắn',
    icon: Sun,
    color: '#D97706',
    bg: 'rgba(217, 119, 6, 0.08)'
  },
  {
    id: 'combo',
    name: 'Combo Quà Tặng & Tiểu Cảnh',
    scientific: 'Garden Gift Box',
    desc: 'Thiết kế phối chậu nghệ thuật, quà tặng ý nghĩa',
    icon: Gift,
    color: '#7C3AED',
    bg: 'rgba(124, 58, 237, 0.08)'
  },
  {
    id: 'accessories',
    name: 'Chậu Gốm & Đất Trồng',
    scientific: 'Soil & Pots',
    desc: 'Đất Akadama, Pumice tơi xốp & chậu đất nung chuẩn',
    icon: Layers,
    color: '#059669',
    bg: 'rgba(5, 150, 105, 0.08)'
  },
  {
    id: 'all',
    name: 'Tất Cả Sản Phẩm Sen Đá',
    scientific: 'Full Collection',
    desc: 'Khám phá trọn bộ sưu tập mầm xanh tại vườn',
    icon: Sparkles,
    color: 'var(--primary)',
    bg: 'var(--primary-light)'
  }
];

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
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // States for Plants Dropdown Menu
  const [isPlantsMegaMenuOpen, setIsPlantsMegaMenuOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState('all');
  const [isMobilePlantsOpen, setIsMobilePlantsOpen] = useState(true);

  const menuRef = useRef(null);
  const searchRef = useRef(null);
  const filterRef = useRef(null);
  const megaMenuRef = useRef(null);

  const currentUser = user;

  // Sync local search with external prop when it changes externally
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // Close mobile drawer and mega menu on route navigation
  useEffect(() => {
    setIsMobileDrawerOpen(false);
    setIsPlantsMegaMenuOpen(false);
  }, [currentRoute]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileDrawerOpen]);

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
      if (megaMenuRef.current && !megaMenuRef.current.contains(e.target)) {
        setIsPlantsMegaMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lấy danh mục sản phẩm động hoàn toàn dựa trên các sản phẩm thực tế trong DB
  const activeCategories = useMemo(() => {
    const uniqueCatIds = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));

    const list = [
      {
        id: 'all',
        name: 'Tất Cả Sản Phẩm',
        desc: 'Toàn bộ mầm xanh tại vườn',
        icon: Sparkles,
        count: products.length,
        color: 'var(--primary)',
        bg: 'var(--primary-light)'
      }
    ];

    uniqueCatIds.forEach((catId) => {
      const meta = CATEGORY_META[catId] || {
        name: catId.charAt(0).toUpperCase() + catId.slice(1),
        desc: 'Sản phẩm tại vườn',
        icon: Sprout,
        color: 'var(--primary)',
        bg: 'var(--primary-light)'
      };
      const count = products.filter((p) => p.category === catId).length;
      if (count > 0) {
        list.push({
          id: catId,
          ...meta,
          count
        });
      }
    });

    return list;
  }, [products]);

  // Danh sách sản phẩm xem trước từ DB cho danh mục đang chọn (tối đa 6 sản phẩm)
  const previewProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    const activeList = hoveredCategory === 'all' 
      ? products 
      : products.filter((p) => p.category === hoveredCategory);
    
    return [...activeList]
      .sort((a, b) => {
        const rDiff = (b.rating || 0) - (a.rating || 0);
        if (Math.abs(rDiff) > 0.05) return rDiff;
        return (b.reviewsCount || 0) - (a.reviewsCount || 0);
      })
      .slice(0, 6);
  }, [products, hoveredCategory]);

  const currentCategoryObj = useMemo(() => {
    return activeCategories.find((c) => c.id === hoveredCategory) || activeCategories[0];
  }, [activeCategories, hoveredCategory]);

  const handleSelectCategoryAndNavigate = (catId) => {
    setIsPlantsMegaMenuOpen(false);
    setIsMobileDrawerOpen(false);
    if (onSelectCategory) {
      onSelectCategory(catId);
    }
    onNavigate('shop');
  };

  const handleSelectProductAndNavigate = (productId) => {
    setIsPlantsMegaMenuOpen(false);
    setIsMobileDrawerOpen(false);
    onNavigate('product-detail', productId);
  };

  const handleSearchTermAndNavigate = (term) => {
    setIsPlantsMegaMenuOpen(false);
    setIsMobileDrawerOpen(false);
    if (onSearchChange) onSearchChange(term);
    onNavigate('shop');
  };

  const handleLightFilterAndNavigate = (light) => {
    setIsPlantsMegaMenuOpen(false);
    setIsMobileDrawerOpen(false);
    if (onSelectLight) onSelectLight(light);
    onNavigate('shop');
  };

  const handleDifficultyFilterAndNavigate = (diff) => {
    setIsPlantsMegaMenuOpen(false);
    setIsMobileDrawerOpen(false);
    if (onSelectDifficulty) onSelectDifficulty(diff);
    onNavigate('shop');
  };

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
    <>
      <header className="header">
        <div className="container">
        <nav className="nav-container">
          {/* Logo & Mobile Hamburger */}
          <div className="nav-left" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button 
              type="button"
              className="nav-hamburger-btn"
              onClick={() => setIsMobileDrawerOpen(true)}
              aria-label="Mở menu điều hướng"
              title="Menu danh mục"
            >
              <Menu size={22} />
            </button>

            <a 
              href="/" 
              className="logo" 
              onClick={(e) => { 
                e.preventDefault(); 
                onNavigate('home'); 
              }}
              style={{ padding: 0 }}
            >
              <img 
                src={webLogo} 
                alt="Sen Xinh Garden" 
                style={{ height: '48px', width: 'auto', objectFit: 'contain' }} 
              />
            </a>
          </div>

          {/* Navigation links */}
          <ul className="nav-menu">
            <li>
              <a 
                href="/" 
                className={`nav-link ${currentRoute === 'home' ? 'active' : ''}`} 
                onClick={(e) => { e.preventDefault(); onNavigate('home'); }}
              >
                Trang Chủ
              </a>
            </li>

            {/* Tab: SẢN PHẨM with VietThuong-Style Mega Menu */}
            <li 
              className="nav-item-has-megamenu"
              ref={megaMenuRef}
              onMouseEnter={() => setIsPlantsMegaMenuOpen(true)}
              onMouseLeave={() => setIsPlantsMegaMenuOpen(false)}
            >
              <button 
                type="button"
                className={`nav-link nav-link-dropdown-trigger ${currentRoute === 'shop' || currentRoute === 'product-detail' || isPlantsMegaMenuOpen ? 'active' : ''}`} 
                onClick={(e) => {
                  e.preventDefault();
                  setIsPlantsMegaMenuOpen((prev) => !prev);
                }}
                aria-expanded={isPlantsMegaMenuOpen}
                aria-haspopup="true"
              >
                <span>SẢN PHẨM</span>
                <ChevronDown size={14} className={`nav-chevron ${isPlantsMegaMenuOpen ? 'open' : ''}`} />
              </button>

              {/* Dropdown Danh Mục Sản Phẩm Đơn Giản & Trực Quan Theo DB */}
              {isPlantsMegaMenuOpen && (
                <div className="plants-simple-menu" role="menu">
                  <div className="simple-menu-layout">
                    
                    {/* Cột Trái: Danh Mục Sen Đá Từ DB */}
                    <div className="simple-menu-categories">
                      <div className="simple-menu-section-label">DANH MỤC CÂY ({activeCategories.length - 1})</div>
                      <div className="simple-category-list">
                        {activeCategories.map((cat) => {
                          const IconComp = cat.icon;
                          const isHovered = hoveredCategory === cat.id;
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              className={`simple-category-btn ${isHovered ? 'active' : ''}`}
                              onMouseEnter={() => setHoveredCategory(cat.id)}
                              onClick={() => handleSelectCategoryAndNavigate(cat.id)}
                            >
                              <div className="simple-cat-btn-left">
                                <div className="simple-cat-icon-wrap" style={{ background: cat.bg, color: cat.color }}>
                                  <IconComp size={15} />
                                </div>
                                <span className="simple-cat-name">{cat.name}</span>
                              </div>
                              <span className="simple-cat-count">{cat.count}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Cột Phải: Sản Phẩm Thuần Trong DB */}
                    <div className="simple-menu-products">
                      <div className="simple-products-header">
                        <div className="simple-products-title">
                          <span>{currentCategoryObj?.name || 'Sản Phẩm'}</span>
                          <span className="simple-title-badge">
                            {previewProducts.length} cây nổi bật
                          </span>
                        </div>
                        <button 
                          type="button"
                          className="simple-view-all-link"
                          onClick={() => handleSelectCategoryAndNavigate(hoveredCategory)}
                        >
                          <span>Xem tất cả</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>

                      {previewProducts.length === 0 ? (
                        <div className="simple-empty-state">
                          <Sprout size={32} style={{ color: 'var(--text-light)', opacity: 0.6 }} />
                          <p>Chưa có sản phẩm nào trong danh mục này</p>
                        </div>
                      ) : (
                        <div className="simple-products-grid">
                          {previewProducts.map((p) => {
                            const pId = p.publicId || p.id;
                            return (
                              <div 
                                key={pId}
                                className="simple-product-card"
                                onClick={() => handleSelectProductAndNavigate(pId)}
                              >
                                <img 
                                  src={p.image} 
                                  alt={p.name} 
                                  className="simple-product-img" 
                                  loading="lazy"
                                />
                                <div className="simple-product-info">
                                  <div className="simple-product-name" title={p.name}>
                                    {p.name}
                                  </div>
                                  <div className="simple-product-meta">
                                    <span className="simple-product-price">
                                      {p.price?.toLocaleString('vi-VN')}₫
                                    </span>
                                    {p.rating && (
                                      <span className="simple-product-rating">
                                        ★ {p.rating}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Footer Link */}
                      <div className="simple-menu-footer">
                        <button
                          type="button"
                          className="simple-footer-btn"
                          onClick={() => handleSelectCategoryAndNavigate('all')}
                        >
                          <Sparkles size={14} />
                          <span>Khám phá trọn bộ {products.length} sản phẩm sen đá tại vườn</span>
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </li>

            <li>
              <a 
                href="/news" 
                className={`nav-link ${currentRoute === 'news' || currentRoute === 'news-detail' ? 'active' : ''}`} 
                onClick={(e) => { e.preventDefault(); onNavigate('news'); }}
              >
                Tin Tức & Cẩm Nang
              </a>
            </li>
            <li>
              <a 
                href="/policy" 
                className={`nav-link ${currentRoute === 'policy' ? 'active' : ''}`} 
                onClick={(e) => { e.preventDefault(); onNavigate('policy'); }}
              >
                Chính Sách
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

                      {/* Item 3: Đơn Hàng */}
                      <button 
                        id="menu-orders-btn"
                        className="user-menu-item"
                        onClick={() => handleMenuItemClick('orders')}
                      >
                        <div className="menu-item-icon"><Package size={17} /></div>
                        <span className="menu-item-label">Đơn Hàng Của Tôi</span>
                      </button>

                      {/* Item 4: Lịch Sử Mua Hàng */}
                      <button 
                        id="menu-history-btn"
                        className="user-menu-item"
                        onClick={() => handleMenuItemClick('history')}
                      >
                        <div className="menu-item-icon"><History size={17} /></div>
                        <span className="menu-item-label">Lịch Sử Mua Hàng</span>
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

    {/* Mobile Navigation Drawer & Backdrop - Mounted to document.body via Portal to prevent containment by header */}
    {typeof document !== 'undefined' && createPortal(
      <>
        <div 
          className={`mobile-nav-overlay ${isMobileDrawerOpen ? 'open' : ''}`}
        onClick={() => setIsMobileDrawerOpen(false)}
        aria-hidden="true"
      />

      <aside className={`mobile-nav-drawer ${isMobileDrawerOpen ? 'open' : ''}`} aria-hidden={!isMobileDrawerOpen}>
        <div className="mobile-nav-header">
          <img 
            src={webLogo} 
            alt="Sen Xinh Garden" 
            style={{ height: '38px', width: 'auto', objectFit: 'contain' }} 
          />
          <button 
            type="button"
            className="mobile-nav-close"
            onClick={() => setIsMobileDrawerOpen(false)}
            aria-label="Đóng menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search in Drawer */}
        <div className="mobile-nav-search">
          <form 
            className="mobile-search-form" 
            onSubmit={(e) => {
              handleSearchSubmit(e);
              setIsMobileDrawerOpen(false);
            }}
          >
            <Search size={16} style={{ color: 'var(--text-muted)' }} />
            <input 
              type="text"
              placeholder="Tìm sen đá, tiểu cảnh..."
              value={localSearch}
              onChange={(e) => {
                setLocalSearch(e.target.value);
                if (onSearchChange) onSearchChange(e.target.value);
              }}
            />
            {localSearch && (
              <button 
                type="button" 
                onClick={handleClearSearch}
                style={{ border: 'none', background: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <X size={14} />
              </button>
            )}
          </form>
        </div>

        {/* Links in Drawer */}
        <div className="mobile-nav-links">
          <button 
            type="button"
            className={`mobile-nav-item ${currentRoute === 'home' ? 'active' : ''}`}
            onClick={() => {
              setIsMobileDrawerOpen(false);
              onNavigate('home');
            }}
          >
            <Home size={18} />
            <span>Trang Chủ</span>
          </button>

          {/* Accordion: Sản Phẩm & Các Loại Sen */}
          <div className="mobile-accordion-section">
            <button 
              type="button"
              className={`mobile-nav-item ${currentRoute === 'shop' || isMobilePlantsOpen ? 'active' : ''}`}
              onClick={() => setIsMobilePlantsOpen(!isMobilePlantsOpen)}
              style={{ justifyContent: 'space-between' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Sprout size={18} color="var(--primary)" />
                <span style={{ fontWeight: 600 }}>Sản Phẩm & Các Loại Sen</span>
              </div>
              <ChevronDown size={16} style={{ transform: isMobilePlantsOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease', color: 'var(--text-muted)' }} />
            </button>

            {isMobilePlantsOpen && (
              <div className="mobile-plants-sublist">
                {activeCategories.map((cat) => {
                  const IconComp = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      className="mobile-plant-subitem"
                      onClick={() => handleSelectCategoryAndNavigate(cat.id)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: cat.bg, color: cat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <IconComp size={15} />
                        </div>
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-main)' }}>{cat.name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{cat.desc}</div>
                        </div>
                      </div>
                      {cat.count > 0 && <span className="mobile-nav-item-badge">{cat.count}</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button 
            type="button"
            className={`mobile-nav-item ${currentRoute === 'news' || currentRoute === 'news-detail' ? 'active' : ''}`}
            onClick={() => {
              setIsMobileDrawerOpen(false);
              onNavigate('news');
            }}
          >
            <Layers size={18} />
            <span>Tin Tức & Cẩm Nang</span>
          </button>

          <button 
            type="button"
            className={`mobile-nav-item ${currentRoute === 'policy' ? 'active' : ''}`}
            onClick={() => {
              setIsMobileDrawerOpen(false);
              onNavigate('policy');
            }}
          >
            <ShieldCheck size={18} />
            <span>Chính Sách Cửa Hàng</span>
          </button>

          <div className="mobile-nav-divider" />

          <button 
            type="button"
            className="mobile-nav-item"
            onClick={() => {
              setIsMobileDrawerOpen(false);
              if (onOpenWishlist) onOpenWishlist();
            }}
          >
            <Heart size={18} color="#E63946" />
            <span>Mục Yêu Thích</span>
            {wishlistCount > 0 && (
              <span className="mobile-nav-item-badge" style={{ background: '#E63946' }}>{wishlistCount}</span>
            )}
          </button>

          <button 
            type="button"
            className={`mobile-nav-item ${currentRoute === 'cart' ? 'active' : ''}`}
            onClick={() => {
              setIsMobileDrawerOpen(false);
              onNavigate('cart');
            }}
          >
            <ShoppingBag size={18} color="var(--primary)" />
            <span>Giỏ Hàng</span>
            {cartCount > 0 && (
              <span className="mobile-nav-item-badge">{cartCount}</span>
            )}
          </button>
        </div>
      </aside>
    </>,
    document.body
  )}
    </>
  );
}
