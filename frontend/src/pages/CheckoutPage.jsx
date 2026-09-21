import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  createOrder, 
  lookupOrder, 
  checkOrderStatus,
  getShippingConfig,
  fetchShippingConfig
} from '../services/api';
import useModal from '../hooks/useModal';
import { formatPrice } from '../utils/formatters';
import NotificationModal from '../components/NotificationModal';

// Modular Checkout Components
import CheckoutOrderCompleted from '../components/checkout/CheckoutOrderCompleted';
import CheckoutCustomerForm from '../components/checkout/CheckoutCustomerForm';
import CheckoutPaymentMethods from '../components/checkout/CheckoutPaymentMethods';
import CheckoutOrderSummary from '../components/checkout/CheckoutOrderSummary';

export default function CheckoutPage({
  user,
  cartItems = [],
  discountCode = '',
  discountPercent = 0,
  onOrderSuccess,
  onClearCart,
  onNavigateHome,
  onNavigateShop,
  onNavigateCart,
  onNavigateAdmin,
  initialOrderCode = null
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const directBuyItem = location.state?.buyNowItem || location.state?.directBuyItem;
  const isDirectBuy = Boolean(directBuyItem);
  const checkoutItems = isDirectBuy ? [directBuyItem] : (cartItems || []);
  const isAdmin = Boolean(
    user && (user.role?.toLowerCase().includes('admin') || user.email === 'admin@senxinh.vn')
  );

  // Notification Modal
  const { modalProps, showModal } = useModal();

  const detectCity = (addr) => {
    if (!addr) return 'Hà Nội';
    if (addr.includes('Hồ Chí Minh') || addr.includes('TP.HCM') || addr.includes('Sài Gòn')) return 'TP. Hồ Chí Minh';
    if (addr.includes('Đà Lạt') || addr.includes('Lâm Đồng')) return 'Đà Lạt';
    if (addr.includes('Đà Nẵng')) return 'Đà Nẵng';
    if (addr.includes('Hải Phòng')) return 'Hải Phòng';
    if (addr.includes('Cần Thơ')) return 'Cần Thơ';
    if (addr.includes('Hà Nội')) return 'Hà Nội';
    return 'Hà Nội';
  };

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: detectCity(user?.address),
    paymentMethod: 'vietqr', // 'vietqr' | 'cod'
    note: ''
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || prev.name || '',
        phone: user.phone || prev.phone || '',
        address: user.address || prev.address || '',
        city: detectCity(user.address) || prev.city
      }));
    }
  }, [user]);

  const [copiedKey, setCopiedKey] = useState('');
  const [isCompleted, setIsCompleted] = useState(Boolean(initialOrderCode));
  const [orderCode, setOrderCode] = useState(initialOrderCode || '');
  const [placedOrder, setPlacedOrder] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [vietQrData, setVietQrData] = useState(null);
  const [orderStatus, setOrderStatus] = useState('PENDING');
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);

  useEffect(() => {
    if (initialOrderCode) {
      setIsCompleted(true);
      setOrderCode(initialOrderCode);
      lookupOrder(initialOrderCode)
        .then((ord) => {
          if (ord) {
            setPlacedOrder(ord);
            if (ord.status) setOrderStatus(ord.status);
          }
        })
        .catch(() => {});
    }
  }, [initialOrderCode]);

  const subtotal = checkoutItems.reduce((sum, item) => sum + (item?.price || 0) * (item?.quantity || 1), 0);

  const discountAmount = Math.round(subtotal * (discountPercent / 100));

  const [shippingConfig, setShippingConfig] = useState(getShippingConfig());

  useEffect(() => {
    fetchShippingConfig().then((cfg) => {
      if (cfg) setShippingConfig(cfg);
    });
  }, []);

  const freeShippingThreshold = shippingConfig?.freeShippingThreshold || 200000;
  const freeShippingEnabled = shippingConfig?.freeShippingEnabled !== false;
  const isFreeShipping = (freeShippingEnabled && subtotal >= freeShippingThreshold) || subtotal === 0;

  // Tra cứu cước phí vận chuyển theo Tỉnh / Thành phố đã chọn
  const getCityShippingFee = (cityName) => {
    if (!cityName) return shippingConfig?.defaultShippingFee || 35000;
    const rates = shippingConfig?.provinceRates || [];
    const matched = rates.find((r) =>
      r.province.toLowerCase() === cityName.toLowerCase() ||
      cityName.toLowerCase().includes(r.province.toLowerCase()) ||
      r.province.toLowerCase().includes(cityName.toLowerCase())
    );
    if (matched) return matched.fee;
    return shippingConfig?.defaultShippingFee || 35000;
  };

  const currentCityFee = getCityShippingFee(formData.city);
  const shippingFee = isFreeShipping ? 0 : currentCityFee;
  const total = Math.max(0, subtotal - discountAmount + shippingFee);
  const totalItemCount = checkoutItems.reduce((cnt, it) => cnt + (it.quantity || 1), 0);

  const bankInfo = {
    bankName: 'MBBank',
    bankCode: 'MBBank',
    accountNumber: 'VQRQALYXL6596', // Tài khoản ảo SePay (VA)
    primaryAccountNumber: '0001761675223',
    accountName: 'NGUYEN HOANG THAI VINH',
    branch: 'Ngân hàng TMCP Quân Đội (MBBank)'
  };

  const activeBankInfo = {
    bankName: vietQrData?.bankName || bankInfo.bankName,
    bankCode: vietQrData?.bankCode || bankInfo.bankCode,
    accountNumber: vietQrData?.accountNumber || bankInfo.accountNumber,
    primaryAccountNumber: bankInfo.primaryAccountNumber,
    accountName: vietQrData?.accountName || bankInfo.accountName,
    branch: bankInfo.branch
  };

  const currentCode = orderCode || `SX${Math.floor(100000 + Math.random() * 900000)}`;
  const finalTotalAmount = placedOrder ? (placedOrder.totalAmount !== undefined ? placedOrder.totalAmount : total) : total;

  // Cổng VietQR SePay
  const sepayAcc = activeBankInfo.accountNumber || 'VQRQALYXL6596';
  const sepayHolder = encodeURIComponent(activeBankInfo.accountName || 'NGUYEN HOANG THAI VINH');
  const vietQrUrl = vietQrData?.qrImageUrl || `https://vietqr.app/img?bank=MBBank&acc=${sepayAcc}&template=compact&amount=${Math.round(finalTotalAmount)}&des=${currentCode}&showinfo=true&fullacc=true&holder=${sepayHolder}&store=Sen%20Xinh%20Garden`;

  const handleCopyText = (textToCopy, key) => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim()) {
      showModal('warning', 'Vui lòng điền đầy đủ Họ tên, Số điện thoại và Địa chỉ giao hàng!');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        customerName: formData.name.trim(),
        customerPhone: formData.phone.trim(),
        customerAddress: formData.address.trim(),
        city: formData.city,
        customerEmail: user?.email || formData.email || '',
        note: formData.note.trim(),
        paymentMethod: formData.paymentMethod,
        discountCode: discountCode || '',
        discountPercent: discountPercent || 0,
        discountAmount: discountAmount,
        shippingFee: shippingFee,
        subtotal: subtotal,
        totalAmount: total,
        orderCode: currentCode,
        items: checkoutItems.map(it => ({
          id: it.id,
          name: it.name,
          price: it.price,
          quantity: it.quantity,
          image: it.image
        }))
      };

      const result = await createOrder(payload);
      const code = result.order?.orderCode || currentCode;
      setOrderCode(code);
      if (result.vietQr) {
        setVietQrData(result.vietQr);
      }
      setPlacedOrder(result.order || {
        orderCode: code,
        subtotal,
        discountAmount,
        shippingFee,
        totalAmount: total,
        paymentMethod: formData.paymentMethod,
        customerName: formData.name,
        customerPhone: formData.phone,
        customerEmail: user?.email || '',
        customerAddress: formData.address,
        status: 'PENDING'
      });

      setIsCompleted(true);

      if (onOrderSuccess) {
        onOrderSuccess(result.order, isDirectBuy, directBuyItem);
      }
      if (onClearCart && !isDirectBuy) {
        onClearCart();
      }
    } catch (err) {
      console.error('Lỗi khi tạo đơn hàng:', err);
      showModal('error', err.message || 'Không thể tạo đơn hàng. Vui lòng kiểm tra lại kết nối mạng!');
    } finally {
      setSubmitting(false);
    }
  };

  // Auto-polling kiểm tra trạng thái thanh toán khi đơn hàng đang hiển thị mã QR (VietQR)
  useEffect(() => {
    if (!isCompleted || orderStatus === 'PAID') return;
    const targetCode = orderCode || placedOrder?.orderCode;
    if (!targetCode) return;

    const intervalId = setInterval(async () => {
      try {
        const res = await checkOrderStatus(targetCode);
        if (res && res.success && res.status === 'PAID') {
          setOrderStatus('PAID');
          setPlacedOrder((prev) => ({ ...prev, status: 'PAID' }));
          try {
            confetti({
              particleCount: 160,
              spread: 90,
              origin: { y: 0.6 }
            });
          } catch (e) {}
        }
      } catch (err) {
        console.warn('Lỗi polling trạng thái thanh toán:', err);
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [isCompleted, orderStatus, orderCode, placedOrder?.orderCode]);

  // Kiểm tra trạng thái thanh toán thủ công
  const handleManualCheckPayment = async () => {
    setIsCheckingPayment(true);
    try {
      const targetCode = orderCode || placedOrder?.orderCode || currentCode;
      const res = await checkOrderStatus(targetCode);
      if (res && res.success && res.status === 'PAID') {
        setOrderStatus('PAID');
        setPlacedOrder((prev) => ({ ...prev, status: 'PAID' }));
        try {
          confetti({
            particleCount: 160,
            spread: 90,
            origin: { y: 0.6 }
          });
        } catch (e) {}
        showModal('success', 'Giao dịch đã được ghi nhận thành công! Đơn hàng đã chuyển sang trạng thái ĐÃ THANH TOÁN.');
      } else {
        showModal(
          'info',
          `Hệ thống đang đối soát thanh toán cho đơn hàng #${targetCode}. Nếu bạn vừa chuyển tiền, vui lòng đợi 15 - 30 giây để hệ thống tự động cập nhật trạng thái nhé.`
        );
      }
    } catch (err) {
      showModal('warning', 'Không thể kết nối máy chủ để kiểm tra trạng thái lúc này. Vui lòng thử lại sau giây lát!');
    } finally {
      setIsCheckingPayment(false);
    }
  };

  // =========================================================================
  // Screen 1: Order Completed & Payment Gateway Screen
  // =========================================================================
  if (isCompleted) {
    return (
      <>
        <CheckoutOrderCompleted
          placedOrder={placedOrder}
          formData={formData}
          orderStatus={orderStatus}
          finalTotalAmount={finalTotalAmount}
          currentCode={currentCode}
          formatPrice={formatPrice}
          activeBankInfo={activeBankInfo}
          vietQrUrl={vietQrUrl}
          copiedKey={copiedKey}
          handleCopyText={handleCopyText}
          handleManualCheckPayment={handleManualCheckPayment}
          isCheckingPayment={isCheckingPayment}
          isAdmin={isAdmin}
          onNavigateShop={onNavigateShop}
          onNavigateAdmin={onNavigateAdmin}
          navigate={navigate}
        />
        <NotificationModal {...modalProps} />
      </>
    );
  }

  // =========================================================================
  // Screen 2: Empty Cart Warning
  // =========================================================================
  if (checkoutItems.length === 0) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center', minHeight: '60vh' }}>
        <div style={{ maxWidth: 440, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--primary-light, #e8f5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingBag size={36} color="var(--primary)" />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>Không có sản phẩm nào để thanh toán</h2>
          <p style={{ color: 'var(--text-secondary, #666)', fontSize: '0.95rem', margin: 0 }}>
            Giỏ hàng của bạn đang trống hoặc bạn chưa chọn sản phẩm nào. Hãy khám phá vườn sen đá xinh nhé!
          </p>
          <button className="btn-primary" onClick={onNavigateShop} style={{ padding: '12px 24px' }}>
            <span>Xem Cửa Hàng</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // Screen 3: Simplified Checkout Form
  // =========================================================================
  return (
    <>
      <div className="chk-page">
        {/* Simple Top Navigation Header */}
        <div className="chk-simple-header">
          <div className="container">
            <button
              type="button"
              className="chk-back-btn"
              onClick={isDirectBuy ? () => navigate(-1) : onNavigateCart}
            >
              <ArrowLeft size={16} />
              <span>{isDirectBuy ? 'Quay lại chọn sản phẩm' : 'Quay lại giỏ hàng'}</span>
            </button>
          </div>
        </div>

        <div className="container" style={{ padding: '24px 20px 80px' }}>
          {/* Page Title */}
          <div className="chk-title-section">
            <h1 className="chk-page-title">Thanh Toán Đơn Hàng</h1>
            <p className="chk-page-desc">Vui lòng điền thông tin giao hàng và chọn phương thức thanh toán</p>
          </div>

          <form onSubmit={handleSubmitOrder} className="chk-layout">
            {/* Left Column: Delivery Info & Payment Method */}
            <div className="chk-main-col">
              <CheckoutCustomerForm
                user={user}
                formData={formData}
                setFormData={setFormData}
                shippingConfig={shippingConfig}
                formatPrice={formatPrice}
                navigate={navigate}
              />

              <CheckoutPaymentMethods
                paymentMethod={formData.paymentMethod}
                onSelectMethod={(method) => setFormData({ ...formData, paymentMethod: method })}
              />
            </div>

            {/* Right Column: Order Review Summary */}
            <CheckoutOrderSummary
              checkoutItems={checkoutItems}
              formatPrice={formatPrice}
              subtotal={subtotal}
              discountAmount={discountAmount}
              discountCode={discountCode}
              discountPercent={discountPercent}
              shippingFee={shippingFee}
              isFreeShipping={isFreeShipping}
              cityName={formData.city}
              total={total}
              totalItemCount={totalItemCount}
              submitting={submitting}
            />
          </form>
        </div>
      </div>

      {/* Notification Modal */}
      <NotificationModal {...modalProps} />
    </>
  );
}
