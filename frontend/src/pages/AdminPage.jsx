import React, { useState, useEffect, useMemo } from 'react';
import {
  Package,
  CheckCircle2,
  Clock,
  Truck,
  RefreshCw,
  AlertCircle,
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  Sprout,
  Tag,
  Users,
  Shield,
  Eye,
  X,
  Sparkles,
  ChevronRight,
  TrendingUp,
  SlidersHorizontal,
  Check,
  AlertTriangle
} from 'lucide-react';
import {
  getAdminOrders,
  updateOrderStatus,
  getAdminStats,
  getAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  updateProductStock,
  deleteAdminProduct,
  getAdminCoupons,
  createAdminCoupon,
  toggleAdminCoupon,
  deleteAdminCoupon,
  getAdminCustomers,
  updateCustomerRole
} from '../services/api';
import { CATEGORIES } from '../data/products';

const ORDER_STATUS_LABELS = {
  PENDING: { label: 'Chờ Thanh Toán', color: '#D97706', bg: '#FEF3C7', icon: Clock },
  PAID: { label: 'Đã Thanh Toán', color: '#059669', bg: '#D1FAE5', icon: CheckCircle2 },
  SHIPPING: { label: 'Đang Giao Hàng', color: '#2563EB', bg: '#DBEAFE', icon: Truck },
  COMPLETED: { label: 'Đã Hoàn Tất', color: '#047857', bg: '#A7F3D0', icon: CheckCircle2 },
  CANCELLED: { label: 'Đã Hủy', color: '#DC2626', bg: '#FEE2E2', icon: AlertCircle }
};

const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1520302630591-fd1c66edc19d?auto=format&fit=crop&w=800&q=80'
];

export default function AdminPage({
  onNavigateHome,
  onNavigateShop,
  onProductsChange,
  addToast
}) {
  // Navigation tabs: 'orders' | 'products' | 'coupons' | 'customers'
  const [activeTab, setActiveTab] = useState('orders');

  // Stats
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // Orders State
  const [orders, setOrders] = useState([]);
  const [orderFilterStatus, setOrderFilterStatus] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');

  // Products State
  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [productCategory, setProductCategory] = useState('all');
  const [productStockFilter, setProductStockFilter] = useState('all'); // 'all' | 'low' | 'out'

  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productFormData, setProductFormData] = useState({
    name: '',
    scientificName: '',
    category: 'echeveria',
    price: 65000,
    originalPrice: 85000,
    inStock: 25,
    badge: 'Mới về',
    image: SAMPLE_IMAGES[0],
    difficulty: 'Dễ trồng',
    difficultyLevel: 1,
    light: 'Nhiều nắng gián tiếp',
    lightType: 'indirect',
    watering: '1 tuần / 1 lần',
    wateringDays: 7,
    size: 'Mini (6 - 8cm)',
    idealLocation: 'Bàn làm việc, cửa sổ sáng',
    description: '',
    meaning: ''
  });

  // Coupons State
  const [coupons, setCoupons] = useState([]);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponFormData, setCouponFormData] = useState({
    code: '',
    discountPercent: 15,
    description: '',
    isActive: true
  });

  // Customers State
  const [customers, setCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState('');

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  // ----------------------------------------------------
  // DATA FETCHING
  // ----------------------------------------------------
  const loadAllData = async () => {
    setLoading(true);
    try {
      const [statsData, ordersData, productsData, couponsData, customersData] = await Promise.all([
        getAdminStats(),
        getAdminOrders(orderFilterStatus),
        getAdminProducts(),
        getAdminCoupons(),
        getAdminCustomers()
      ]);

      setStats(statsData);
      setOrders(ordersData);
      setProducts(productsData);
      setCoupons(couponsData);
      setCustomers(customersData);

      if (onProductsChange) {
        onProductsChange(productsData);
      }
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [orderFilterStatus]);

  // ----------------------------------------------------
  // ORDER ACTIONS
  // ----------------------------------------------------
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      if (addToast) addToast(`Đã đổi trạng thái đơn #${orderId} sang ${newStatus}`, 'success');
      loadAllData();
    } catch (err) {
      alert('Không thể cập nhật trạng thái đơn hàng');
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        !orderSearch ||
        (o.orderCode && o.orderCode.toLowerCase().includes(orderSearch.toLowerCase())) ||
        (o.customerName && o.customerName.toLowerCase().includes(orderSearch.toLowerCase())) ||
        (o.customerPhone && o.customerPhone.includes(orderSearch));
      return matchSearch;
    });
  }, [orders, orderSearch]);

  // ----------------------------------------------------
  // PRODUCT ACTIONS
  // ----------------------------------------------------
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductFormData({
      name: '',
      scientificName: '',
      category: 'echeveria',
      price: 65000,
      originalPrice: 85000,
      inStock: 25,
      badge: 'Mới về',
      image: SAMPLE_IMAGES[Math.floor(Math.random() * SAMPLE_IMAGES.length)],
      difficulty: 'Dễ trồng',
      difficultyLevel: 1,
      light: 'Nhiều nắng gián tiếp',
      lightType: 'indirect',
      watering: '1 tuần / 1 lần',
      wateringDays: 7,
      size: 'Mini (6 - 8cm)',
      idealLocation: 'Bàn làm việc, cửa sổ sáng',
      description: 'Sen đá mang vẻ đẹp mộc mạc, thuần khiết và dễ chăm sóc tại nhà hoặc văn phòng.',
      meaning: 'Tượng trưng cho tình bạn vĩnh cửu, sự kiên cường và may mắn tài lộc.'
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);
    setProductFormData({
      ...prod,
      price: prod.price || 0,
      originalPrice: prod.originalPrice || prod.price || 0,
      inStock: prod.inStock || 0
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productFormData.name.trim()) {
      alert('Vui lòng nhập tên sen đá!');
      return;
    }

    try {
      if (editingProduct) {
        await updateAdminProduct(editingProduct.id, productFormData);
        if (addToast) addToast(`Đã cập nhật cây "${productFormData.name}"`, 'success');
      } else {
        await createAdminProduct(productFormData);
        if (addToast) addToast(`Đã thêm cây "${productFormData.name}" vào vườn`, 'success');
      }
      setIsProductModalOpen(false);
      loadAllData();
    } catch (err) {
      alert('Lỗi khi lưu thông tin sản phẩm: ' + err.message);
    }
  };

  const handleQuickStockChange = async (prod, delta) => {
    const newStock = Math.max(0, (prod.inStock || 0) + delta);
    try {
      await updateProductStock(prod.id, newStock);
      setProducts((prev) =>
        prev.map((p) => (p.id === prod.id ? { ...p, inStock: newStock } : p))
      );
      if (onProductsChange) {
        onProductsChange(
          products.map((p) => (p.id === prod.id ? { ...p, inStock: newStock } : p))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProduct = async (prod) => {
    if (window.confirm(`Bạn có chắc muốn xóa cây "${prod.name}" khỏi danh mục?`)) {
      try {
        await deleteAdminProduct(prod.id);
        if (addToast) addToast(`Đã xóa cây "${prod.name}"`, 'info');
        loadAllData();
      } catch (err) {
        alert('Không thể xóa sản phẩm');
      }
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        !productSearch ||
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        (p.scientificName && p.scientificName.toLowerCase().includes(productSearch.toLowerCase()));

      const matchCategory = productCategory === 'all' || p.category === productCategory;

      let matchStock = true;
      if (productStockFilter === 'low') matchStock = (p.inStock || 0) > 0 && (p.inStock || 0) <= 10;
      else if (productStockFilter === 'out') matchStock = (p.inStock || 0) === 0;

      return matchSearch && matchCategory && matchStock;
    });
  }, [products, productSearch, productCategory, productStockFilter]);

  // ----------------------------------------------------
  // COUPON ACTIONS
  // ----------------------------------------------------
  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    if (!couponFormData.code.trim()) {
      alert('Vui lòng nhập mã giảm giá!');
      return;
    }

    try {
      await createAdminCoupon({
        ...couponFormData,
        code: couponFormData.code.trim().toUpperCase()
      });
      if (addToast) addToast(`Đã tạo mã "${couponFormData.code.toUpperCase()}"`, 'success');
      setIsCouponModalOpen(false);
      loadAllData();
    } catch (err) {
      alert('Lỗi khi tạo mã giảm giá: ' + err.message);
    }
  };

  const handleToggleCoupon = async (coupon) => {
    try {
      await toggleAdminCoupon(coupon.code, !coupon.isActive);
      setCoupons((prev) =>
        prev.map((c) => (c.code === coupon.code ? { ...c, isActive: !c.isActive } : c))
      );
      if (addToast) {
        addToast(
          `Voucher ${coupon.code} hiện ${!coupon.isActive ? 'Đang kích hoạt' : 'Đã tạm dừng'}`,
          'info'
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCoupon = async (coupon) => {
    if (window.confirm(`Xác nhận xóa voucher "${coupon.code}"?`)) {
      try {
        await deleteAdminCoupon(coupon.code);
        if (addToast) addToast(`Đã xóa voucher ${coupon.code}`, 'info');
        loadAllData();
      } catch (err) {
        alert('Không thể xóa voucher');
      }
    }
  };

  // ----------------------------------------------------
  // CUSTOMER ACTIONS
  // ----------------------------------------------------
  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateCustomerRole(userId, newRole);
      if (addToast) addToast('Đã cập nhật phân quyền người dùng', 'success');
      setCustomers((prev) =>
        prev.map((c) => (String(c.id) === String(userId) ? { ...c, role: newRole } : c))
      );
    } catch (err) {
      alert('Không thể cập nhật phân quyền');
    }
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (!customerSearch) return true;
      const q = customerSearch.toLowerCase();
      return (
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.phone && c.phone.includes(q))
      );
    });
  }, [customers, customerSearch]);

  return (
    <div className="admin-page">
      {/* Header Banner */}
      <div className="page-header-banner">
        <div className="container">
          <div className="breadcrumb">
            <button className="breadcrumb-link" onClick={onNavigateHome}>
              Trang Chủ
            </button>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Hệ Thống Quản Trị Sen Xinh Garden</span>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              flexWrap: 'wrap',
              gap: '16px',
              marginTop: '14px'
            }}
          >
            <div>
              <span className="section-subtitle" style={{ color: 'var(--accent)' }}>
                Bảng Điều Khiển Nhà Vườn (Spring Boot 3.4 + React 18)
              </span>
              <h1 className="page-title" style={{ fontSize: '2.3rem', marginTop: '4px' }}>
                Trung Tâm Quản Trị & Kho Cây
              </h1>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                className="btn-secondary"
                onClick={loadAllData}
                style={{ padding: '10px 18px', fontSize: '0.88rem' }}
                title="Làm mới dữ liệu từ server"
              >
                <RefreshCw size={15} className={loading ? 'spin' : ''} />
                <span>Làm Mới</span>
              </button>

              <button
                className="btn-secondary"
                onClick={onNavigateHome}
                style={{ padding: '10px 18px', fontSize: '0.88rem' }}
              >
                <ArrowLeft size={15} />
                <span>Về Cửa Hàng</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '32px 24px 80px' }}>
        {/* KPI Stats Row */}
        {stats && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
              gap: '16px',
              marginBottom: '32px'
            }}
          >
            <div
              style={{
                background: '#fff',
                padding: '18px 20px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-light)' }}>Tổng Doanh Thu</span>
                <TrendingUp size={16} color="var(--primary)" />
              </div>
              <strong style={{ fontSize: '1.45rem', color: 'var(--primary)', display: 'block', marginTop: '4px' }}>
                {formatPrice(stats.totalRevenue)}
              </strong>
            </div>

            <div
              style={{
                background: '#FFFBEB',
                padding: '18px 20px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #FDE68A'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', color: '#B45309' }}>Đơn Chờ Thanh Toán</span>
                <Clock size={16} color="#D97706" />
              </div>
              <strong style={{ fontSize: '1.6rem', color: '#D97706', display: 'block', marginTop: '4px' }}>
                {stats.pendingOrders}
              </strong>
            </div>

            <div
              style={{
                background: '#ECFDF5',
                padding: '18px 20px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #A7F3D0'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', color: '#047857' }}>Đơn Đã Xử Lý / Xong</span>
                <CheckCircle2 size={16} color="#059669" />
              </div>
              <strong style={{ fontSize: '1.6rem', color: '#059669', display: 'block', marginTop: '4px' }}>
                {(stats.paidOrders || 0) + (stats.completedOrders || 0)}
              </strong>
            </div>

            <div
              style={{
                background: '#EFF6FF',
                padding: '18px 20px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #BFDBFE'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', color: '#1D4ED8' }}>Sen Đá Trong Kho</span>
                <Sprout size={16} color="#2563EB" />
              </div>
              <strong style={{ fontSize: '1.6rem', color: '#1D4ED8', display: 'block', marginTop: '4px' }}>
                {stats.totalProducts || products.length}
              </strong>
            </div>

            <div
              style={{
                background: '#FAF5FF',
                padding: '18px 20px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #E9D5FF'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', color: '#7E22CE' }}>Thành Viên Đăng Ký</span>
                <Users size={16} color="#9333EA" />
              </div>
              <strong style={{ fontSize: '1.6rem', color: '#7E22CE', display: 'block', marginTop: '4px' }}>
                {stats.totalCustomers || customers.length}
              </strong>
            </div>
          </div>
        )}

        {/* Navigation Tabs Bar */}
        <div className="admin-nav-tabs">
          <button
            className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <Package size={17} />
            <span>Đơn Hàng & Vận Chuyển</span>
            <span className="admin-tab-badge">{orders.length}</span>
          </button>

          <button
            className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <Sprout size={17} />
            <span>Quản Lý Sen Đá & Tồn Kho</span>
            <span className="admin-tab-badge">{products.length}</span>
          </button>

          <button
            className={`admin-tab-btn ${activeTab === 'coupons' ? 'active' : ''}`}
            onClick={() => setActiveTab('coupons')}
          >
            <Tag size={17} />
            <span>Mã Ưu Đãi & Voucher</span>
            <span className="admin-tab-badge">{coupons.length}</span>
          </button>

          <button
            className={`admin-tab-btn ${activeTab === 'customers' ? 'active' : ''}`}
            onClick={() => setActiveTab('customers')}
          >
            <Users size={17} />
            <span>Khách Hàng & Phân Quyền</span>
            <span className="admin-tab-badge">{customers.length}</span>
          </button>
        </div>

        {/* ============================================================ */}
        {/* TAB 1: ORDERS MANAGEMENT */}
        {/* ============================================================ */}
        {activeTab === 'orders' && (
          <div>
            <div className="admin-toolbar">
              <div className="admin-search-wrapper">
                <Search size={17} />
                <input
                  type="text"
                  className="admin-search-input"
                  placeholder="Tìm theo mã đơn (#SX-...), tên khách, số điện thoại..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                />
              </div>

              {/* Status filter tabs */}
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
                {['all', 'PENDING', 'PAID', 'SHIPPING', 'COMPLETED', 'CANCELLED'].map((st) => (
                  <button
                    key={st}
                    className={`cat-tab ${orderFilterStatus === st ? 'active' : ''}`}
                    onClick={() => setOrderFilterStatus(st)}
                    style={{ fontSize: '0.82rem', padding: '6px 12px' }}
                  >
                    {st === 'all' ? 'Tất Cả' : ORDER_STATUS_LABELS[st]?.label || st}
                  </button>
                ))}
              </div>
            </div>

            {/* Order Cards List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredOrders.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    background: '#fff',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px dashed var(--border-light)'
                  }}
                >
                  <Package size={44} style={{ opacity: 0.3, marginBottom: '12px' }} />
                  <h4>Không tìm thấy đơn hàng nào phù hợp</h4>
                </div>
              ) : (
                filteredOrders.map((order) => {
                  const statusCfg = ORDER_STATUS_LABELS[order.status] || ORDER_STATUS_LABELS.PENDING;
                  const StatusIcon = statusCfg.icon;

                  return (
                    <div
                      key={order.id}
                      style={{
                        background: '#fff',
                        border: '1px solid var(--border-light)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '22px',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          flexWrap: 'wrap',
                          gap: '14px',
                          marginBottom: '16px'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <strong style={{ fontSize: '1.12rem', color: 'var(--primary)' }}>
                              Đơn Hàng #{order.orderCode}
                            </strong>
                            <span style={{ fontSize: '0.82rem', color: 'var(--text-light)' }}>
                              • {order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : 'Vừa tạo'}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.92rem', fontWeight: 600, marginTop: '4px' }}>
                            Khách hàng: {order.customerName} - 📞 {order.customerPhone}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            📍 Địa chỉ: {order.customerAddress}
                          </div>
                          {order.note && (
                            <div style={{ fontSize: '0.84rem', color: 'var(--accent)', marginTop: '2px' }}>
                              💬 Ghi chú: {order.note}
                            </div>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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

                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className="select-filter"
                            style={{ padding: '6px 32px 6px 12px', fontSize: '0.84rem' }}
                          >
                            <option value="PENDING">Chờ Thanh Toán</option>
                            <option value="PAID">Đã Thanh Toán</option>
                            <option value="SHIPPING">Đang Giao Hàng</option>
                            <option value="COMPLETED">Đã Hoàn Tất</option>
                            <option value="CANCELLED">Hủy Đơn</option>
                          </select>
                        </div>
                      </div>

                      <div
                        style={{
                          background: 'var(--bg-main)',
                          padding: '12px 16px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.88rem'
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '6px',
                            flexWrap: 'wrap',
                            gap: '8px'
                          }}
                        >
                          <span style={{ color: 'var(--text-muted)' }}>Danh sách món:</span>
                          <span style={{ fontWeight: 500 }}>
                            {order.items && order.items.length > 0
                              ? order.items
                                  .map((it) => `${it.productName || it.name} (x${it.quantity})`)
                                  .join(' • ')
                              : 'Chi tiết sản phẩm'}
                          </span>
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontWeight: 700,
                            paddingTop: '8px',
                            borderTop: '1px dashed var(--border-light)'
                          }}
                        >
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Phương thức:{' '}
                            <strong style={{ color: 'var(--text-main)' }}>
                              {order.paymentMethod === 'momo'
                                ? 'Ví MoMo / VietQR'
                                : order.paymentMethod === 'vietqr'
                                ? 'VietQR Ngân Hàng'
                                : 'COD (Thu Hộ)'}
                            </strong>
                          </span>
                          <span style={{ color: 'var(--primary)', fontSize: '1.05rem' }}>
                            {formatPrice(order.totalAmount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: PRODUCTS & STOCK CRUD MANAGEMENT */}
        {/* ============================================================ */}
        {activeTab === 'products' && (
          <div>
            <div className="admin-toolbar">
              <div className="admin-search-wrapper">
                <Search size={17} />
                <input
                  type="text"
                  className="admin-search-input"
                  placeholder="Tìm theo tên sen đá, tên khoa học..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <select
                  value={productCategory}
                  onChange={(e) => setProductCategory(e.target.value)}
                  className="select-filter"
                  style={{ padding: '8px 28px 8px 12px', fontSize: '0.85rem' }}
                >
                  <option value="all">Tất Cả Danh Mục</option>
                  {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>

                <select
                  value={productStockFilter}
                  onChange={(e) => setProductStockFilter(e.target.value)}
                  className="select-filter"
                  style={{ padding: '8px 28px 8px 12px', fontSize: '0.85rem' }}
                >
                  <option value="all">Tất Cả Tồn Kho</option>
                  <option value="low">⚠️ Sắp Hết (≤ 10)</option>
                  <option value="out">❌ Hết Hàng (0)</option>
                </select>

                <button
                  className="btn-primary"
                  onClick={handleOpenAddProduct}
                  style={{ padding: '9px 18px', fontSize: '0.88rem' }}
                >
                  <Plus size={16} />
                  <span>Thêm Cây Mới</span>
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="admin-table-wrapper">
              <div className="admin-table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Sen Đá</th>
                      <th>Danh Mục</th>
                      <th>Giá Bán</th>
                      <th>Tồn Kho</th>
                      <th>Đặc Tính</th>
                      <th>Huy Hiệu</th>
                      <th style={{ textAlign: 'center' }}>Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-light)' }}>
                          Chưa có sản phẩm nào phù hợp với bộ lọc tìm kiếm
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((prod) => {
                        const isLow = (prod.inStock || 0) > 0 && (prod.inStock || 0) <= 10;
                        const isOut = (prod.inStock || 0) === 0;

                        return (
                          <tr key={prod.id}>
                            <td>
                              <div className="admin-prod-cell">
                                <img
                                  src={
                                    prod.image ||
                                    'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=150&q=80'
                                  }
                                  alt={prod.name}
                                  className="admin-prod-thumb"
                                />
                                <div>
                                  <strong style={{ color: 'var(--text-main)', display: 'block', fontSize: '0.95rem' }}>
                                    {prod.name}
                                  </strong>
                                  <span style={{ fontSize: '0.78rem', color: 'var(--text-light)', fontStyle: 'italic' }}>
                                    {prod.scientificName || 'Sen mọng nước'}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span
                                style={{
                                  background: 'var(--bg-main)',
                                  padding: '4px 10px',
                                  borderRadius: 'var(--radius-full)',
                                  fontSize: '0.8rem',
                                  color: 'var(--text-muted)',
                                  fontWeight: 500
                                }}
                              >
                                {CATEGORIES.find((c) => c.id === prod.category)?.name || prod.category}
                              </span>
                            </td>
                            <td>
                              <div>
                                <strong style={{ color: 'var(--primary)', fontSize: '0.98rem' }}>
                                  {formatPrice(prod.price)}
                                </strong>
                                {prod.originalPrice > prod.price && (
                                  <span
                                    style={{
                                      fontSize: '0.78rem',
                                      color: 'var(--text-light)',
                                      textDecoration: 'line-through',
                                      display: 'block'
                                    }}
                                  >
                                    {formatPrice(prod.originalPrice)}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span
                                  className={`stock-pill ${
                                    isOut ? 'out-of-stock' : isLow ? 'low-stock' : 'in-stock'
                                  }`}
                                >
                                  {isOut ? 'Hết hàng' : isLow ? `Còn ít (${prod.inStock})` : `Còn ${prod.inStock}`}
                                </span>

                                <div className="stock-stepper">
                                  <button
                                    className="stock-step-btn"
                                    onClick={() => handleQuickStockChange(prod, -1)}
                                    title="Giảm 1 cây"
                                  >
                                    -
                                  </button>
                                  <button
                                    className="stock-step-btn"
                                    onClick={() => handleQuickStockChange(prod, 1)}
                                    title="Tăng 1 cây"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                <div>☀️ {prod.light || 'Nắng nhẹ'}</div>
                                <div>💧 {prod.watering || '1 tuần/lần'}</div>
                              </div>
                            </td>
                            <td>
                              {prod.badge ? (
                                <span
                                  style={{
                                    background: '#FEF3C7',
                                    color: '#B45309',
                                    padding: '3px 8px',
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: '0.75rem',
                                    fontWeight: 700
                                  }}
                                >
                                  {prod.badge}
                                </span>
                              ) : (
                                <span style={{ color: 'var(--text-light)', fontSize: '0.8rem' }}>—</span>
                              )}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <div style={{ display: 'inline-flex', gap: '6px' }}>
                                <button
                                  className="btn-icon-action"
                                  onClick={() => handleOpenEditProduct(prod)}
                                  title="Chỉnh sửa sản phẩm"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  className="btn-icon-action delete"
                                  onClick={() => handleDeleteProduct(prod)}
                                  title="Xóa sản phẩm"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: COUPONS / VOUCHERS MANAGEMENT */}
        {/* ============================================================ */}
        {activeTab === 'coupons' && (
          <div>
            <div className="admin-toolbar">
              <div>
                <strong style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>
                  Danh Sách Mã Giảm Giá Đang Có
                </strong>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                  Khách hàng có thể nhập các mã đang kích hoạt khi xem Giỏ hàng hoặc Thanh toán.
                </p>
              </div>

              <button
                className="btn-primary"
                onClick={() => {
                  setCouponFormData({
                    code: '',
                    discountPercent: 15,
                    description: '',
                    isActive: true
                  });
                  setIsCouponModalOpen(true);
                }}
                style={{ padding: '9px 18px', fontSize: '0.88rem' }}
              >
                <Plus size={16} />
                <span>Tạo Mã Voucher Mới</span>
              </button>
            </div>

            <div className="coupon-cards-grid">
              {coupons.map((c) => (
                <div key={c.code} className={`admin-coupon-ticket ${!c.isActive ? 'inactive' : ''}`}>
                  <div>
                    <div className="coupon-ticket-header">
                      <span className="coupon-ticket-code">{c.code}</span>
                      <span className="coupon-discount-badge">-{c.discountPercent}%</span>
                    </div>

                    <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', margin: '0 0 14px' }}>
                      {c.description || 'Ưu đãi dành cho khách hàng Sen Xinh'}
                    </p>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: '12px',
                      borderTop: '1px dashed #E2E8F0'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <label className="admin-toggle" title="Bật / tắt hiệu lực mã voucher">
                        <input
                          type="checkbox"
                          checked={Boolean(c.isActive)}
                          onChange={() => handleToggleCoupon(c)}
                        />
                        <span className="admin-toggle-slider" />
                      </label>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: c.isActive ? '#059669' : '#94A3B8' }}>
                        {c.isActive ? 'Đang hoạt động' : 'Tạm dừng'}
                      </span>
                    </div>

                    <button
                      className="btn-icon-action delete"
                      onClick={() => handleDeleteCoupon(c)}
                      title="Xóa voucher này"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: CUSTOMERS & MEMBERSHIP MANAGEMENT */}
        {/* ============================================================ */}
        {activeTab === 'customers' && (
          <div>
            <div className="admin-toolbar">
              <div className="admin-search-wrapper">
                <Search size={17} />
                <input
                  type="text"
                  className="admin-search-input"
                  placeholder="Tìm thành viên theo tên, email, số điện thoại..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                />
              </div>

              <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                Tổng cộng: <strong style={{ color: 'var(--primary)' }}>{filteredCustomers.length}</strong> người dùng
              </div>
            </div>

            <div className="admin-table-wrapper">
              <div className="admin-table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Khách Hàng</th>
                      <th>Email & SĐT</th>
                      <th>Địa Chỉ Giao Hàng</th>
                      <th>Điểm Sen Thưởng</th>
                      <th>Vai Trò & Phân Quyền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map((cust) => (
                      <tr key={cust.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img
                              src={
                                cust.avatar ||
                                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                              }
                              alt={cust.name}
                              style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                            <div>
                              <strong style={{ color: 'var(--text-main)', fontSize: '0.94rem' }}>
                                {cust.name}
                              </strong>
                              {cust.role && cust.role.includes('Admin') && (
                                <span
                                  style={{
                                    marginLeft: '6px',
                                    background: '#DC2626',
                                    color: '#fff',
                                    fontSize: '0.7rem',
                                    padding: '2px 6px',
                                    borderRadius: 'var(--radius-full)',
                                    fontWeight: 700
                                  }}
                                >
                                  ADMIN
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.88rem' }}>
                            <div>📧 {cust.email}</div>
                            {cust.phone && <div style={{ color: 'var(--text-muted)' }}>📞 {cust.phone}</div>}
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                            {cust.address || 'Chưa cập nhật'}
                          </span>
                        </td>
                        <td>
                          <span
                            style={{
                              background: '#ECFDF5',
                              color: '#047857',
                              fontWeight: 700,
                              padding: '4px 10px',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.82rem'
                            }}
                          >
                            🌱 {cust.points || 0} điểm
                          </span>
                        </td>
                        <td>
                          <select
                            value={cust.role || 'Thành viên mới'}
                            onChange={(e) => handleRoleChange(cust.id, e.target.value)}
                            className="select-filter"
                            style={{ padding: '6px 30px 6px 10px', fontSize: '0.82rem' }}
                          >
                            <option value="Quản trị viên (Admin)">Quản trị viên (Admin)</option>
                            <option value="Khách hàng VIP">Khách hàng VIP</option>
                            <option value="Thành viên thân thiết">Thành viên thân thiết</option>
                            <option value="Thành viên mới">Thành viên mới</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* MODAL: ADD / EDIT PRODUCT */}
      {/* ============================================================ */}
      {isProductModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsProductModalOpen(false)}>
          <div className="admin-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sprout size={20} color="var(--primary)" />
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)' }}>
                  {editingProduct ? 'Chỉnh Sửa Thông Tin Sen Đá' : 'Thêm Sen Đá Mới Vào Vườn'}
                </h3>
              </div>
              <button
                className="btn-icon-action"
                onClick={() => setIsProductModalOpen(false)}
                title="Đóng cửa sổ"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}>
              <div className="admin-modal-body">
                {/* Basic info */}
                <div className="admin-form-row">
                  <div className="admin-form-control">
                    <label>Tên Sen Đá *</label>
                    <input
                      type="text"
                      required
                      placeholder="VD: Sen Đá Kim Cương Pha Lê"
                      value={productFormData.name}
                      onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-control">
                    <label>Tên Khoa Học</label>
                    <input
                      type="text"
                      placeholder="VD: Haworthia Cooperi"
                      value={productFormData.scientificName}
                      onChange={(e) => setProductFormData({ ...productFormData, scientificName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-control">
                    <label>Danh Mục</label>
                    <select
                      value={productFormData.category}
                      onChange={(e) => setProductFormData({ ...productFormData, category: e.target.value })}
                    >
                      {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-form-control">
                    <label>Huy Hiệu (Badge)</label>
                    <input
                      type="text"
                      placeholder="VD: Bán chạy, Mới về, Ưa chuộng..."
                      value={productFormData.badge || ''}
                      onChange={(e) => setProductFormData({ ...productFormData, badge: e.target.value })}
                    />
                  </div>
                </div>

                {/* Pricing & Stock */}
                <div className="admin-form-row">
                  <div className="admin-form-control">
                    <label>Giá Bán (VNĐ) *</label>
                    <input
                      type="number"
                      required
                      min="1000"
                      step="1000"
                      value={productFormData.price}
                      onChange={(e) =>
                        setProductFormData({ ...productFormData, price: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="admin-form-control">
                    <label>Giá Gốc (Trước giảm)</label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={productFormData.originalPrice}
                      onChange={(e) =>
                        setProductFormData({ ...productFormData, originalPrice: Number(e.target.value) })
                      }
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-control">
                    <label>Số Lượng Tồn Kho *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={productFormData.inStock}
                      onChange={(e) =>
                        setProductFormData({ ...productFormData, inStock: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="admin-form-control">
                    <label>Kích Thước Cây</label>
                    <input
                      type="text"
                      placeholder="VD: Mini (6 - 8cm), Trung (8 - 10cm)..."
                      value={productFormData.size || ''}
                      onChange={(e) => setProductFormData({ ...productFormData, size: e.target.value })}
                    />
                  </div>
                </div>

                {/* Image URL & Sample images */}
                <div className="admin-form-control">
                  <label>Đường Dẫn Hình Ảnh (URL)</label>
                  <input
                    type="url"
                    value={productFormData.image}
                    onChange={(e) => setProductFormData({ ...productFormData, image: e.target.value })}
                    placeholder="https://..."
                  />
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>Chọn ảnh mẫu:</span>
                    {SAMPLE_IMAGES.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Sample ${idx}`}
                        onClick={() => setProductFormData({ ...productFormData, image: img })}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          objectFit: 'cover',
                          border: productFormData.image === img ? '2px solid var(--primary)' : '1px solid var(--border-light)'
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Care specs */}
                <div className="admin-form-row">
                  <div className="admin-form-control">
                    <label>Yêu Cầu Ánh Sáng</label>
                    <select
                      value={productFormData.lightType}
                      onChange={(e) =>
                        setProductFormData({
                          ...productFormData,
                          lightType: e.target.value,
                          light:
                            e.target.value === 'full_sun'
                              ? 'Nhiều nắng trực tiếp'
                              : e.target.value === 'indirect'
                              ? 'Nhiều nắng gián tiếp'
                              : 'Trong nhà / Bàn làm việc'
                        })
                      }
                    >
                      <option value="indirect">Nhiều nắng gián tiếp</option>
                      <option value="full_sun">Nhiều nắng trực tiếp</option>
                      <option value="indoor">Trong nhà / Bàn làm việc</option>
                    </select>
                  </div>
                  <div className="admin-form-control">
                    <label>Chu Kỳ Tưới Nước</label>
                    <input
                      type="text"
                      placeholder="VD: 1 tuần / 1 lần"
                      value={productFormData.watering}
                      onChange={(e) => setProductFormData({ ...productFormData, watering: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-form-control">
                  <label>Mô Tả Sản Phẩm</label>
                  <textarea
                    rows={3}
                    value={productFormData.description}
                    onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
                    placeholder="Mô tả đặc điểm nổi bật, dáng cây, màu sắc khi tắm nắng..."
                  />
                </div>

                <div className="admin-form-control">
                  <label>Ý Nghĩa Phong Thủy</label>
                  <input
                    type="text"
                    value={productFormData.meaning}
                    onChange={(e) => setProductFormData({ ...productFormData, meaning: e.target.value })}
                    placeholder="VD: Mang lại tài lộc, sự may mắn và bình an..."
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsProductModalOpen(false)}
                >
                  Hủy Bỏ
                </button>
                <button type="submit" className="btn-primary">
                  <Check size={16} />
                  <span>{editingProduct ? 'Cập Nhật Sen Đá' : 'Lưu Vào Cửa Hàng'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: CREATE COUPON */}
      {/* ============================================================ */}
      {isCouponModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsCouponModalOpen(false)}>
          <div
            className="admin-modal-container"
            style={{ maxWidth: '520px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Tag size={20} color="var(--primary)" />
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)' }}>
                  Tạo Mã Voucher Giảm Giá
                </h3>
              </div>
              <button
                className="btn-icon-action"
                onClick={() => setIsCouponModalOpen(false)}
                title="Đóng cửa sổ"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon}>
              <div className="admin-modal-body">
                <div className="admin-form-control">
                  <label>Mã Voucher (Code) *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: SENXINHVIP25, FREESHIP..."
                    value={couponFormData.code}
                    onChange={(e) =>
                      setCouponFormData({
                        ...couponFormData,
                        code: e.target.value.toUpperCase().replace(/\s+/g, '')
                      })
                    }
                    style={{ textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}
                  />
                </div>

                <div className="admin-form-control">
                  <label>Phần Trăm Chiết Khấu (%) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="100"
                    value={couponFormData.discountPercent}
                    onChange={(e) =>
                      setCouponFormData({
                        ...couponFormData,
                        discountPercent: Number(e.target.value)
                      })
                    }
                  />
                </div>

                <div className="admin-form-control">
                  <label>Mô Tả / Điều Kiện Áp Dụng</label>
                  <textarea
                    rows={2}
                    placeholder="VD: Giảm 25% cho đơn hàng từ 200k, áp dụng toàn quốc..."
                    value={couponFormData.description}
                    onChange={(e) =>
                      setCouponFormData({ ...couponFormData, description: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsCouponModalOpen(false)}
                >
                  Hủy Bỏ
                </button>
                <button type="submit" className="btn-primary">
                  <Check size={16} />
                  <span>Kích Hoạt Mã Ngay</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
