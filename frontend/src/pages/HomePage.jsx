import React from 'react';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import PlantFilterHub from '../components/PlantFilterHub';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function HomePage({
  products,
  onOpenProductDetail,
  onAddToCart,
  wishlist,
  onToggleWishlist,
  onNavigateShop,
  onApplyFilters
}) {
  const featuredProducts = products.slice(0, 5);

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
                    isWishlisted={wishlist.includes(product.id)}
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
      />
    </div>
  );
}
