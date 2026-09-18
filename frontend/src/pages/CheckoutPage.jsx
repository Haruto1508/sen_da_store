import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  CreditCard, 
  Truck, 
  Copy, 
  CheckCircle2, 
  QrCode, 
  ShieldCheck, 
  ArrowLeft, 
  ArrowRight,
  ShoppingBag,
  Clock,
  Sparkles,
  Smartphone,
  ExternalLink,
  Zap,
  Loader2,
  Package,
  Check,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  createOrder, 
  createMoMoPayment, 
  simulateMoMoPayment, 
  lookupOrder, 
  simulateBankTransferPayment,
  checkOrderStatus,
  getUseMockData,
  isMockUser,
  getShippingConfig,
  fetchShippingConfig
} from '../services/api';
import useModal from '../components/useModal';
import NotificationModal from '../components/NotificationModal';

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

  // Cho phép hiển thị công cụ test thanh toán khi ở localhost hoặc chế độ Mock Data
  const isMockActive = getUseMockData();
  const isLocalOrMock = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    isMockActive
  );
  const canShowPaymentSimulation = isLocalOrMock || Boolean(user && isMockUser(user));

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
    paymentMethod: 'momo', // 'momo' | 'vietqr' | 'cod'
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

  const [copied, setCopied] = useState(false);
  const [isCompleted, setIsCompleted] = useState(Boolean(initialOrderCode));
  const [orderCode, setOrderCode] = useState(initialOrderCode || '');
  const [placedOrder, setPlacedOrder] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [momoData, setMomoData] = useState(null);
  const [vietQrData, setVietQrData] = useState(null);
  const [orderStatus, setOrderStatus] = useState('PENDING');
  const [isSimulating, setIsSimulating] = useState(false);

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

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

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
    primaryAccountNumber: '0001761675223', // Số tài khoản ngân hàng gốc
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

  // Cổng VietQR SePay vietqr.app chuẩn hóa chính xác số tiền & nội dung chuyển khoản
  const sepayAcc = activeBankInfo.accountNumber || 'VQRQALYXL6596';
  const sepayHolder = encodeURIComponent(activeBankInfo.accountName || 'NGUYEN HOANG THAI VINH');
  const vietQrUrl = vietQrData?.qrImageUrl || `https://vietqr.app/img?bank=MBBank&acc=${sepayAcc}&template=compact&amount=${Math.round(finalTotalAmount)}&des=${currentCode}&showinfo=true&fullacc=true&holder=${sepayHolder}&store=Sen%20Xinh%20Garden`;

  const handleCopyAccount = (textToCopy = activeBankInfo.accountNumber) => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address) {
      showModal('warning', 'Vui lòng điền đầy đủ Họ tên, Số điện thoại và Địa chỉ giao hàng!');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        customerName: formData.name,
        customerPhone: formData.phone,
        customerAddress: formData.address,
        city: formData.city,
        customerEmail: user?.email || formData.email || '',
        note: formData.note,
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
        customerEmail: user?.email || formData.email || '',
        customerAddress: formData.address,
        status: 'PENDING'
      });

      // Khởi tạo MoMo nếu khách chọn momo
      if (formData.paymentMethod === 'momo') {
        try {
          const momoRes = await createMoMoPayment(code, total);
          if (momoRes && momoRes.data) {
            setMomoData(momoRes.data);
          }
        } catch (mErr) {
          console.warn('Khởi tạo giao dịch MoMo offline fallback:', mErr);
        }
      }

      setIsCompleted(true);

      if (onOrderSuccess) {
        onOrderSuccess(result.order, isDirectBuy, directBuyItem);
      }
      if (onClearCart && !isDirectBuy) {
        onClearCart();
      }
    } catch (err) {
      console.error('Lỗi khi tạo đơn hàng:', err);
      showModal('error', err.message || 'Không thể tạo đơn hàng. Vui lòng kiểm tra lại kết nối máy chủ!');
    } finally {
      setSubmitting(false);
    }
  };

  // Auto-polling kiểm tra trạng thái thanh toán khi đơn hàng đang hiển thị mã QR (VietQR hoặc MoMo)
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
              particleCount: 180,
              spread: 100,
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

  // Mô phỏng quét mã MoMo thành công (Sandbox / Demo)
  const handleSimulateMoMo = async () => {
    setIsSimulating(true);
    try {
      const res = await simulateMoMoPayment(currentCode);
      if (res && res.success) {
        setOrderStatus('PAID');
        setPlacedOrder((prev) => ({ ...prev, status: 'PAID' }));
        try {
          confetti({
            particleCount: 180,
            spread: 100,
            origin: { y: 0.6 }
          });
        } catch (e) {}
      }
    } catch (err) {
      console.error('Lỗi mô phỏng MoMo:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const [isCheckingPayment, setIsCheckingPayment] = useState(false);

  // Kiểm tra trạng thái thanh toán thủ công (nhận diện SePay / MoMo)
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
            particleCount: 180,
            spread: 100,
            origin: { y: 0.6 }
          });
        } catch (e) {}
        showModal('success', 'Tuyệt vời! Giao dịch đã được hệ thống ghi nhận thành công! Đơn hàng đã chuyển sang trạng thái ĐÃ THANH TOÁN.');
      } else {
        showModal(
          'info',
          'Hệ thống đang đối soát số dư cho đơn #' + targetCode + '. Nếu bạn vừa chuyển tiền qua App Ngân Hàng, vui lòng đợi 15 - 30 giây để SePay xử lý. Bạn cũng có thể bấm nút "Test Sandbox" bên dưới để kích hoạt ngay!'
        );
      }
    } catch (err) {
      showModal('warning', 'Không thể kết nối máy chủ để kiểm tra trạng thái lúc này. Vui lòng thử lại sau giây lát!');
    } finally {
      setIsCheckingPayment(false);
    }
  };

  // Mô phỏng chuyển khoản ngân hàng thành công qua SePay Webhook (Sandbox / Demo)
  const handleSimulateBankTransfer = async () => {
    setIsSimulating(true);
    try {
      const res = await simulateBankTransferPayment(currentCode);
      if (res && (res.success || res.status === 'PAID')) {
        setOrderStatus('PAID');
        setPlacedOrder((prev) => ({ ...prev, status: 'PAID' }));
        try {
          confetti({
            particleCount: 180,
            spread: 100,
            origin: { y: 0.6 }
          });
        } catch (e) {}
        showModal('success', 'Mô phỏng SePay Webhook thành công! Đơn hàng #' + currentCode + ' đã được tự động kích hoạt sang trạng thái ĐÃ THANH TOÁN (PAID)!');
      } else {
        showModal('error', res?.message || 'Không thể mô phỏng chuyển khoản');
      }
    } catch (err) {
      console.error('Lỗi mô phỏng Webhook chuyển khoản:', err);
      showModal('error', 'Lỗi mô phỏng Webhook: ' + (err.message || err));
    } finally {
      setIsSimulating(false);
    }
  };

  // =========================================================================
  // Screen 1: Order Completed View (Pending / Paid / QR / COD)
  // =========================================================================
  if (isCompleted) {
    const currentPaymentMethod = placedOrder ? placedOrder.paymentMethod : formData.paymentMethod;
    const isMoMo = currentPaymentMethod === 'momo';
    const isVietQr = currentPaymentMethod === 'vietqr';
    const isPaid = orderStatus === 'PAID';

    return (
      <div className="pay-page">
        <div className="page-header-banner">
          <div className="container">
            <div className="breadcrumb">
              <button className="breadcrumb-link" onClick={onNavigateHome}>Trang Chủ</button>
              <span className="breadcrumb-separator">/</span>
              <button className="breadcrumb-link" onClick={onNavigateShop}>Cửa Hàng</button>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-current">Xác Nhận Đơn Hàng</span>
            </div>
          </div>
        </div>

        <div className="pay-container">
          {/* Step indicator */}
          <div className="chk-steps" style={{ marginBottom: '28px', padding: 0 }}>
            <div className="chk-step done">
              <div className="chk-step-circle"><Check size={16} /></div>
              <span className="chk-step-label">Thông tin</span>
            </div>
            <div className="chk-step-line done" />
            <div className="chk-step done">
              <div className="chk-step-circle"><Check size={16} /></div>
              <span className="chk-step-label">Thanh toán</span>
            </div>
            <div className="chk-step-line done" />
            <div className="chk-step active">
              <div className="chk-step-circle">3</div>
              <span className="chk-step-label">Xác nhận</span>
            </div>
          </div>

          {/* Header Card */}
          <div className="pay-header-card">
            <div className={`pay-icon-ring ${isPaid ? 'paid' : ''}`}>
              <CheckCircle2 size={42} color="#fff" />
            </div>

            <span className="pay-subtitle">
              {isPaid ? 'Giao Dịch Đã Hoàn Tất' : 'Cảm Ơn Bạn Đã Mua Hàng!'}
            </span>
            <h1 className="pay-title">
              {isPaid ? 'Đơn Hàng Đã Được Thanh Toán!' : 'Đặt Hàng Thành Công!'}
            </h1>
            <p className="pay-desc">
              Nhà vườn Sen Xinh Garden đã tiếp nhận đơn hàng <strong>#{currentCode}</strong> và đang tiến hành chọn lọc những cây sen đá tươi khỏe nhất để đóng gói giao đến bạn.
            </p>

            {/* Info strip */}
            <div className="pay-info-strip">
              <div className="pay-info-item">
                <div className="pay-info-label">Mã đơn hàng</div>
                <div className="pay-info-val">#{currentCode}</div>
              </div>
              <div className="pay-info-item">
                <div className="pay-info-label">Tổng thanh toán</div>
                <div className="pay-info-val" style={{ color: 'var(--primary)' }}>{formatPrice(finalTotalAmount)}</div>
              </div>
              <div className="pay-info-item">
                <div className="pay-info-label">Hình thức</div>
                <div className="pay-info-val">
                  {isMoMo ? 'Cổng MoMo (Ví & QR)' : isVietQr ? 'Chuyển Khoản VietQR' : 'Tiền Mặt (COD)'}
                </div>
              </div>
              <div className="pay-info-item">
                <div className="pay-info-label">Trạng thái</div>
                <div className="pay-info-val">
                  {isPaid ? (
                    <span className="pay-status-pill paid">✓ Đã Thanh Toán</span>
                  ) : (
                    <span className="pay-status-pill waiting">
                      <span className="pay-pulse" />
                      Chờ Thanh Toán
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Celebration Card when PAID */}
          {isPaid && (
            <div className="pay-celebration">
              <div className="pay-celebration-badge">
                <CheckCircle2 size={36} color="#fff" />
              </div>
              <h2>Giao Dịch Đã Được Xác Nhận Thành Công!</h2>
              <p>
                Hệ thống Sen Xinh Garden đã tự động ghi nhận số tiền <strong>{formatPrice(finalTotalAmount)}</strong>. Đơn hàng <strong>#{currentCode}</strong> đã được chuyển sang trạng thái <strong>ĐÃ THANH TOÁN (PAID)</strong>.
              </p>
              <div className="pay-ipn-note">
                <Sparkles size={16} color="#10B981" />
                <span>Hệ thống Webhook IPN tự động xác nhận • Quý khách không cần gửi biên lai</span>
              </div>
            </div>
          )}

          {/* MoMo QR Card */}
          {!isPaid && isMoMo && (
            <div className="pay-qr-card">
              <div className="pay-qr-header momo">
                <div className="pay-qr-brand">
                  <div className="pay-qr-brand-icon momo">
                    <Smartphone size={22} />
                  </div>
                  <div>
                    <div className="pay-qr-brand-name">Cổng Thanh Toán MoMo</div>
                    <div className="pay-qr-brand-sub">Quét bằng App MoMo hoặc bất kỳ App Ngân Hàng nào hỗ trợ VietQR</div>
                  </div>
                </div>

                <div className="pay-status-pill waiting">
                  <span className="pay-pulse" />
                  <span>Tự động phát hiện thanh toán...</span>
                </div>
              </div>

              <div className="pay-qr-body">
                <div className="pay-qr-img-col">
                  <div className="pay-qr-frame momo-border">
                    <img 
                      src={momoData?.qrCodeUrl || `https://img.vietqr.io/image/970422-0988123456-compact2.png?amount=${finalTotalAmount}&addInfo=${currentCode}&accountName=MOMO%20SEN%20XINH%20GARDEN`} 
                      alt="Mã QR Thanh Toán MoMo" 
                      className="pay-qr-img" 
                    />
                  </div>
                  <div className="pay-qr-caption">Mã QR tương thích Ví MoMo & VietQR NAPAS</div>
                </div>

                <div className="pay-qr-info">
                  <div className="pay-qr-row">
                    <div className="pay-qr-row-label">Cổng thanh toán</div>
                    <div className="pay-qr-row-val momo-color">MoMo Payment Gateway v2</div>
                  </div>

                  <div className="pay-qr-row">
                    <div className="pay-qr-row-label">Đơn vị thụ hưởng</div>
                    <div className="pay-qr-row-val">Nhà Vườn Sen Xinh Garden</div>
                  </div>

                  <div className="pay-qr-row">
                    <div className="pay-qr-row-label">Số tiền cần thanh toán</div>
                    <div className="pay-qr-row-val big momo-color">{formatPrice(finalTotalAmount)}</div>
                  </div>

                  <div className="pay-qr-row">
                    <div className="pay-qr-row-label">Mã giao dịch / Nội dung</div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span className="pay-qr-code-pill momo">{currentCode}</span>
                      <button 
                        type="button" 
                        className={`pay-copy-btn ${copied ? 'copied' : ''}`}
                        onClick={() => handleCopyAccount(currentCode)}
                      >
                        <Copy size={13} />
                        <span>{copied ? 'Đã sao chép!' : 'Sao chép'}</span>
                      </button>
                    </div>
                  </div>

                  {momoData?.payUrl && (
                    <a 
                      href={momoData.payUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="pay-open-momo"
                    >
                      <ExternalLink size={17} />
                      <span>Mở Cổng Thanh Toán MoMo (App / Web)</span>
                    </a>
                  )}

                  <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button 
                      type="button" 
                      className="btn-primary"
                      onClick={handleManualCheckPayment}
                      disabled={isCheckingPayment}
                      style={{
                        width: '100%',
                        padding: '12px 18px',
                        fontSize: '0.96rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        borderRadius: 'var(--radius-md)',
                        background: '#A50064',
                        borderColor: '#A50064'
                      }}
                    >
                      {isCheckingPayment ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                      <span>{isCheckingPayment ? 'Đang kiểm tra MoMo...' : 'Tôi Đã Quét MoMo Xong - Kiểm Tra Ngay'}</span>
                    </button>

                    {canShowPaymentSimulation && (
                      <div className="pay-sandbox-box" style={{ marginTop: 0 }}>
                        <button 
                          type="button" 
                          className="pay-sandbox-btn momo-sim" 
                          onClick={handleSimulateMoMo}
                          disabled={isSimulating}
                        >
                          {isSimulating ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                          <span>{isSimulating ? 'Đang gửi Webhook...' : '⚡ Test Sandbox: Mô phỏng quét MoMo thành công'}</span>
                        </button>
                        <div className="pay-sandbox-hint">
                          💡 Webhook IPN kết nối trực tiếp: Sau khi thanh toán thành công, hệ thống tự động đổi sang trạng thái PAID.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VietQR Payment Details */}
          {!isPaid && isVietQr && (
            <div className="pay-qr-card">
              <div className="pay-qr-header vqr">
                <div className="pay-qr-brand">
                  <div className="pay-qr-brand-icon vqr">
                    <QrCode size={22} />
                  </div>
                  <div>
                    <div className="pay-qr-brand-name">Chuyển Khoản Ngân Hàng VietQR 24/7</div>
                    <div className="pay-qr-brand-sub">Hỗ trợ 40+ ngân hàng (MBBank, Vietcombank, Techcombank, VPBank...)</div>
                  </div>
                </div>

                <div className="pay-status-pill waiting">
                  <span className="pay-pulse" />
                  <span>Tự động nhận diện giao dịch SePay...</span>
                </div>
              </div>

              <div className="pay-qr-body">
                <div className="pay-qr-img-col">
                  <div className="pay-qr-frame vqr-border">
                    <img src={vietQrUrl} alt="Mã VietQR Chuyển Khoản" className="pay-qr-img" />
                  </div>
                  <div className="pay-qr-caption">Quét bằng App Ngân Hàng tự động điền số tiền và mã đơn</div>
                </div>

                <div className="pay-qr-info">
                  <div className="pay-qr-row">
                    <div className="pay-qr-row-label">Ngân hàng thụ hưởng</div>
                    <div className="pay-qr-row-val">{activeBankInfo.bankName} ({activeBankInfo.bankCode})</div>
                  </div>

                  <div className="pay-qr-row">
                    <div className="pay-qr-row-label">Chủ tài khoản</div>
                    <div className="pay-qr-row-val">{activeBankInfo.accountName}</div>
                  </div>

                  <div className="pay-qr-row">
                    <div className="pay-qr-row-label">Số tài khoản ảo (VA SePay)</div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span className="pay-qr-row-val" style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>
                        {activeBankInfo.accountNumber}
                      </span>
                      <button 
                        type="button" 
                        className={`pay-copy-btn ${copied ? 'copied' : ''}`}
                        onClick={() => handleCopyAccount(activeBankInfo.accountNumber)}
                        title="Sao chép số tài khoản VA"
                      >
                        <Copy size={13} />
                        <span>{copied ? 'Đã chép!' : 'Sao chép'}</span>
                      </button>
                    </div>
                  </div>

                  {activeBankInfo.primaryAccountNumber && activeBankInfo.primaryAccountNumber !== activeBankInfo.accountNumber && (
                    <div className="pay-qr-row">
                      <div className="pay-qr-row-label">Số tài khoản MBBank gốc</div>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span className="pay-qr-row-val">{activeBankInfo.primaryAccountNumber}</span>
                        <button 
                          type="button" 
                          className="pay-copy-btn"
                          onClick={() => handleCopyAccount(activeBankInfo.primaryAccountNumber)}
                          title="Sao chép số tài khoản MBBank"
                        >
                          <Copy size={13} />
                          <span>Sao chép</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="pay-qr-row">
                    <div className="pay-qr-row-label">Số tiền cần chuyển</div>
                    <div className="pay-qr-row-val big green-color">{formatPrice(finalTotalAmount)}</div>
                  </div>

                  <div className="pay-qr-row">
                    <div className="pay-qr-row-label">Nội dung chuyển khoản (bắt buộc)</div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span className="pay-qr-code-pill">{currentCode}</span>
                      <button 
                        type="button" 
                        className="pay-copy-btn"
                        onClick={() => handleCopyAccount(currentCode)}
                      >
                        <Copy size={13} />
                        <span>Sao chép</span>
                      </button>
                    </div>
                  </div>

                  <div style={{ marginTop: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button 
                      type="button" 
                      className="btn-primary"
                      onClick={handleManualCheckPayment}
                      disabled={isCheckingPayment}
                      style={{
                        width: '100%',
                        padding: '12px 18px',
                        fontSize: '0.96rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      {isCheckingPayment ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                      <span>{isCheckingPayment ? 'Đang kiểm tra giao dịch...' : 'Tôi Đã Chuyển Khoản Xong - Kiểm Tra Ngay'}</span>
                    </button>

                    {canShowPaymentSimulation && (
                      <div className="pay-sandbox-box" style={{ marginTop: 0 }}>
                        <button 
                          type="button" 
                          className="pay-sandbox-btn vqr-sim" 
                          onClick={handleSimulateBankTransfer}
                          disabled={isSimulating}
                          title="Bấm để mô phỏng Webhook SePay bắt giao dịch và tự động duyệt đơn PAID"
                        >
                          {isSimulating ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                          <span>{isSimulating ? 'Đang gửi Webhook...' : '⚡ [Test Sandbox] Mô phỏng SePay xác nhận nhận tiền thành công'}</span>
                        </button>
                        <div className="pay-sandbox-hint">
                          💡 <strong>Lưu ý kiểm thử:</strong> Khi chạy trên Localhost, hệ thống SePay trên internet không thể gửi Webhook trực tiếp vào máy tính cục bộ nếu chưa có public domain (ngrok/tunnel). Hãy bấm nút <strong>Test Sandbox</strong> ở trên để trải nghiệm ngay quy trình tự động cập nhật đơn hàng sang ĐÃ THANH TOÁN!
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* COD Card */}
          {currentPaymentMethod === 'cod' && (
            <div className="pay-cod-card">
              <div className="pay-cod-icon">
                <Truck size={36} color="#fff" />
              </div>
              <h3>Thanh Toán Tiền Mặt Khi Nhận Hàng (COD)</h3>
              <p>
                Đơn hàng của bạn sẽ được nhân viên bưu tá giao tận nơi. Bạn có thể kiểm tra cây sen đá trước khi thanh toán số tiền <strong>{formatPrice(finalTotalAmount)}</strong> cho shipper nhé!
              </p>
              <div className="pay-cod-steps">
                <div className="pay-cod-step">
                  <div className="pay-cod-step-dot">1</div>
                  <span>Đóng gói bảo vệ bầu đất</span>
                </div>
                <span className="pay-cod-arrow">→</span>
                <div className="pay-cod-step">
                  <div className="pay-cod-step-dot">2</div>
                  <span>Giao hàng tận nơi (2-4 ngày)</span>
                </div>
                <span className="pay-cod-arrow">→</span>
                <div className="pay-cod-step">
                  <div className="pay-cod-step-dot">3</div>
                  <span>Kiểm tra cây & Thanh toán</span>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="pay-actions">
            <button className="btn-primary" onClick={onNavigateShop}>
              <ShoppingBag size={18} />
              <span>Tiếp Tục Khám Phá Cửa Hàng</span>
            </button>

            {isAdmin ? (
              <button className="btn-secondary" onClick={onNavigateAdmin}>
                <ShieldCheck size={18} color="var(--primary)" />
                <span>Xem Đơn Trên Trang Quản Trị</span>
              </button>
            ) : (
              <button
                className="btn-secondary"
                onClick={() => navigate('/account', { state: { tab: 'orders' } })}
              >
                <Package size={18} color="var(--primary)" />
                <span>Theo Dõi Đơn Hàng Của Tôi</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // Screen 2: Empty Cart in Checkout
  // =========================================================================
  if (!checkoutItems || checkoutItems.length === 0) {
    return (
      <div className="chk-page">
        <div className="chk-empty">
          <ShoppingBag size={64} style={{ color: 'var(--moss)', opacity: 0.35, marginBottom: '16px' }} />
          <h2 style={{ fontSize: '1.6rem', marginBottom: '12px' }}>Không có sản phẩm nào để thanh toán</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '28px', lineHeight: 1.65 }}>
            Chưa có sản phẩm được chọn để thanh toán. Hãy chọn thêm các cây sen đá bạn yêu thích nhé!
          </p>
          <button className="btn-primary" onClick={onNavigateShop} style={{ padding: '14px 28px' }}>
            <span>Quay Lại Cửa Hàng</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // Screen 3: Checkout Form
  // =========================================================================
  return (
    <>
    <div className="chk-page">
      {/* Header Banner */}
      <div className="page-header-banner">
        <div className="container">
          <div className="breadcrumb">
            <button className="breadcrumb-link" onClick={onNavigateHome}>Trang Chủ</button>
            <span className="breadcrumb-separator">/</span>
            <button className="breadcrumb-link" onClick={isDirectBuy ? onNavigateShop : onNavigateCart}>
              {isDirectBuy ? 'Cửa Hàng' : 'Giỏ Hàng'}
            </button>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Thanh Toán Đơn Hàng</span>
          </div>

          <div style={{ marginTop: '10px' }}>
            <span className="section-subtitle" style={{ color: 'var(--accent)' }}>Xác Nhận & Đặt Hàng</span>
            <h1 className="page-title" style={{ fontSize: '1.75rem', marginTop: '4px' }}>
              Thông Tin Giao Hàng & Thanh Toán
            </h1>
          </div>
        </div>
      </div>

      {/* Steps Indicator */}
      <div className="container">
        <div className="chk-steps">
          <div className="chk-step active">
            <div className="chk-step-circle">1</div>
            <span className="chk-step-label">Thông tin</span>
          </div>
          <div className="chk-step-line" />
          <div className="chk-step">
            <div className="chk-step-circle">2</div>
            <span className="chk-step-label">Thanh toán</span>
          </div>
          <div className="chk-step-line" />
          <div className="chk-step">
            <div className="chk-step-circle">3</div>
            <span className="chk-step-label">Xác nhận</span>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '32px 24px 80px' }}>
        <form onSubmit={handleSubmitOrder} className="chk-layout">
          {/* Left Column: Delivery Info & Payment Method */}
          <div className="chk-main-col">
            {/* Guest Checkout Notice Banner */}
            {!user && (
              <div className="chk-guest-banner">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Sparkles size={18} color="var(--primary)" />
                  <span>
                    <strong>Mua ngay không cần tài khoản!</strong> Hoặc đăng nhập để tự động điền và tích lũy điểm Mầm Xanh.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="chk-guest-login-btn"
                >
                  Đăng Nhập Nhanh
                </button>
              </div>
            )}

            {/* Step 1: Customer Details */}
            <div className="chk-card">
              <div className="chk-card-head">
                <div className="chk-step-num">1</div>
                <div>
                  <h3 className="chk-card-title">
                    Thông Tin Nhận Hàng
                    {user?.name && <span className="chk-autofill-badge">✓ Tự động điền</span>}
                  </h3>
                  <p className="chk-card-sub">Chúng tôi sẽ liên hệ xác nhận và giao cây đến địa chỉ này</p>
                </div>
              </div>

              <div className="chk-form-grid">
                <div className="chk-form-group">
                  <label className="chk-form-label">Họ và tên người nhận <span>*</span></label>
                  <input
                    type="text"
                    required
                    className="chk-form-input"
                    placeholder="Ví dụ: Nguyễn Văn An"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="chk-form-group">
                  <label className="chk-form-label">Số điện thoại liên hệ <span>*</span></label>
                  <input
                    type="tel"
                    required
                    className="chk-form-input"
                    placeholder="Ví dụ: 0988 123 456"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="chk-form-group full">
                  <label className="chk-form-label">Địa chỉ nhận hàng chi tiết <span>*</span></label>
                  <input
                    type="text"
                    required
                    className="chk-form-input"
                    placeholder="Số nhà, tên đường, ngõ ngách, phường/xã..."
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div className="chk-form-group">
                  <label className="chk-form-label">Tỉnh / Thành phố</label>
                  <select
                    className="chk-form-input"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  >
                    {(shippingConfig?.provinceRates || []).map((r) => (
                      <option key={r.id || r.province} value={r.province}>
                        {r.province} ({formatPrice(r.fee)})
                      </option>
                    ))}
                    {formData.city && !(shippingConfig?.provinceRates || []).some(r => r.province.toLowerCase() === formData.city.toLowerCase()) && (
                      <option value={formData.city}>{formData.city} ({formatPrice(shippingConfig?.defaultShippingFee || 35000)})</option>
                    )}
                  </select>
                </div>

                <div className="chk-form-group">
                  <label className="chk-form-label">Ghi chú giao hàng (Tùy chọn)</label>
                  <input
                    type="text"
                    className="chk-form-input"
                    placeholder="Giao vào giờ hành chính, gọi trước..."
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Payment Method */}
            <div className="chk-card">
              <div className="chk-card-head">
                <div className="chk-step-num">2</div>
                <div>
                  <h3 className="chk-card-title">Phương Thức Thanh Toán</h3>
                  <p className="chk-card-sub">Lựa chọn hình thức thanh toán thuận tiện nhất cho bạn</p>
                </div>
              </div>

              <div className="chk-pay-options">
                {/* MoMo Option */}
                <label className={`chk-pay-card ${formData.paymentMethod === 'momo' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="momo"
                    checked={formData.paymentMethod === 'momo'}
                    onChange={() => setFormData({ ...formData, paymentMethod: 'momo' })}
                  />
                  <div className="chk-pay-icon" style={{ background: '#FFF0F6', color: '#D82D8B' }}>
                    <Smartphone size={24} />
                  </div>
                  <div className="chk-pay-body">
                    <div className="chk-pay-name">
                      <span>Cổng Thanh Toán MoMo (Ví MoMo & VietQR MoMo)</span>
                      <span className="chk-pay-badge" style={{ background: '#FFF0F6', color: '#D82D8B', border: '1px solid #FBCFE8' }}>
                        Khuyên Dùng • Tự Động
                      </span>
                    </div>
                    <p className="chk-pay-desc">
                      Quét bằng App MoMo hoặc 40+ App Ngân Hàng. Hệ thống nhận diện thanh toán tự động trong vài giây.
                    </p>
                  </div>
                  <div className="chk-radio-dot" />
                </label>

                {/* VietQR Option */}
                <label className={`chk-pay-card ${formData.paymentMethod === 'vietqr' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="vietqr"
                    checked={formData.paymentMethod === 'vietqr'}
                    onChange={() => setFormData({ ...formData, paymentMethod: 'vietqr' })}
                  />
                  <div className="chk-pay-icon" style={{ background: '#EBF4EE', color: 'var(--primary)' }}>
                    <QrCode size={24} />
                  </div>
                  <div className="chk-pay-body">
                    <div className="chk-pay-name">
                      <span>Chuyển Khoản Ngân Hàng Qua Mã VietQR</span>
                    </div>
                    <p className="chk-pay-desc">
                      Quét mã QR 24/7 tự động điền số tiền và mã đơn. Tự động xác nhận biến động số dư qua SePay.
                    </p>
                  </div>
                  <div className="chk-radio-dot" />
                </label>

                {/* COD Option */}
                <label className={`chk-pay-card ${formData.paymentMethod === 'cod' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === 'cod'}
                    onChange={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                  />
                  <div className="chk-pay-icon" style={{ background: '#FFF4E5', color: 'var(--accent)' }}>
                    <Truck size={24} />
                  </div>
                  <div className="chk-pay-body">
                    <div className="chk-pay-name">
                      <span>Thanh Toán Khi Nhận Hàng (COD)</span>
                    </div>
                    <p className="chk-pay-desc">
                      Nhận cây, kiểm tra bầu đất và sen đá tận nơi rồi thanh toán tiền mặt cho nhân viên giao hàng.
                    </p>
                  </div>
                  <div className="chk-radio-dot" />
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Review Summary */}
          <div className="chk-summary-col">
            <div className="chk-summary-card">
              <h3 className="chk-summary-title">Đơn Hàng ({totalItemCount} cây)</h3>

              {/* Items preview */}
              <div className="chk-items-preview">
                {checkoutItems.map((item) => (
                  <div key={item.id} className="chk-preview-item">
                    <div className="chk-preview-item-left">
                      <div className="chk-preview-thumb-wrap">
                        <img src={item.image} alt={item.name} className="chk-preview-thumb" />
                        <span className="chk-preview-qty-badge">{item.quantity}</span>
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div className="chk-preview-name">{item.name}</div>
                        <div className="chk-preview-unit">{formatPrice(item.price)}</div>
                      </div>
                    </div>
                    <strong className="chk-preview-price">{formatPrice(item.price * item.quantity)}</strong>
                  </div>
                ))}
              </div>

              {/* Price Calculation */}
              <div className="chk-price-sep" />
              <div className="chk-price-rows">
                <div className="chk-price-row">
                  <span>Tạm tính:</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="chk-price-row discount">
                    <span>Mã ưu đãi ({discountCode} -{discountPercent}%):</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="chk-price-row">
                  <span>Phí vận chuyển ({formData.city || 'Khu vực'}):</span>
                  <span>{isFreeShipping ? <strong style={{ color: 'var(--primary)' }}>Miễn Phí (0₫)</strong> : formatPrice(shippingFee)}</span>
                </div>
              </div>

              <div className="chk-price-sep" />
              <div className="chk-price-total">
                <span className="chk-price-total-label">Tổng tiền thanh toán:</span>
                <span className="chk-price-total-val">{formatPrice(total)}</span>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="chk-submit-btn"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Đang Tạo Đơn Hàng...</span>
                  </>
                ) : (
                  <>
                    <span>Xác Nhận Đặt Hàng ({formatPrice(total)})</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <button
                type="button"
                className="chk-back-link"
                onClick={isDirectBuy ? () => navigate(-1) : onNavigateCart}
              >
                {isDirectBuy ? '← Quay Lại Chọn Cây' : '← Quay Lại Giỏ Hàng'}
              </button>

              {/* Guarantee */}
              <div className="chk-guarantee">
                <ShieldCheck size={20} color="var(--primary)" style={{ flexShrink: 0 }} />
                <span>Bảo mật 100%. Được mở gói đồng kiểm tra cây trước khi nhận.</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>

    {/* Notification Modal */}
    <NotificationModal {...modalProps} />
    </>
  );
}
