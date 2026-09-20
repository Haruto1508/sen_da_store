import React from 'react';
import { Minus, Plus, Trash2, AlertTriangle } from 'lucide-react';

export default function CartItemRow({
  item,
  idx,
  formatPrice,
  onUpdateQty,
  onRemoveItem,
  onOpenProductDetail
}) {
  const isUnavailable = item.available === false || item.status === 'DELETED' || item.status === 'INACTIVE';
  const isOutOfStock = !isUnavailable && item.inStock !== undefined && item.inStock <= 0;
  const isLowStock = !isUnavailable && item.inStock !== undefined && item.inStock > 0 && item.inStock <= 5;
  const maxAllowed = item.inStock !== undefined ? item.inStock : 999;
  const isMaxReached = item.quantity >= maxAllowed;

  return (
    <div
      className={`cx-item${isUnavailable ? ' unavailable' : isOutOfStock ? ' outofstock' : ''}`}
      style={{ animationDelay: `${idx * 0.05}s` }}
    >
      <div
        className="cx-item-info"
        onClick={() => !isUnavailable && onOpenProductDetail && onOpenProductDetail(item.id)}
      >
        <img src={item.image} alt={item.name} className="cx-item-img" />
        <div style={{ minWidth: 0 }}>
          <div className="cx-item-name">{item.name}</div>
          {item.scientificName && <div className="cx-item-latin">{item.scientificName}</div>}
          <div className="cx-item-price-mobile">{formatPrice(item.price)}</div>

          {isUnavailable ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
              <span className="cx-item-status-badge error">
                <AlertTriangle size={12} /> {item.message || 'Sản phẩm không còn kinh doanh'}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveItem && onRemoveItem(item.id);
                }}
                style={{
                  fontSize: '0.76rem',
                  color: '#DC2626',
                  background: 'transparent',
                  border: 'none',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                [Xóa]
              </button>
            </div>
          ) : item.inStock !== undefined && (
            <div style={{ marginTop: '3px' }}>
              {isOutOfStock && (
                <span className="cx-item-status-badge error">
                  <AlertTriangle size={12} /> Tạm hết hàng
                </span>
              )}
              {isLowStock && <span className="cx-item-status-badge warn">Chỉ còn {item.inStock} cây</span>}
              {!isOutOfStock && !isLowStock && <span className="cx-item-status-badge info">Kho còn {item.inStock} cây</span>}
            </div>
          )}
        </div>
      </div>

      <div className="cx-item-unit">
        {formatPrice(item.price)}
        {item.originalPrice > item.price && <del>{formatPrice(item.originalPrice)}</del>}
      </div>

      <div className="cx-qty-wrap">
        <div className="cx-qty-control">
          <button
            className="cx-qty-btn"
            onClick={() => onUpdateQty && onUpdateQty(item.id, item.quantity - 1)}
            disabled={item.quantity <= 1 || isOutOfStock || isUnavailable}
            aria-label="Giảm"
          >
            <Minus size={14} />
          </button>
          <span className="cx-qty-val">{item.quantity}</span>
          <button
            className="cx-qty-btn"
            onClick={() => onUpdateQty && onUpdateQty(item.id, item.quantity + 1)}
            disabled={isMaxReached || isOutOfStock || isUnavailable}
            title={isMaxReached ? `Tối đa ${maxAllowed} cây` : 'Tăng'}
            aria-label="Tăng"
          >
            <Plus size={14} />
          </button>
        </div>
        {isMaxReached && !isOutOfStock && <span className="cx-qty-max">Tối đa kho</span>}
      </div>

      <div className="cx-item-total">{formatPrice(item.price * item.quantity)}</div>

      <button
        className="cx-item-remove"
        onClick={() => onRemoveItem && onRemoveItem(item.id)}
        title="Xóa khỏi giỏ hàng"
        aria-label="Xóa"
      >
        <Trash2 size={17} />
      </button>
    </div>
  );
}
