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
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
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
  if (!res.ok) throw new Error(`Không tìm thấy sản phẩm (${res.status})`);
  const data = await res.json();
  return data.data;
}

/**
 * Tạo đơn hàng mới
 */
export async function createOrder(orderPayload) {
  if (USE_MOCK_DATA) {
    const subtotal = orderPayload.items?.reduce((sum, it) => sum + (it.price || 0) * (it.quantity || 1), 0) || 0;
    const discountAmount = orderPayload.discountAmount || 0;
    const shippingFee = orderPayload.shippingFee !== undefined ? orderPayload.shippingFee : (subtotal >= 200000 || subtotal === 0 ? 0 : 30000);
    const totalAmount = orderPayload.totalAmount || Math.max(0, subtotal - discountAmount + shippingFee);

    const mockOrder = {
      id: Date.now(),
      orderCode: orderPayload.orderCode || `SX-${Date.now().toString(36).toUpperCase()}`,
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
      shippingFee,
      totalAmount,
      note: orderPayload.note || '',
      createdAt: new Date().toISOString()
    };
    try {
      const existing = getStoredOrders();
      existing.unshift(mockOrder);
      saveStoredOrders(existing);
    } catch (e) {
      console.error('Lỗi lưu đơn hàng mock:', e);
    }
    return { success: true, data: mockOrder, order: mockOrder };
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
    throw new Error('Không tìm thấy đơn hàng trong Mock Data');
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
 * Khách hàng hủy đơn hàng (khi đang PENDING)
 */
export async function cancelCustomerOrder(orderId) {
  if (USE_MOCK_DATA) {
    const orders = getStoredOrders();
    const target = orders.find((o) => o.id === orderId || o.orderCode === orderId);
    if (!target) throw new Error('Không tìm thấy đơn hàng để hủy');
    if (target.status !== 'PENDING') {
      throw new Error('Đơn hàng đã được xử lý, không thể tự hủy');
    }
    target.status = 'CANCELLED';
    saveStoredOrders(orders);
    return { success: true, message: 'Đã hủy đơn hàng thành công', data: target };
  }

  const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'CANCELLED' })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Không thể hủy đơn hàng');
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

  const res = await fetch(`${API_BASE}/users/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profileData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Không thể cập nhật thông tin');
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
 */
export async function uploadProductImage(file) {
  const formData = new FormData();
  formData.append('file', file);

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
    return await res.json();
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
    return { success: true, message: 'Mô phỏng chuyển khoản thành công (Mock Data)', status: 'PAID' };
  }

  try {
    const res = await fetch(`${API_BASE}/payment/bank-transfer/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderCode })
    });
    return await res.json();
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
// AUTHENTICATION APIs (Login, Register, Password Reset)
/**
 * Kiểm tra trạng thái tài khoản theo email (phát hiện tài khoản Google chưa có mật khẩu)
 */
export async function checkEmailStatus(email) {
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail) return { exists: false };

  if (USE_MOCK_DATA) {
    const users = getStoredUsers();
    const target = users.find(
      (u) => (u.email && u.email.toLowerCase() === cleanEmail) || u.phone === cleanEmail
    );
    if (!target) return { exists: false };
    const hasPassword = Boolean(target.password && target.password.trim() !== '');
    const isGoogle = target.authProvider === 'GOOGLE' || 
      (Array.isArray(target.linkedProviders) && target.linkedProviders.includes('GOOGLE'));
    return {
      exists: true,
      hasPassword,
      isGoogle,
      email: target.email,
      name: target.name
    };
  }

  try {
    const res = await fetch(`${API_BASE}/auth/check-email?email=${encodeURIComponent(cleanEmail)}`);
    if (!res.ok) return { exists: false };
    const data = await res.json();
    return data.data || { exists: false };
  } catch {
    return { exists: false };
  }
}

export async function loginUser(email, password) {
  if (USE_MOCK_DATA) {
    const users = getStoredUsers();
    const cleanEmail = (email || '').trim().toLowerCase();
    const existingUser = users.find(
      (u) => (u.email && u.email.toLowerCase() === cleanEmail) || u.phone === cleanEmail
    );

    if (existingUser) {
      // Case 2: Tài khoản tồn tại nhưng chưa có password local (tạo qua Google)
      if (!existingUser.password) {
        const error = new Error(
          'Tài khoản của bạn được tạo qua Google và chưa thiết lập mật khẩu. Vui lòng thiết lập mật khẩu trước khi đăng nhập bằng Email/Password hoặc tiếp tục Đăng nhập bằng Google.'
        );
        error.code = 'AUTH_008';
        error.email = existingUser.email;
        throw error;
      }

      const isMatch =
        existingUser.password === password ||
        (cleanEmail === 'admin@senxinh.vn' && (password === 'admin' || password === 'admin123')) ||
        (cleanEmail === 'long.senxinh@gmail.com' && (password === '123' || password === '123456'));

      if (isMatch) {
        const { password: _, ...userSafe } = existingUser;
        userSafe.hasPassword = true;
        userSafe.linkedProviders = ['LOCAL'];
        if (existingUser.authProvider === 'GOOGLE') {
          userSafe.linkedProviders.push('GOOGLE');
        }
        return {
          success: true,
          message: 'Đăng nhập thành công! (Chế độ Mock Data)',
          data: userSafe,
          token: `mock_token_${Date.now()}`
        };
      }
    }

    throw new Error('Email hoặc mật khẩu không chính xác. Hãy kiểm tra lại!');
  }

  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) {
    const error = new Error(data.message || 'Đăng nhập không thành công');
    error.code = data.code;
    error.data = data.data;
    throw error;
  }
  return data;
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
      // Case 1: User mới đăng nhập Google -> password = null
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
      // Case 3 & 4: User đã tồn tại (đăng ký local trước đó hoặc đã liên kết), không tạo user thứ hai!
      if (userAvatar && (!matched.avatar || matched.avatar.includes('unsplash'))) {
        matched.avatar = userAvatar;
        saveStoredUsers(users);
      }
    }

    const { password: _, ...userSafe } = matched;
    userSafe.hasPassword = !!matched.password;
    userSafe.linkedProviders = ['GOOGLE'];
    if (matched.password) {
      userSafe.linkedProviders.push('LOCAL');
    }

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
  return data;
}

/**
 * Thiết lập mật khẩu cho tài khoản Google chưa có mật khẩu local
 */
export async function setPassword({ email, password, otp } = {}) {
  if (USE_MOCK_DATA) {
    const users = getStoredUsers();
    const cleanEmail = (email || '').trim().toLowerCase();
    const target = users.find((u) => u.email && u.email.toLowerCase() === cleanEmail);
    if (!target) {
      throw new Error('Không tìm thấy tài khoản người dùng để thiết lập mật khẩu!');
    }
    target.password = password;
    saveStoredUsers(users);

    const { password: _, ...userSafe } = target;
    userSafe.hasPassword = true;
    userSafe.linkedProviders = ['GOOGLE', 'LOCAL'];
    return {
      success: true,
      message: 'Thiết lập mật khẩu thành công! Bạn có thể đăng nhập bằng Email và Mật khẩu.',
      data: userSafe,
      token: `mock_token_${Date.now()}`
    };
  }

  const token = localStorage.getItem('senxinh_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/auth/set-password`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ email, password, otp })
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || 'Thiết lập mật khẩu thất bại');
    err.code = data.code;
    throw err;
  }
  return data;
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
      password: userData.password,
      address: userData.address || 'Hà Nội, Việt Nam',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      role: 'Thành viên mới',
      points: 50
    };

    users.push(newUser);
    saveStoredUsers(users);

    const { password: _, ...userSafe } = newUser;
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
    body: JSON.stringify(userData)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Đăng ký không thành công');
  }
  return data;
}

export async function requestPasswordOtp(emailOrPhone) {
  if (USE_MOCK_DATA) {
    const users = getStoredUsers();
    const target = (emailOrPhone || '').trim().toLowerCase();
    const found = users.find(
      (u) => u.email.toLowerCase() === target || u.phone === target
    );

    if (!found && target !== 'admin@senxinh.vn' && target !== 'long.senxinh@gmail.com') {
      throw new Error('Không tìm thấy tài khoản với email/số điện thoại này.');
    }

    return {
      success: true,
      message: 'Mã xác thực OTP đã được gửi đến bạn. (Mã mẫu thử nghiệm: 686868)',
      demoOtp: '686868'
    };
  }

  const res = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emailOrPhone })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Không tìm thấy tài khoản');
  }
  return data;
}

export async function resetPassword({ emailOrPhone, otp, newPassword }) {
  if (USE_MOCK_DATA) {
    if (otp !== '686868' && otp !== '123456') {
      throw new Error('Mã OTP xác thực không chính xác! Hãy nhập 686868 để thử nghiệm.');
    }

    const users = getStoredUsers();
    const target = (emailOrPhone || '').trim().toLowerCase();
    const userIndex = users.findIndex(
      (u) => u.email.toLowerCase() === target || u.phone === target
    );

    if (userIndex !== -1) {
      users[userIndex].password = newPassword;
      saveStoredUsers(users);
    }

    return {
      success: true,
      message: 'Đổi mật khẩu thành công! Bạn có thể đăng nhập ngay bằng mật khẩu mới.'
    };
  }

  const res = await fetch(`${API_BASE}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emailOrPhone, otp, newPassword })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Đặt lại mật khẩu thất bại');
  }
  return data;
}

export async function changePassword({ email, currentPassword, newPassword }) {
  if (USE_MOCK_DATA) {
    const users = getStoredUsers();
    const target = (email || '').trim().toLowerCase();
    const found = users.find((u) => u.email.toLowerCase() === target);

    if (found && found.password !== currentPassword) {
      throw new Error('Mật khẩu hiện tại không chính xác!');
    }

    if (found) {
      found.password = newPassword;
      saveStoredUsers(users);
    }

    return {
      success: true,
      message: 'Cập nhật mật khẩu mới thành công!'
    };
  }

  const res = await fetch(`${API_BASE}/auth/change-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, currentPassword, newPassword })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Đổi mật khẩu thất bại');
  }
  return data;
}
