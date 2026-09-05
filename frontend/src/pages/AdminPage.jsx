import React, { useState, useEffect } from 'react';
import { Package, CheckCircle2, Clock, Truck, RefreshCw, AlertCircle, ArrowLeft } from 'lucide-react';
import { getAdminOrders, updateOrderStatus, getAdminStats } from '../services/api';

const STATUS_LABELS = {
  PENDING: { label: 'Chờ Thanh Toán', color: '#F59E0B', bg: '#FEF3C7', icon: Clock },
  PAID: { label: 'Đã Thanh Toán', color: '#10B981', bg: '#D1FAE5', icon: CheckCircle2 },
  SHIPPING: { label: 'Đang Giao Hàng', color: '#3B82F6', bg: '#DBEAFE', icon: Truck },
  COMPLETED: { label: 'Đã Hoàn Tất', color: '#059669', bg: '#A7F3D0', icon: CheckCircle2 },
  CANCELLED: { label: 'Đã Hủy', color: '#EF4444', bg: '#FEE2E2', icon: AlertCircle }
};

export default function AdminPage({ onNavigateHome }) {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(false);

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [orderList, statsData] = await Promise.all([
        getAdminOrders(filterStatus),
        getAdminStats()
      ]);
      setOrders(orderList);
      setStats(statsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterStatus]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      loadData();
    } catch (err) {
      alert('Không thể cập nhật trạng thái');
    }
  };

  return (
    <div className="admin-page">
      {/* Header Banner */}
      <div className="page-header-banner">
        <div className="container">
          <div className="breadcrumb">
            <button className="breadcrumb-link" onClick={onNavigateHome}>Trang Chủ</button>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Hệ Thống Quản Trị Đơn Hàng</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginTop: '14px' }}>
            <div>
              <span className="section-subtitle" style={{ color: 'var(--accent)' }}>
                Bảng Điều Khiển Nhà Vườn (Java 21 + Spring Boot 3)
              </span>
              <h1 className="page-title" style={{ fontSize: '2.4rem', marginTop: '4px' }}>
                Quản Lý Đơn Hàng & Thống Kê Doanh Thu
              </h1>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                className="btn-secondary" 
                onClick={loadData}
                style={{ padding: '10px 18px', fontSize: '0.88rem' }}
              >
                <RefreshCw size={15} className={loading ? 'spin' : ''} />
                <span>Làm Mới Dữ Liệu</span>
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

      <div className="container" style={{ padding: '36px 24px 80px' }}>
        {/* Stats Row */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '18px', marginBottom: '32px' }}>
            <div style={{ background: '#fff', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-light)', display: 'block' }}>Tổng Số Đơn Hàng</span>
              <strong style={{ fontSize: '1.8rem', color: 'var(--primary)' }}>{stats.totalOrders}</strong>
            </div>

            <div style={{ background: '#FFFBEB', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid #FDE68A' }}>
              <span style={{ fontSize: '0.82rem', color: '#B45309', display: 'block' }}>Đơn Chờ Thanh Toán</span>
              <strong style={{ fontSize: '1.8rem', color: '#D97706' }}>{stats.pendingOrders}</strong>
            </div>

            <div style={{ background: '#ECFDF5', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid #A7F3D0' }}>
              <span style={{ fontSize: '0.82rem', color: '#047857', display: 'block' }}>Đơn Đã Thanh Toán / Xong</span>
              <strong style={{ fontSize: '1.8rem', color: '#059669' }}>{stats.paidOrders + stats.completedOrders}</strong>
            </div>

            <div style={{ background: '#EFF6FF', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid #BFDBFE' }}>
              <span style={{ fontSize: '0.82rem', color: '#1D4ED8', display: 'block' }}>Tổng Doanh Thu Thực Tế</span>
              <strong style={{ fontSize: '1.5rem', color: '#1D4ED8' }}>{formatPrice(stats.totalRevenue)}</strong>
            </div>
          </div>
        )}

        {/* Status filter tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px' }}>
          {['all', 'PENDING', 'PAID', 'SHIPPING', 'COMPLETED'].map((st) => (
            <button
              key={st}
              className={`cat-tab ${filterStatus === st ? 'active' : ''}`}
              onClick={() => setFilterStatus(st)}
            >
              {st === 'all' ? 'Tất Cả Đơn Hàng' : STATUS_LABELS[st]?.label || st}
            </button>
          ))}
        </div>

        {/* Order Cards List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-light)' }}>
              <Package size={44} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <h4>Chưa có đơn hàng nào trong danh mục này</h4>
            </div>
          ) : (
            orders.map((order) => {
              const statusCfg = STATUS_LABELS[order.status] || STATUS_LABELS.PENDING;
              const StatusIcon = statusCfg.icon;

              return (
                <div 
                  key={order.id} 
                  style={{
                    background: '#fff',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '24px',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <strong style={{ fontSize: '1.15rem', color: 'var(--primary)' }}>Đơn Hàng #{order.orderCode}</strong>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-light)' }}>
                          • {new Date(order.createdAt).toLocaleString('vi-VN')}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '4px' }}>
                        Khách hàng: {order.customerName} - 📞 {order.customerPhone}
                      </div>
                      <div style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
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
                        style={{ padding: '6px 32px 6px 14px', fontSize: '0.85rem' }}
                      >
                        <option value="PENDING">Chờ Thanh Toán</option>
                        <option value="PAID">Đã Thanh Toán</option>
                        <option value="SHIPPING">Đang Giao Hàng</option>
                        <option value="COMPLETED">Đã Hoàn Tất</option>
                        <option value="CANCELLED">Hủy Đơn</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-main)', padding: '14px 18px', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Danh sách món:</span>
                      <span>
                        {order.items.map(it => `${it.productName || it.name} (x${it.quantity})`).join(' • ')}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, paddingTop: '8px', borderTop: '1px dashed var(--border-light)' }}>
                      <span>Hình thức thanh toán: {order.paymentMethod === 'vietqr' ? 'VietQR Ngân Hàng' : 'COD (Thu Hộ)'}</span>
                      <span style={{ color: 'var(--primary)', fontSize: '1.05rem' }}>{formatPrice(order.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
