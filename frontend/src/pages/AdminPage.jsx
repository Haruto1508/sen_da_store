import React, { useState, useEffect, useCallback } from 'react';
import NotificationModal from '../components/NotificationModal';
import useModal from '../components/useModal';
import useOrderEvents from '../hooks/useOrderEvents';
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
  updateCustomerRole,
  updateCustomerStatus,
  deleteAdminCustomer,
  deleteProductImage,
  getShippingConfig,
  fetchShippingConfig,
  saveShippingConfig,
  resetShippingConfig
} from '../services/api';

import { ORDER_STATUS_LABELS, SAMPLE_IMAGES } from '../components/admin/adminConstants';
import AdminGatekeeper from '../components/admin/AdminGatekeeper';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';
import AdminStatsCards from '../components/admin/AdminStatsCards';
import OrdersTab from '../components/admin/OrdersTab';
import DeliveredOrdersTab from '../components/admin/DeliveredOrdersTab';
import ProductsTab from '../components/admin/ProductsTab';
import CouponsTab from '../components/admin/CouponsTab';
import CustomersTab from '../components/admin/CustomersTab';
import ShippingTab from '../components/admin/ShippingTab';
import CustomerOrdersView from '../components/admin/CustomerOrdersView';
import OrderDetailView from '../components/admin/OrderDetailView';
import ProductModal from '../components/admin/ProductModal';
import CouponModal from '../components/admin/CouponModal';
import AdminAccountsTab from '../components/admin/AdminAccountsTab';

const ITEMS_PER_PAGE = 10;

export default function AdminPage({
  user,
  onLoginAsAdmin,
  onLogout,
  onNavigateHome,
  onNavigateShop,
  onProductsChange,
  addToast
}) {
  const isAdmin = Boolean(
    user &&
    (user.role?.toLowerCase().includes('admin') || user.email === 'admin@senxinh.vn')
  );

  const { modalProps, showModal } = useModal();

  // Navigation tabs: 'orders' | 'products' | 'coupons' | 'customers'
  const [activeTab, setActiveTab] = useState('orders');

  // Sidebar Layout States
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Stats & Data
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // Orders State
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [orderFilterStatus, setOrderFilterStatus] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');

  // Products State
  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [productCategory, setProductCategory] = useState('all');
  const [productStockFilter, setProductStockFilter] = useState('all');

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

  // Shipping Rates Configuration State
  const [shippingConfig, setShippingConfig] = useState(getShippingConfig());

  // Dedicated View Navigation State: 'tabs' | 'customer-orders' | 'order-detail'
  const [viewMode, setViewMode] = useState('tabs');
  const [activeCustomer, setActiveCustomer] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [previousViewMode, setPreviousViewMode] = useState('tabs');
  const [customerOrderFilter, setCustomerOrderFilter] = useState('all');

  // Pagination states
  const [orderPage, setOrderPage] = useState(1);
  const [productPage, setProductPage] = useState(1);
  const [couponPage, setCouponPage] = useState(1);
  const [customerPage, setCustomerPage] = useState(1);
  const [custOrderPage, setCustOrderPage] = useState(1);

  // Reset pages when filters change
  useEffect(() => { setOrderPage(1); }, [orderSearch, orderFilterStatus]);
  useEffect(() => { setProductPage(1); }, [productSearch, productCategory, productStockFilter]);
  useEffect(() => { setCustomerPage(1); }, [customerSearch]);
  useEffect(() => { setCustOrderPage(1); }, [customerOrderFilter, activeCustomer]);

  // Lock body scroll when Product or Coupon modal is open
  useEffect(() => {
    const isAnyModalOpen = isProductModalOpen || isCouponModalOpen;
    if (isAnyModalOpen) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }
      document.body.classList.add('modal-open');
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.body.classList.remove('modal-open');
    };
  }, [isProductModalOpen, isCouponModalOpen]);

  // ----------------------------------------------------
  // DATA FETCHING
  // ----------------------------------------------------
  const loadAllData = async () => {
    setLoading(true);
    try {
      const [statsData, ordersData, productsData, couponsData, customersData, allOrdersData, shippingData] = await Promise.all([
        getAdminStats(),
        getAdminOrders(orderFilterStatus),
        getAdminProducts(),
        getAdminCoupons(),
        getAdminCustomers(),
        getAdminOrders('all'),
        fetchShippingConfig()
      ]);

      setStats(statsData);
      setOrders(ordersData);
      setAllOrders(allOrdersData);
      setProducts(productsData);
      setCoupons(couponsData);
      setCustomers(customersData);
      if (shippingData) {
        setShippingConfig(shippingData);
      }

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
  // REALTIME SSE ORDER STREAM (ADMIN)
  // ----------------------------------------------------
  const handleRealtimeOrderCreated = useCallback((event) => {
    console.info('⚡ [Admin SSE] Nhận sự kiện đơn hàng mới:', event);
    if (addToast) {
      addToast(
        `🔔 Đơn hàng mới #${event.orderCode || event.orderId} (${(event.totalAmount || 0).toLocaleString('vi-VN')}₫) từ ${event.customerName || 'Khách hàng'}!`,
        'success'
      );
    }

    const newOrder = {
      id: event.orderId,
      orderCode: event.orderCode,
      customerName: event.customerName || 'Khách hàng',
      totalAmount: event.totalAmount || 0,
      status: event.status || 'PENDING',
      createdAt: event.createdAt || new Date().toISOString(),
      items: []
    };

    // Thêm ngay lập tức vào allOrders nếu chưa tồn tại
    setAllOrders((prev) => {
      if (prev.some((o) => String(o.id) === String(event.orderId) || o.orderCode === event.orderCode)) {
        return prev;
      }
      return [newOrder, ...prev];
    });

    // Thêm ngay lập tức vào danh sách hiển thị nếu phù hợp với bộ lọc hiện tại
    setOrders((prev) => {
      if (prev.some((o) => String(o.id) === String(event.orderId) || o.orderCode === event.orderCode)) {
        return prev;
      }
      if (orderFilterStatus === 'all' || orderFilterStatus === (event.status || 'PENDING')) {
        return [newOrder, ...prev];
      }
      return prev;
    });

    // Tự động đồng bộ đầy đủ chi tiết trong background mà KHÔNG reload trang
    getAdminOrders(orderFilterStatus).then((freshOrders) => {
      if (freshOrders) setOrders(freshOrders);
    }).catch(() => {});
    getAdminOrders('all').then((freshAll) => {
      if (freshAll) setAllOrders(freshAll);
    }).catch(() => {});
    getAdminStats().then((freshStats) => {
      if (freshStats) setStats(freshStats);
    }).catch(() => {});
  }, [addToast, orderFilterStatus]);

  const handleRealtimeOrderStatusChanged = useCallback((event) => {
    console.info('⚡ [Admin SSE] Nhận sự kiện cập nhật trạng thái đơn hàng:', event);
    const { orderId, orderCode, status } = event;
    const statusLabel = ORDER_STATUS_LABELS[status]?.label || status;

    if (addToast) {
      addToast(`📦 Đơn hàng #${orderCode || orderId} chuyển sang: ${statusLabel}`, 'info');
    }

    // Cập nhật trạng thái trong Order Detail view nếu admin đang mở xem chi tiết đơn này
    setActiveOrder((prev) => {
      if (prev && (String(prev.id) === String(orderId) || prev.orderCode === orderCode)) {
        return { ...prev, status };
      }
      return prev;
    });

    // Cập nhật trực tiếp trong danh sách orders mà KHÔNG tải lại toàn bộ trang
    setOrders((prev) =>
      prev.map((ord) => {
        if (String(ord.id) === String(orderId) || ord.orderCode === orderCode) {
          return { ...ord, status };
        }
        return ord;
      })
    );

    // Cập nhật trong allOrders
    setAllOrders((prev) =>
      prev.map((ord) => {
        if (String(ord.id) === String(orderId) || ord.orderCode === orderCode) {
          return { ...ord, status };
        }
        return ord;
      })
    );

    // Cập nhật thẻ thống kê ngầm
    getAdminStats().then((freshStats) => {
      if (freshStats) setStats(freshStats);
    }).catch(() => {});
  }, [addToast]);

  // Kích hoạt kết nối SSE thời gian thực cho Admin
  const { isConnected: isRealtimeConnected } = useOrderEvents({
    onOrderCreated: handleRealtimeOrderCreated,
    onOrderStatusChanged: handleRealtimeOrderStatusChanged,
    enabled: isAdmin
  });

  // Customer Orders Calculation Helper
  const getCustomerOrdersCountAndSpent = (customer) => {
    if (!customer) return { count: 0, totalSpent: 0, orders: [] };
    const cPhone = (customer.phone || '').trim();
    const cEmail = (customer.email || '').trim().toLowerCase();
    const cName = (customer.name || '').trim().toLowerCase();
    const cId = customer.id ? String(customer.id) : '';

    const source = allOrders && allOrders.length > 0 ? allOrders : orders;
    const matched = source.filter((o) => {
      if (cId && o.userId && String(o.userId) === cId) return true;
      if (cPhone && o.customerPhone && o.customerPhone.trim() === cPhone) return true;
      if (cEmail && o.customerEmail && o.customerEmail.trim().toLowerCase() === cEmail) return true;
      if (cName && o.customerName && o.customerName.trim().toLowerCase() === cName) return true;
      return false;
    });

    const totalSpent = matched
      .filter((o) => o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    return { count: matched.length, totalSpent, orders: matched };
  };

  // Open dedicated Customer Orders page view
  const handleOpenCustomerOrders = (customer) => {
    setActiveCustomer(customer);
    setCustomerOrderFilter('all');
    setViewMode('customer-orders');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open dedicated Order Detail page view
  const handleOpenOrderDetail = (order, sourceView = 'tabs') => {
    setActiveOrder(order);
    setPreviousViewMode(sourceView);
    setViewMode('order-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Back from Order Detail page
  const handleBackFromOrderDetail = () => {
    if (previousViewMode === 'customer-orders' && activeCustomer) {
      setViewMode('customer-orders');
    } else {
      setViewMode('tabs');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Back from Customer Orders page
  const handleBackFromCustomerOrders = () => {
    setViewMode('tabs');
    setActiveTab('customers');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Update status directly in Order Detail page
  const handleDetailStatusChange = async (newStatus) => {
    if (!activeOrder) return;
    try {
      await updateOrderStatus(activeOrder.id, newStatus);
      if (addToast) addToast(`Đã đổi trạng thái đơn #${activeOrder.orderCode || activeOrder.id} sang ${ORDER_STATUS_LABELS[newStatus]?.label || newStatus}`, 'success');
      setActiveOrder((prev) => ({ ...prev, status: newStatus }));
      loadAllData();
    } catch (err) {
      showModal('error', 'Không thể cập nhật trạng thái đơn hàng');
    }
  };

  // Order status change in table
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      if (addToast) addToast(`Đã đổi trạng thái đơn #${orderId} sang ${newStatus}`, 'success');
      loadAllData();
    } catch (err) {
      showModal('error', 'Không thể cập nhật trạng thái đơn hàng');
    }
  };

  // Product Actions
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
      showModal('warning', 'Vui lòng nhập tên sen đá!');
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
      showModal('error', 'Lỗi khi lưu thông tin sản phẩm: ' + err.message);
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
        if (prod.image && (prod.image.includes('cloudinary.com') || prod.image.includes('/uploads/products/'))) {
          deleteProductImage(prod.image);
        }
        if (addToast) addToast(`Đã xóa cây "${prod.name}"`, 'info');
        loadAllData();
      } catch (err) {
        showModal('error', 'Không thể xóa sản phẩm');
      }
    }
  };

  // Coupon Actions
  const handleOpenAddCoupon = () => {
    setCouponFormData({
      code: '',
      discountPercent: 15,
      description: '',
      isActive: true
    });
    setIsCouponModalOpen(true);
  };

  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    if (!couponFormData.code.trim()) {
      showModal('warning', 'Vui lòng nhập mã giảm giá!');
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
      showModal('error', 'Lỗi khi tạo mã giảm giá: ' + err.message);
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
        showModal('error', 'Không thể xóa voucher');
      }
    }
  };

  // Customer Actions
  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateCustomerRole(userId, newRole);
      if (addToast) addToast('Đã cập nhật phân quyền người dùng', 'success');
      setCustomers((prev) =>
        prev.map((c) => (String(c.id) === String(userId) ? { ...c, role: newRole } : c))
      );
    } catch (err) {
      showModal('error', 'Không thể cập nhật phân quyền');
    }
  };

  const handleCustomerStatusChange = async (userId, newStatus) => {
    try {
      await updateCustomerStatus(userId, newStatus);
      if (addToast) {
        addToast(
          `Đã đổi trạng thái tài khoản sang ${newStatus === 'ACTIVE' ? 'Hoạt động' : newStatus === 'BANNED' ? 'Bị khóa' : 'Đã xóa'}`,
          'success'
        );
      }
      setCustomers((prev) =>
        prev.map((c) => (String(c.id) === String(userId) ? { ...c, status: newStatus } : c))
      );
    } catch (err) {
      showModal('error', 'Không thể cập nhật trạng thái người dùng');
    }
  };

  const handleDeleteCustomer = async (cust) => {
    if (window.confirm(`Xác nhận vô hiệu hóa (xóa mềm) tài khoản khách hàng "${cust.name}"? Lịch sử đơn hàng của khách vẫn được lưu trữ an toàn.`)) {
      try {
        await deleteAdminCustomer(cust.id);
        if (addToast) addToast(`Đã vô hiệu hóa tài khoản ${cust.name}`, 'info');
        setCustomers((prev) =>
          prev.map((c) => (String(c.id) === String(cust.id) ? { ...c, status: 'DELETED' } : c))
        );
      } catch (err) {
        showModal('error', 'Không thể xóa tài khoản');
      }
    }
  };

  // Unauthenticated Admin Gatekeeper
  if (!isAdmin) {
    return (
      <AdminGatekeeper
        user={user}
        onLoginAsAdmin={onLoginAsAdmin}
        onNavigateHome={onNavigateHome}
        addToast={addToast}
      />
    );
  }

  return (
    <div className="admin-page admin-sidebar-layout">
      {/* Dedicated Left Admin Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        viewMode={viewMode}
        setViewMode={setViewMode}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        mobileSidebarOpen={mobileSidebarOpen}
        setMobileSidebarOpen={setMobileSidebarOpen}
        onNavigateHome={onNavigateHome}
        onLogout={onLogout}
      />

      {/* Right Content Area */}
      <div className="admin-main-wrapper-inner">
        {/* Topbar inside content area */}
        <AdminHeader
          viewMode={viewMode}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeCustomer={activeCustomer}
          activeOrder={activeOrder}
          setMobileSidebarOpen={setMobileSidebarOpen}
          onOpenAddProduct={() => {
            setViewMode('tabs');
            setActiveTab('products');
            handleOpenAddProduct();
          }}
          onOpenAddCoupon={() => {
            setViewMode('tabs');
            setActiveTab('coupons');
            handleOpenAddCoupon();
          }}
          onNavigateHome={onNavigateHome}
          isRealtimeConnected={isRealtimeConnected}
          user={user}
          onLogout={onLogout}
        />

        {/* Content Body */}
        <div className="admin-content-body">
          {viewMode === 'tabs' && (
            <React.Fragment>
              {/* KPI Stats Row */}
              <AdminStatsCards
                stats={stats}
                productsCount={products.length}
                customersCount={customers.length}
              />

              {/* TAB 1: ORDERS MANAGEMENT */}
              {activeTab === 'orders' && (
                <OrdersTab
                  orders={orders}
                  customers={customers}
                  orderFilterStatus={orderFilterStatus}
                  setOrderFilterStatus={setOrderFilterStatus}
                  orderSearch={orderSearch}
                  setOrderSearch={setOrderSearch}
                  orderPage={orderPage}
                  setOrderPage={setOrderPage}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onStatusChange={handleStatusChange}
                  onOpenOrderDetail={handleOpenOrderDetail}
                  onOpenCustomerOrders={handleOpenCustomerOrders}
                />
              )}

              {/* TAB 1B: DELIVERED ORDERS MANAGEMENT (ĐƠN ĐÃ GIAO) */}
              {activeTab === 'delivered' && (
                <DeliveredOrdersTab
                  orders={allOrders.length > 0 ? allOrders : orders}
                  onOpenOrderDetail={handleOpenOrderDetail}
                  onOpenCustomerOrders={handleOpenCustomerOrders}
                />
              )}

              {/* TAB 2: PRODUCTS MANAGEMENT */}
              {activeTab === 'products' && (
                <ProductsTab
                  products={products}
                  productSearch={productSearch}
                  setProductSearch={setProductSearch}
                  productCategory={productCategory}
                  setProductCategory={setProductCategory}
                  productStockFilter={productStockFilter}
                  setProductStockFilter={setProductStockFilter}
                  productPage={productPage}
                  setProductPage={setProductPage}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onOpenAddProduct={handleOpenAddProduct}
                  onOpenEditProduct={handleOpenEditProduct}
                  onQuickStockChange={handleQuickStockChange}
                  onDeleteProduct={handleDeleteProduct}
                />
              )}

              {/* TAB 3: COUPONS MANAGEMENT */}
              {activeTab === 'coupons' && (
                <CouponsTab
                  coupons={coupons}
                  couponPage={couponPage}
                  setCouponPage={setCouponPage}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onOpenAddCoupon={handleOpenAddCoupon}
                  onToggleCoupon={handleToggleCoupon}
                  onDeleteCoupon={handleDeleteCoupon}
                />
              )}

              {/* TAB 4: CUSTOMERS MANAGEMENT */}
              {activeTab === 'customers' && (
                <CustomersTab
                  customers={customers}
                  customerSearch={customerSearch}
                  setCustomerSearch={setCustomerSearch}
                  customerPage={customerPage}
                  setCustomerPage={setCustomerPage}
                  itemsPerPage={ITEMS_PER_PAGE}
                  getCustomerOrdersCountAndSpent={getCustomerOrdersCountAndSpent}
                  onOpenCustomerOrders={handleOpenCustomerOrders}
                  onRoleChange={handleRoleChange}
                  onStatusChange={handleCustomerStatusChange}
                  onDeleteCustomer={handleDeleteCustomer}
                />
              )}

              {/* TAB 5: SHIPPING RATES MANAGEMENT */}
              {activeTab === 'shipping' && (
                <ShippingTab
                  shippingConfig={shippingConfig}
                  onUpdateShippingConfig={async (newCfg) => {
                    const saved = await saveShippingConfig(newCfg);
                    setShippingConfig(saved || newCfg);
                  }}
                  onResetShippingConfig={async () => {
                    const def = await resetShippingConfig();
                    setShippingConfig(def);
                    return def;
                  }}
                  addToast={addToast}
                />
              )}

              {/* TAB 6: ADMIN ACCOUNTS & PASSWORD MANAGEMENT */}
              {activeTab === 'admin-accounts' && (
                <AdminAccountsTab
                  currentUser={user}
                  customers={customers}
                  onReloadCustomers={async () => {
                    try {
                      const latest = await getAdminCustomers();
                      setCustomers(latest);
                    } catch (err) {
                      console.warn('Lỗi khi tải lại danh sách khách hàng/admin:', err);
                    }
                  }}
                  onLogout={onLogout}
                  addToast={addToast}
                />
              )}
            </React.Fragment>
          )}

          {/* DEDICATED VIEW: CUSTOMER ORDERS LIST VIEW */}
          {viewMode === 'customer-orders' && activeCustomer && (
            <CustomerOrdersView
              activeCustomer={activeCustomer}
              allOrders={allOrders}
              orders={orders}
              customerOrderFilter={customerOrderFilter}
              setCustomerOrderFilter={setCustomerOrderFilter}
              custOrderPage={custOrderPage}
              setCustOrderPage={setCustOrderPage}
              itemsPerPage={ITEMS_PER_PAGE}
              getCustomerOrdersCountAndSpent={getCustomerOrdersCountAndSpent}
              onBack={handleBackFromCustomerOrders}
              onOpenOrderDetail={handleOpenOrderDetail}
            />
          )}

          {/* DEDICATED VIEW: ORDER DETAIL VIEW */}
          {viewMode === 'order-detail' && activeOrder && (
            <OrderDetailView
              activeOrder={activeOrder}
              activeCustomer={activeCustomer}
              customers={customers}
              previousViewMode={previousViewMode}
              onBack={handleBackFromOrderDetail}
              onOpenCustomerOrders={handleOpenCustomerOrders}
              onDetailStatusChange={handleDetailStatusChange}
            />
          )}
        </div>

        {/* MODAL: ADD / EDIT PRODUCT */}
        <ProductModal
          isOpen={isProductModalOpen}
          editingProduct={editingProduct}
          productFormData={productFormData}
          setProductFormData={setProductFormData}
          onClose={() => setIsProductModalOpen(false)}
          onSave={handleSaveProduct}
        />

        {/* MODAL: CREATE COUPON */}
        <CouponModal
          isOpen={isCouponModalOpen}
          couponFormData={couponFormData}
          setCouponFormData={setCouponFormData}
          onClose={() => setIsCouponModalOpen(false)}
          onSave={handleSaveCoupon}
        />
      </div>

      {/* Notification Modal – thay thế window.alert() */}
      <NotificationModal {...modalProps} />
    </div>
  );
}
