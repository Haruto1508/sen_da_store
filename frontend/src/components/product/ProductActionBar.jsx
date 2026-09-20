import React from 'react';
import { ShoppingBag, Zap, Heart } from 'lucide-react';

export default function ProductActionBar({
  product,
  qty,
  onDecrease,
  onIncrease,
  onAddToCart,
  onBuyNow,
  formatPrice,
  isWishlisted,
  onToggleWishlist
}) {
  return (
    <div className="detail-action-bar">
      <div className="qty-control" style={{ padding: '4px' }}>
        <button className="qty-btn" onClick={onDecrease} aria-label="Giảm">
          -
        </button>
        <span
          className="qty-value"
          style={{ fontSize: '0.95rem', minWidth: '32px', textAlign: 'center' }}
        >
          {qty}
        </span>
        <button className="qty-btn" onClick={onIncrease} aria-label="Tăng">
          +
        </button>
      </div>

      <button
        className="btn-add-cart"
        onClick={() => onAddToCart(product, qty)}
        title="Thêm vào giỏ hàng để tiếp tục chọn thêm cây khác"
      >
        <ShoppingBag size={18} />
        <span>Thêm Vào Giỏ ({formatPrice(product.price * qty)})</span>
      </button>

      <button
        className="btn-buy-now"
        onClick={() => onBuyNow(product, qty)}
        title="Đặt mua ngay chậu sen đá này"
      >
        <Zap size={17} fill="#FFE082" color="#FFE082" className="zap-icon" />
        <span>Mua Ngay</span>
      </button>

      <button
        className={`icon-btn ${isWishlisted ? 'active' : ''}`}
        style={{ width: '44px', height: '44px' }}
        onClick={() => onToggleWishlist(product?.id || product?.publicId)}
        title={isWishlisted ? 'Bỏ khỏi yêu thích' : 'Lưu vào yêu thích'}
        aria-label="Yêu thích"
      >
        <Heart
          size={20}
          fill={isWishlisted ? '#E63946' : 'none'}
          color={isWishlisted ? '#E63946' : 'currentColor'}
        />
      </button>
    </div>
  );
}
