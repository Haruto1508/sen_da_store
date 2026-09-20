import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Package, 
  Heart, 
  Sparkles, 
  LogOut, 
  Check, 
  Edit3, 
  ArrowRight,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle,
  RefreshCw,
  Trash2,
  Plus,
  Tag,
  X
} from 'lucide-react';
import { getAdminOrders, updateOrderStatus, getCustomerOrders, cancelCustomerOrder, confirmReceivedOrder, deleteCustomerOrdersBulk } from '../services/api';
import NotificationModal from '../components/NotificationModal';
import useModal from '../components/useModal';
import Pagination from '../components/Pagination';

const CANCEL_REASONS = [
  'Đổi ý không muốn mua nữa',
  'Muốn thay đổi địa chỉ hoặc số điện thoại nhận hàng',
  'Muốn thêm hoặc bớt sản phẩm trong giỏ hàng',
  'Thời gian giao hàng dự kiến quá lâu',
  'Tìm thấy giá tốt hơn ở nơi khác',
  'Khác (Vui lòng ghi rõ bên dưới)'
];

const STATUS_CONFIG = {
  PENDING: { label: 'Chờ Thanh Toán', color: '#D97706', bg: '#FEF3C7', icon: Clock, step: 1 },
  PAID: { label: 'Đã Thanh Toán', color: '#059669', bg: '#D1FAE5', icon: CheckCircle2, step: 2 },
  SHIPPING: { label: 'Đang Giao Hàng', color: '#2563EB', bg: '#DBEAFE', icon: Truck, step: 3 },
  COMPLETED: { label: 'Giao Thành Công', color: '#16A34A', bg: '#DCFCE7', icon: CheckCircle2, step: 4 },
  CANCELLED: { label: 'Đã Hủy Đơn', color: '#DC2626', bg: '#FEE2E2', icon: AlertCircle, step: 0 }
};

const DELIVERY_STEPS = [
  { step: 1, label: 'Đặt Hàng' },
  { step: 2, label: 'Đã Xác Nhận' },
  { step: 3, label: 'Đang Giao Hàng' },
  { step: 4, label: 'Giao Thành Công' }
];

export default function AccountPage({
  initialTab = 'profile',
  user,
  wishlistCount = 0,
  cartCount = 0,
  cartItems = [],
  products = [],
  wishlist = [],
  discountCode = '',
  discountPercent = 0,
  onUpdateQty,
  onRemoveItem,
  onApplyCoupon,
  onToggleWishlist,
  onAddToCart,
  onOpenProductDetail,
  onNavigateCheckout,
  onNavigateShop,
  onNavigateCart,
  onNavigateAdmin,
  onNavigateHome,
  onLogout,
  onUpdateUser
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(location.state?.tab || initialTab || 'profile');
  // Notification Modal
  const { modalProps, showModal } = useModal();
  const [isEditing, setIsEditing] = useState(false);

  // Đảm bảo thông tin user luôn trích xuất chính xác kể cả khi backend trả về cấu trúc lồng
  const currentUser = (user?.user && !user?.name) ? user.user : (user || {});

  const [formData, setFormData] = useState({
    name: currentUser.name || '',
    email: currentUser.email || '',
    phone: currentUser.phone || '',
    address: currentUser.address || ''
  });

  useEffect(() => {
    const cu = (user?.user && !user?.name) ? user.user : user;
    if (cu) {
      setFormData({
        name: cu.name || '',
        email: cu.email || '',
        phone: cu.phone || '',
        address: cu.address || ''
      });
    }
  }, [user]);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Coupon state in Cart Tab
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState(false);



  // Orders and shipping history state
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Pagination state in Orders Tab
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Bulk delete orders state
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [isDeletingOrders, setIsDeletingOrders] = useState(false);
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);

  // Modal hủy đơn hàng state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedCancelOrder, setSelectedCancelOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState(CANCEL_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);
  const [isSubmittingReceive, setIsSubmittingReceive] = useState(false);

  // Sync tab if initialTab or location.state.tab changes
  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    } else if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, location.state]);

  const isAdmin = Boolean(currentUser?.role?.toLowerCase().includes('admin') || currentUser?.email === 'admin@senxinh.vn');

  const loadOrders = async () => {
    if (!currentUser || (!currentUser.name && !currentUser.email && !currentUser.phone)) {
      setOrders([]);
      setStats(null);
      return;
    }

    setOrdersLoading(true);
    try {
      let orderList = [];
      let allUserOrders = [];

      if (isAdmin) {
        orderList = await getAdminOrders(filterStatus);
        allUserOrders = (filterStatus === 'all') ? orderList : (await getAdminOrders('all') || []);
      } else {
        const identifier = currentUser.phone || currentUser.email || currentUser.name;
        const email = currentUser.email || '';
        allUserOrders = await getCustomerOrders(identifier, email);
        if (filterStatus && filterStatus !== 'all') {
          orderList = allUserOrders.filter((o) => o.status === filterStatus);
        } else {
          orderList = allUserOrders;
        }
      }

      setOrders(orderList || []);

      // Calculate user-centric order stats
      const listForStats = allUserOrders || [];
      setStats({
        totalOrders: listForStats.length,
        pendingOrders: listForStats.filter(o => o.status === 'PENDING').length,
        paidOrders: listForStats.filter(o => o.status === 'PAID').length,
        shippingOrders: listForStats.filter(o => o.status === 'SHIPPING').length,
        completedOrders: listForStats.filter(o => o.status === 'COMPLETED').length,
        cancelledOrders: listForStats.filter(o => o.status === 'CANCELLED').length
      });
    } catch (err) {
      console.error('Lỗi tải danh sách đơn hàng:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'orders') {
      loadOrders();
    }
  }, [activeTab, filterStatus, user]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      loadOrders();
    } catch (err) {
      showModal('error', 'Không thể cập nhật trạng thái đơn hàng');
    }
  };

  const handleOpenCancelModal = (order) => {
    setSelectedCancelOrder(order);
    setCancelReason(CANCEL_REASONS[0]);
    setCustomReason('');
    setCancelModalOpen(true);
  };

  const handleConfirmCancelOrder = async () => {
    if (!selectedCancelOrder) return;
    const finalReason = cancelReason.startsWith('Khác') ? customReason.trim() : cancelReason;
    if (!finalReason) {
      showModal('warning', 'Vui lòng điền chi tiết lý do bạn muốn hủy đơn.');
      return;
    }

    setIsSubmittingCancel(true);
    try {
      await cancelCustomerOrder(selectedCancelOrder.id, finalReason);
      setCancelModalOpen(false);
      setSelectedCancelOrder(null);
      showModal('success', 'Đã hủy đơn hàng thành công! Sản phẩm đã được hoàn trả về kho.');
      loadOrders();
    } catch (err) {
      showModal('error', err.message || 'Không thể hủy đơn hàng');
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  const handleConfirmReceived = async (orderId) => {
    if (!window.confirm('Bạn xác nhận đã nhận được kiện hàng này nguyên vẹn và đầy đủ?')) return;
    setIsSubmittingReceive(true);
    try {
      const res = await confirmReceivedOrder(orderId);
      const pointsMsg = res?.pointsEarned ? ` và được cộng ${res.pointsEarned} Điểm Sen!` : '!';
      showModal('success', `Cảm ơn bạn! Đã xác nhận nhận hàng thành công${pointsMsg}`);
      
      // Update local user points if available
      const savedUser = JSON.parse(localStorage.getItem('user') || 'null');
      if (savedUser && onUpdateUser) {
        onUpdateUser(savedUser);
      }
      loadOrders();
    } catch (err) {
      showModal('error', err.message || 'Không thể xác nhận nhận hàng');
    } finally {
      setIsSubmittingReceive(false);
    }
  };

  // Reset trang và chế độ xóa khi đổi tab trạng thái đơn
  useEffect(() => {
    setCurrentPage(1);
    if (isDeleteMode) {
      setIsDeleteMode(false);
      setSelectedOrderIds([]);
    }
  }, [filterStatus]);

  const totalPages = Math.max(1, Math.ceil(orders.length / itemsPerPage));
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const pagedOrders = orders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Bulk delete handlers
  const handleToggleDeleteMode = () => {
    if (isDeleteMode) {
      setIsDeleteMode(false);
      setSelectedOrderIds([]);
    } else {
      setIsDeleteMode(true);
      // Mặc định tick chọn tất cả các đơn hàng hiện có để xóa
      setSelectedOrderIds(orders.map((o) => o.id));
    }
  };

  const handleSelectAll = () => {
    setSelectedOrderIds(orders.map((o) => o.id));
  };

  const handleDeselectAll = () => {
    setSelectedOrderIds([]);
  };

  const handleToggleSelectOrder = (orderId) => {
    setSelectedOrderIds((prev) => {
      if (prev.includes(orderId)) {
        return prev.filter((id) => id !== orderId);
      } else {
        return [...prev, orderId];
      }
    });
  };

  const handleExecuteDeleteBulk = async () => {
    if (selectedOrderIds.length === 0) return;
    setIsDeletingOrders(true);
    try {
      await deleteCustomerOrdersBulk(selectedOrderIds);
      showModal('success', `Đã xóa thành công ${selectedOrderIds.length} đơn hàng khỏi lịch sử.`);
      setIsConfirmDeleteModalOpen(false);
      setIsDeleteMode(false);
      setSelectedOrderIds([]);
      await loadOrders();
    } catch (err) {
      showModal('error', err.message || 'Không thể xóa các đơn hàng đã chọn. Vui lòng thử lại!');
    } finally {
      setIsDeletingOrders(false);
    }
  };

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (onUpdateUser) {
      onUpdateUser(formData);
    }
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Cart calculations
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = Math.round(subtotal * (discountPercent / 100));
  const freeShippingThreshold = 200000;
  const isFreeShipping = subtotal >= freeShippingThreshold || subtotal === 0;
  const shippingFee = isFreeShipping ? 0 : 30000;
  const total = Math.max(0, subtotal - discountAmount + shippingFee);
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const remainingForFreeShip = Math.max(0, freeShippingThreshold - subtotal);

  const handleApplyCouponSubmit = (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    if (onApplyCoupon) {
      const ok = onApplyCoupon(couponInput.trim());
      if (ok) {
        setCouponSuccess(true);
        setCouponError('');
        setCouponInput('');
        setTimeout(() => setCouponSuccess(false), 3000);
      } else {
        setCouponError('Mã ưu đãi không hợp lệ. Hãy thử mã SENXANH10 (-10%) hoặc SENXANH20 (-20%)!');
        setCouponSuccess(false);
      }
    }
  };

  // Wishlist products
  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <>
    <div className="account-page">
      {/* Header Banner */}
      <div className="page-header-banner">
        <div className="container">
          <div className="breadcrumb">
            <button className="breadcrumb-link" onClick={onNavigateHome}>Trang Chủ</button>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">
              {activeTab === 'orders' && 'Lịch Sử Đơn Hàng & Giao Hàng'}
              {activeTab === 'wishlist' && 'Mục Yêu Thích Của Tôi'}
              {activeTab === 'cart' && 'Giỏ Hàng Của Bạn'}
              {activeTab === 'profile' && 'Tài Khoản Của Tôi'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginTop: '14px' }}>
            <div>
              <span className="section-subtitle" style={{ color: 'var(--accent)' }}>
                {activeTab === 'orders' && 'Theo Dõi Đơn & Vận Chuyển'}
                {activeTab === 'wishlist' && 'Bộ Sưu Tập Đã Lưu'}
                {activeTab === 'cart' && 'Túi Mầm Xanh'}
                {activeTab === 'profile' && 'Trung Tâm Thành Viên'}
              </span>
              <h1 className="page-title" style={{ fontSize: '1.75rem', marginTop: '4px' }}>
                {activeTab === 'orders' && 'Đơn Hàng & Lịch Sử Giao Hàng'}
                {activeTab === 'wishlist' && `Mục Yêu Thích (${wishlistProducts.length} Cây)`}
                {activeTab === 'cart' && `Giỏ Hàng (${cartCount} Sản Phẩm)`}
                {activeTab === 'profile' && 'Hồ Sơ & Quản Lý Tài Khoản'}
              </h1>
            </div>

            {activeTab === 'orders' && (
              <button 
                className="btn-secondary" 
                onClick={loadOrders}
                style={{ padding: '10px 18px', fontSize: '0.88rem' }}
              >
                <RefreshCw size={15} className={ordersLoading ? 'spin' : ''} />
                <span>Làm Mới Đơn Hàng</span>
              </button>
            )}

            {(activeTab === 'wishlist' || activeTab === 'cart') && (
              <button 
                className="btn-secondary" 
                onClick={onNavigateShop}
                style={{ padding: '10px 18px', fontSize: '0.88rem' }}
              >
                <ShoppingBag size={15} />
                <span>Khám Phá Cửa Hàng</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '36px 24px 80px' }}>
        <div className="account-layout">
          {/* Left Column: User Profile Sidebar (STAYS ALWAYS VISIBLE) */}
          <aside className="account-sidebar">
            <div className="profile-card">
              <h2 className="profile-name">{formData.name}</h2>
              <p className="profile-email">{formData.email}</p>

              <div className="profile-membership-pill">
                <span>{currentUser?.role || (user ? 'Thành Viên Mới' : 'Khách Ghé Thăm')}</span>
              </div>

              {/* Interactive Quick Stats (Clickable to switch tabs) */}
              <div className="profile-stats">
                <div 
                  className={`profile-stat-item ${activeTab === 'cart' ? 'active' : ''}`}
                  onClick={() => (onNavigateCart ? onNavigateCart() : setActiveTab('cart'))}
                  style={{ cursor: 'pointer' }}
                  title="Nhấn để xem giỏ hàng"
                >
                  <strong>{cartCount}</strong>
                  <span>Giỏ hàng</span>
                </div>

                <div className="profile-stat-divider" />

                <div 
                  className={`profile-stat-item ${activeTab === 'wishlist' ? 'active' : ''}`}
                  onClick={() => setActiveTab('wishlist')}
                  style={{ cursor: 'pointer' }}
                  title="Nhấn để xem mục yêu thích"
                >
                  <strong>{wishlistCount}</strong>
                  <span>Yêu thích</span>
                </div>

                <div className="profile-stat-divider" />

                <div className="profile-stat-item" title="Điểm tích lũy thành viên">
                  <strong>{currentUser?.points ?? 0}</strong>
                  <span>Điểm Sen</span>
                </div>
              </div>

              {!user && (
                <div style={{ padding: '12px 14px', background: '#FEF3C7', borderRadius: 'var(--radius-md)', margin: '14px 0', border: '1px solid #FDE68A', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.82rem', color: '#92400E', marginBottom: '8px' }}>
                    Đăng nhập để tích Điểm Sen và quản lý đơn hàng!
                  </p>
                  <button 
                    className="btn-primary" 
                    onClick={onLogout}
                    style={{ padding: '6px 14px', fontSize: '0.82rem', width: '100%' }}
                  >
                    Đăng Nhập Ngay
                  </button>
                </div>
              )}

              {/* Sidebar Navigation Links */}
              <div className="profile-nav-list">
                <button 
                  className={`profile-nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('profile');
                    setIsEditing(false);
                  }}
                >
                  <User size={18} />
                  <span>Thông Tin Cá Nhân</span>
                </button>

                <button 
                  className={`profile-nav-btn ${activeTab === 'orders' ? 'active' : ''}`}
                  onClick={() => setActiveTab('orders')}
                >
                  <Package size={18} />
                  <span>Xem Đơn Hàng</span>
                </button>

                <button 
                  className={`profile-nav-btn ${activeTab === 'wishlist' ? 'active' : ''}`}
                  onClick={() => setActiveTab('wishlist')}
                >
                  <Heart size={18} />
                  <span>Mục Yêu Thích</span>
                  {wishlistCount > 0 && (
                    <span className="profile-nav-badge" style={{ background: '#FEE2E2', color: '#DC2626' }}>
                      {wishlistCount}
                    </span>
                  )}
                </button>

                <button 
                  className={`profile-nav-btn ${activeTab === 'cart' ? 'active' : ''}`}
                  onClick={() => (onNavigateCart ? onNavigateCart() : setActiveTab('cart'))}
                >
                  <ShoppingBag size={18} />
                  <span>Xem Giỏ Hàng</span>
                  {cartCount > 0 && (
                    <span className="profile-nav-badge">
                      {cartCount}
                    </span>
                  )}
                </button>


                <button 
                  className="profile-nav-btn logout"
                  onClick={onLogout}
                >
                  <LogOut size={18} />
                  <span>Đăng Xuất Tài Khoản</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Right Column: Main Content (Switches between Profile, Orders, Wishlist, Cart) */}
          <main className="account-main">
            {/* 1. TAB: PROFILE INFO */}
            {activeTab === 'profile' && (
              !user ? (
                <div className="account-card" style={{ textAlign: 'center', padding: '60px 24px' }}>
                  <User size={48} style={{ opacity: 0.35, color: 'var(--primary)', marginBottom: '16px' }} />
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>Bạn Chưa Đăng Nhập Tài Khoản</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '480px', margin: '0 auto 24px' }}>
                    Vui lòng đăng nhập để xem và cập nhật thông tin cá nhân, địa chỉ nhận cây mặc định và tích lũy Điểm Sen thưởng.
                  </p>
                  <button className="btn-primary" onClick={onLogout} style={{ padding: '12px 28px' }}>
                    <span>Đăng Nhập Ngay</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="account-card">
                    <div className="account-card-header">
                    <div>
                      <h3 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Thông Tin Người Dùng</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '2px' }}>
                        Quản lý thông tin liên hệ và địa chỉ nhận cây mặc định của bạn
                      </p>
                    </div>

                    {!isEditing && (
                      <button 
                        className="btn-secondary" 
                        onClick={() => setIsEditing(true)}
                        style={{ padding: '8px 16px', fontSize: '0.88rem' }}
                      >
                        <Edit3 size={16} />
                        <span>Chỉnh Sửa</span>
                      </button>
                    )}
                  </div>

                  {savedSuccess && (
                    <div className="save-success-banner">
                      <Check size={18} />
                      <span>Cập nhật thông tin tài khoản thành công!</span>
                    </div>
                  )}

                  {isEditing ? (
                    <form onSubmit={handleSave} className="form-grid" style={{ marginTop: '20px' }}>
                      <div className="form-group">
                        <label className="form-label">Họ và tên</label>
                        <input
                          type="text"
                          className="form-input"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          className="form-input"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Số điện thoại</label>
                        <input
                          type="tel"
                          className="form-input"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          required
                        />
                      </div>

                      <div className="form-group full-width">
                        <label className="form-label">Địa chỉ giao hàng mặc định</label>
                        <input
                          type="text"
                          className="form-input"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          required
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                        <button type="submit" className="btn-primary" style={{ padding: '10px 24px' }}>
                          <Check size={16} />
                          <span>Lưu Thay Đổi</span>
                        </button>
                        <button 
                          type="button" 
                          className="btn-secondary" 
                          onClick={() => setIsEditing(false)}
                          style={{ padding: '10px 20px' }}
                        >
                          Hủy Bỏ
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="profile-details-grid">
                      <div className="detail-item">
                        <div className="detail-icon"><User size={18} /></div>
                        <div>
                          <span className="detail-label">Họ và tên:</span>
                          <strong className="detail-value">{formData.name}</strong>
                        </div>
                      </div>

                      <div className="detail-item">
                        <div className="detail-icon"><Mail size={18} /></div>
                        <div>
                          <span className="detail-label">Địa chỉ email:</span>
                          <strong className="detail-value">{formData.email}</strong>
                        </div>
                      </div>

                      <div className="detail-item">
                        <div className="detail-icon"><Phone size={18} /></div>
                        <div>
                          <span className="detail-label">Số điện thoại:</span>
                          <strong className="detail-value">{formData.phone}</strong>
                        </div>
                      </div>

                      <div className="detail-item full-width">
                        <div className="detail-icon"><MapPin size={18} /></div>
                        <div>
                          <span className="detail-label">Địa chỉ nhận hàng mặc định:</span>
                          <strong className="detail-value">{formData.address}</strong>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '24px' }}>
                  <div className="quick-card" onClick={() => setActiveTab('orders')}>
                    <div className="quick-card-icon" style={{ background: '#EBF4EE', color: 'var(--primary)' }}>
                      <Package size={24} />
                    </div>
                    <div>
                      <h4>Quản Lý & Xem Đơn Hàng</h4>
                      <p>Xem tiến trình vận chuyển, lịch sử giao hàng và hóa đơn theo thời gian thực.</p>
                    </div>
                    <ArrowRight size={18} className="quick-card-arrow" />
                  </div>

                  <div className="quick-card" onClick={() => setActiveTab('wishlist')}>
                    <div className="quick-card-icon" style={{ background: '#FFF4E5', color: 'var(--accent)' }}>
                      <Heart size={24} />
                    </div>
                    <div>
                      <h4>Mục Yêu Thích Của Bạn</h4>
                      <p>Xem lại các giống sen đá bạn đã lưu và nhanh chóng thêm vào giỏ hàng.</p>
                    </div>
                    <ArrowRight size={18} className="quick-card-arrow" />
                  </div>
                </div>
              </>
            )
          )}

            {/* 2. TAB: ORDERS & SHIPPING HISTORY */}
            {activeTab === 'orders' && (
              !user ? (
                <div className="account-card" style={{ textAlign: 'center', padding: '60px 24px' }}>
                  <Package size={48} style={{ opacity: 0.35, color: 'var(--primary)', marginBottom: '16px' }} />
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>Tra Cứu Lịch Sử Đơn Hàng</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '480px', margin: '0 auto 24px' }}>
                    Vui lòng đăng nhập để theo dõi trạng thái vận chuyển, kiểm tra lộ trình giao hàng và hóa đơn các chậu cây của bạn.
                  </p>
                  <button className="btn-primary" onClick={onLogout} style={{ padding: '12px 28px' }}>
                    <span>Đăng Nhập Ngay</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              ) : (
                <div className="account-card">
                  <div className="account-card-header" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Danh Sách Đơn Hàng & Lịch Sử Giao Hàng</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '2px' }}>
                      Theo dõi trạng thái giao hàng, kiểm tra lộ trình vận chuyển và thông tin thanh toán
                    </p>
                  </div>

                  {orders.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button
                        type="button"
                        className={`btn-secondary ${isDeleteMode ? 'active' : ''}`}
                        onClick={handleToggleDeleteMode}
                        style={{
                          padding: '8px 16px',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          color: isDeleteMode ? '#DC2626' : 'var(--text-main)',
                          borderColor: isDeleteMode ? '#FCA5A5' : 'var(--border-color)',
                          background: isDeleteMode ? '#FEF2F2' : '#fff',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                        title={isDeleteMode ? 'Hủy chế độ xóa' : 'Bật chế độ chọn để xóa các đơn hàng'}
                      >
                        <Trash2 size={15} color={isDeleteMode ? '#DC2626' : 'currentColor'} />
                        <span>{isDeleteMode ? 'Hủy Chế Độ Xóa' : 'Xóa Tất Cả / Chọn Xóa'}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Bulk Delete Toolbar when active */}
                {isDeleteMode && (
                  <div className="order-delete-toolbar">
                    <div className="order-delete-toolbar-info">
                      <Trash2 size={18} color="#E11D48" />
                      <span>
                        Đã chọn <strong>{selectedOrderIds.length}</strong> / {orders.length} đơn hàng để xóa
                      </span>
                      <span className="order-delete-toolbar-hint">
                        • Nhấp vào ô tick trên từng đơn để bỏ qua (giữ lại) đơn không muốn xóa
                      </span>
                    </div>

                    <div className="order-delete-toolbar-actions">
                      <button
                        type="button"
                        className="btn-toolbar-sub"
                        onClick={handleSelectAll}
                        title="Chọn tất cả đơn hàng hiện tại"
                      >
                        Chọn tất cả
                      </button>
                      <button
                        type="button"
                        className="btn-toolbar-sub"
                        onClick={handleDeselectAll}
                        title="Bỏ chọn tất cả đơn hàng"
                      >
                        Bỏ chọn tất cả
                      </button>
                      <button
                        type="button"
                        className="btn-toolbar-cancel"
                        onClick={() => {
                          setIsDeleteMode(false);
                          setSelectedOrderIds([]);
                        }}
                      >
                        <X size={14} />
                        <span>Hủy</span>
                      </button>
                      <button
                        type="button"
                        className="btn-toolbar-delete"
                        onClick={() => setIsConfirmDeleteModalOpen(true)}
                        disabled={selectedOrderIds.length === 0 || isDeletingOrders}
                        title="Xác nhận xóa các đơn hàng đã được tick"
                      >
                        <Trash2 size={14} />
                        <span>Xóa ({selectedOrderIds.length}) Đơn Đã Chọn</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Quick stats numbers */}
                {stats && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '24px' }}>
                    <div style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Tổng Số Đơn</span>
                      <strong style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>{stats.totalOrders}</strong>
                    </div>

                    <div style={{ background: '#FFFBEB', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid #FDE68A' }}>
                      <span style={{ fontSize: '0.8rem', color: '#B45309', display: 'block' }}>Chờ Thanh Toán</span>
                      <strong style={{ fontSize: '1.5rem', color: '#D97706' }}>{stats.pendingOrders}</strong>
                    </div>

                    <div style={{ background: '#EFF6FF', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid #BFDBFE' }}>
                      <span style={{ fontSize: '0.8rem', color: '#1D4ED8', display: 'block' }}>Đang Xử Lý / Giao</span>
                      <strong style={{ fontSize: '1.5rem', color: '#2563EB' }}>{stats.paidOrders}</strong>
                    </div>

                    <div style={{ background: '#ECFDF5', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid #A7F3D0' }}>
                      <span style={{ fontSize: '0.8rem', color: '#047857', display: 'block' }}>Hoàn Tất / Đã Giao</span>
                      <strong style={{ fontSize: '1.5rem', color: '#059669' }}>{stats.completedOrders}</strong>
                    </div>
                  </div>
                )}

                {/* Status Tabs Filter */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '6px' }}>
                  {[
                    { id: 'all', label: 'Tất Cả', count: stats?.totalOrders },
                    { id: 'PENDING', label: 'Chờ Thanh Toán', count: stats?.pendingOrders },
                    { id: 'PAID', label: 'Đã Thanh Toán', count: stats?.paidOrders },
                    { id: 'SHIPPING', label: 'Đang Giao Hàng', count: stats?.shippingOrders },
                    { id: 'COMPLETED', label: 'Đã Nhận Hàng (Đã Giao)', count: stats?.completedOrders },
                    { id: 'CANCELLED', label: 'Đã Hủy', count: stats?.cancelledOrders }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      className={`cat-tab ${filterStatus === tab.id ? 'active' : ''}`}
                      onClick={() => setFilterStatus(tab.id)}
                      style={{ padding: '8px 16px', fontSize: '0.86rem', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <span>{tab.label}</span>
                      {tab.count !== undefined && tab.count > 0 && (
                        <span style={{
                          background: filterStatus === tab.id ? 'rgba(255,255,255,0.25)' : 'var(--bg-alt)',
                          fontSize: '0.75rem',
                          padding: '2px 7px',
                          borderRadius: '10px',
                          fontWeight: 700
                        }}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Orders List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {ordersLoading ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                      <RefreshCw size={28} className="spin" style={{ color: 'var(--primary)', marginBottom: '12px' }} />
                      <p style={{ color: 'var(--text-muted)' }}>Đang tải lịch sử đơn hàng từ máy chủ...</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '50px 20px', background: 'var(--bg-main)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-light)' }}>
                      <Package size={40} style={{ opacity: 0.35, marginBottom: '12px', color: 'var(--text-muted)' }} />
                      <h4 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>Chưa có đơn hàng nào trong mục này</h4>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
                        Khám phá ngay bộ sưu tập sen đá tuyệt đẹp để gieo những mầm xanh đầu tiên.
                      </p>
                      <button className="btn-primary" onClick={onNavigateShop} style={{ padding: '10px 24px', fontSize: '0.9rem' }}>
                        <span>Mua Sắm Ngay</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  ) : (
                    pagedOrders.map((order) => {
                      const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
                      const StatusIcon = statusCfg.icon;
                      const currentStep = statusCfg.step;
                      const isSelected = selectedOrderIds.includes(order.id);

                      return (
                        <div 
                          key={order.id} 
                          style={{
                            background: isDeleteMode && isSelected ? '#FFFDFD' : '#fff',
                            border: isDeleteMode && isSelected ? '1.5px solid #FCA5A5' : '1px solid var(--border-light)',
                            borderRadius: 'var(--radius-lg)',
                            padding: '24px',
                            boxShadow: isDeleteMode && isSelected ? '0 4px 12px rgba(225, 29, 72, 0.08)' : 'var(--shadow-sm)',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {/* Checkbox bar when in Delete Mode */}
                          {isDeleteMode && (
                            <div 
                              className={`order-card-checkbox-bar ${isSelected ? 'selected' : 'unselected'}`}
                              onClick={() => handleToggleSelectOrder(order.id)}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleSelectOrder(order.id)}
                                style={{
                                  width: '18px',
                                  height: '18px',
                                  accentColor: '#DC2626',
                                  cursor: 'pointer'
                                }}
                              />
                              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: isSelected ? '#DC2626' : '#64748B' }}>
                                {isSelected ? '✓ Đã chọn xóa đơn này' : '○ Bỏ qua (giữ lại đơn này không xóa)'}
                              </span>
                            </div>
                          )}

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                <strong style={{ color: 'var(--primary)', fontSize: '1.05rem', letterSpacing: '0.5px' }}>
                                  #{order.orderCode || order.id}
                                </strong>
                                <span style={{ fontSize: '0.82rem', color: 'var(--text-light)' }}>
                                  • {new Date(order.createdAt).toLocaleString('vi-VN')}
                                </span>
                              </div>
                              <div style={{ fontSize: '0.92rem', fontWeight: 600, marginTop: '4px' }}>
                                Người nhận: {order.customerName} - 📞 {order.customerPhone}
                              </div>
                              <div style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                                📍 Giao đến: {order.shippingAddress || order.customerAddress || 'Địa chỉ mặc định'}
                              </div>
                              {order.note && (
                                <div style={{ fontSize: '0.84rem', color: 'var(--accent)', marginTop: '2px' }}>
                                  💬 Ghi chú: {order.note}
                                </div>
                              )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                              <span 
                                style={{
                                  background: statusCfg.bg,
                                  color: statusCfg.color,
                                  fontSize: '0.82rem',
                                  fontWeight: 700,
                                  padding: '6px 14px',
                                  borderRadius: 'var(--radius-full)',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}
                              >
                                <StatusIcon size={14} />
                                {statusCfg.label}
                              </span>

                              {isAdmin ? (
                                <select
                                  value={order.status}
                                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                  className="select-filter"
                                  style={{ padding: '6px 30px 6px 12px', fontSize: '0.82rem' }}
                                  title="Cập nhật trạng thái đơn hàng (Admin)"
                                >
                                  <option value="PENDING">Chờ Thanh Toán</option>
                                  <option value="PAID">Đã Thanh Toán</option>
                                  <option value="SHIPPING">Đang Giao Hàng</option>
                                  <option value="COMPLETED">Đã Hoàn Tất</option>
                                  <option value="CANCELLED">Hủy Đơn</option>
                                </select>
                              ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  {order.status === 'SHIPPING' && (
                                    <button
                                      className="btn-primary"
                                      onClick={() => handleConfirmReceived(order.id)}
                                      disabled={isSubmittingReceive}
                                      style={{
                                        padding: '7px 16px',
                                        fontSize: '0.82rem',
                                        fontWeight: 600,
                                        background: '#059669',
                                        borderColor: '#059669',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                      }}
                                      title="Xác nhận bạn đã nhận được hàng và tích lũy Điểm Sen"
                                    >
                                      <CheckCircle2 size={15} />
                                      <span>Đã Nhận Được Hàng</span>
                                    </button>
                                  )}

                                  {(order.status === 'PENDING' || order.status === 'PAID') && (
                                    <button
                                      className="btn-secondary"
                                      onClick={() => handleOpenCancelModal(order)}
                                      style={{ padding: '6px 14px', fontSize: '0.8rem', color: '#DC2626', borderColor: '#FCA5A5' }}
                                      title="Hủy đơn hàng này"
                                    >
                                      Hủy Đơn
                                    </button>
                                  )}

                                  {order.status === 'COMPLETED' && (
                                    <span style={{
                                      fontSize: '0.8rem',
                                      color: '#059669',
                                      fontWeight: 600,
                                      background: '#DCFCE7',
                                      padding: '4px 10px',
                                      borderRadius: 'var(--radius-full)',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '5px'
                                    }}>
                                      <CheckCircle2 size={13} /> Đã Giao Thành Công
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Delivery Progress Bar */}
                          {order.status !== 'CANCELLED' ? (
                            <div style={{ background: 'var(--bg-alt)', padding: '16px 20px', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
                              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '10px' }}>
                                🚚 Tiến trình vận chuyển & giao hàng:
                              </div>

                              <div className="delivery-tracker">
                                {DELIVERY_STEPS.map((st) => {
                                  const isCompleted = currentStep > st.step;
                                  const isActive = currentStep === st.step;

                                  return (
                                    <div 
                                      key={st.step} 
                                      className={`delivery-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
                                    >
                                      <div className="delivery-step-dot">
                                        {isCompleted ? '✓' : st.step}
                                      </div>
                                      <span className="delivery-step-label">{st.label}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ) : (
                            <div style={{ background: '#FEF2F2', border: '1px dashed #FCA5A5', color: '#DC2626', padding: '12px 18px', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: '0.88rem' }}>
                              ⚠️ Đơn hàng này đã bị hủy. Nếu có bất kỳ thắc mắc nào, quý khách vui lòng liên hệ hotline hỗ trợ.
                            </div>
                          )}

                          {/* Items and Total */}
                          <div style={{ background: 'var(--bg-main)', padding: '14px 18px', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Sản phẩm đã chọn:</span>
                              <span style={{ fontWeight: 500 }}>
                                {order.items.map(it => `${it.productName || it.name} (x${it.quantity})`).join(' • ')}
                              </span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700, paddingTop: '10px', borderTop: '1px dashed var(--border-light)' }}>
                              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                Phương thức: <strong>{
                                  order.paymentMethod?.toLowerCase() === 'vietqr' ? 'Chuyển khoản VietQR' :
                                  order.paymentMethod?.toLowerCase() === 'momo' ? 'Ví điện tử MoMo' :
                                  'Tiền mặt khi nhận (COD)'
                                }</strong>
                              </span>
                              <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                {order.status === 'PENDING' && order.paymentMethod !== 'cod' && (
                                  <button
                                    className="btn-primary"
                                    onClick={() => navigate(`/order-success/${order.orderCode || order.id}`)}
                                    style={{ padding: '6px 14px', fontSize: '0.82rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                                    title="Quét mã QR để hoàn tất thanh toán"
                                  >
                                    <span>Thanh Toán Ngay</span>
                                    <ArrowRight size={14} />
                                  </button>
                                )}
                                <div>
                                  <span style={{ fontSize: '0.82rem', color: 'var(--text-light)', display: 'block' }}>Tổng thanh toán</span>
                                  <span style={{ color: 'var(--primary)', fontSize: '1.15rem' }}>{formatPrice(order.totalAmount)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Phân Trang (Pagination) */}
                {orders.length > itemsPerPage && (
                  <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalItems={orders.length}
                      onPageChange={(page) => {
                        setCurrentPage(page);
                        window.scrollTo({ top: 380, behavior: 'smooth' });
                      }}
                    />
                    <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                      Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, orders.length)} trong tổng số {orders.length} đơn hàng
                    </span>
                  </div>
                )}
              </div>
            )
          )}

            {/* 3. TAB: WISHLIST (MỤC YÊU THÍCH) */}
            {activeTab === 'wishlist' && (
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

                {wishlistProducts.length === 0 ? (
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
            )}

            {/* 4. TAB: CART (XEM GIỎ HÀNG) */}
            {activeTab === 'cart' && (
              <div className="account-card">
                <div className="account-card-header" style={{ marginBottom: '20px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Giỏ Hàng Của Bạn</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '2px' }}>
                      Xem lại các chậu sen đá đã chọn, áp dụng mã giảm giá và thanh toán nhanh chóng
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className="btn-primary" 
                      onClick={onNavigateCart}
                      style={{ padding: '8px 16px', fontSize: '0.88rem' }}
                    >
                      <span>Trang Giỏ Hàng Đầy Đủ</span>
                      <ArrowRight size={15} />
                    </button>
                    <button 
                      className="btn-secondary" 
                      onClick={onNavigateShop}
                      style={{ padding: '8px 16px', fontSize: '0.88rem' }}
                    >
                      <span>Chọn Thêm Cây</span>
                    </button>
                  </div>
                </div>

                {cartItems.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-main)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-light)' }}>
                    <ShoppingBag size={48} style={{ opacity: 0.3, color: 'var(--primary)', marginBottom: '14px' }} />
                    <h4 style={{ fontSize: '1.2rem', marginBottom: '6px' }}>Giỏ Hàng Hiện Đang Trống</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '440px', margin: '0 auto 20px' }}>
                      Góc bàn làm việc hay ban công của bạn vẫn đang chờ một chậu sen đá xinh xắn đấy!
                    </p>
                    <button className="btn-primary" onClick={onNavigateShop} style={{ padding: '12px 28px' }}>
                      <Sparkles size={16} />
                      <span>Mua Sắm Ngay</span>
                    </button>
                  </div>
                ) : (
                  <div>
                    {/* Items List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                      {cartItems.map((item) => (
                        <div 
                          key={item.id} 
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '16px',
                            background: '#fff',
                            border: '1px solid var(--border-light)',
                            borderRadius: 'var(--radius-md)',
                            padding: '16px 20px'
                          }}
                        >
                          <div 
                            style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', flex: 1, minWidth: '240px' }}
                            onClick={() => onOpenProductDetail && onOpenProductDetail(item.id)}
                          >
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-sm)', objectFit: 'cover', border: '1px solid var(--border-light)' }} 
                            />
                            <div>
                              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                                {item.name}
                              </h4>
                              <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>
                                {formatPrice(item.price)}
                              </span>
                            </div>
                          </div>

                          {/* Quantity control */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button 
                              className="qty-btn"
                              onClick={() => onUpdateQty && onUpdateQty(item.id, item.quantity - 1)}
                              title="Giảm số lượng"
                            >
                              <Minus size={14} />
                            </button>
                            <span style={{ minWidth: '28px', textAlign: 'center', fontWeight: 700, fontSize: '0.95rem' }}>
                              {item.quantity}
                            </span>
                            <button 
                              className="qty-btn"
                              onClick={() => onUpdateQty && onUpdateQty(item.id, item.quantity + 1)}
                              title="Tăng số lượng"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          {/* Total and remove */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                            <strong style={{ fontSize: '1.05rem', color: 'var(--primary)', minWidth: '90px', textAlign: 'right' }}>
                              {formatPrice(item.price * item.quantity)}
                            </strong>
                            <button 
                              className="icon-btn-danger"
                              onClick={() => onRemoveItem && onRemoveItem(item.id)}
                              title="Xóa sản phẩm"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Summary & Voucher Section */}
                    <div style={{ background: 'var(--bg-main)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
                      {/* Coupon form */}
                      <form onSubmit={handleApplyCouponSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                          <Tag size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                          <input 
                            type="text"
                            placeholder="Mã giảm giá (ví dụ: SENXANH10, SENXANH20)"
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value)}
                            className="form-input"
                            style={{ paddingLeft: '40px', background: '#fff' }}
                          />
                        </div>
                        <button type="submit" className="btn-secondary" style={{ padding: '0 24px', whiteSpace: 'nowrap' }}>
                          Áp Dụng
                        </button>
                      </form>

                      {couponSuccess && (
                        <div style={{ color: '#059669', fontSize: '0.85rem', marginBottom: '14px', fontWeight: 600 }}>
                          ✓ Đã áp dụng mã giảm giá thành công!
                        </div>
                      )}
                      {couponError && (
                        <div style={{ color: '#DC2626', fontSize: '0.85rem', marginBottom: '14px' }}>
                          {couponError}
                        </div>
                      )}

                      {/* Totals table */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.92rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Tạm tính:</span>
                          <strong style={{ color: 'var(--text-main)' }}>{formatPrice(subtotal)}</strong>
                        </div>

                        {discountPercent > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669' }}>
                            <span>Mã giảm giá ({discountCode} -{discountPercent}%):</span>
                            <strong>-{formatPrice(discountAmount)}</strong>
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Phí vận chuyển:</span>
                          <span>{shippingFee === 0 ? <strong style={{ color: '#059669' }}>Miễn phí (0đ)</strong> : formatPrice(shippingFee)}</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', borderTop: '1px dashed var(--border-light)', marginTop: '4px' }}>
                          <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>Tổng thanh toán:</span>
                          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'Outfit, sans-serif' }}>
                            {formatPrice(total)}
                          </span>
                        </div>
                      </div>

                      {/* Checkout button */}
                      <button 
                        className="btn-primary"
                        onClick={onNavigateCheckout}
                        style={{ width: '100%', padding: '15px', fontSize: '1.05rem', marginTop: '20px', justifyContent: 'center' }}
                      >
                        <span>Tiến Hành Đặt Hàng Ngay</span>
                        <ArrowRight size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}


          </main>
        </div>
      </div>
    </div>

    {/* Modal Xác Nhận Hủy Đơn Hàng */}
    {cancelModalOpen && selectedCancelOrder && (
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.55)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
          backdropFilter: 'blur(3px)'
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget && !isSubmittingCancel) {
            setCancelModalOpen(false);
          }
        }}
      >
        <div 
          style={{
            background: '#ffffff',
            borderRadius: 'var(--radius-lg, 16px)',
            maxWidth: '520px',
            width: '100%',
            padding: '28px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid var(--border-light, #e2e8f0)',
            position: 'relative'
          }}
        >
          {/* Modal Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#DC2626', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <AlertCircle size={22} />
                Xác Nhận Hủy Đơn Hàng
              </h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '4px', marginBottom: 0 }}>
                Mã đơn: <strong style={{ color: 'var(--primary)' }}>#{selectedCancelOrder.orderCode || selectedCancelOrder.id}</strong>
              </p>
            </div>
            <button
              type="button"
              onClick={() => !isSubmittingCancel && setCancelModalOpen(false)}
              disabled={isSubmittingCancel}
              style={{
                border: 'none',
                background: '#F1F5F9',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748B'
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Warning notice */}
          <div style={{ background: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: 'var(--radius-md, 8px)', padding: '12px 14px', marginBottom: '18px', fontSize: '0.84rem', color: '#991B1B', lineHeight: '1.5' }}>
            ⚠️ <strong>Lưu ý:</strong> Khi bạn xác nhận hủy đơn, số lượng sản phẩm trong đơn sẽ được tự động hoàn trả vào kho của Sen Xinh và đơn hàng sẽ không thể khôi phục lại.
          </div>

          {/* Reasons form */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '10px' }}>
              Vui lòng chọn lý do hủy đơn:
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {CANCEL_REASONS.map((reason, idx) => (
                <label 
                  key={idx} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm, 6px)',
                    background: cancelReason === reason ? '#F8FAFC' : 'transparent',
                    border: `1px solid ${cancelReason === reason ? 'var(--primary)' : 'var(--border-light, #E2E8F0)'}`,
                    transition: 'all 0.2s'
                  }}
                >
                  <input
                    type="radio"
                    name="cancelReason"
                    value={reason}
                    checked={cancelReason === reason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            {cancelReason.startsWith('Khác') && (
              <div style={{ marginTop: '12px' }}>
                <textarea
                  rows={3}
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Nhập lý do chi tiết của bạn tại đây..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md, 8px)',
                    border: '1px solid var(--border-light, #E2E8F0)',
                    fontSize: '0.88rem',
                    resize: 'none',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setCancelModalOpen(false)}
              disabled={isSubmittingCancel}
              style={{ padding: '10px 20px', fontSize: '0.88rem' }}
            >
              Không Hủy
            </button>
            <button
              type="button"
              onClick={handleConfirmCancelOrder}
              disabled={isSubmittingCancel}
              style={{
                padding: '10px 22px',
                fontSize: '0.88rem',
                fontWeight: 600,
                color: '#fff',
                background: '#DC2626',
                border: 'none',
                borderRadius: 'var(--radius-md, 8px)',
                cursor: isSubmittingCancel ? 'not-allowed' : 'pointer',
                opacity: isSubmittingCancel ? 0.7 : 1,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {isSubmittingCancel && <RefreshCw size={15} className="spin" />}
              <span>{isSubmittingCancel ? 'Đang Hủy...' : 'Xác Nhận Hủy Đơn'}</span>
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Modal xác nhận xóa hàng loạt đơn hàng */}
    {isConfirmDeleteModalOpen && (
      <div 
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}
        onClick={() => !isDeletingOrders && setIsConfirmDeleteModalOpen(false)}
      >
        <div 
          style={{
            background: '#fff',
            borderRadius: 'var(--radius-lg, 12px)',
            maxWidth: '460px',
            width: '100%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            overflow: 'hidden',
            animation: 'fadeIn 0.2s ease'
          }} 
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626' }}>
                <Trash2 size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#1E293B' }}>Xác Nhận Xóa Đơn Hàng</h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#64748B' }}>Thao tác này sẽ xóa vĩnh viễn khỏi lịch sử</p>
              </div>
            </div>
            <button
              onClick={() => !isDeletingOrders && setIsConfirmDeleteModalOpen(false)}
              disabled={isDeletingOrders}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '4px' }}
            >
              <X size={18} />
            </button>
          </div>

          <div style={{ padding: '20px 24px' }}>
            <p style={{ fontSize: '0.92rem', color: '#334155', lineHeight: 1.6, margin: 0 }}>
              Bạn có chắc chắn muốn xóa <strong>{selectedOrderIds.length}</strong> đơn hàng đã chọn không?
            </p>
            <div style={{ marginTop: '12px', padding: '10px 14px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.82rem', color: '#64748B' }}>
              💡 <em>Lưu ý:</em> Các đơn hàng bạn đã <strong>bỏ tick</strong> (bỏ qua) sẽ được giữ lại nguyên vẹn trong tài khoản.
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '16px 24px', borderTop: '1px solid #E2E8F0', background: '#F8FAFC' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setIsConfirmDeleteModalOpen(false)}
              disabled={isDeletingOrders}
              style={{ padding: '9px 18px', fontSize: '0.88rem' }}
            >
              Hủy Bỏ
            </button>
            <button
              type="button"
              onClick={handleExecuteDeleteBulk}
              disabled={isDeletingOrders}
              style={{
                padding: '9px 22px',
                fontSize: '0.88rem',
                fontWeight: 600,
                color: '#fff',
                background: '#DC2626',
                border: 'none',
                borderRadius: 'var(--radius-md, 8px)',
                cursor: isDeletingOrders ? 'not-allowed' : 'pointer',
                opacity: isDeletingOrders ? 0.7 : 1,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {isDeletingOrders ? (
                <>
                  <RefreshCw size={15} className="spin" />
                  <span>Đang Xóa...</span>
                </>
              ) : (
                <>
                  <Trash2 size={15} />
                  <span>Đồng Ý Xóa</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Notification Modal – thay thế window.alert() */}
    <NotificationModal {...modalProps} />
    </>
  );
}
