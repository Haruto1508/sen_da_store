import React, { useState, useEffect } from 'react';
import { Heart, ShoppingBag, Trash2, Sparkles, ArrowRight } from 'lucide-react';
import { formatPrice } from './accountConstants';
import Pagination from '../Pagination';

export default function AccountWishlistTab({
  wishlistProducts = [],
  onNavigateShop,
  onOpenProductDetail,
  onAddToCart,
  onToggleWishlist
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const totalPages = Math.max(1, Math.ceil(wishlistProducts.length / itemsPerPage));

  // Tự động điều chỉnh trang nếu xóa bớt sản phẩm
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(Math.max(1, totalPages));
    }
  }, [totalPages, currentPage]);

  const pagedProducts = wishlistProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
          <>
            <div className="account-wishlist-grid">
              {pagedProducts.map((product) => (
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

            {/* Phân Trang (Pagination) */}
            {wishlistProducts.length > 0 && (
              <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={wishlistProducts.length}
                  onPageChange={(page) => {
                    setCurrentPage(page);
                    window.scrollTo({ top: 380, behavior: 'smooth' });
                  }}
                />
                <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                  Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, wishlistProducts.length)} trong tổng số {wishlistProducts.length} cây yêu thích
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
