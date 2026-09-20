import React from 'react';
import { Heart, ShoppingBag, Trash2, Sparkles, ArrowRight } from 'lucide-react';
import { formatPrice } from './accountConstants';

export default function AccountWishlistTab({
  wishlistProducts,
  onNavigateShop,
  onOpenProductDetail,
  onAddToCart,
  onToggleWishlist
}) {
  return (
    <div className="account-tab-content">
      <div className="account-card">
        <div className="account-card-header" style={{ marginBottom: '24px' }}>
          <div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Mục Yêu Thích Của Bạn</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '2px' }}>
              Các chậu sen đá và phụ kiện bạn đã lưu lại để theo dõi
            </p>
          </div>

          <button 
            className="btn-secondary" 
            onClick={onNavigateShop}
            style={{ padding: '8px 16px', fontSize: '0.88rem' }}
          >
            <span>Xem Thêm Cây Khác</span>
            <ArrowRight size={15} />
          </button>
        </div>

        {(!wishlistProducts || wishlistProducts.length === 0) ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-main)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-light)' }}>
            <Heart size={48} style={{ opacity: 0.3, color: '#DC2626', marginBottom: '14px' }} />
            <h4 style={{ fontSize: '1.2rem', marginBottom: '6px' }}>Danh Sách Yêu Thích Trống</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '440px', margin: '0 auto 20px' }}>
              Bạn chưa thêm chậu sen đá nào vào mục yêu thích. Nhấn vào biểu tượng trái tim khi xem cây để lưu lại nhé!
            </p>
            <button className="btn-primary" onClick={onNavigateShop} style={{ padding: '12px 28px' }}>
              <Sparkles size={16} />
              <span>Khám Phá Cây Ngay</span>
            </button>
          </div>
        ) : (
          <div className="account-wishlist-grid">
            {wishlistProducts.map((product) => (
              <div key={product.id} className="wishlist-item-card">
                <div 
                  className="wishlist-thumb-wrap" 
                  onClick={() => onOpenProductDetail && onOpenProductDetail(product.id)}
                >
                  <img src={product.image} alt={product.name} className="wishlist-thumb" />
                  <span className="wishlist-cat-badge">{product.category}</span>
                </div>

                <div className="wishlist-item-info">
                  <h4 onClick={() => onOpenProductDetail && onOpenProductDetail(product.id)}>
                    {product.name}
                  </h4>
                  <p className="wishlist-item-price">{formatPrice(product.price)}</p>

                  <div className="wishlist-actions">
                    <button 
                      className="btn-primary" 
                      onClick={() => onAddToCart && onAddToCart(product, 1)}
                      style={{ padding: '8px 14px', fontSize: '0.84rem' }}
                    >
                      <ShoppingBag size={15} />
                      <span>Thêm Vào Giỏ</span>
                    </button>

                    <button 
                      className="icon-btn-danger" 
                      onClick={() => onToggleWishlist && onToggleWishlist(product.id)}
                      title="Bỏ thích"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
