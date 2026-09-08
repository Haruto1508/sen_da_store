import { Clock, CheckCircle2, Truck, AlertCircle } from 'lucide-react';

export const ORDER_STATUS_LABELS = {
  PENDING: { label: 'Chờ Thanh Toán', color: '#D97706', bg: '#FEF3C7', icon: Clock },
  PAID: { label: 'Đã Thanh Toán', color: '#059669', bg: '#D1FAE5', icon: CheckCircle2 },
  SHIPPING: { label: 'Đang Giao Hàng', color: '#2563EB', bg: '#DBEAFE', icon: Truck },
  COMPLETED: { label: 'Đã Hoàn Tất', color: '#047857', bg: '#A7F3D0', icon: CheckCircle2 },
  CANCELLED: { label: 'Đã Hủy', color: '#DC2626', bg: '#FEE2E2', icon: AlertCircle }
};

export const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1520302630591-fd1c66edc19d?auto=format&fit=crop&w=800&q=80'
];

export const formatPrice = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
};
