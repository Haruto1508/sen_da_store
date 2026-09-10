import React from 'react';
import { 
  Sparkles, 
  Flower2, 
  Gem, 
  Sun, 
  Gift, 
  Layers, 
  Search,
  SlidersHorizontal,
  RotateCcw
} from 'lucide-react';
import { CATEGORIES } from '../data/products';

const ICON_MAP = {
  Sparkles: Sparkles,
  Flower2: Flower2,
  Gem: Gem,
  Sun: Sun,
  Gift: Gift,
  Layers: Layers
};

export default function FilterBar({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  selectedLight,
  onSelectLight,
  selectedDifficulty,
  onSelectDifficulty,
  sortBy,
  onSortChange
}) {
  return (
    <div className="filter-bar">
      {/* Category Tabs */}
      <div className="category-tabs">
        {CATEGORIES.map((cat) => {
          const IconComp = ICON_MAP[cat.icon] || Sparkles;
          const isActive = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              className={`cat-tab ${isActive ? 'active' : ''}`}
              onClick={() => onSelectCategory(cat.id)}
            >
              <IconComp size={16} />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Search and Dropdown Controls */}
      <div className="filter-controls">
        {/* Search Box */}
        <div className="search-box">
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Tìm tên sen đá, tên khoa học..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button 
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-light)', fontSize: '0.8rem' }}
              onClick={() => onSearchChange('')}
            >
              ✕
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="dropdown-filters">
          {/* Light Filter */}
          <select 
            className="select-filter"
            value={selectedLight}
            onChange={(e) => onSelectLight(e.target.value)}
            aria-label="Lọc theo ánh sáng"
          >
            <option value="all">Mọi loại ánh sáng</option>
            <option value="indoor">Bàn làm việc / Trong nhà</option>
            <option value="indirect">Nắng tán xạ / Nắng dịu</option>
            <option value="full_sun">Nhiều nắng trực tiếp</option>
          </select>

          {/* Difficulty Filter */}
          <select 
            className="select-filter"
            value={selectedDifficulty}
            onChange={(e) => onSelectDifficulty(e.target.value)}
            aria-label="Lọc theo độ khó chăm sóc"
          >
            <option value="all">Mọi cấp độ chăm sóc</option>
            <option value="easy">Cực dễ cho người mới</option>
            <option value="medium">Cần kinh nghiệm một chút</option>
          </select>

          {/* Sort By */}
          <select 
            className="select-filter"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            aria-label="Sắp xếp sản phẩm"
          >
            <option value="featured">Nổi bật nhất</option>
            <option value="price-asc">Giá: Thấp đến Cao</option>
            <option value="price-desc">Giá: Cao đến Thấp</option>
            <option value="rating">Đánh giá cao nhất</option>
          </select>

          {/* Quick Reset Filter Button */}
          {(selectedCategory !== 'all' || searchQuery || selectedLight !== 'all' || selectedDifficulty !== 'all') && (
            <button
              type="button"
              className="btn-filter-reset"
              onClick={() => {
                onSelectCategory('all');
                onSearchChange('');
                onSelectLight('all');
                onSelectDifficulty('all');
              }}
              title="Xóa tất cả bộ lọc và từ khóa tìm kiếm"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px dashed var(--accent)',
                background: 'rgba(217, 119, 87, 0.08)',
                color: 'var(--accent)',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <RotateCcw size={14} />
              <span>Đặt Lại</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
