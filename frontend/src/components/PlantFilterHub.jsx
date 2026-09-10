import React, { useState, useMemo } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  ArrowRight, 
  RotateCcw, 
  Sun, 
  Sprout, 
  Sparkles, 
  Layers,
  Check,
  ShoppingBag
} from 'lucide-react';
import { CATEGORIES } from '../data/products';

const QUICK_TAGS = [
  { label: '🌿 Sen Kim Cương', query: 'kim cương', category: 'all', light: 'indirect', difficulty: 'all' },
  { label: '🌹 Sen Đài Hoa Hồng', query: '', category: 'echeveria', light: 'all', difficulty: 'all' },
  { label: '🪴 Để Bàn Làm Việc', query: '', category: 'all', light: 'indoor', difficulty: 'easy' },
  { label: '✨ Cực Dễ Trồng', query: '', category: 'all', light: 'all', difficulty: 'easy' },
  { label: '🌵 Xương Rồng May Mắn', query: '', category: 'cactus', light: 'all', difficulty: 'all' },
  { label: '🎁 Combo Quà Tặng', query: '', category: 'combo', light: 'all', difficulty: 'all' }
];

export default function PlantFilterHub({
  products = [],
  onApplyFilters,
  onOpenProductDetail,
  onAddToCart,
  initialCategory = 'all',
  initialLight = 'all',
  initialDifficulty = 'all'
}) {
  const [localSearch, setLocalSearch] = useState('');
  const [localCategory, setLocalCategory] = useState(initialCategory);
  const [localLight, setLocalLight] = useState(initialLight);
  const [localDifficulty, setLocalDifficulty] = useState(initialDifficulty);

  // Dynamic matching items calculation
  const matchingProducts = useMemo(() => {
    return products.filter((item) => {
      // Category filter
      if (localCategory !== 'all' && item.category !== localCategory) return false;

      // Search query filter
      if (localSearch.trim()) {
        const q = localSearch.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesSci = (item.scientificName || '').toLowerCase().includes(q);
        const matchesDesc = (item.description || '').toLowerCase().includes(q);
        if (!matchesName && !matchesSci && !matchesDesc) return false;
      }

      // Light filter
      if (localLight !== 'all' && item.lightType !== localLight) return false;

      // Difficulty filter
      if (localDifficulty === 'easy' && item.difficultyLevel !== 1) return false;
      if (localDifficulty === 'medium' && item.difficultyLevel < 2) return false;

      return true;
    });
  }, [products, localSearch, localCategory, localLight, localDifficulty]);

  const hasActiveFilters = localSearch.trim() !== '' || localCategory !== 'all' || localLight !== 'all' || localDifficulty !== 'all';

  const handleReset = () => {
    setLocalSearch('');
    setLocalCategory('all');
    setLocalLight('all');
    setLocalDifficulty('all');
  };

  const handleQuickTagClick = (tag) => {
    setLocalSearch(tag.query);
    setLocalCategory(tag.category);
    setLocalLight(tag.light);
    setLocalDifficulty(tag.difficulty);
  };

  const handleApply = () => {
    if (onApplyFilters) {
      onApplyFilters({
        category: localCategory,
        searchQuery: localSearch,
        light: localLight,
        difficulty: localDifficulty
      });
    }
  };

  return (
    <section id="plant-filter-hub" className="plant-filter-hub-section">
      <div className="container">
        <div className="plant-filter-card">
          {/* Header */}
          <div className="filter-hub-header">
            <div className="filter-hub-badge">
              <SlidersHorizontal size={15} color="var(--accent)" />
              <span>Bộ Lọc & Tìm Kiếm Sen Đá Nhanh</span>
            </div>
            <h2 className="filter-hub-title">
              Tìm Chậu Cây Hoàn Hảo Cho Không Gian Của Bạn
            </h2>
            <p className="filter-hub-desc">
              Dễ dàng lọc theo vị trí đặt chậu (trong nhà, bàn làm việc, ban công), mức độ chăm sóc hoặc tìm kiếm theo tên các loài sen đá yêu thích!
            </p>
          </div>

          {/* Search Input Bar */}
          <div className="filter-hub-search-row">
            <div className="hub-search-box">
              <Search size={20} className="hub-search-icon" />
              <input 
                type="text"
                placeholder="Nhập tên cây, đặc tính (ví dụ: kim cương, móng rồng, đài hồng...)"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleApply();
                }}
              />
              {localSearch && (
                <button 
                  type="button" 
                  className="hub-clear-search-btn"
                  onClick={() => setLocalSearch('')}
                  title="Xóa tìm kiếm"
                >
                  ✕
                </button>
              )}
            </div>

            <button 
              className="btn-primary hub-search-submit-btn" 
              onClick={handleApply}
              title="Tìm kiếm ngay"
            >
              <Search size={18} />
              <span>Tìm Kiếm ({matchingProducts.length})</span>
            </button>
          </div>

          {/* Quick Tag Pills */}
          <div className="filter-hub-tags-row">
            <span className="hub-tags-label">Gợi ý nhanh:</span>
            <div className="hub-tags-list">
              {QUICK_TAGS.map((tag, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="hub-tag-pill"
                  onClick={() => handleQuickTagClick(tag)}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Dropdown Selectors */}
          <div className="filter-hub-selectors-grid">
            {/* Category */}
            <div className="hub-select-group">
              <label>
                <Layers size={15} color="var(--primary)" />
                <span>Danh Mục Cây</span>
              </label>
              <select 
                value={localCategory} 
                onChange={(e) => setLocalCategory(e.target.value)}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Light / Location */}
            <div className="hub-select-group">
              <label>
                <Sun size={15} color="#D97706" />
                <span>Vị Trí & Ánh Sáng</span>
              </label>
              <select 
                value={localLight} 
                onChange={(e) => setLocalLight(e.target.value)}
              >
                <option value="all">Mọi loại ánh sáng</option>
                <option value="indoor">Bàn làm việc / Trong nhà</option>
                <option value="indirect">Nắng tán xạ / Nắng dịu</option>
                <option value="full_sun">Nhiều nắng trực tiếp ngoài trời</option>
              </select>
            </div>

            {/* Difficulty */}
            <div className="hub-select-group">
              <label>
                <Sprout size={15} color="var(--moss)" />
                <span>Mức Độ Chăm Sóc</span>
              </label>
              <select 
                value={localDifficulty} 
                onChange={(e) => setLocalDifficulty(e.target.value)}
              >
                <option value="all">Mọi cấp độ chăm sóc</option>
                <option value="easy">Cực dễ cho người mới bắt đầu</option>
                <option value="medium">Cần chú ý lượng nước một chút</option>
              </select>
            </div>
          </div>

          {/* Preview Results Header & Reset */}
          <div className="filter-hub-results-bar">
            <div className="hub-results-count">
              <span>Đang hiển thị <strong>{matchingProducts.length}</strong> cây phù hợp với tiêu chí của bạn</span>
            </div>
            {hasActiveFilters && (
              <button className="hub-reset-btn" onClick={handleReset} title="Xóa tất cả tiêu chí lọc">
                <RotateCcw size={14} />
                <span>Đặt Lại Bộ Lọc</span>
              </button>
            )}
          </div>

          {/* Live Preview Cards Grid (Top 4 matching products) */}
          {matchingProducts.length > 0 ? (
            <div className="hub-preview-grid">
              {matchingProducts.slice(0, 4).map((plant) => (
                <div key={plant.id} className="hub-preview-card" onClick={() => onOpenProductDetail && onOpenProductDetail(plant.id)}>
                  <div className="hub-preview-img-box">
                    <img src={plant.image} alt={plant.name} loading="lazy" />
                    {plant.badge && <span className="hub-card-badge">{plant.badge}</span>}
                  </div>
                  <div className="hub-preview-body">
                    <h4 className="hub-preview-name">{plant.name}</h4>
                    <p className="hub-preview-meta">
                      {plant.lightType === 'indoor' ? '🪴 Trong nhà' : plant.lightType === 'full_sun' ? '☀️ Ưa nắng' : '🌤️ Nắng dịu'} • {plant.difficultyLevel === 1 ? 'Dễ chăm' : 'Trung bình'}
                    </p>
                    <div className="hub-preview-price-row">
                      <span className="hub-preview-price">{(plant.price || 0).toLocaleString('vi-VN')}₫</span>
                      <button 
                        className="hub-add-cart-btn"
                        title="Thêm vào giỏ hàng"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onAddToCart) onAddToCart(plant, 1);
                        }}
                      >
                        <ShoppingBag size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="hub-no-results">
              <p>Không có cây sen đá nào khớp hoàn toàn với các bộ lọc bạn đã chọn.</p>
              <button className="btn-secondary" onClick={handleReset} style={{ padding: '8px 18px', fontSize: '0.88rem' }}>
                Xóa bộ lọc để xem toàn bộ cây
              </button>
            </div>
          )}

          {/* Bottom Action Footer */}
          <div className="filter-hub-footer">
            <button className="btn-primary hub-explore-all-btn" onClick={handleApply}>
              <span>Khám Phá Tất Cả {matchingProducts.length} Cây Trong Cửa Hàng</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
