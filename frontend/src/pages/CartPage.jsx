import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  ArrowLeft
} from "lucide-react";
import { getShippingConfig, fetchShippingConfig } from "../services/api";
import { formatPrice } from "../utils/formatters";


import CartFreeShippingBar from "../components/cart/CartFreeShippingBar";
import CartItemRow from "../components/cart/CartItemRow";
import CartSummaryCard from "../components/cart/CartSummaryCard";

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
  onNavigateAccount,
  onOpenProductDetail
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const isFromAccount = location.state?.from === 'account';
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);

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
            {isFromAccount ? (
              <>
                <button 
                  className="breadcrumb-link" 
                  onClick={() => (onNavigateAccount ? onNavigateAccount() : navigate('/account'))}
                >
                  Tài Khoản Của Tôi
                </button>
                <span className="breadcrumb-separator">/</span>
              </>
            ) : (
              <>
                <button className="breadcrumb-link" onClick={onNavigateShop}>Cửa Hàng</button>
                <span className="breadcrumb-separator">/</span>
              </>
            )}
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

      <div className="container page-body-container">
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
            <CartFreeShippingBar
              remainingForFreeShip={remainingForFreeShip}
              progressPercent={progressPercent}
              formatPrice={formatPrice}
            />

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
                  {cartItems.map((item, idx) => (
                    <CartItemRow
                      key={item.id}
                      item={item}
                      idx={idx}
                      formatPrice={formatPrice}
                      onUpdateQty={onUpdateQty}
                      onRemoveItem={onRemoveItem}
                      onOpenProductDetail={onOpenProductDetail}
                    />
                  ))}
                </div>
                <div style={{ marginTop: "20px" }}>
                  <button className="btn-secondary" onClick={onNavigateShop} style={{ padding: "10px 20px", fontSize: "0.9rem" }}>
                    <ArrowLeft size={16} /><span>Tiếp Tục Chọn Cây Khác</span>
                  </button>
                </div>
              </div>

              <CartSummaryCard
                couponInput={couponInput}
                setCouponInput={setCouponInput}
                couponError={couponError}
                setCouponError={setCouponError}
                couponSuccess={couponSuccess}
                couponLoading={couponLoading}
                handleApplyCouponSubmit={handleApplyCouponSubmit}
                discountCode={discountCode}
                discountPercent={discountPercent}
                onRemoveCoupon={onRemoveCoupon}
                formatPrice={formatPrice}
                subtotal={subtotal}
                discountAmount={discountAmount}
                isFreeShipping={isFreeShipping}
                shippingFee={shippingFee}
                total={total}
                hasUnavailableItem={hasUnavailableItem}
                hasOutOfStockItem={hasOutOfStockItem}
                cartItems={cartItems}
                onNavigateCheckout={onNavigateCheckout}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}