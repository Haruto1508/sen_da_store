import React, { useMemo } from 'react';
import {
  Search,
  Package,
  ShoppingBag,
  ChevronRight
} from 'lucide-react';
import Pagination from '../Pagination';
import { ORDER_STATUS_LABELS, formatPrice } from './adminConstants';

export default function OrdersTab({
  orders,
  customers,
  orderFilterStatus,
  setOrderFilterStatus,
  orderSearch,
  setOrderSearch,
  orderPage,
  setOrderPage,
  itemsPerPage = 10,
  onStatusChange,
  onOpenOrderDetail,
  onOpenCustomerOrders
}) {
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

  const orderTotalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const pagedOrders = filteredOrders.slice((orderPage - 1) * itemsPerPage, orderPage * itemsPerPage);

  return (
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
          pagedOrders.map((order) => {
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
                    <div style={{ fontSize: '0.92rem', fontWeight: 600, marginTop: '4px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                      <span>Khách hàng: {order.customerName} - 📞 {order.customerPhone}</span>
                      <button
                        type="button"
                        className="btn-history-inline"
                        onClick={() => {
                          const found = customers.find(
                            (c) =>
                              (order.customerPhone && c.phone === order.customerPhone) ||
                              (order.customerEmail && c.email?.toLowerCase() === order.customerEmail?.toLowerCase()) ||
                              (order.customerName && c.name?.toLowerCase() === order.customerName?.toLowerCase())
                          );
                          if (found) {
                            onOpenCustomerOrders(found);
                          } else {
                            onOpenCustomerOrders({
                              id: order.userId || 'guest',
                              name: order.customerName || 'Khách Hàng',
                              email: order.customerEmail || 'Chưa có email',
                              phone: order.customerPhone || '',
                              address: order.customerAddress || order.shippingAddress || '',
                              role: 'Khách vãng lai',
                              points: 0
                            });
                          }
                        }}
                        title="Xem toàn bộ lịch sử mua hàng của khách này ở trang riêng"
                      >
                        <ShoppingBag size={12} />
                        <span>Lịch sử mua</span>
                      </button>
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
                      onChange={(e) => onStatusChange(order.id, e.target.value)}
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

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
                  <button
                    type="button"
                    className="btn-open-detail"
                    onClick={() => onOpenOrderDetail(order, 'tabs')}
                    title="Mở toàn màn hình trang chi tiết đơn hàng này"
                  >
                    <span>Xem Chi Tiết Đơn Hàng</span>
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            );
          })
        )}

        <Pagination
          currentPage={orderPage}
          totalPages={orderTotalPages}
          totalItems={filteredOrders.length}
          onPageChange={setOrderPage}
        />
      </div>
    </div>
  );
}
