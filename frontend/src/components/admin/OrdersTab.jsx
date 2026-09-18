import React, { useMemo, useState } from 'react';
import {
  Search,
  Package,
  ShoppingBag,
  ChevronRight,
  Clock,
  MapPin,
  Phone,
  User,
  CreditCard,
  Truck,
  Copy,
  Check,
  Calendar,
  MessageSquare
} from 'lucide-react';
import Pagination from '../Pagination';
import { ORDER_STATUS_LABELS, formatPrice } from './adminConstants';

export default function OrdersTab({
  orders = [],
  customers = [],
  orderFilterStatus = 'all',
  setOrderFilterStatus,
  orderSearch = '',
  setOrderSearch,
  orderPage = 1,
  setOrderPage,
  itemsPerPage = 10,
  onStatusChange,
  onOpenOrderDetail,
  onOpenCustomerOrders
}) {
  const [copiedCode, setCopiedCode] = useState('');

  const handleCopyCode = (code, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        !orderSearch ||
        (o.orderCode && o.orderCode.toLowerCase().includes(orderSearch.toLowerCase())) ||
        (o.customerName && o.customerName.toLowerCase().includes(orderSearch.toLowerCase())) ||
        (o.customerPhone && o.customerPhone.includes(orderSearch));

      const matchStatus = orderFilterStatus === 'all' || o.status === orderFilterStatus;
      return matchSearch && matchStatus;
    });
  }, [orders, orderSearch, orderFilterStatus]);

  // Status counts for tabs
  const statusCounts = useMemo(() => {
    const counts = { all: orders.length, PENDING: 0, PAID: 0, SHIPPING: 0, COMPLETED: 0, CANCELLED: 0 };
    orders.forEach((o) => {
      if (counts[o.status] !== undefined) counts[o.status]++;
    });
    return counts;
  }, [orders]);

  const orderTotalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const pagedOrders = filteredOrders.slice(
    (orderPage - 1) * itemsPerPage,
    orderPage * itemsPerPage
  );

  const STATUS_TABS = [
    { key: 'all', label: 'Tất Cả' },
    { key: 'PENDING', label: 'Chờ Thanh Toán' },
    { key: 'PAID', label: 'Đã Thanh Toán' },
    { key: 'SHIPPING', label: 'Đang Giao' },
    { key: 'COMPLETED', label: 'Hoàn Tất' },
    { key: 'CANCELLED', label: 'Đã Hủy' }
  ];

  return (
    <div className="admin-tab-content">
      {/* 1. Toolbar: Search + Quick Stats */}
      <div className="admin-toolbar" style={{ marginBottom: '16px' }}>
        <div className="admin-search-wrapper" style={{ maxWidth: '420px' }}>
          <Search size={16} />
          <input
            type="text"
            className="admin-search-input"
            placeholder="Tìm theo mã đơn (#SX...), tên khách, số điện thoại..."
            value={orderSearch}
            onChange={(e) => setOrderSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <span>Đang hiển thị:</span>
          <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
            {filteredOrders.length} đơn hàng
          </span>
        </div>
      </div>

      {/* 2. Status Filter Pill Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '12px',
          marginBottom: '16px',
          borderBottom: '1px solid var(--border-light)'
        }}
      >
        {STATUS_TABS.map((tab) => {
          const isActive = orderFilterStatus === tab.key;
          const count = statusCounts[tab.key] || 0;
          return (
            <button
              key={tab.key}
              type="button"
              className={`cat-tab ${isActive ? 'active' : ''}`}
              onClick={() => {
                setOrderFilterStatus(tab.key);
                setOrderPage(1);
              }}
              style={{
                fontSize: '0.84rem',
                padding: '7px 14px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap'
              }}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-full)',
                  background: isActive ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.06)',
                  color: isActive ? '#fff' : 'inherit',
                  fontWeight: 700
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Orders Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredOrders.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: '#fff',
              borderRadius: 'var(--radius-lg)',
              border: '1px dashed var(--border-light)',
              color: 'var(--text-muted)'
            }}
          >
            <Package size={48} style={{ opacity: 0.25, marginBottom: '12px' }} />
            <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>
              Không tìm thấy đơn hàng nào
            </h4>
            <p style={{ fontSize: '0.86rem', marginTop: '6px', color: 'var(--text-light)' }}>
              Thử thay đổi từ khóa tìm kiếm hoặc chọn bộ lọc trạng thái khác.
            </p>
          </div>
        ) : (
          pagedOrders.map((order) => {
            const statusCfg = ORDER_STATUS_LABELS[order.status] || ORDER_STATUS_LABELS.PENDING;
            const StatusIcon = statusCfg.icon;

            return (
              <div
                key={order.id}
                className="admin-order-card"
                style={{
                  background: '#fff',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px 22px',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'box-shadow 0.2s, border-color 0.2s'
                }}
              >
                {/* Header: Order Code, Time, Status, Status Selector */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                    paddingBottom: '14px',
                    borderBottom: '1px solid var(--border-light)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'rgba(45, 90, 63, 0.08)',
                        color: 'var(--primary)',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontWeight: 800,
                        fontSize: '0.95rem',
                        fontFamily: 'monospace',
                        letterSpacing: '0.5px'
                      }}
                    >
                      <span>#{order.orderCode}</span>
                      <button
                        type="button"
                        onClick={(e) => handleCopyCode(order.orderCode, e)}
                        title="Sao chép mã đơn"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '2px',
                          display: 'inline-flex',
                          color: copiedCode === order.orderCode ? '#059669' : 'inherit'
                        }}
                      >
                        {copiedCode === order.orderCode ? <Check size={13} /> : <Copy size={13} />}
                      </button>
                    </div>

                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.82rem', color: 'var(--text-light)' }}>
                      <Calendar size={13} />
                      <span>{order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : 'Vừa tạo'}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        background: statusCfg.bg,
                        color: statusCfg.color,
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        padding: '5px 12px',
                        borderRadius: 'var(--radius-full)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        border: `1px solid ${statusCfg.color}22`
                      }}
                    >
                      <StatusIcon size={14} />
                      {statusCfg.label}
                    </span>

                    <select
                      value={order.status}
                      onChange={(e) => onStatusChange(order.id, e.target.value)}
                      className="select-filter"
                      style={{ padding: '6px 28px 6px 10px', fontSize: '0.82rem' }}
                    >
                      <option value="PENDING">Chờ Thanh Toán</option>
                      <option value="PAID">Đã Thanh Toán</option>
                      <option value="SHIPPING">Đang Giao Hàng</option>
                      <option value="COMPLETED">Đã Hoàn Tất</option>
                      <option value="CANCELLED">Hủy Đơn</option>
                    </select>
                  </div>
                </div>

                {/* Body Info: Customer Details + Delivery */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: '16px',
                    margin: '14px 0',
                    fontSize: '0.88rem'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                      <User size={15} color="var(--primary)" />
                      <span>{order.customerName || 'Khách Vãng Lai'}</span>
                      <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>•</span>
                      <Phone size={13} color="var(--text-light)" />
                      <span style={{ color: 'var(--text-muted)' }}>{order.customerPhone}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                      <MapPin size={14} color="var(--text-light)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{order.customerAddress || 'Chưa cung cấp địa chỉ'}</span>
                    </div>

                    {order.note && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', color: 'var(--accent)', fontSize: '0.82rem', marginTop: '4px' }}>
                        <MessageSquare size={13} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>Ghi chú: {order.note}</span>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }}>
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
                      <ShoppingBag size={13} />
                      <span>Xem Lịch Sử Mua Của Khách</span>
                    </button>
                  </div>
                </div>

                {/* Items Summary Strip */}
                <div
                  style={{
                    background: '#F8FAF7',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px 16px',
                    marginBottom: '14px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Sản Phẩm Đã Đặt ({(order.items || []).length} món)
                    </span>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-light)' }}>
                      Phương thức: <strong style={{ color: 'var(--text-main)' }}>
                        {order.paymentMethod === 'momo'
                          ? 'Ví MoMo'
                          : order.paymentMethod === 'vietqr'
                          ? 'VietQR Ngân Hàng'
                          : 'COD (Thu Hộ)'}
                      </strong>
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {order.items && order.items.length > 0 ? (
                      order.items.map((it, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: '#fff',
                            border: '1px solid var(--border-light)',
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.82rem'
                          }}
                        >
                          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                            {it.productName || it.name}
                          </span>
                          <span
                            style={{
                              background: 'var(--primary-light)',
                              color: 'var(--primary)',
                              padding: '1px 6px',
                              borderRadius: 'var(--radius-full)',
                              fontWeight: 700,
                              fontSize: '0.76rem'
                            }}
                          >
                            x{it.quantity || 1}
                          </span>
                          <span style={{ color: 'var(--text-light)', fontSize: '0.78rem' }}>
                            ({formatPrice((it.price || 0) * (it.quantity || 1))})
                          </span>
                        </div>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-light)' }}>
                        Chi tiết sản phẩm xem trong đơn hàng
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer: Price breakdown & View Details button */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                    paddingTop: '6px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Tổng Tiền Đơn Hàng:</span>
                    <strong style={{ fontSize: '1.25rem', color: 'var(--primary)', fontFamily: 'Outfit, sans-serif' }}>
                      {formatPrice(order.totalAmount)}
                    </strong>
                    {order.shippingFee !== undefined && (
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>
                        (Ship: {order.shippingFee === 0 ? 'Freeship' : formatPrice(order.shippingFee)})
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    className="btn-open-detail"
                    onClick={() => onOpenOrderDetail(order, 'tabs')}
                    title="Mở trang chi tiết toàn diện của đơn hàng này"
                  >
                    <span>Xem Chi Tiết Đơn Hàng</span>
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            );
          })
        )}

        {/* 4. Pagination */}
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
