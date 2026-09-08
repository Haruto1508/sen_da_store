import mockData from '../data/mockData.json';

// ==============================================================================
// SEN XINH GARDEN - API SERVICE & MOCK DATA CONTROLLER
// Có thể bật / tắt chế độ Mock Data từ biến môi trường: VITE_USE_MOCK_DATA
// ==============================================================================

export const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';
export const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

console.info(
  `%c🌿 [Sen Xinh Garden] Chế độ dữ liệu: ${
    USE_MOCK_DATA ? 'MOCK DATA JSON (VITE_USE_MOCK_DATA=true)' : 'LIVE BACKEND POSTGRESQL (VITE_USE_MOCK_DATA=false)'
  }`,
  'color: #10b981; font-weight: bold; font-size: 13px;'
);

// ==============================================================================
// LOCAL STORAGE MOCK DB HELPERS (Sử dụng dữ liệu từ mockData.json làm gốc)
// ==============================================================================

export function getStoredCoupons() {
  try {
    const saved = localStorage.getItem('senxinh_admin_coupons');
    if (!saved) {
      localStorage.setItem('senxinh_admin_coupons', JSON.stringify(mockData.coupons));
      return mockData.coupons;
    }
    return JSON.parse(saved);
  } catch {
    return mockData.coupons;
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

export const SEED_MOCK_ORDERS = [
  {
    id: 1718000001,
    orderCode: 'SX-HL8812',
    customerName: 'Nguyễn Hoàng Long',
    customerEmail: 'long.senxinh@gmail.com',
    customerPhone: '0988123456',
    shippingAddress: '123 Phố Trúc Bạch, Quận Ba Đình, Hà Nội',
    status: 'COMPLETED',
    paymentMethod: 'VIETQR',
    createdAt: '2026-08-28T09:15:00.000Z',
    items: [
      {
        id: 'sen-da-kim-cuong',
        name: 'Sen Đá Kim Cương Pha Lê (Haworthia Cooperi)',
        price: 85000,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'sen-da-chuoi-ngoc',
        name: 'Sen Đá Chuỗi Ngọc Bi Rủ',
        price: 65000,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'dat-trong-sen-da',
        name: 'Đất Trồng Sen Đá Chuyên Dụng Soil Mix (1kg)',
        price: 35000,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1520302630591-fd1c66edc19d?auto=format&fit=crop&w=800&q=80'
      }
    ],
    subtotal: 270000,
    discountAmount: 20000,
    shippingFee: 15000,
    totalAmount: 265000,
    note: 'Giao giờ hành chính, bọc kỹ chậu giúp mình nhé shop.'
  },
  {
    id: 1718000002,
    orderCode: 'SX-HL9941',
    customerName: 'Nguyễn Hoàng Long',
    customerEmail: 'long.senxinh@gmail.com',
    customerPhone: '0988123456',
    shippingAddress: '123 Phố Trúc Bạch, Quận Ba Đình, Hà Nội',
    status: 'SHIPPING',
    paymentMethod: 'COD',
    createdAt: '2026-09-02T14:30:00.000Z',
    items: [
      {
        id: 'sen-da-mong-rong',
        name: 'Sen Đá Móng Rồng Xanh Viền Trắng',
        price: 55000,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'chau-dat-nung-mini',
        name: 'Bộ 2 Chậu Đất Nung Thấm Nước Size M',
        price: 45000,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80'
      }
    ],
    subtotal: 155000,
    discountAmount: 0,
    shippingFee: 20000,
    totalAmount: 175000,
    note: 'Gọi trước khi giao 15 phút.'
  },
  {
    id: 1718000003,
    orderCode: 'SX-AD1002',
    customerName: 'Quản Trị Viên Sen Xinh',
    customerEmail: 'admin@senxinh.vn',
    customerPhone: '0901234567',
    shippingAddress: 'Vườn Sen Xinh, Tây Hồ, Hà Nội',
    status: 'PAID',
    paymentMethod: 'MOMO',
    createdAt: '2026-09-04T10:00:00.000Z',
    items: [
      {
        id: 'sen-da-hoa-hong-xanh',
        name: 'Sen Đá Hoa Hồng Xanh Cổ Thụ',
        price: 150000,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'sen-da-do-la-hong',
        name: 'Sen Đá Đô La Hồng Cẩm Thạch',
        price: 120000,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80'
      }
    ],
    subtotal: 420000,
    discountAmount: 40000,
    shippingFee: 0,
    totalAmount: 380000,
    note: 'Đơn đặt kiểm tra cây giống nhập khẩu'
  }
];

export function getStoredOrders() {
  try {
    const raw = localStorage.getItem('senxinh_mock_orders');
    if (!raw || JSON.parse(raw).length === 0) {
      localStorage.setItem('senxinh_mock_orders', JSON.stringify(SEED_MOCK_ORDERS));
      return SEED_MOCK_ORDERS;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_MOCK_ORDERS;
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
    const mockOrder = {
      id: Date.now(),
      orderCode: orderPayload.orderCode || `SX-${Date.now().toString(36).toUpperCase()}`,
      status: 'PENDING',
      ...orderPayload,
      createdAt: new Date().toISOString()
    };
    try {
      const existing = JSON.parse(localStorage.getItem('senxinh_mock_orders') || '[]');
      existing.unshift(mockOrder);
      localStorage.setItem('senxinh_mock_orders', JSON.stringify(existing));
    } catch (e) {
      console.error('Lỗi lưu đơn hàng mock:', e);
    }
    return { success: true, data: mockOrder };
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
    const existing = JSON.parse(localStorage.getItem('senxinh_mock_orders') || '[]');
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
export async function getCustomerOrders(identifier) {
  if (USE_MOCK_DATA) {
    const mockOrders = getStoredOrders();
    if (!identifier) return mockOrders;
    const query = String(identifier).toLowerCase();
    return mockOrders.filter(
      (o) =>
        (o.customerPhone && o.customerPhone.includes(query)) ||
        (o.customerEmail && o.customerEmail.toLowerCase() === query) ||
        (o.customerName && o.customerName.toLowerCase().includes(query))
    );
  }

  const res = await fetch(`${API_BASE}/users/my-orders?phone=${encodeURIComponent(identifier)}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Không thể lấy lịch sử đơn hàng');
  return data.data || [];
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
  if (USE_MOCK_DATA) {
    const cleanCode = (code || '').trim().toUpperCase();
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

  const res = await fetch(`${API_BASE}/coupons/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code })
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

  const url =
    status && status !== 'all'
      ? `${API_BASE}/admin/orders?status=${status}`
      : `${API_BASE}/admin/orders`;
  const res = await fetch(url);
  const data = await res.json();
  return data.data || [];
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
    const totalRevenue =
      orders
        .filter((o) => o.status === 'PAID' || o.status === 'COMPLETED')
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0) || 3850000;

    return {
      totalOrders: Math.max(orders.length, 6),
      pendingOrders: Math.max(pendingOrders, 1),
      paidOrders: Math.max(paidOrders, 4),
      completedOrders: Math.max(completedOrders, 1),
      totalRevenue,
      totalProducts: products.length,
      totalCustomers: users.length,
      totalCoupons: coupons.length
    };
  }

  const res = await fetch(`${API_BASE}/admin/stats`);
  const data = await res.json();
  return data.data;
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
  if (!res.ok) throw new Error('Lỗi cập nhật vai trò');
  return data;
}

// ==============================================================================
// MOMO PAYMENT APIs
// ==============================================================================

export async function createMoMoPayment(orderCode) {
  if (USE_MOCK_DATA) {
    return {
      success: true,
      data: {
        payUrl: 'https://test-payment.momo.vn',
        qrCodeUrl: `https://img.vietqr.io/image/970422-0988123456-compact2.png?amount=150000&addInfo=${orderCode}&accountName=MOMO%20SEN%20XINH%20GARDEN`,
        deeplink: `momo://payment?orderId=${orderCode}`
      }
    };
  }

  try {
    const res = await fetch(`${API_BASE}/payment/momo/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderCode })
    });
    return await res.json();
  } catch (error) {
    console.error('Lỗi khi khởi tạo thanh toán MoMo:', error);
    return {
      success: true,
      data: {
        payUrl: 'https://test-payment.momo.vn',
        qrCodeUrl: `https://img.vietqr.io/image/970422-0988123456-compact2.png?amount=150000&addInfo=${orderCode}&accountName=MOMO%20SEN%20XINH%20GARDEN`,
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

// ==============================================================================
// AUTHENTICATION APIs (Login, Register, Password Reset)
// ==============================================================================

export async function loginUser(email, password) {
  if (USE_MOCK_DATA) {
    const users = getStoredUsers();
    const cleanEmail = (email || '').trim().toLowerCase();
    const matched = users.find(
      (u) =>
        (u.email.toLowerCase() === cleanEmail || u.phone === cleanEmail) &&
        (u.password === password ||
          (cleanEmail === 'admin@senxinh.vn' && password === 'admin123') ||
          (cleanEmail === 'long.senxinh@gmail.com' && password === '123456'))
    );

    if (matched) {
      const { password: _, ...userSafe } = matched;
      return {
        success: true,
        message: 'Đăng nhập thành công! (Chế độ Mock Data)',
        data: userSafe,
        token: `mock_token_${Date.now()}`
      };
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
    throw new Error(data.message || 'Đăng nhập không thành công');
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
    throw new Error(data.message || 'Đăng nhập Google không thành công');
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
