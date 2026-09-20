import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  Share2 
} from 'lucide-react';
import ProductCard from '../components/ProductCard';

// Modular Product Detail Components
import ProductGuaranteeBox from '../components/product/ProductGuaranteeBox';
import ProductSpecsGrid from '../components/product/ProductSpecsGrid';
import ProductActionBar from '../components/product/ProductActionBar';

export default function ProductDetailPage({
  product,
  allProducts = [],
  onNavigateBack,
  onNavigateHome,
  onNavigateShop,
  onSelectProduct,
  onAddToCart,
  onBuyNow,
  isWishlisted,
  onToggleWishlist,
  wishlist = []
}) {
  const [qty, setQty] = useState(1);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!product) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2>Không tìm thấy sản phẩm</h2>
        <p style={{ color: 'var(--text-muted)', margin: '14px 0 24px' }}>
          Sản phẩm có thể đã ngừng kinh doanh hoặc đường dẫn không chính xác.
        </p>
        <button className="btn-primary" onClick={onNavigateShop}>
          Quay lại Cửa Hàng
        </button>
      </div>
    );
  }

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handleDecrease = () => {
    if (qty > 1) setQty(qty - 1);
  };

  const handleIncrease = () => {
    if (qty < (product.inStock || 99)) setQty(qty + 1);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Related products (same category or similar light)
  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id && (p.category === product.category || p.lightType === product.lightType))
    .slice(0, 3);

  return (
    <div className="product-detail-page">
      {/* Breadcrumb Navigation */}
      <div className="page-header-banner" style={{ padding: '24px 0' }}>
        <div className="container">
          <div className="breadcrumb">
            <button className="breadcrumb-link" onClick={onNavigateHome}>Trang Chủ</button>
            <span className="breadcrumb-separator">/</span>
            <button className="breadcrumb-link" onClick={onNavigateShop}>Cửa Hàng</button>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">{product.name}</span>
          </div>

          <div style={{ marginTop: '16px' }}>
            <button 
              className="btn-secondary" 
              onClick={onNavigateBack}
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              <ArrowLeft size={16} />
              <span>Quay Lại</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '36px 24px 80px' }}>
        {/* Main Product 2-Column Grid */}
        <div className="product-detail-layout">
          {/* Left Column: Image & Guarantees */}
          <div className="detail-media-column">
            <div className="detail-hero-image-wrap">
              {product.badge && (
                <span className="detail-badge-corner">{product.badge}</span>
              )}
              <img 
                src={product.image} 
                alt={product.name} 
                className="detail-hero-image"
              />
            </div>

            {/* Commitment Badges */}
            <ProductGuaranteeBox />
          </div>

          {/* Right Column: Information & Actions */}
          <div className="detail-info-column">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className="tag-pill" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 700, marginBottom: '8px' }}>
                  {product.category === 'haworthia' ? 'Sen Mọng Nước & Kim Cương' : product.category === 'echeveria' ? 'Sen Đài & Hoa Hồng' : 'Cây Cảnh Phong Thủy'}
                </span>
                <h1 style={{ fontSize: '1.75rem', margin: '4px 0 6px', lineHeight: 1.25 }}>
                  {product.name}
                </h1>
                <p style={{ fontStyle: 'italic', color: 'var(--text-light)', fontSize: '0.88rem', marginBottom: '12px' }}>
                  {product.scientificName}
                </p>
              </div>

              <button 
                className="icon-btn"
                onClick={handleShare}
                title="Sao chép liên kết"
                aria-label="Chia sẻ"
              >
                <Share2 size={16} />
              </button>
            </div>

            {/* Price & Discounts */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', margin: '10px 0 16px' }}>
              <span style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'Outfit, sans-serif' }}>
                {formatPrice(product.price)}
              </span>
              {product.originalPrice > product.price && (
                <span style={{ fontSize: '0.92rem', color: 'var(--text-light)', textDecoration: 'line-through' }}>
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              {product.originalPrice > product.price && (
                <span style={{ background: '#FEE2E2', color: '#DC2626', fontSize: '0.74rem', fontWeight: 700, padding: '2px 7px', borderRadius: '4px' }}>
                  Tiết kiệm {Math.round((1 - product.price / product.originalPrice) * 100)}%
                </span>
              )}
            </div>

            {/* Quick Specs Grid */}
            <ProductSpecsGrid product={product} />

            {/* Description */}
            <div style={{ margin: '24px 0' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>Mô tả sản phẩm</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '0.96rem' }}>
                {product.description}
              </p>
            </div>

            {/* Meaning Box */}
            {product.meaning && (
              <div className="detail-meaning-box">
                <Sparkles size={20} color="var(--accent)" />
                <div>
                  <strong>Ý Nghĩa Phong Thủy & Tinh Thần:</strong>
                  <p>{product.meaning}</p>
                </div>
              </div>
            )}

            {/* Care tips */}
            {product.careTips && product.careTips.length > 0 && (
              <div className="detail-care-accordion">
                <h4 style={{ fontSize: '1rem', color: 'var(--primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={18} />
                  <span>Hướng Dẫn Chăm Sóc Độc Quyền Từ Nhà Vườn:</span>
                </h4>
                <ul style={{ paddingLeft: '22px', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                  {product.careTips.map((tip, idx) => (
                    <li key={idx} style={{ marginBottom: '6px' }}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Purchasing Action Bar */}
            <ProductActionBar
              product={product}
              qty={qty}
              onDecrease={handleDecrease}
              onIncrease={handleIncrease}
              onAddToCart={onAddToCart}
              onBuyNow={onBuyNow}
              formatPrice={formatPrice}
              isWishlisted={isWishlisted}
              onToggleWishlist={onToggleWishlist}
            />

            {copiedLink && (
              <div style={{ color: 'var(--primary)', fontSize: '0.85rem', marginTop: '10px' }}>
                ✓ Đã sao chép liên kết sản phẩm vào bộ nhớ tạm!
              </div>
            )}
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div style={{ marginTop: '90px', borderTop: '1px solid var(--border-light)', paddingTop: '60px' }}>
            <div className="section-header" style={{ textAlign: 'left', marginBottom: '32px' }}>
              <span className="section-subtitle">Gợi Ý Thêm Cho Bạn</span>
              <h2 className="section-title">Các Mầm Sen Đá Tương Tự</h2>
            </div>

            <div className="product-grid">
              {relatedProducts.map((rel) => (
                <ProductCard
                  key={rel.id}
                  product={rel}
                  onOpenDetail={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    onSelectProduct(rel.id);
                  }}
                  onAddToCart={onAddToCart}
                  onBuyNow={onBuyNow}
                  isWishlisted={wishlist.some(wId => String(wId) === String(rel.id) || (rel.publicId && String(wId) === String(rel.publicId)))}
                  onToggleWishlist={onToggleWishlist}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
