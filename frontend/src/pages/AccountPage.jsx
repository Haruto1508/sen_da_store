import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { RefreshCw, ShoppingBag } from 'lucide-react';

import {
  getAdminOrders,
  updateOrderStatus,
  getCustomerOrders,
  cancelCustomerOrder,
  requestReturnOrder,
  confirmReceivedOrder,
  deleteCustomerOrdersBulk
} from '../services/api';
import NotificationModal from '../components/NotificationModal';
import useModal from '../hooks/useModal';


// Modular Account Subcomponents
import AccountSidebar from '../components/account/AccountSidebar';
import AccountProfileTab from '../components/account/AccountProfileTab';
import AccountOrdersTab from '../components/account/AccountOrdersTab';
import AccountWishlistTab from '../components/account/AccountWishlistTab';
import AccountCartTab from '../components/account/AccountCartTab';
import AccountPurchaseHistoryTab from '../components/account/AccountPurchaseHistoryTab';
import OrderCancelModal from '../components/account/OrderCancelModal';
import OrderDeleteModal from '../components/account/OrderDeleteModal';
import OrderReturnModal from '../components/account/OrderReturnModal';
import { CANCEL_REASONS } from '../components/account/accountConstants';

export default function AccountPage({
  user,
  cartCount = 0,
  wishlistCount = 0,
  wishlist = [],
  cartItems = [],
  products = [],
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
  onUpdateUser,
  initialTab
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { modalProps, showModal } = useModal();

  // Xác định tab từ URL path hoặc state hoặc initialTab
  const getTabFromPath = () => {
    const p = (location.pathname || '').toLowerCase();
    if (p === '/account/orders' || p === '/orders') return 'orders';
    if (p === '/account/history' || p === '/history') return 'history';
    if (p === '/account/wishlist' || p === '/wishlist') return 'wishlist';
    if (p === '/account/cart') return 'cart';
    if (p === '/account/profile' || p === '/account') return 'profile';
    return location.state?.tab || initialTab || 'profile';
  };

  const [activeTab, setActiveTab] = useState(getTabFromPath);
  const [isEditing, setIsEditing] = useState(false);

  // Chuẩn hóa thông tin user
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

  // Sync tab khi location.pathname, location.state hoặc initialTab thay đổi
  useEffect(() => {
    const tab = getTabFromPath();
    setActiveTab(tab);
  }, [location.pathname, location.state, initialTab]);

  // Chuyển tab kèm cập nhật URL trang tương ứng
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    if (setIsEditing) setIsEditing(false);
    const pathMap = {
      profile: '/account',
      orders: '/account/orders',
      history: '/account/history',
      wishlist: '/account/wishlist',
      cart: '/account/cart'
    };
    const targetPath = pathMap[newTab] || '/account';
    if (location.pathname !== targetPath) {
      navigate(targetPath);
    }
  };

  const isAdmin = Boolean(currentUser?.role?.toLowerCase().includes('admin') || currentUser?.email === 'admin@senxinh.vn');

  // ==================== Orders State & Handlers ====================
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [backendTotalPages, setBackendTotalPages] = useState(1);
  const [backendTotalElements, setBackendTotalElements] = useState(0);

  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [isDeletingOrders, setIsDeletingOrders] = useState(false);
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedCancelOrder, setSelectedCancelOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState(CANCEL_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);
  const [isSubmittingReceive, setIsSubmittingReceive] = useState(false);

  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedReturnOrder, setSelectedReturnOrder] = useState(null);
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

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
        
        setOrders(orderList || []);
        const listForStats = allUserOrders || [];
        setStats({
          totalOrders: listForStats.length,
          pendingOrders: listForStats.filter(o => o.status === 'PENDING').length,
          paidOrders: listForStats.filter(o => o.status === 'PAID').length,
          shippingOrders: listForStats.filter(o => o.status === 'SHIPPING').length,
          completedOrders: listForStats.filter(o => o.status === 'COMPLETED').length,
          cancelledOrders: listForStats.filter(o => o.status === 'CANCELLED').length
        });
        setBackendTotalPages(Math.max(1, Math.ceil((orderList?.length || 0) / itemsPerPage)));
        setBackendTotalElements(orderList?.length || 0);
      } else {
        const identifier = currentUser.phone || currentUser.email || currentUser.name;
        const email = currentUser.email || '';
        
        // Fetch all for stats
        allUserOrders = await getCustomerOrders(identifier, email, 'all', 1, 0);
        const listForStats = allUserOrders || [];
        setStats({
          totalOrders: listForStats.length,
          pendingOrders: listForStats.filter(o => o.status === 'PENDING').length,
          paidOrders: listForStats.filter(o => o.status === 'PAID').length,
          shippingOrders: listForStats.filter(o => o.status === 'SHIPPING').length,
          completedOrders: listForStats.filter(o => o.status === 'COMPLETED').length,
          cancelledOrders: listForStats.filter(o => o.status === 'CANCELLED').length
        });

        // Fetch paginated for display if on orders tab, else fetch all
        const fetchLimit = activeTab === 'orders' ? itemsPerPage : 0;
        const paginatedData = await getCustomerOrders(identifier, email, filterStatus, currentPage, fetchLimit);
        if (paginatedData && typeof paginatedData.totalPages !== 'undefined') {
          setOrders(paginatedData.content || []);
          setBackendTotalPages(paginatedData.totalPages);
          setBackendTotalElements(paginatedData.totalElements);
        } else {
          setOrders(paginatedData || []);
          setBackendTotalPages(Math.max(1, Math.ceil((paginatedData?.length || 0) / itemsPerPage)));
          setBackendTotalElements(paginatedData?.length || 0);
        }
      }
    } catch (err) {
      console.error('Lỗi tải danh sách đơn hàng:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'orders' || activeTab === 'history') {
      loadOrders();
    }
  }, [activeTab, filterStatus, currentPage]);

  // Tự động tải đơn hàng ngay khi người dùng đăng nhập/vào trang để các thẻ badge luôn có số liệu mới nhất
  useEffect(() => {
    loadOrders();
  }, [user]);

  const completedOrdersCount = stats?.completedOrders !== undefined 
    ? stats.completedOrders 
    : 0;

  useEffect(() => {
    setCurrentPage(1);
    if (isDeleteMode) {
      setIsDeleteMode(false);
      setSelectedOrderIds([]);
    }
  }, [filterStatus]);

  const totalPages = isAdmin ? Math.max(1, Math.ceil(orders.length / itemsPerPage)) : backendTotalPages;
  const totalItems = isAdmin ? orders.length : backendTotalElements;

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  // Nếu là admin, vẫn phân trang frontend. Nếu là khách, orders đã được phân trang từ backend.
  const pagedOrders = isAdmin ? orders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) : orders;

  const handleToggleDeleteMode = () => {
    if (isDeleteMode) {
      setIsDeleteMode(false);
      setSelectedOrderIds([]);
    } else {
      setIsDeleteMode(true);
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

  const handleOpenReturnModal = (order) => {
    setSelectedReturnOrder(order);
    setReturnModalOpen(true);
  };

  const handleConfirmReturnOrder = async ({ reason, note, refundBankInfo }) => {
    if (!selectedReturnOrder) return;
    setIsSubmittingReturn(true);
    try {
      await requestReturnOrder(selectedReturnOrder.id, {
        reason,
        note,
        refundBankInfo
      });
      setReturnModalOpen(false);
      setSelectedReturnOrder(null);
      showModal('success', 'Yêu cầu hoàn trả đã được gửi thành công! Cửa hàng sẽ xét duyệt trong vòng 24h làm việc.');
      await loadOrders();
    } catch (err) {
      showModal('error', err.message || 'Không thể gửi yêu cầu hoàn trả đơn hàng');
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  const handleConfirmReceived = async (orderId) => {
    if (!window.confirm('Bạn xác nhận đã nhận được kiện hàng này nguyên vẹn và đầy đủ?')) return;
    setIsSubmittingReceive(true);
    try {
      const res = await confirmReceivedOrder(orderId);
      const pointsMsg = res?.pointsEarned ? ` và được cộng ${res.pointsEarned} Điểm Sen!` : '!';
      showModal('success', `Cảm ơn bạn! Đã xác nhận nhận hàng thành công${pointsMsg}`);
      
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

  // ==================== Profile Save ====================
  const handleSave = (e) => {
    e.preventDefault();
    if (onUpdateUser) {
      onUpdateUser(formData);
    }
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // ==================== Cart & Voucher Calculation ====================
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState(false);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = Math.round(subtotal * (discountPercent / 100));
  const freeShippingThreshold = 200000;
  const isFreeShipping = subtotal >= freeShippingThreshold || subtotal === 0;
  const shippingFee = isFreeShipping ? 0 : 30000;
  const total = Math.max(0, subtotal - discountAmount + shippingFee);

  const handleApplyCouponSubmit = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    if (onApplyCoupon) {
      const ok = await onApplyCoupon(couponInput.trim());
      if (ok) {
        setCouponSuccess(true);
        setCouponError('');
      } else {
        setCouponError('Mã ưu đãi không hợp lệ. Hãy thử mã SENXANH10 (-10%) hoặc SENXANH20 (-20%)!');
        setCouponSuccess(false);
      }
    }
  };

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
              {activeTab === 'profile' ? (
                <span className="breadcrumb-current">Tài Khoản Của Tôi</span>
              ) : (
                <>
                  <button 
                    className="breadcrumb-link" 
                    onClick={() => handleTabChange('profile')}
                  >
                    Tài Khoản Của Tôi
                  </button>
                  <span className="breadcrumb-separator">/</span>
                  <span className="breadcrumb-current">
                    {activeTab === 'orders' && 'Lịch Sử Đơn Hàng & Giao Hàng'}
                    {activeTab === 'history' && 'Lịch Sử Mua Hàng'}
                    {activeTab === 'wishlist' && 'Mục Yêu Thích Của Tôi'}
                    {activeTab === 'cart' && 'Giỏ Hàng Của Bạn'}
                  </span>
                </>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginTop: '14px' }}>
              <div>
                <span className="section-subtitle" style={{ color: 'var(--accent)' }}>
                  {activeTab === 'orders' && 'Theo Dõi Đơn & Vận Chuyển'}
                  {activeTab === 'history' && 'Bộ Sưu Tập Cây Đã Sở Hữu'}
                  {activeTab === 'wishlist' && 'Bộ Sưu Tập Đã Lưu'}
                  {activeTab === 'cart' && 'Túi Mầm Xanh'}
                  {activeTab === 'profile' && 'Trung Tâm Thành Viên'}
                </span>
                <h1 className="page-title" style={{ fontSize: '1.75rem', marginTop: '4px' }}>
                  {activeTab === 'orders' && 'Đơn Hàng & Lịch Sử Giao Hàng'}
                  {activeTab === 'history' && `Lịch Sử Mua Hàng (${completedOrdersCount} Đơn Hoàn Tất)`}
                  {activeTab === 'wishlist' && `Mục Yêu Thích (${wishlistProducts.length} Cây)`}
                  {activeTab === 'cart' && `Giỏ Hàng (${cartCount} Sản Phẩm)`}
                  {activeTab === 'profile' && 'Hồ Sơ & Quản Lý Tài Khoản'}
                </h1>
              </div>

              {(activeTab === 'orders' || activeTab === 'history') && (
                <button 
                  className="btn-secondary" 
                  onClick={loadOrders}
                  style={{ padding: '10px 18px', fontSize: '0.88rem' }}
                >
                  <RefreshCw size={15} className={ordersLoading ? 'spin' : ''} />
                  <span>Làm Mới</span>
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

        {/* Main Content Layout */}
        <div className="container page-body-container">
          <div className="account-layout">
            {/* Sidebar Left */}
            <AccountSidebar
              user={user}
              currentUser={currentUser}
              formData={formData}
              activeTab={activeTab}
              setActiveTab={handleTabChange}
              setIsEditing={setIsEditing}
              cartCount={cartCount}
              wishlistCount={wishlistCount}
              completedOrdersCount={completedOrdersCount}
              onLogout={onLogout}
              onNavigateCart={onNavigateCart}
            />

            {/* Main Tabs Container */}
            <main className="account-main">
              {activeTab === 'profile' && (
                <AccountProfileTab
                  user={user}
                  formData={formData}
                  setFormData={setFormData}
                  isEditing={isEditing}
                  setIsEditing={setIsEditing}
                  handleSave={handleSave}
                  savedSuccess={savedSuccess}
                  setActiveTab={handleTabChange}
                  onLogout={onLogout}
                />
              )}

              {activeTab === 'orders' && (
                <AccountOrdersTab
                  user={user}
                  orders={orders}
                  stats={stats}
                  filterStatus={filterStatus}
                  setFilterStatus={setFilterStatus}
                  ordersLoading={ordersLoading}
                  pagedOrders={pagedOrders}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  isDeleteMode={isDeleteMode}
                  selectedOrderIds={selectedOrderIds}
                  handleToggleDeleteMode={handleToggleDeleteMode}
                  handleSelectAll={handleSelectAll}
                  handleDeselectAll={handleDeselectAll}
                  handleToggleSelectOrder={handleToggleSelectOrder}
                  setIsConfirmDeleteModalOpen={setIsConfirmDeleteModalOpen}
                  isDeletingOrders={isDeletingOrders}
                  isAdmin={isAdmin}
                  handleStatusChange={handleStatusChange}
                  handleOpenCancelModal={handleOpenCancelModal}
                  handleOpenReturnModal={handleOpenReturnModal}
                  handleConfirmReceived={handleConfirmReceived}
                  isSubmittingReceive={isSubmittingReceive}
                  onNavigateShop={onNavigateShop}
                  onNavigatePayment={(code) => navigate(`/order-success/${code}`)}
                  onLogout={onLogout}
                />
              )}

              {activeTab === 'wishlist' && (
                <AccountWishlistTab
                  wishlistProducts={wishlistProducts}
                  onNavigateShop={onNavigateShop}
                  onOpenProductDetail={onOpenProductDetail}
                  onAddToCart={onAddToCart}
                  onToggleWishlist={onToggleWishlist}
                />
              )}

              {activeTab === 'history' && (
                <AccountPurchaseHistoryTab
                  orders={orders}
                  ordersLoading={ordersLoading}
                  onAddToCart={onAddToCart}
                  onNavigateShop={onNavigateShop}
                  onNavigateCart={() => handleTabChange('cart')}
                  onOpenProductDetail={onOpenProductDetail}
                  onOpenReturnModal={handleOpenReturnModal}
                  onNavigateOrders={() => handleTabChange('orders')}
                />
              )}

              {activeTab === 'cart' && (
                <AccountCartTab
                  cartItems={cartItems}
                  onNavigateCart={onNavigateCart}
                  onNavigateShop={onNavigateShop}
                  onOpenProductDetail={onOpenProductDetail}
                  onUpdateQty={onUpdateQty}
                  onRemoveItem={onRemoveItem}
                  couponInput={couponInput}
                  setCouponInput={setCouponInput}
                  handleApplyCouponSubmit={handleApplyCouponSubmit}
                  couponSuccess={couponSuccess}
                  couponError={couponError}
                  discountPercent={discountPercent}
                  discountCode={discountCode}
                  discountAmount={discountAmount}
                  subtotal={subtotal}
                  shippingFee={shippingFee}
                  total={total}
                  onNavigateCheckout={onNavigateCheckout}
                />
              )}
            </main>
          </div>
        </div>
      </div>

      {/* Modal Hủy Đơn Hàng */}
      <OrderCancelModal
        isOpen={cancelModalOpen}
        order={selectedCancelOrder}
        onClose={() => setCancelModalOpen(false)}
        cancelReason={cancelReason}
        setCancelReason={setCancelReason}
        customReason={customReason}
        setCustomReason={setCustomReason}
        onConfirmCancel={handleConfirmCancelOrder}
        isSubmitting={isSubmittingCancel}
      />

      {/* Modal Xóa Đơn Hàng Hàng Loạt */}
      <OrderDeleteModal
        isOpen={isConfirmDeleteModalOpen}
        selectedCount={selectedOrderIds.length}
        onClose={() => setIsConfirmDeleteModalOpen(false)}
        onConfirmDelete={handleExecuteDeleteBulk}
        isDeleting={isDeletingOrders}
      />

      {/* Modal Hoàn Trả Đơn Hàng */}
      <OrderReturnModal
        isOpen={returnModalOpen}
        order={selectedReturnOrder}
        onClose={() => setReturnModalOpen(false)}
        onConfirmReturn={handleConfirmReturnOrder}
        isSubmitting={isSubmittingReturn}
      />

      {/* Notification Modal */}
      <NotificationModal {...modalProps} />
    </>
  );
}
