import { PRODUCTS as FALLBACK_PRODUCTS } from '../data/products';

const API_BASE = '/api';

/**
 * Lấy danh sách sản phẩm (hỗ trợ lọc theo category, search, light, difficulty, sort)
 */
export async function getProducts(params = {}) {
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
    console.warn('Backend API tạm thời chưa sẵn sàng, sử dụng dữ liệu cục bộ:', error);
    return FALLBACK_PRODUCTS;
  }
}

/**
 * Lấy chi tiết 1 sản phẩm theo ID
 */
export async function getProductById(id) {
  try {
    const res = await fetch(`${API_BASE}/products/${id}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.warn(`Lỗi khi tải sản phẩm ${id}:`, error);
    return FALLBACK_PRODUCTS.find((p) => p.id === id) || null;
  }
}

/**
 * Tạo đơn hàng mới
 */
export async function createOrder(orderPayload) {
  try {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Không thể tạo đơn hàng');
    }
    return data;
  } catch (error) {
    console.error('Lỗi khi gửi đơn hàng lên server:', error);
    throw error;
  }
}

/**
 * Tra cứu đơn hàng theo mã (orderCode)
 */
export async function lookupOrder(orderCode) {
  const res = await fetch(`${API_BASE}/orders/${orderCode}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Không tìm thấy đơn hàng');
  }
  return data.data;
}

/**
 * Kiểm tra mã ưu đãi / voucher
 */
export async function validateCoupon(code) {
  try {
    const res = await fetch(`${API_BASE}/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });

    const data = await res.json();
    if (!res.ok) {
      return { valid: false, message: data.message || 'Mã không hợp lệ' };
    }
    return data;
  } catch (error) {
    // Fallback if backend offline
    if (code.toUpperCase() === 'SENXANH10') {
      return { valid: true, discountPercent: 10, code: 'SENXANH10' };
    }
    return { valid: false, message: 'Lỗi kết nối máy chủ' };
  }
}

/**
 * Admin: Lấy danh sách toàn bộ đơn hàng
 */
export async function getAdminOrders(status = 'all') {
  const url = status && status !== 'all' 
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
  const res = await fetch(`${API_BASE}/admin/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  return await res.json();
}

/**
 * Admin: Lấy thống kê doanh thu
 */
export async function getAdminStats() {
  const res = await fetch(`${API_BASE}/admin/stats`);
  const data = await res.json();
  return data.data;
}
