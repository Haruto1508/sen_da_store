import React, { useMemo } from 'react';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import PlantFilterHub from '../components/PlantFilterHub';
import { ArrowRight, Sparkles, Star, ShieldCheck, Award } from 'lucide-react';

export default function HomePage({
  products,
  onOpenProductDetail,
  onAddToCart,
  onBuyNow,
  wishlist,
  onToggleWishlist,
  onNavigateShop,
  onApplyFilters
}) {
  const featuredProducts = products.slice(0, 5);

  // Top các sản phẩm được đánh giá cao nhất
  const topRatedProducts = useMemo(() => {
    return [...products]
      .filter((p) => p.status !== 'DELETED')
      .sort((a, b) => {
        const ratingDiff = (b.rating || 0) - (a.rating || 0);
        if (Math.abs(ratingDiff) > 0.05) return ratingDiff;
        return (b.reviewsCount || 0) - (a.reviewsCount || 0);
      })
      .slice(0, 4);
  }, [products]);

  const handleScrollToFilter = () => {
    const el = document.getElementById('plant-filter-hub');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else if (onNavigateShop) {
      onNavigateShop();
    }
  };

  const handleApplyFiltersFromHub = (filterObj) => {
    if (onApplyFilters) {
      onApplyFilters(filterObj);
    } else if (onNavigateShop) {
      onNavigateShop();
    }
  };

  return (
    <div className="home-page">
      {/* Hero Banner */}
      <Hero
        onExploreCatalog={onNavigateShop}
        onOpenFilter={handleScrollToFilter}
      />

      {/* Top Rated Products Section */}
      {topRatedProducts.length > 0 && (
        <section className="top-rated-section">
          <div className="shop-container">
            {/* Trust Badges Banner */}
            <div className="top-rated-trust-badges">
              <div className="trust-badge-item">
                <div className="trust-badge-icon-box" style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--primary)' }}>
                  <Award size={22} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 700 }}>Đánh Giá Hài Lòng 98.6%</h4>
                  <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Hàng ngàn phản hồi 5 sao từ khách hàng</p>
                </div>
              </div>

              <div className="trust-badge-item">
                <div className="trust-badge-icon-box" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#F59E0B' }}>
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 700 }}>Bảo Hành Cây Sống Khỏe</h4>
                  <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cam kết đổi bù 1-1 nếu cây dập úng khi giao</p>
                </div>
              </div>

              <div className="trust-badge-item">
                <div className="trust-badge-icon-box" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#3B82F6' }}>
                  <Star size={22} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 700 }}>Thuần Dưỡng Khí Hậu Chuẩn</h4>
                  <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sen đá quen nắng gió, cực dễ chăm tại nhà</p>
                </div>
              </div>
            </div>

            {/* Section Header */}
            <div className="section-header" style={{ marginBottom: '36px' }}>
              <span className="section-subtitle" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Star size={14} fill="currentColor" />
                <span>Khách Hàng Bình Chọn</span>
              </span>
              <h2 className="section-title">⭐ Những Mầm Sen Đá Được Đánh Giá Cao Nhất</h2>
              <p className="section-desc">
                Tuyển tập những giống sen đá nhận được cơn mưa lời khen về độ tươi khỏe, dáng hình chuẩn và sức sống dẻo dai.
              </p>
            </div>

            {/* Top Rated Product Grid */}
            <div className="top-rated-grid">
              {topRatedProducts.map((product, idx) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  rank={idx + 1}
                  onOpenDetail={() => onOpenProductDetail(product.id)}
                  onAddToCart={onAddToCart}
                  onBuyNow={onBuyNow}
                  isWishlisted={wishlist.some(wId => String(wId) === String(product.id) || (product.publicId && String(wId) === String(product.publicId)))}
                  onToggleWishlist={onToggleWishlist}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products Section */}
      <section className="catalog-section" style={{ padding: '60px 0 80px' }}>
        <div className="shop-container">
          <div className="section-header">
            <span className="section-subtitle">Tuyển Chọn Hàng Đầu</span>
            <h2 className="section-title">Những Mầm Xanh Được Yêu Thích Nhất</h2>
            <p className="section-desc">
              Các giống sen đá khỏe mạnh, thuần dưỡng tốt và dễ chăm sóc nhất cho bàn làm việc và ban công.
            </p>
          </div>

          {products.length > 0 ? (
            <>
              <div className="product-grid-5">
                {featuredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onOpenDetail={() => onOpenProductDetail(product.id)}
                    onAddToCart={onAddToCart}
                    onBuyNow={onBuyNow}
                    isWishlisted={wishlist.some(wId => String(wId) === String(product.id) || (product.publicId && String(wId) === String(product.publicId)))}
                    onToggleWishlist={onToggleWishlist}
                  />
                ))}
              </div>

              <div style={{ textAlign: 'center', marginTop: '48px' }}>
                <button 
                  className="btn-primary" 
                  onClick={onNavigateShop}
                  style={{ padding: '14px 32px', fontSize: '1rem' }}
                >
                  <span>Xem Toàn Bộ Cửa Hàng ({products.length} Cây)</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '50px 20px',
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px dashed var(--border-light)',
              maxWidth: '560px',
              margin: '0 auto'
            }}>
              <Sparkles size={40} style={{ color: 'var(--accent)', opacity: 0.6, marginBottom: '12px' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>
                Hiện chưa có sản phẩm nào
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '20px', lineHeight: 1.6 }}>
                Vườn ươm đang chuẩn bị các mầm xanh mới. Hãy ghé lại sau hoặc khám phá bài viết chăm sóc sen đá nhé!
              </p>
              <button className="btn-secondary" onClick={onNavigateShop} style={{ padding: '10px 22px' }}>
                <span>Khám Phá Cửa Hàng</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Interactive Plant Search & Filter Hub Section (Replaces Quiz) */}
      <PlantFilterHub
        products={products}
        onApplyFilters={handleApplyFiltersFromHub}
        onOpenProductDetail={onOpenProductDetail}
        onAddToCart={onAddToCart}
        onBuyNow={onBuyNow}
      />
    </div>
  );
}
