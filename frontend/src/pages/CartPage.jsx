import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Plus,
  Minus,
  ShieldCheck,
  Truck,
  Tag,
  Check,
  X,
  AlertTriangle,
  Loader2,
  Leaf
} from "lucide-react";
import { getShippingConfig, fetchShippingConfig } from "../services/api";

export default function CartPage({
  cartItems = [],
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  discountCode = "",
  discountPercent = 0,
  onApplyCoupon,
  onRemoveCoupon,
  onNavigateShop,
  onNavigateCheckout,
  onNavigateHome,
  onOpenProductDetail
}) {
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);

  const formatPrice = (amount) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount || 0);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
  const discountAmount = Math.round(subtotal * (discountPercent / 100));

  const [shippingConfig, setShippingConfig] = useState(getShippingConfig());

  useEffect(() => {
    fetchShippingConfig().then((cfg) => {
      if (cfg) setShippingConfig(cfg);
    });
  }, []);

  const freeShippingThreshold = shippingConfig?.freeShippingThreshold || 200000;
  const freeShippingEnabled = shippingConfig?.freeShippingEnabled !== false;
  const defaultFee = shippingConfig?.defaultShippingFee || 35000;
  const isFreeShipping = (freeShippingEnabled && subtotal >= freeShippingThreshold) || subtotal === 0;
  const shippingFee = isFreeShipping ? 0 : defaultFee;
  const total = Math.max(0, subtotal - discountAmount + shippingFee);
  const progressPercent = freeShippingEnabled ? Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100)) : 100;
  const remainingForFreeShip = freeShippingEnabled ? Math.max(0, freeShippingThreshold - subtotal) : 0;
  const totalItemCount = cartItems.reduce((cnt, it) => cnt + it.quantity, 0);

  const hasUnavailableItem = cartItems.some(
    (item) => item.available === false || item.status === "DELETED" || item.status === "INACTIVE"
  );
  const hasOutOfStockItem = cartItems.some(
    (item) => (item.available !== false && item.status !== "DELETED") && item.inStock !== undefined && item.inStock <= 0
  );

  const handleApplyCouponSubmit = async (e) => {
    e.preventDefault();
    const cleanCode = couponInput.trim();
    if (!cleanCode || couponLoading) return;
    setCouponLoading(true);
    setCouponError("");
    setCouponSuccess(false);
    try {
      if (onApplyCoupon) {
        const res = await onApplyCoupon(cleanCode);
        if (res && (res.success || res === true)) {
          setCouponSuccess(true);
          setCouponInput("");
          setTimeout(() => setCouponSuccess(false), 4000);
        } else {
          setCouponError(res?.message || "Mã ưu đãi không hợp lệ. Thử SENXANH10 hoặc SENXANH20!");
        }
      }
    } catch (err) {
      setCouponError(err.message || "Lỗi kiểm tra mã ưu đãi");
    } finally {
      setCouponLoading(false);
    }
  };

  return (
    <div className="cart-page">
      <div className="page-header-banner">
        <div className="container">
          <div className="breadcrumb">
            <button className="breadcrumb-link" onClick={onNavigateHome}>Trang Chủ</button>
            <span className="breadcrumb-separator">/</span>
            <button className="breadcrumb-link" onClick={onNavigateShop}>Cửa Hàng</button>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Giỏ Hàng</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px", marginTop: "14px" }}>
            <div>
              <span className="section-subtitle" style={{ color: "var(--accent)" }}>Túi Mầm Xanh</span>
              <h1 className="page-title" style={{ fontSize: "1.65rem", marginTop: "4px" }}>
                Giỏ Hàng ({totalItemCount} sản phẩm)
              </h1>
            </div>
            {cartItems.length > 0 && (
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {onClearCart && (
                  <button className="btn-secondary" onClick={onClearCart} style={{ padding: "10px 18px", fontSize: "0.9rem", color: "#DC2626" }}>
                    <Trash2 size={16} /><span>Xóa Sạch</span>
                  </button>
                )}
                <button className="btn-secondary" onClick={onNavigateShop} style={{ padding: "10px 20px", fontSize: "0.9rem" }}>
                  <ArrowLeft size={16} /><span>Tiếp Tục Chọn Cây</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: "32px 24px 80px" }}>
        {cartItems.length === 0 ? (
          <div className="cx-empty">
            <div className="cx-empty-icon"><ShoppingBag size={48} /></div>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "12px" }}>Giỏ hàng đang trống</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "28px", lineHeight: 1.65 }}>
              Góc ban công hay bàn làm việc của bạn vẫn đang chờ một chậu sen đá đáng yêu! Hãy ghé thăm vườn cây Sen Xinh Garden để chọn ngay nhé.
            </p>
            <button className="btn-primary" onClick={onNavigateShop} style={{ padding: "14px 32px", fontSize: "1rem" }}>
              <span>Khám Phá Cửa Hàng</span><ArrowRight size={18} />
            </button>
          </div>
        ) : (
          <>
            <div className="cx-freeship">
              <div className="cx-freeship-top">
                <span className="cx-freeship-label">
                  <Truck size={18} color="var(--primary)" />
                  {remainingForFreeShip === 0
                    ? <span><strong>Tuyệt vời!</strong> Đơn hàng đủ điều kiện <strong>Miễn Phí Vận Chuyển</strong> toàn quốc!</span>
                    : <span>Mua thêm <strong style={{ color: "var(--primary)" }}>{formatPrice(remainingForFreeShip)}</strong> để nhận <strong>Miễn Phí Giao Hàng</strong>!</span>
                  }
                </span>
                <span className="cx-freeship-pct">{progressPercent}%</span>
              </div>
              <div className="cx-freeship-bar">
                <div className="cx-freeship-fill" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>

            <div className="cx-layout">
              <div className="cx-items-col">
                <div className="cx-items-head">
                  <span>Sản Phẩm</span>
                  <span>Đơn Giá</span>
                  <span>Số Lượng</span>
                  <span>Tạm Tính</span>
                  <span />
                </div>
                <div className="cx-items-list">
                  {cartItems.map((item, idx) => {
                    const isUnavailable = item.available === false || item.status === "DELETED" || item.status === "INACTIVE";
                    const isOutOfStock = !isUnavailable && item.inStock !== undefined && item.inStock <= 0;
                    const isLowStock = !isUnavailable && item.inStock !== undefined && item.inStock > 0 && item.inStock <= 5;
                    const maxAllowed = item.inStock !== undefined ? item.inStock : 999;
                    const isMaxReached = item.quantity >= maxAllowed;
                    return (
                      <div key={item.id}
                        className={`cx-item${isUnavailable ? " unavailable" : isOutOfStock ? " outofstock" : ""}`}
                        style={{ animationDelay: `${idx * 0.05}s` }}>
                        <div className="cx-item-info"
                          onClick={() => !isUnavailable && onOpenProductDetail && onOpenProductDetail(item.id)}>
                          <img src={item.image} alt={item.name} className="cx-item-img" />
                          <div style={{ minWidth: 0 }}>
                            <div className="cx-item-name">{item.name}</div>
                            {item.scientificName && <div className="cx-item-latin">{item.scientificName}</div>}
                            <div className="cx-item-price-mobile">{formatPrice(item.price)}</div>
                            {isUnavailable ? (
                              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px", flexWrap: "wrap" }}>
                                <span className="cx-item-status-badge error">
                                  <AlertTriangle size={12} /> {item.message || "Sản phẩm không còn kinh doanh"}
                                </span>
                                <button type="button"
                                  onClick={(e) => { e.stopPropagation(); onRemoveItem && onRemoveItem(item.id); }}
                                  style={{ fontSize: "0.76rem", color: "#DC2626", background: "transparent", border: "none", textDecoration: "underline", cursor: "pointer", fontWeight: 600 }}>
                                  [Xóa]
                                </button>
                              </div>
                            ) : item.inStock !== undefined && (
                              <div style={{ marginTop: "3px" }}>
                                {isOutOfStock && <span className="cx-item-status-badge error"><AlertTriangle size={12} /> Tạm hết hàng</span>}
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
                            <button className="cx-qty-btn"
                              onClick={() => onUpdateQty && onUpdateQty(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1 || isOutOfStock || isUnavailable} aria-label="Giảm">
                              <Minus size={14} />
                            </button>
                            <span className="cx-qty-val">{item.quantity}</span>
                            <button className="cx-qty-btn"
                              onClick={() => onUpdateQty && onUpdateQty(item.id, item.quantity + 1)}
                              disabled={isMaxReached || isOutOfStock || isUnavailable}
                              title={isMaxReached ? `Tối đa ${maxAllowed} cây` : "Tăng"} aria-label="Tăng">
                              <Plus size={14} />
                            </button>
                          </div>
                          {isMaxReached && !isOutOfStock && <span className="cx-qty-max">Tối đa kho</span>}
                        </div>
                        <div className="cx-item-total">{formatPrice(item.price * item.quantity)}</div>
                        <button className="cx-item-remove"
                          onClick={() => onRemoveItem && onRemoveItem(item.id)}
                          title="Xóa khỏi giỏ hàng" aria-label="Xóa">
                          <Trash2 size={17} />
                        </button>
                      </div>
                    );
                  })}
                </div>
                <div style={{ marginTop: "20px" }}>
                  <button className="btn-secondary" onClick={onNavigateShop} style={{ padding: "10px 20px", fontSize: "0.9rem" }}>
                    <ArrowLeft size={16} /><span>Tiếp Tục Chọn Cây Khác</span>
                  </button>
                </div>
              </div>

              <div className="cx-summary-col">
                <div className="cx-summary-card">
                  <div className="cx-summary-title">Tóm Tắt Đơn Hàng</div>
                  <form onSubmit={handleApplyCouponSubmit} className="cx-coupon-form">
                    <div className="cx-coupon-row">
                      <Tag size={16} className="cx-coupon-icon" />
                      <input type="text" className="cx-coupon-input" placeholder="Nhập mã ưu đãi..."
                        value={couponInput}
                        onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(""); }}
                        disabled={couponLoading} />
                      <button type="submit" className="cx-coupon-btn" disabled={couponLoading}>
                        {couponLoading ? <Loader2 size={14} className="animate-spin" /> : "Áp Dụng"}
                      </button>
                    </div>
                    {couponError && <p className="cx-coupon-msg-error">{couponError}</p>}
                    {couponSuccess && <p className="cx-coupon-msg-ok"><Check size={14} /> Đã áp dụng mã thành công!</p>}
                    {discountCode && (
                      <div className="cx-coupon-applied">
                        <span>Mã: <strong>{discountCode}</strong> (-{discountPercent}%)</span>
                        {onRemoveCoupon && (
                          <button type="button" className="cx-coupon-remove" onClick={onRemoveCoupon}><X size={15} /></button>
                        )}
                      </div>
                    )}
                  </form>
                  <div className="cx-summary-rows">
                    <div className="cx-summary-row">
                      <span>Tổng tiền hàng:</span><span>{formatPrice(subtotal)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="cx-summary-row discount">
                        <span>Giảm giá ({discountPercent}%):</span><span>-{formatPrice(discountAmount)}</span>
                      </div>
                    )}
                    <div className="cx-summary-row">
                      <span>Phí vận chuyển:</span>
                      <span>{isFreeShipping ? <strong style={{ color: "var(--primary)" }}>Miễn Phí</strong> : formatPrice(shippingFee)}</span>
                    </div>
                  </div>
                  <div className="cx-summary-sep" style={{ margin: "14px 0" }} />
                  <div className="cx-summary-total">
                    <span>Tổng thanh toán:</span>
                    <span className="cx-summary-total-price">{formatPrice(total)}</span>
                  </div>
                  <p className="cx-vat-note">(Đã bao gồm thuế GTGT nếu có)</p>
                  {hasUnavailableItem && (
                    <div className="cx-warning-box danger">
                      <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                      <span>Có sản phẩm không còn kinh doanh. Xóa trước khi thanh toán.</span>
                    </div>
                  )}
                  {!hasUnavailableItem && hasOutOfStockItem && (
                    <div className="cx-warning-box warn">
                      <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                      <span>Có sản phẩm hết hàng. Xóa trước khi thanh toán.</span>
                    </div>
                  )}
                  <button className="btn-primary" onClick={onNavigateCheckout}
                    disabled={hasUnavailableItem || hasOutOfStockItem || cartItems.length === 0}
                    style={{ width: "100%", padding: "16px 20px", fontSize: "1rem", fontWeight: 700, marginTop: "20px",
                      opacity: (hasUnavailableItem || hasOutOfStockItem) ? 0.6 : 1,
                      cursor: (hasUnavailableItem || hasOutOfStockItem) ? "not-allowed" : "pointer" }}>
                    <span>Tiến Hành Đặt Hàng</span><ArrowRight size={18} />
                  </button>
                  <div className="cx-trust">
                    <div className="cx-trust-item">
                      <div className="cx-trust-icon"><ShieldCheck size={16} /></div>
                      <span>Bảo hành hoàn tiền 100% nếu cây bị gãy hỏng</span>
                    </div>
                    <div className="cx-trust-item">
                      <div className="cx-trust-icon"><Truck size={16} /></div>
                      <span>Đóng gói chuyên dụng giữ ẩm bảo vệ bầu đất</span>
                    </div>
                    <div className="cx-trust-item">
                      <div className="cx-trust-icon"><Leaf size={16} /></div>
                      <span>Giao hàng toàn quốc 2-5 ngày làm việc</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}