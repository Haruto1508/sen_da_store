import { Clock, CheckCircle2, Truck, AlertCircle } from 'lucide-react';

export const CANCEL_REASONS = [
  'Đổi ý không muốn mua nữa',
  'Muốn thay đổi địa chỉ hoặc số điện thoại nhận hàng',
  'Muốn thêm hoặc bớt sản phẩm trong giỏ hàng',
  'Thời gian giao hàng dự kiến quá lâu',
  'Tìm thấy giá tốt hơn ở nơi khác',
  'Khác (Vui lòng ghi rõ bên dưới)'
];

export const STATUS_CONFIG = {
  PENDING: { label: 'Chờ Thanh Toán', color: '#D97706', bg: '#FEF3C7', icon: Clock, step: 1 },
  PAID: { label: 'Đã Thanh Toán', color: '#059669', bg: '#D1FAE5', icon: CheckCircle2, step: 2 },
  SHIPPING: { label: 'Đang Giao Hàng', color: '#2563EB', bg: '#DBEAFE', icon: Truck, step: 3 },
  COMPLETED: { label: 'Giao Thành Công', color: '#16A34A', bg: '#DCFCE7', icon: CheckCircle2, step: 4 },
  CANCELLED: { label: 'Đã Hủy Đơn', color: '#DC2626', bg: '#FEE2E2', icon: AlertCircle, step: 0 }
};

export const DELIVERY_STEPS = [
  { step: 1, label: 'Đặt Hàng' },
  { step: 2, label: 'Đã Xác Nhận' },
  { step: 3, label: 'Đang Giao Hàng' },
  { step: 4, label: 'Hoàn Tất' }
];

export const formatPrice = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
};
