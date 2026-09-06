import React from 'react';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function HomePage({
  products,
  onOpenProductDetail,
  onAddToCart,
  wishlist,
  onToggleWishlist,
  onNavigateShop,
  onOpenQuiz
}) {
  const featuredProducts = products.slice(0, 5);

  return (
    <div className="home-page">
      {/* Hero Banner */}
      <Hero
        onExploreCatalog={onNavigateShop}
        onOpenQuiz={onOpenQuiz}
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
        </div>
      </section>

      {/* Plant Quiz Feature Banner */}
      <section style={{ background: 'var(--bg-alt)', padding: '70px 0' }}>
        <div className="container">
          <div style={{ 
            background: 'linear-gradient(135deg, #2D5A3F, #1E3F2B)', 
            color: '#fff', 
            borderRadius: 'var(--radius-xl)', 
            padding: '48px', 
            display: 'grid', 
            gridTemplateColumns: '1.2fr 0.8fr', 
            alignItems: 'center', 
            gap: '36px',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: 'var(--radius-full)', fontSize: '0.82rem', marginBottom: '16px' }}>
                <Sparkles size={16} color="#FBBF24" />
                <span>Trắc Nghiệm Tư Vấn Tự Động</span>
              </div>
              <h2 style={{ color: '#fff', fontSize: '2.4rem', marginBottom: '14px', lineHeight: 1.25 }}>
                Chưa Biết Chọn Cây Nào Cho Góc Làm Việc Của Bạn?
              </h2>
              <p style={{ color: '#D1E0D7', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '28px', maxWidth: '540px' }}>
                Chỉ mất 30 giây trả lời 3 câu hỏi nhanh về vị trí đặt chậu và thời gian rảnh của bạn, chúng tôi sẽ gợi ý ngay chậu sen đá sinh ra để dành cho bạn!
              </p>
              <button 
                className="btn-secondary" 
                style={{ background: '#fff', color: 'var(--primary)', border: 'none', padding: '14px 28px', fontSize: '1rem', fontWeight: 700 }}
                onClick={onOpenQuiz}
              >
                <span>Bắt Đầu Làm Trắc Nghiệm Ngay</span>
                <ArrowRight size={18} />
              </button>
            </div>

            <div style={{ textAlign: 'center' }}>
              <img 
                src="https://images.unsplash.com/photo-1463936575829-25148e1db1b8?auto=format&fit=crop&w=600&q=80" 
                alt="Plant Quiz" 
                style={{ width: '100%', maxWidth: '340px', borderRadius: 'var(--radius-lg)', boxShadow: '0 12px 30px rgba(0,0,0,0.3)', border: '4px solid rgba(255,255,255,0.2)' }}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
