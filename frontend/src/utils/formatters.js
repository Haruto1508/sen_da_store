/**
 * Utility functions for formatting price, dates, and times across Sen Xinh Garden.
 */

/**
 * Định dạng tiền tệ VND (ví dụ: 150000 -> 150.000đ)
 * @param {number|string} amount
 * @returns {string}
 */
export const formatPrice = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '0đ';
  return Number(amount).toLocaleString('vi-VN') + 'đ';
};

/**
 * Định dạng ngày giờ dạng "HH:mm - DD/MM/YYYY" (ví dụ: 10:30 - 21/09/2026)
 * @param {string|Date|number} dateStr - Chuỗi ISO hoặc Instant từ backend
 * @returns {string}
 */
export const formatDateTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const pad = (n) => String(n).padStart(2, '0');
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const day = pad(d.getDate());
  const month = pad(d.getMonth() + 1);
  const year = d.getFullYear();
  return `${hours}:${minutes} - ${day}/${month}/${year}`;
};

/**
 * Định dạng ngày dạng "DD/MM/YYYY" (ví dụ: 21/09/2026)
 * @param {string|Date|number} dateStr
 * @returns {string}
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const pad = (n) => String(n).padStart(2, '0');
  const day = pad(d.getDate());
  const month = pad(d.getMonth() + 1);
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Định dạng số nguyên chuẩn Việt Nam (ví dụ: 10000 -> "10.000")
 * @param {number|string} num
 * @returns {string}
 */
export const formatNumber = (num) => {
  if (num === undefined || num === null || isNaN(num)) return '0';
  return Number(num).toLocaleString('vi-VN');
};
