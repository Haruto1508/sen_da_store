import React, { useState, useEffect, useRef } from 'react';
import FilterBar from '../components/FilterBar';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function ShopPage({
  products,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  selectedLight,
  onSelectLight,
  selectedDifficulty,
  onSelectDifficulty,
  sortBy,
  onSortChange,
  onOpenProductDetail,
  onAddToCart,
  wishlist,
  onToggleWishlist,
  onlyWishlist,
  onSetOnlyWishlist,
  onNavigateHome
}) {
  // Pagination State: 10 products per page = exactly 2 lines of 5 products!
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const catalogAnchorRef = useRef(null);

  // Reset to page 1 whenever any filter or search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, selectedLight, selectedDifficulty, sortBy, onlyWishlist]);

  // Total products & pagination calculations
  const totalProducts = products.length;
  const totalPages = Math.ceil(totalProducts / itemsPerPage) || 1;

  // Make sure currentPage is valid
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalProducts);
  const displayedProducts = products.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    if (catalogAnchorRef.current) {
      catalogAnchorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="shop-page">
      {/* Breadcrumb & Header Banner */}
      <div className="page-header-banner">
        <div className="shop-container">
          <div className="breadcrumb">
            <button className="breadcrumb-link" onClick={onNavigateHome}>Trang Chủ</button>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Cửa Hàng</span>
            {onlyWishlist && (
              <>
                <span className="breadcrumb-separator">/</span>
                <span className="breadcrumb-current">Mục Yêu Thích</span>
              </>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginTop: '14px' }}>
            <div>
              <span className="section-subtitle" style={{ color: 'var(--accent)' }}>
                {onlyWishlist ? 'Danh Sách Đã Lưu' : 'Bộ Sưu Tập Thực Vật Phong Phú'}
              </span>
              <h1 className="page-title" style={{ fontSize: '2.5rem', marginTop: '4px' }}>
                {onlyWishlist ? 'Mầm Xanh Yêu Thích Của Bạn' : 'Cửa Hàng Sen Đá & Cây Phong Thủy'}
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '6px', maxWidth: '650px' }}>
                {onlyWishlist
                  ? 'Xem lại các chậu cây bạn đã lưu lại để tham khảo hoặc bổ sung vào giỏ hàng.'
                  : 'Khám phá hàng chục giống sen đá tuyển chọn với bố cục 5 cây mỗi dòng giúp bạn dễ dàng so sánh và chọn lựa.'}
              </p>
            </div>

            {onlyWishlist && (
              <button 
                className="btn-secondary" 
                onClick={() => onSetOnlyWishlist(false)}
                style={{ padding: '10px 18px', fontSize: '0.88rem' }}
              >
                <ArrowLeft size={16} />
                <span>Xem Tất Cả Cửa Hàng</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="shop-container" style={{ padding: '32px 24px 80px' }}>
        {/* Anchor for smooth scroll upon pagination */}
        <div ref={catalogAnchorRef} style={{ scrollMarginTop: '90px' }} />

        {/* Filter controls (if not onlyWishlist) */}
        {!onlyWishlist && (
          <FilterBar
            selectedCategory={selectedCategory}
            onSelectCategory={onSelectCategory}
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            selectedLight={selectedLight}
            onSelectLight={onSelectLight}
            selectedDifficulty={selectedDifficulty}
            onSelectDifficulty={onSelectDifficulty}
            sortBy={sortBy}
            onSortChange={onSortChange}
          />
        )}

        {/* Products Grid (5 products per line) */}
        {displayedProducts.length > 0 ? (
          <>
            <div className="product-grid-5">
              {displayedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpenDetail={() => onOpenProductDetail(product.id)}
                  onAddToCart={onAddToCart}
                  isWishlisted={wishlist.includes(product.id)}
                  onToggleWishlist={onToggleWishlist}
                />
              ))}
            </div>

            {/* Pagination Component */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalProducts}
              onPageChange={handlePageChange}
            />
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '70px 20px', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-light)' }}>
            <Sparkles size={40} style={{ color: 'var(--accent)', opacity: 0.5, marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>Không tìm thấy cây sen đá phù hợp</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '22px' }}>
              Hãy thử điều chỉnh từ khóa tìm kiếm hoặc chọn danh mục khác nhé!
            </p>
            <button
              className="btn-primary"
              onClick={() => {
                onSelectCategory('all');
                onSearchChange('');
                onSelectLight('all');
                onSelectDifficulty('all');
                if (onlyWishlist) onSetOnlyWishlist(false);
              }}
            >
              Xem Lại Tất Cả Sản Phẩm
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
