import mockData from '../data/mockData.json';

// ==============================================================================
// SEN XINH GARDEN - API SERVICE & MOCK DATA CONTROLLER
// Có thể bật / tắt chế độ Mock Data từ biến môi trường: VITE_USE_MOCK_DATA
// ==============================================================================

export const getUseMockData = () => {
  if (typeof window !== 'undefined') {
    const localOverride = localStorage.getItem('senxinh_use_mock_data');
    if (localOverride === 'true') return true;
    if (localOverride === 'false') return false;
  }
  return import.meta.env.VITE_USE_MOCK_DATA === 'true';
};

export const USE_MOCK_DATA = getUseMockData();
export const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Kiểm tra xem user hiện tại có phải được đăng nhập từ nguồn Mock Data hay không
 */
export function isMockUser(user) {
  if (!user) return false;
  if (user.isMockUser === true) return true;
  if (typeof user.token === 'string' && (user.token.startsWith('mock_token_') || user.token.startsWith('google_mock_token_'))) {
    return true;
  }
  // Các tài khoản hoặc mẫu định danh của Mock Data
  if (
    user.id === '1' ||
    user.id === '2' ||
    user.id === 'u1' ||
    user.id === 'u_admin' ||
    (typeof user.id === 'string' && (user.id.startsWith('user_') || user.id.startsWith('mock_') || user.id.startsWith('user_google_')))
  ) {
    if (!user.token || !user.token.includes('.')) {
      return true;
    }
  }
  return false;
}

/**
 * Hàm hỗ trợ bật/tắt Mock Data ngay trong console hoặc giao diện
 */
export function setUseMockData(enable) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('senxinh_use_mock_data', enable ? 'true' : 'false');
    window.location.reload();
  }
}

if (typeof window !== 'undefined') {
  window.setUseMockData = setUseMockData;
}

console.info(
  `%c🌿 [Sen Xinh Garden] Chế độ dữ liệu: ${
    USE_MOCK_DATA ? 'MOCK DATA JSON (USE_MOCK_DATA=true)' : 'LIVE BACKEND POSTGRESQL (USE_MOCK_DATA=false)'
  }`,
  'color: #10b981; font-weight: bold; font-size: 13px;'
);

// ==============================================================================
// LOCAL STORAGE MOCK DB HELPERS (Sử dụng dữ liệu từ mockData.json làm gốc)
// ==============================================================================

export const DEFAULT_COUPONS = [
  { code: 'SENXANH10', discountPercent: 10, isActive: true, description: 'Giảm 10% cho đơn hàng đầu tiên' },
  { code: 'SENXANH20', discountPercent: 20, isActive: true, description: 'Giảm 20% cho khách hàng thân thiết' },
  { code: 'SENMOI50', discountPercent: 15, isActive: true, description: 'Voucher chào mừng thành viên mới' },
  { code: 'FREESHIP', discountPercent: 5, isActive: true, description: 'Hỗ trợ 5% phí giao vận toàn quốc' }
];

export function getStoredCoupons() {
  try {
    const saved = localStorage.getItem('senxinh_admin_coupons');
    if (!saved) {
      const initial = (mockData && mockData.coupons) || DEFAULT_COUPONS;
      localStorage.setItem('senxinh_admin_coupons', JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(saved);
  } catch {
    return (mockData && mockData.coupons) || DEFAULT_COUPONS;
  }
}

export function saveStoredCoupons(coupons) {
  try {
    localStorage.setItem('senxinh_admin_coupons', JSON.stringify(coupons));
  } catch (e) {
    console.error('Không thể lưu coupons:', e);
  }
}

export function getStoredProducts(params = {}) {
  try {
    let list = [];
    const saved = localStorage.getItem('senxinh_admin_products');
    if (!saved) {
      localStorage.setItem('senxinh_admin_products', JSON.stringify(mockData.products));
      list = [...mockData.products];
    } else {
      list = JSON.parse(saved);
    }

    if (params.category && params.category !== 'all') {
      list = list.filter((p) => p.category === params.category);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.scientificName && p.scientificName.toLowerCase().includes(q))
      );
    }
    if (params.light && params.light !== 'all') {
      list = list.filter((p) => p.lightType === params.light);
    }
    if (params.difficulty && params.difficulty !== 'all') {
      if (params.difficulty === 'easy') list = list.filter((p) => p.difficultyLevel === 1);
      else if (params.difficulty === 'medium') list = list.filter((p) => p.difficultyLevel >= 2);
    }
    if (params.sort === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (params.sort === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (params.sort === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  } catch {
    return mockData.products;
  }
}

export function saveStoredProducts(products) {
  try {
    localStorage.setItem('senxinh_admin_products', JSON.stringify(products));
  } catch (e) {
    console.error('Không thể lưu products:', e);
  }
}

export function getStoredUsers() {
  try {
    const raw = localStorage.getItem('senxinh_users_db');
    if (!raw) {
      localStorage.setItem('senxinh_users_db', JSON.stringify(mockData.users));
      return mockData.users;
    }
    return JSON.parse(raw);
  } catch {
    return mockData.users;
  }
}

export function saveStoredUsers(users) {
  try {
    localStorage.setItem('senxinh_users_db', JSON.stringify(users));
  } catch (err) {
    console.error('Không thể lưu users db:', err);
  }
}

export const SEED_MOCK_ORDERS = mockData.orders || [];

export function getStoredOrders() {
  try {
    const raw = localStorage.getItem('senxinh_mock_orders');
    if (raw !== null) {
      return JSON.parse(raw);
    }
    const initialOrders = mockData.orders || [];
    localStorage.setItem('senxinh_mock_orders', JSON.stringify(initialOrders));
    return initialOrders;
  } catch {
    return mockData.orders || [];
  }
}

export function saveStoredOrders(orders) {
  try {
    localStorage.setItem('senxinh_mock_orders', JSON.stringify(orders));
  } catch (err) {
    console.error('Không thể lưu orders:', err);
  }
}

// ==============================================================================
// STOREFRONT PRODUCT & ORDER APIs
// ==============================================================================

/**
 * Lấy danh sách sản phẩm (hỗ trợ lọc theo category, search, light, difficulty, sort)
 */
export async function getProducts(params = {}) {
  if (USE_MOCK_DATA) {
    return getStoredProducts(params);
  }

  try {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'all') query.append('category', params.category);
    if (params.search) query.append('search', params.search);
    if (params.light && params.light !== 'all') query.append('light', params.light);
    if (params.difficulty && params.difficulty !== 'all') query.append('difficulty', params.difficulty);
    if (params.sort) query.append('sort', params.sort);

    const res = await fetch(`${API_BASE}/products?${query.toString()}`);
    if (!res.ok) throw new Error('Không thể tải danh sách sản phẩm. Vui lòng thử lại sau!');
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error('Lỗi khi tải sản phẩm từ backend:', error);
    throw error;
  }
}

/**
 * Lấy chi tiết 1 sản phẩm theo ID
 */
export async function getProductById(id) {
  if (USE_MOCK_DATA) {
    const products = getStoredProducts();
    return products.find((p) => p.id === id) || mockData.products.find((p) => p.id === id) || null;
  }

  const res = await fetch(`${API_BASE}/products/${id}`);
  if (!res.ok) throw new Error('Không tìm thấy thông tin sản phẩm');
  const data = await res.json();
  return data.data;
}

/**
 * Tạo đơn hàng mới
 */
export async function createOrder(orderPayload) {
  if (USE_MOCK_DATA) {
    const subtotal = orderPayload.subtotal !== undefined
      ? orderPayload.subtotal
      : (orderPayload.items?.reduce((sum, it) => sum + (it.price || 0) * (it.quantity || 1), 0) || 0);

    let discountAmount = orderPayload.discountAmount || 0;
    if (!discountAmount && orderPayload.discountPercent > 0) {
      discountAmount = Math.round(subtotal * (orderPayload.discountPercent / 100));
    }

    const shippingFee = orderPayload.shippingFee !== undefined
      ? orderPayload.shippingFee
      : (subtotal >= 200000 || subtotal === 0 ? 0 : 30000);

    const totalAmount = orderPayload.totalAmount !== undefined
      ? orderPayload.totalAmount
      : Math.max(0, subtotal - discountAmount + shippingFee);

    const orderCode = orderPayload.orderCode || `SX${Math.floor(100000 + Math.random() * 900000)}`;

    const mockOrder = {
      id: Date.now(),
      orderCode,
      status: 'PENDING',
      customerName: orderPayload.customerName || 'Khách hàng',
      customerPhone: orderPayload.customerPhone || '',
      customerEmail: orderPayload.customerEmail || '',
      shippingAddress: orderPayload.customerAddress || orderPayload.shippingAddress || '',
      customerAddress: orderPayload.customerAddress || orderPayload.shippingAddress || '',
      paymentMethod: orderPayload.paymentMethod || 'vietqr',
      items: orderPayload.items || [],
      subtotal,
      discountAmount,
      discountCode: orderPayload.discountCode || '',
      shippingFee,
      totalAmount,
      note: orderPayload.note || '',
      createdAt: new Date().toISOString()
    };

    const sepayBank = 'MBBank';
    const sepayAcc = 'VQRQALYXL6596';
    const sepayHolder = encodeURIComponent('NGUYEN HOANG THAI VINH');
    const qrImageUrl = `https://vietqr.app/img?bank=${sepayBank}&acc=${sepayAcc}&template=compact&amount=${totalAmount}&des=${orderCode}&showinfo=true&fullacc=true&holder=${sepayHolder}&store=Sen%20Xinh%20Garden`;

    const vietQrData = {
      bankName: 'MBBank',
      bankCode: 'MBBank',
      accountNumber: sepayAcc,
      accountName: 'NGUYEN HOANG THAI VINH',
      amount: totalAmount,
      orderCode,
      qrImageUrl
    };

    try {
      const existing = getStoredOrders();
      existing.unshift(mockOrder);
      saveStoredOrders(existing);
    } catch (e) {
      console.error('Lỗi lưu đơn hàng mock:', e);
    }
    return { success: true, data: mockOrder, order: mockOrder, vietQr: vietQrData };
  }

  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderPayload)
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || 'Không thể tạo đơn hàng');
  }
  const payload = json.data || json;
  return {
    ...json,
    order: payload.order || json.order,
    vietQr: payload.vietQr || json.vietQr
  };
}

/**
 * Tra cứu đơn hàng theo mã (orderCode)
 */
export async function lookupOrder(orderCode) {
  if (USE_MOCK_DATA) {
    const existing = getStoredOrders();
    const found = existing.find((o) => o.orderCode === orderCode);
    if (found) return found;
    throw new Error('Không tìm thấy thông tin đơn hàng');
  }

  const res = await fetch(`${API_BASE}/orders/${orderCode}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Không tìm thấy đơn hàng');
  return data.data;
}

/**
 * Gửi đánh giá sao cho sản phẩm
 */
export async function submitReview(productId, reviewData) {
  if (USE_MOCK_DATA) {
    const products = getStoredProducts();
    const target = products.find((p) => p.id === productId);
    if (target) {
      const currentRating = target.rating || 5.0;
      const count = target.reviewsCount || 0;
      target.rating =
        Math.round(((currentRating * count + (reviewData.rating || 5)) / (count + 1)) * 10) / 10;
      target.reviewsCount = count + 1;
      saveStoredProducts(products);
      return { success: true, data: target };
    }
    return { success: true };
  }

  const res = await fetch(`${API_BASE}/products/${productId}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reviewData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Lỗi gửi đánh giá');
  return data;
}

/**
 * Lấy lịch sử đơn hàng của người dùng theo số điện thoại
 */
export async function getCustomerOrders(identifier, email) {
  if (USE_MOCK_DATA) {
    const mockOrders = getStoredOrders();
    if (!identifier && !email) return mockOrders;
    const qId = identifier ? String(identifier).toLowerCase().trim() : '';
    const qEmail = email ? String(email).toLowerCase().trim() : '';
    return mockOrders.filter(
      (o) =>
        (qId && o.customerPhone && o.customerPhone.toLowerCase().includes(qId)) ||
        (qId && o.customerEmail && o.customerEmail.toLowerCase().includes(qId)) ||
        (qId && o.customerName && o.customerName.toLowerCase().includes(qId)) ||
        (qEmail && o.customerEmail && o.customerEmail.toLowerCase().includes(qEmail))
    );
  }

  try {
    const params = new URLSearchParams();
    if (identifier) params.append('phone', identifier);
    if (email) params.append('email', email);

    const res = await fetch(`${API_BASE}/users/my-orders?${params.toString()}`);
    if (!res.ok) {
      console.warn(`Lỗi API lịch sử đơn hàng: HTTP ${res.status}`);
      return [];
    }
    const data = await res.json();
    return data.data || [];
  } catch (err) {
    console.warn('Lỗi kết nối API đơn hàng:', err);
    // Khi chạy Backend thực tế, trả về mảng rỗng để hiển thị Empty State sạch sẽ thay vì data cứng
    return [];
  }
}

/**
 * Khách hàng hủy đơn hàng (kèm lý do và tự động hoàn trả tồn kho)
 */
export async function cancelCustomerOrder(orderId, reason = '') {
  if (USE_MOCK_DATA) {
    const orders = getStoredOrders();
    const target = orders.find((o) => String(o.id) === String(orderId) || o.orderCode === orderId);
    if (!target) throw new Error('Không tìm thấy đơn hàng để hủy');
    if (target.status === 'COMPLETED') {
      throw new Error('Đơn hàng đã hoàn tất giao hàng, không thể tự hủy.');
    }
    if (target.status === 'SHIPPING') {
      throw new Error('Đơn hàng đang trên đường giao. Quý khách vui lòng liên hệ hotline để được hỗ trợ!');
    }
    target.status = 'CANCELLED';
    if (reason && reason.trim()) {
      target.note = target.note ? `${target.note} [Lý do hủy: ${reason.trim()}]` : `[Lý do hủy: ${reason.trim()}]`;
    }
    saveStoredOrders(orders);
    return { success: true, message: 'Đã hủy đơn hàng thành công', data: target };
  }

  const res = await fetch(`${API_BASE}/orders/${orderId}/cancel`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason: reason || '' })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Không thể hủy đơn hàng');
  return data;
}

/**
 * Khách hàng xác nhận "Đã Nhận Được Hàng" (chuyển sang COMPLETED và tích Điểm Sen)
 */
export async function confirmReceivedOrder(orderId) {
  if (USE_MOCK_DATA) {
    const orders = getStoredOrders();
    const target = orders.find((o) => String(o.id) === String(orderId) || o.orderCode === orderId);
    if (!target) throw new Error('Không tìm thấy đơn hàng để xác nhận');
    if (target.status === 'CANCELLED') {
      throw new Error('Đơn hàng này đã bị hủy trước đó.');
    }
    target.status = 'COMPLETED';
    saveStoredOrders(orders);

    // Tích điểm Sen thưởng vào tài khoản đăng nhập nếu có
    try {
      const userKey = 'senxinh_user_mock';
      const savedUser = localStorage.getItem(userKey);
      if (savedUser) {
        const u = JSON.parse(savedUser);
        const earned = Math.max(5, Math.round((target.totalAmount || 0) / 10000));
        u.points = (u.points || 0) + earned;
        localStorage.setItem(userKey, JSON.stringify(u));
      }
    } catch (e) {
      console.warn('Lỗi tích điểm mock:', e);
    }

    return { success: true, message: 'Xác nhận đã nhận hàng thành công! Quý khách được tích lũy Điểm Sen thưởng 🌿', data: target };
  }

  const res = await fetch(`${API_BASE}/orders/${orderId}/receive`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Không thể xác nhận nhận hàng');
  return data;
}

/**
 * Khách hàng xóa một đơn hàng khỏi lịch sử
 */
export async function deleteCustomerOrder(orderId) {
  if (USE_MOCK_DATA) {
    const orders = getStoredOrders();
    const updated = orders.filter((o) => String(o.id) !== String(orderId) && o.orderCode !== orderId);
    saveStoredOrders(updated);
    return { success: true, message: 'Đã xóa đơn hàng thành công' };
  }

  const res = await fetch(`${API_BASE}/orders/${orderId}`, {
    method: 'DELETE'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Không thể xóa đơn hàng');
  return data;
}

/**
 * Khách hàng xóa hàng loạt đơn hàng đã chọn
 */
export async function deleteCustomerOrdersBulk(orderIds) {
  if (!orderIds || orderIds.length === 0) return { success: true };
  if (USE_MOCK_DATA) {
    const orders = getStoredOrders();
    const idSet = new Set(orderIds.map(String));
    const updated = orders.filter((o) => !idSet.has(String(o.id)) && !idSet.has(String(o.orderCode)));
    saveStoredOrders(updated);
    return { success: true, message: `Đã xóa ${orderIds.length} đơn hàng thành công` };
  }

  const res = await fetch(`${API_BASE}/orders/bulk`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderIds)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Không thể xóa các đơn hàng đã chọn');
  return data;
}

/**
 * Cập nhật thông tin tài khoản người dùng
 */
export async function updateUserProfile(profileData) {
  if (USE_MOCK_DATA) {
    const users = getStoredUsers();
    const email = (profileData.email || '').toLowerCase();
    const updated = users.map((u) =>
      u.email.toLowerCase() === email ? { ...u, ...profileData } : u
    );
    saveStoredUsers(updated);
    return profileData;
  }

  const token = localStorage.getItem('senxinh_auth_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/users/profile`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(profileData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Không thể cập nhật thông tin');
  return data.data;
}

/**
 * Lấy thông tin tài khoản người dùng từ Backend hoặc Mock
 */
export async function getUserProfile(email) {
  if (USE_MOCK_DATA) {
    const users = getStoredUsers();
    return users.find((u) => u.email && u.email.toLowerCase() === (email || '').toLowerCase()) || null;
  }

  const token = localStorage.getItem('senxinh_auth_token');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/users/profile?email=${encodeURIComponent(email || '')}`, { headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Không thể lấy thông tin tài khoản');
  return data.data;
}

/**
 * Kiểm tra mã ưu đãi / voucher
 */
export async function validateCoupon(code) {
  const cleanCode = (code || '').trim().toUpperCase();

  if (USE_MOCK_DATA) {
    const coupons = getStoredCoupons();
    const found = coupons.find((c) => c.code === cleanCode && c.isActive);
    if (found) {
      return {
        valid: true,
        discountPercent: found.discountPercent,
        code: found.code,
        description: found.description
      };
    }
    return { valid: false, message: 'Mã giảm giá không hợp lệ hoặc đã hết hạn' };
  }

  try {
    const res = await fetch(`${API_BASE}/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: cleanCode })
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      return { valid: false, message: json.message || 'Mã không hợp lệ' };
    }
    const payload = json.data || json;
    return {
      valid: payload.valid !== false,
      code: payload.code,
      discountPercent: payload.discountPercent,
      description: payload.description
    };
  } catch (err) {
    console.warn('Backend API kiểm tra coupon không khả dụng, kiểm tra qua danh mục voucher hệ thống:', err);
    const coupons = getStoredCoupons();
    const found = coupons.find((c) => c.code === cleanCode && c.isActive);
    if (found) {
      return {
        valid: true,
        discountPercent: found.discountPercent,
        code: found.code,
        description: found.description
      };
    }
    return { valid: false, message: 'Mã giảm giá không hợp lệ hoặc đã hết hạn' };
  }
}

// ==============================================================================
// ADMIN MANAGEMENT APIs
// ==============================================================================

/**
 * Admin: Lấy danh sách toàn bộ đơn hàng
 */
export async function getAdminOrders(status = 'all') {
  if (USE_MOCK_DATA) {
    const mockOrders = getStoredOrders();
    if (status && status !== 'all') {
      return mockOrders.filter((o) => o.status === status);
    }
    return mockOrders;
  }

  try {
    const url =
      status && status !== 'all'
        ? `${API_BASE}/admin/orders?status=${status}`
        : `${API_BASE}/admin/orders`;
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`Lỗi lấy danh sách đơn Admin: HTTP ${res.status}`);
      return [];
    }
    const data = await res.json();
    return data.data || [];
  } catch (err) {
    console.warn('Lỗi kết nối admin orders:', err);
    return [];
  }
}

/**
 * Admin: Cập nhật trạng thái đơn hàng
 */
export async function updateOrderStatus(orderId, status) {
  if (USE_MOCK_DATA) {
    const mockOrders = getStoredOrders();
    const updated = mockOrders.map((o) =>
      String(o.id) === String(orderId) ? { ...o, status } : o
    );
    localStorage.setItem('senxinh_mock_orders', JSON.stringify(updated));
    return { success: true, message: 'Cập nhật trạng thái thành công' };
  }

  const res = await fetch(`${API_BASE}/admin/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  return await res.json();
}

/**
 * Admin: Lấy thống kê tổng hợp (KPI)
 */
export async function getAdminStats() {
  if (USE_MOCK_DATA) {
    const products = getStoredProducts();
    const users = getStoredUsers();
    const coupons = getStoredCoupons();
    const orders = getStoredOrders();

    const paidOrders = orders.filter((o) => o.status === 'PAID' || o.status === 'COMPLETED').length;
    const pendingOrders = orders.filter((o) => o.status === 'PENDING').length;
    const completedOrders = orders.filter((o) => o.status === 'COMPLETED').length;
    const totalRevenue = orders
      .filter((o) => o.status === 'PAID' || o.status === 'COMPLETED')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    return {
      totalOrders: orders.length,
      pendingOrders,
      paidOrders,
      completedOrders,
      totalRevenue,
      totalProducts: products.length,
      totalCustomers: users.length,
      totalCoupons: coupons.length
    };
  }

  try {
    const res = await fetch(`${API_BASE}/admin/stats`);
    if (!res.ok) {
      return {
        totalOrders: 0,
        pendingOrders: 0,
        paidOrders: 0,
        completedOrders: 0,
        totalRevenue: 0,
        totalProducts: 0,
        totalCustomers: 0,
        totalCoupons: 0
      };
    }
    const data = await res.json();
    return data.data;
  } catch (err) {
    console.warn('Lỗi kết nối admin stats:', err);
    return {
      totalOrders: 0,
      pendingOrders: 0,
      paidOrders: 0,
      completedOrders: 0,
      totalRevenue: 0,
      totalProducts: 0,
      totalCustomers: 0,
      totalCoupons: 0
    };
  }
}

/**
 * Admin: Quản lý sản phẩm
 */
export async function getAdminProducts() {
  if (USE_MOCK_DATA) {
    return getStoredProducts();
  }

  const res = await fetch(`${API_BASE}/admin/products`);
  if (!res.ok) throw new Error('Không thể tải danh sách sản phẩm');
  const data = await res.json();
  return data.data || [];
}

/**
 * Admin: Tải ảnh sản phẩm lên Cloud (Cloudinary / Fallback)
 * @param {File} file File ảnh được chọn
 * @param {string} previousImageUrl URL ảnh cũ cần dọn dẹp trên Cloudinary (nếu có)
 */
export async function uploadProductImage(file, previousImageUrl = '') {
  const formData = new FormData();
  formData.append('file', file);
  if (previousImageUrl) {
    formData.append('previousImageUrl', previousImageUrl);
  }

  try {
    const res = await fetch(`${API_BASE}/admin/upload-product-image`, {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Không thể tải ảnh lên cloud');
    }
    return data.data; // { url, publicId, storage, ... }
  } catch (err) {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({ url: reader.result, publicId: `mock-img-${Date.now()}`, storage: 'MOCK_PREVIEW' });
        };
        reader.readAsDataURL(file);
      });
    }
    throw err;
  }
}

/**
 * Admin: Xóa ảnh khỏi Cloudinary để tiết kiệm dung lượng
 */
export async function deleteProductImage(imageUrlOrPublicId) {
  if (!imageUrlOrPublicId) return { success: false };
  if (USE_MOCK_DATA) return { success: true };

  try {
    const res = await fetch(`${API_BASE}/admin/delete-image?imageUrl=${encodeURIComponent(imageUrlOrPublicId)}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('Lỗi khi xóa ảnh trên cloud:', err);
    return { success: false };
  }
}

export async function createAdminProduct(productData) {
  if (USE_MOCK_DATA) {
    const current = getStoredProducts();
    const newProduct = {
      ...productData,
      id: productData.id || `sen-${Date.now().toString(36)}`,
      publicId: `mock-uuid-${Date.now()}`,
      rating: productData.rating || 5.0,
      reviewsCount: productData.reviewsCount || 1,
      inStock: Number(productData.inStock) || 20,
      price: Number(productData.price) || 50000,
      originalPrice: Number(productData.originalPrice) || Number(productData.price) || 65000
    };
    const updated = [newProduct, ...current];
    saveStoredProducts(updated);
    return { success: true, message: 'Thêm sen đá thành công', data: newProduct };
  }

  const res = await fetch(`${API_BASE}/admin/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Không thể tạo sản phẩm');
  return data;
}

export async function updateAdminProduct(id, productData) {
  if (USE_MOCK_DATA) {
    const current = getStoredProducts();
    const updated = current.map((p) => (p.id === id ? { ...p, ...productData } : p));
    saveStoredProducts(updated);
    return { success: true, message: 'Cập nhật thành công', data: { id, ...productData } };
  }

  const res = await fetch(`${API_BASE}/admin/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Không thể cập nhật sản phẩm');
  return data;
}

export async function updateProductStock(id, newStock) {
  if (USE_MOCK_DATA) {
    const current = getStoredProducts();
    const updated = current.map((p) =>
      p.id === id ? { ...p, inStock: Math.max(0, newStock) } : p
    );
    saveStoredProducts(updated);
    return { success: true, inStock: Math.max(0, newStock) };
  }

  const res = await fetch(`${API_BASE}/admin/products/${id}/stock`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ inStock: newStock })
  });
  const data = await res.json();
  if (!res.ok) throw new Error('Không thể cập nhật tồn kho');
  return data;
}

export async function deleteAdminProduct(id) {
  if (USE_MOCK_DATA) {
    const current = getStoredProducts();
    const updated = current.filter((p) => p.id !== id);
    saveStoredProducts(updated);
    return { success: true, message: 'Đã xóa sản phẩm thành công' };
  }

  const res = await fetch(`${API_BASE}/admin/products/${id}`, {
    method: 'DELETE'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Không thể xóa');
  return data;
}

/**
 * Admin: Quản lý mã ưu đãi (Coupons)
 */
export async function getAdminCoupons() {
  if (USE_MOCK_DATA) {
    return getStoredCoupons();
  }

  const res = await fetch(`${API_BASE}/admin/coupons`);
  if (!res.ok) throw new Error('Không thể tải mã ưu đãi');
  const data = await res.json();
  return data.data || [];
}

export async function createAdminCoupon(couponData) {
  if (USE_MOCK_DATA) {
    const coupons = getStoredCoupons();
    const code = (couponData.code || '').trim().toUpperCase();
    if (coupons.some((c) => c.code === code)) {
      throw new Error('Mã giảm giá đã tồn tại trong hệ thống');
    }
    const newCoupon = {
      code,
      discountPercent: Number(couponData.discountPercent) || 10,
      isActive: true,
      description: couponData.description || 'Ưu đãi đặc biệt'
    };
    const updated = [newCoupon, ...coupons];
    saveStoredCoupons(updated);
    return { success: true, message: 'Tạo mã voucher thành công', data: newCoupon };
  }

  const res = await fetch(`${API_BASE}/admin/coupons`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(couponData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Không thể tạo mã');
  return data;
}

export async function toggleAdminCoupon(code, isActive) {
  if (USE_MOCK_DATA) {
    const coupons = getStoredCoupons();
    const updated = coupons.map((c) =>
      c.code === code ? { ...c, isActive: typeof isActive === 'boolean' ? isActive : !c.isActive } : c
    );
    saveStoredCoupons(updated);
    return { success: true, message: 'Cập nhật trạng thái thành công' };
  }

  const res = await fetch(`${API_BASE}/admin/coupons/${code}/toggle`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isActive })
  });
  const data = await res.json();
  if (!res.ok) throw new Error('Lỗi cập nhật voucher');
  return data;
}

export async function deleteAdminCoupon(code) {
  if (USE_MOCK_DATA) {
    const coupons = getStoredCoupons();
    const updated = coupons.filter((c) => c.code !== code);
    saveStoredCoupons(updated);
    return { success: true, message: 'Đã xóa mã voucher thành công' };
  }

  const res = await fetch(`${API_BASE}/admin/coupons/${code}`, {
    method: 'DELETE'
  });
  const data = await res.json();
  if (!res.ok) throw new Error('Lỗi xóa voucher');
  return data;
}

/**
 * Admin: Quản lý khách hàng
 */
export async function getAdminCustomers() {
  if (USE_MOCK_DATA) {
    const users = getStoredUsers();
    return users.map(({ password, ...rest }) => rest);
  }

  const res = await fetch(`${API_BASE}/admin/customers`);
  if (!res.ok) throw new Error('Không thể tải danh sách khách hàng');
  const data = await res.json();
  return data.data || [];
}

export async function updateCustomerRole(userId, newRole) {
  if (USE_MOCK_DATA) {
    const users = getStoredUsers();
    const updated = users.map((u) =>
      String(u.id) === String(userId) ? { ...u, role: newRole } : u
    );
    saveStoredUsers(updated);
    return { success: true, message: 'Cập nhật vai trò thành công', newRole };
  }

  const res = await fetch(`${API_BASE}/admin/customers/${userId}/role`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: newRole })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Lỗi cập nhật vai trò');
  return data;
}

export async function updateCustomerStatus(userId, newStatus) {
  if (USE_MOCK_DATA) {
    const users = getStoredUsers();
    const updated = users.map((u) =>
      String(u.id) === String(userId) ? { ...u, status: newStatus } : u
    );
    saveStoredUsers(updated);
    return { success: true, message: 'Cập nhật trạng thái thành công', status: newStatus };
  }

  const res = await fetch(`${API_BASE}/admin/customers/${userId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: newStatus })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Lỗi cập nhật trạng thái');
  return data;
}

export async function deleteAdminCustomer(userId) {
  if (USE_MOCK_DATA) {
    const users = getStoredUsers();
    const updated = users.map((u) =>
      String(u.id) === String(userId) ? { ...u, status: 'DELETED' } : u
    );
    saveStoredUsers(updated);
    return { success: true, message: 'Đã vô hiệu hóa tài khoản thành công' };
  }

  const res = await fetch(`${API_BASE}/admin/customers/${userId}`, {
    method: 'DELETE'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Lỗi xóa tài khoản');
  return data;
}

// ==============================================================================
// MOMO PAYMENT APIs
// ==============================================================================

export async function createMoMoPayment(orderCode, amount = 0) {
  const payAmount = Number(amount) > 0 ? Number(amount) : 150000;
  if (USE_MOCK_DATA) {
    return {
      success: true,
      data: {
        payUrl: 'https://test-payment.momo.vn',
        qrCodeUrl: `https://img.vietqr.io/image/970422-0988123456-compact2.png?amount=${payAmount}&addInfo=${orderCode}&accountName=MOMO%20SEN%20XINH%20GARDEN`,
        deeplink: `momo://payment?orderId=${orderCode}`
      }
    };
  }

  try {
    const res = await fetch(`${API_BASE}/payment/momo/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderCode, amount: payAmount })
    });
    return await res.json();
  } catch (error) {
    console.error('Lỗi khi khởi tạo thanh toán MoMo:', error);
    return {
      success: true,
      data: {
        payUrl: 'https://test-payment.momo.vn',
        qrCodeUrl: `https://img.vietqr.io/image/970422-0988123456-compact2.png?amount=${payAmount}&addInfo=${orderCode}&accountName=MOMO%20SEN%20XINH%20GARDEN`,
        deeplink: `momo://payment?orderId=${orderCode}`
      }
    };
  }
}

export async function simulateMoMoPayment(orderCode) {
  if (USE_MOCK_DATA) {
    return { success: true, message: 'Thanh toán MoMo thành công (Chế độ Mock)' };
  }

  try {
    const res = await fetch(`${API_BASE}/payment/momo/simulate-ipn`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderCode })
    });
    const json = await res.json();
    // Backend trả về ApiResult wrapper: { message, data: { resultCode, ... } }
    // Chuẩn hóa response để frontend luôn nhận được { success: true/false }
    if (res.ok) {
      const inner = json.data || {};
      const resultCode = inner.resultCode !== undefined ? inner.resultCode : 0;
      return { success: resultCode === 0, message: json.message || inner.message || 'Thành công', data: inner };
    }
    return { success: false, message: json.message || 'Lỗi xác nhận thanh toán MoMo' };
  } catch (error) {
    console.error('Lỗi khi mô phỏng IPN MoMo:', error);
    return { success: false, message: 'Lỗi kết nối máy chủ MoMo' };
  }
}

/**
 * Kiểm tra trạng thái đơn hàng theo mã đơn (orderCode) phục vụ polling thanh toán tự động
 */
export async function checkOrderStatus(orderCode) {
  if (!orderCode) return { success: false };

  if (USE_MOCK_DATA) {
    const orders = getStoredOrders();
    const order = orders.find(
      (o) => (o.orderCode && o.orderCode.toUpperCase() === orderCode.toUpperCase()) || String(o.id) === String(orderCode)
    );
    if (order) {
      return { success: true, status: order.status || 'PENDING', order };
    }
    return { success: false, status: 'NOT_FOUND' };
  }

  try {
    const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(orderCode)}`);
    if (!res.ok) {
      return { success: false, status: 'UNKNOWN' };
    }
    const data = await res.json();
    const order = data.data || {};
    return { success: true, status: order.status || 'PENDING', order };
  } catch (err) {
    console.warn('Lỗi kiểm tra trạng thái đơn hàng:', err);
    return { success: false, status: 'ERROR' };
  }
}

/**
 * Mô phỏng Webhook Chuyển khoản ngân hàng (SePay / VietQR) tự động xác nhận PAID
 */
export async function simulateBankTransferPayment(orderCode) {
  if (USE_MOCK_DATA) {
    const orders = getStoredOrders();
    const updated = orders.map((o) =>
      o.orderCode?.toUpperCase() === orderCode?.toUpperCase() || String(o.id) === String(orderCode)
        ? { ...o, status: 'PAID' }
        : o
    );
    localStorage.setItem('senxinh_mock_orders', JSON.stringify(updated));
    return { success: true, message: 'Mô phỏng chuyển khoản thành công', status: 'PAID' };
  }

  try {
    const res = await fetch(`${API_BASE}/payment/bank-transfer/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderCode })
    });
    const json = await res.json();
    // Backend trả về ApiResult wrapper: { message, data: { success, status, orderCode, ... } }
    // Chuẩn hóa để frontend luôn nhận được { success: true/false, status: 'PAID' }
    if (res.ok) {
      const inner = json.data || {};
      return {
        success: inner.success !== false,
        status: inner.status || 'PAID',
        message: json.message || inner.message || 'Mô phỏng chuyển khoản thành công',
        orderCode: inner.orderCode || orderCode
      };
    }
    return { success: false, message: json.message || 'Lỗi xác nhận chuyển khoản' };
  } catch (error) {
    console.error('Lỗi khi mô phỏng Webhook chuyển khoản:', error);
    return { success: false, message: 'Lỗi kết nối máy chủ' };
  }
}

/**
 * Kiểm tra tính khả dụng của danh sách sản phẩm trong giỏ hàng (Cart Validation)
 * Không bao giờ làm crash 500 nếu sản phẩm bị xóa hoặc hết hàng
 */
export async function validateCartItems(items) {
  if (!items || items.length === 0) {
    return { valid: true, items: [], hasUnavailableItems: false, hasOutOfStockItems: false };
  }

  if (USE_MOCK_DATA) {
    const products = getStoredProducts();
    const validated = items.map((it) => {
      const p = products.find((prod) => prod.id === it.id);
      if (!p || p.status === 'DELETED' || p.status === 'INACTIVE') {
        return {
          productId: it.id,
          productName: it.name,
          available: false,
          status: 'DELETED',
          message: 'Sản phẩm không còn được bán hoặc đã ngừng kinh doanh',
          inStock: 0
        };
      }
      if ((p.inStock || 0) <= 0) {
        return {
          productId: it.id,
          productName: p.name,
          available: false,
          status: 'OUT_OF_STOCK',
          message: 'Sản phẩm hiện đang tạm hết hàng trong kho',
          inStock: 0
        };
      }
      return {
        productId: it.id,
        productName: p.name,
        available: true,
        status: 'ACTIVE',
        message: 'Sẵn sàng đặt hàng',
        inStock: p.inStock
      };
    });
    const hasUnavailable = validated.some((v) => !v.available);
    return { valid: !hasUnavailable, items: validated, hasUnavailableItems: hasUnavailable };
  }

  try {
    const res = await fetch(`${API_BASE}/cart/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: items.map((it) => ({ productId: it.id, quantity: it.quantity }))
      })
    });
    const data = await res.json();
    return data.data || { valid: true, items: [] };
  } catch (err) {
    console.warn('Lỗi kiểm tra giỏ hàng:', err);
    return { valid: true, items: [] };
  }
}

// ==============================================================================
// AUTHENTICATION APIs (Passwordless Email & Google OAuth)
// ==============================================================================

/**
 * Gửi mã OTP xác thực 6 số về Email
 */
export async function sendOtp(email) {
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail) {
    throw new Error('Vui lòng nhập địa chỉ Email!');
  }

  if (USE_MOCK_DATA) {
    const mockOtp = String(Math.floor(100000 + Math.random() * 900000));
    try {
      sessionStorage.setItem(
        `senxinh_mock_otp_${cleanEmail}`,
        JSON.stringify({ code: mockOtp, expiry: Date.now() + 5 * 60 * 1000 })
      );
    } catch {}
    console.info(`🔑 [SEN XINH MOCK OTP] Mã xác thực cho ${cleanEmail}: ${mockOtp}`);
    return {
      success: true,
      message: `Mã xác thực OTP gồm 6 chữ số đã được gửi đến email ${cleanEmail}. (Mã thử nghiệm: ${mockOtp})`,
      devOtp: mockOtp,
      expiresInSeconds: 300
    };
  }

  const res = await fetch(`${API_BASE}/auth/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: cleanEmail })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Không thể gửi mã OTP. Vui lòng thử lại sau!');
  }
  return data.data || data;
}

/**
 * Đăng nhập bằng Mật Khẩu (Phương án 1) hoặc OTP Email (Phương án 2)
 */
export async function loginUser(email, password = '', otp = '') {
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail) {
    throw new Error('Vui lòng nhập địa chỉ Email!');
  }

  if (USE_MOCK_DATA) {
    const users = getStoredUsers();
    let existingUser = users.find(
      (u) => (u.email && u.email.toLowerCase() === cleanEmail) || u.phone === cleanEmail
    );

    const isAdmin = cleanEmail === 'admin@senxinh.vn' || existingUser?.role?.toLowerCase().includes('admin');

    // 1. Kiểm tra Admin
    if (isAdmin) {
      if (password) {
        const adminPw = existingUser?.password || 'admin123';
        if (password !== adminPw && password !== 'admin123') {
          throw new Error('Mật khẩu Quản trị viên không chính xác!');
        }
      } else if (otp) {
        // Kiểm tra OTP Admin
        let stored = null;
        try {
          stored = JSON.parse(sessionStorage.getItem(`senxinh_mock_otp_${cleanEmail}`));
        } catch {}
        if (!stored || Date.now() > stored.expiry) {
          throw new Error('Mã OTP chưa được yêu cầu hoặc đã hết hạn. Vui lòng nhấn gửi lại mã!');
        }
        if (stored.code !== otp.trim()) {
          throw new Error('Mã OTP không chính xác. Vui lòng kiểm tra lại!');
        }
      } else {
        throw new Error('Tài khoản Quản trị viên bắt buộc phải nhập Mật khẩu hoặc mã OTP!');
      }
    } else {
      // 2. Tài khoản Khách hàng
      if (otp) {
        let stored = null;
        try {
          stored = JSON.parse(sessionStorage.getItem(`senxinh_mock_otp_${cleanEmail}`));
        } catch {}
        if (!stored || Date.now() > stored.expiry) {
          throw new Error('Mã OTP chưa được yêu cầu hoặc đã hết hạn. Vui lòng nhấn gửi lại mã!');
        }
        if (stored.code !== otp.trim()) {
          throw new Error('Mã OTP không chính xác. Vui lòng kiểm tra lại!');
        }
        // Xóa OTP sau khi dùng
        try { sessionStorage.removeItem(`senxinh_mock_otp_${cleanEmail}`); } catch {}
      } else if (password) {
        if (existingUser) {
          if (existingUser.password && existingUser.password !== password && password !== '123456') {
            throw new Error('Mật khẩu đăng nhập không chính xác!');
          }
        } else {
          throw new Error('Không tìm thấy tài khoản với email này. Vui lòng chọn Xác thực OTP để tạo tài khoản mới!');
        }
      } else {
        throw new Error('Vui lòng nhập Mật khẩu hoặc yêu cầu gửi mã OTP để đăng nhập an toàn!');
      }
    }

    if (!existingUser) {
      // Tự động tạo mới tài khoản nếu xác thực OTP thành công
      existingUser = {
        id: `user_${Date.now()}`,
        publicId: `mock-uuid-${Date.now()}`,
        name: cleanEmail.includes('@') ? cleanEmail.split('@')[0] : cleanEmail,
        email: cleanEmail,
        phone: '',
        authProvider: 'EMAIL',
        address: 'Hà Nội, Việt Nam',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        role: 'Thành viên mới',
        points: 50
      };
      users.push(existingUser);
      saveStoredUsers(users);
    }

    const { password: _, ...userSafe } = existingUser;
    userSafe.isMockUser = true;
    userSafe.linkedProviders = ['EMAIL'];
    if (existingUser.authProvider === 'GOOGLE') {
      userSafe.linkedProviders.push('GOOGLE');
    }
    return {
      success: true,
      message: 'Đăng nhập thành công!',
      data: userSafe,
      token: `mock_token_${Date.now()}`
    };
  }

  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      email: cleanEmail,
      password: password || '',
      otp: otp || ''
    })
  });
  const data = await res.json();
  if (!res.ok) {
    const error = new Error(data.message || 'Đăng nhập không thành công');
    error.code = data.code;
    error.data = data.data;
    throw error;
  }
  // Chuẩn hóa cấu trúc: Backend trả về { user: {...}, token: "..." }
  const userPayload = (data.data && data.data.user) ? data.data.user : data.data;
  const token = data.data?.token || data.token;
  if (token) {
    localStorage.setItem('senxinh_auth_token', token);
  }
  return {
    success: true,
    message: data.message || 'Đăng nhập thành công!',
    data: { ...userPayload, token },
    token
  };
}

export async function loginWithGoogle({ idToken, accessToken, profile = null } = {}) {
  if (USE_MOCK_DATA) {
    const users = getStoredUsers();
    let userEmail = profile?.email;
    let userName = profile?.name;
    let userAvatar = profile?.picture;

    // Giải mã Google ID Token (JWT) nếu chưa có sẵn thông tin profile
    if (!userEmail && idToken) {
      try {
        const base64Url = idToken.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const decoded = JSON.parse(jsonPayload);
        userEmail = decoded.email;
        userName = decoded.name || decoded.email?.split('@')[0];
        userAvatar = decoded.picture;
      } catch (e) {
        console.warn('Không thể giải mã Google idToken ở chế độ Mock Data:', e);
      }
    }

    if (!userEmail) {
      userEmail = 'google.user@senxinh.vn';
      userName = userName || 'Khách Hàng Google';
    }

    const cleanEmail = userEmail.trim().toLowerCase();
    let matched = users.find((u) => u.email && u.email.toLowerCase() === cleanEmail);

    if (!matched) {
      matched = {
        id: `user_google_${Date.now()}`,
        publicId: `google-uuid-${Date.now()}`,
        name: userName || 'Khách Hàng Google',
        email: cleanEmail,
        phone: '',
        authProvider: 'GOOGLE',
        address: 'Hà Nội, Việt Nam',
        avatar: userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        role: 'Thành viên mới',
        points: 50
      };
      users.push(matched);
      saveStoredUsers(users);
    } else {
      if (userAvatar && (!matched.avatar || matched.avatar.includes('unsplash'))) {
        matched.avatar = userAvatar;
        saveStoredUsers(users);
      }
    }

    const { password: _, ...userSafe } = matched;
    userSafe.isMockUser = true;
    userSafe.linkedProviders = ['GOOGLE'];

    return {
      success: true,
      message: 'Đăng nhập Google thành công!',
      data: userSafe,
      token: `google_mock_token_${Date.now()}`
    };
  }

  // Kết nối trực tiếp Backend Spring Boot thực tế
  const res = await fetch(`${API_BASE}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken, accessToken, profile })
  });
  const data = await res.json();
  if (!res.ok) {
    const error = new Error(data.message || 'Đăng nhập Google không thành công');
    error.code = data.code;
    throw error;
  }
  const userPayload = (data.data && data.data.user) ? data.data.user : data.data;
  const token = data.data?.token || data.token;
  if (token) {
    localStorage.setItem('senxinh_auth_token', token);
  }
  return {
    success: true,
    message: data.message || 'Đăng nhập Google thành công!',
    data: { ...userPayload, token },
    token
  };
}

export async function registerUser(userData) {
  if (USE_MOCK_DATA) {
    const users = getStoredUsers();
    const cleanEmail = (userData.email || '').trim().toLowerCase();

    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('Email này đã được đăng ký tài khoản tại Sen Xinh Garden!');
    }

    const newUser = {
      id: `user_${Date.now()}`,
      publicId: `mock-uuid-${Date.now()}`,
      name: userData.name,
      email: cleanEmail,
      phone: userData.phone || '',
      authProvider: 'EMAIL',
      address: userData.address || 'Hà Nội, Việt Nam',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      role: 'Thành viên mới',
      points: 50
    };

    users.push(newUser);
    saveStoredUsers(users);

    const { password: _, ...userSafe } = newUser;
    userSafe.isMockUser = true;
    userSafe.linkedProviders = ['EMAIL'];
    return {
      success: true,
      message: 'Đăng ký thành công! Tặng bạn mã ưu đãi SENMOI50 cho đơn đầu tiên.',
      data: userSafe,
      token: `mock_token_${Date.now()}`
    };
  }

  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      address: userData.address
    })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Đăng ký không thành công');
  }
  const userPayload = (data.data && data.data.user) ? data.data.user : data.data;
  const token = data.data?.token || data.token;
  if (token) {
    localStorage.setItem('senxinh_auth_token', token);
  }
  return {
    success: true,
    message: data.message || 'Đăng ký thành công!',
    data: { ...userPayload, token },
    token
  };
}

/**
 * Các hàm tương thích ngược nếu còn component gọi tạm thời
 */
export async function checkEmailStatus(email) {
  return { exists: true, hasPassword: false, isGoogle: false };
}

export async function setPassword() {
  return { success: true, message: 'Tính năng mật khẩu đã được lược bỏ.' };
}

export async function requestPasswordOtp() {
  return { success: true, message: 'Tính năng mật khẩu đã được lược bỏ.' };
}

export async function resetPassword() {
  return { success: true, message: 'Tính năng mật khẩu đã được lược bỏ.' };
}

export async function changePassword() {
  return { success: true, message: 'Tính năng mật khẩu đã được lược bỏ.' };
}

// ==============================================================================
// CẤU HÌNH PHÍ VẬN CHUYỂN THEO TỈNH / THÀNH PHỐ
// ==============================================================================

export const DEFAULT_SHIPPING_CONFIG = {
  freeShippingEnabled: true,
  freeShippingThreshold: 200000,
  defaultShippingFee: 35000,
  provinceRates: [
    { id: 'rate_hn', province: 'Hà Nội', fee: 25000, estimatedDays: '1 - 2 ngày', note: 'Nội & ngoại thành Hà Nội' },
    { id: 'rate_hcm', province: 'TP. Hồ Chí Minh', fee: 30000, estimatedDays: '2 - 3 ngày', note: 'Toàn khu vực TP. Hồ Chí Minh' },
    { id: 'rate_dl', province: 'Đà Lạt - Lâm Đồng', fee: 20000, estimatedDays: 'Trong ngày / 1 ngày', note: 'Khu vực gần nhà vườn ươm' },
    { id: 'rate_dn', province: 'Đà Nẵng', fee: 28000, estimatedDays: '2 - 3 ngày', note: 'Khu vực miền Trung' },
    { id: 'rate_hp', province: 'Hải Phòng', fee: 26000, estimatedDays: '1 - 2 ngày', note: 'Khu vực duyên hải Bắc Bộ' },
    { id: 'rate_ct', province: 'Cần Thơ', fee: 32000, estimatedDays: '2 - 3 ngày', note: 'Khu vực Tây Nam Bộ' },
    { id: 'rate_bd', province: 'Bình Dương', fee: 28000, estimatedDays: '2 ngày', note: 'Khu vực Đông Nam Bộ' },
    { id: 'rate_dna', province: 'Đồng Nai', fee: 28000, estimatedDays: '2 ngày', note: 'Khu vực Đông Nam Bộ' },
    { id: 'rate_kh', province: 'Khánh Hòa (Nha Trang)', fee: 25000, estimatedDays: '1 - 2 ngày', note: 'Khu vực Nam Trung Bộ' },
    { id: 'rate_other', province: 'Khác', fee: 35000, estimatedDays: '2 - 4 ngày', note: 'Áp dụng cho các tỉnh thành khác toàn quốc' }
  ]
};

const SHIPPING_STORAGE_KEY = 'senxinh_shipping_config';

export function getShippingConfig() {
  if (typeof window === 'undefined') return DEFAULT_SHIPPING_CONFIG;
  try {
    const raw = localStorage.getItem(SHIPPING_STORAGE_KEY);
    if (!raw) return DEFAULT_SHIPPING_CONFIG;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SHIPPING_CONFIG,
      ...parsed,
      provinceRates: Array.isArray(parsed.provinceRates) && parsed.provinceRates.length > 0
        ? parsed.provinceRates
        : DEFAULT_SHIPPING_CONFIG.provinceRates
    };
  } catch (e) {
    return DEFAULT_SHIPPING_CONFIG;
  }
}

/**
 * Tải biểu phí vận chuyển từ máy chủ PostgreSQL (có fallback cache)
 */
export async function fetchShippingConfig() {
  if (USE_MOCK_DATA) {
    return getShippingConfig();
  }

  try {
    const res = await fetch(`${API_BASE}/shipping-rates`);
    if (res.ok) {
      const json = await res.json();
      if (json && json.data) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(SHIPPING_STORAGE_KEY, JSON.stringify(json.data));
        }
        return {
          ...DEFAULT_SHIPPING_CONFIG,
          ...json.data
        };
      }
    }
  } catch (e) {
    console.warn('Không thể kết nối máy chủ để lấy cước phí ship, dùng cache:', e);
  }
  return getShippingConfig();
}

/**
 * Lưu biểu phí vận chuyển lên Database PostgreSQL và đồng bộ cache
 */
export async function saveShippingConfig(newConfig) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(SHIPPING_STORAGE_KEY, JSON.stringify(newConfig));
    } catch (e) {
      console.warn('Lỗi lưu cấu hình phí ship vào localStorage:', e);
    }
  }

  if (!USE_MOCK_DATA) {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/admin/shipping-rates`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(newConfig)
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.data) {
          if (typeof window !== 'undefined') {
            localStorage.setItem(SHIPPING_STORAGE_KEY, JSON.stringify(json.data));
          }
          return json.data;
        }
      }
    } catch (err) {
      console.warn('Lỗi đồng bộ cấu hình phí ship lên Server DB:', err);
    }
  }

  return newConfig;
}

/**
 * Khôi phục biểu phí mặc định
 */
export async function resetShippingConfig() {
  return await saveShippingConfig(DEFAULT_SHIPPING_CONFIG);
}

/**
 * Cấp mã vé xác thực một lần (Ticket) phục vụ kết nối SSE cho Admin
 */
export async function getAdminSseTicket() {
  if (USE_MOCK_DATA) {
    return `mock_ticket_${Date.now()}`;
  }
  const token = typeof window !== 'undefined' ? (localStorage.getItem('senxinh_auth_token') || '') : '';
  const res = await fetch(`${API_BASE}/admin/orders/events/ticket`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Không thể cấp vé xác thực SSE');
  }
  return data.data?.ticket || data.ticket;
}



