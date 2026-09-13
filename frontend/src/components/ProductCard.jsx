import React from 'react';
import { Heart, Plus, Star, Sun, Droplets, Zap } from 'lucide-react';

export default function ProductCard({ 
  product, 
  onOpenDetail, 
  onAddToCart, 
  onBuyNow,
  isWishlisted, 
  onToggleWishlist 
}) {
  const formatPrice = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  const productId = product?.id || product?.publicId;

  return (
    <article className="product-card">
      {/* Image Container */}
      <div className="card-image-wrap" onClick={() => onOpenDetail && onOpenDetail(product)}>
        {product.badge && (
          <span className="card-badge">{product.badge}</span>
        )}

        <button 
          className={`card-wishlist-btn ${isWishlisted ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            if (onToggleWishlist) onToggleWishlist(productId);
          }}
          title={isWishlisted ? 'Bỏ khỏi yêu thích' : 'Thêm vào yêu thích'}
          aria-label="Yêu thích"
        >
          <Heart size={18} fill={isWishlisted ? '#E63946' : 'none'} color={isWishlisted ? '#E63946' : 'currentColor'} />
        </button>

        <img 
          src={product.image} 
          alt={product.name} 
          className="card-img"
          loading="lazy"
        />
      </div>

      {/* Card Content */}
      <div className="card-content">
        <div className="card-tags">
          <span className="tag-pill">
            <Sun size={12} />
            {product.lightType === 'indoor' ? 'Bàn làm việc' : product.lightType === 'indirect' ? 'Nắng dịu' : 'Nhiều nắng'}
          </span>
          <span className="tag-pill">
            <Droplets size={12} />
            {product.watering}
          </span>
        </div>

        <h3 className="card-title" onClick={() => onOpenDetail && onOpenDetail(product)}>
          {product.name}
        </h3>

        <p className="card-latin">{product.scientificName}</p>

        <div className="card-rating">
          <Star size={14} fill="#F59E0B" color="#F59E0B" />
          <span>{product.rating}</span>
          <span>({product.reviewsCount})</span>
        </div>

        <div className="card-footer">
          <div className="price-wrap">
            <span className="price-current">{formatPrice(product.price)}</span>
            {product.originalPrice > product.price && (
              <span className="price-original">{formatPrice(product.originalPrice)}</span>
            )}
          </div>

          <div className="card-actions-wrap" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              className="btn-add-cart"
              onClick={(e) => {
                e.stopPropagation();
                if (onAddToCart) onAddToCart(product, 1);
              }}
              title="Thêm vào giỏ hàng"
              aria-label="Thêm vào giỏ"
            >
              <Plus size={20} />
            </button>

            {onBuyNow && (
              <button 
                className="btn-quick-buy"
                onClick={(e) => {
                  e.stopPropagation();
                  onBuyNow(product, 1);
                }}
                title="Mua ngay chậu cây này"
                aria-label="Mua ngay"
              >
                <Zap size={14} fill="#FFE082" color="#FFE082" />
                <span>Mua</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
