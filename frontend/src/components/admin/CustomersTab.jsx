import React, { useMemo, useState, useEffect } from 'react';
import {
  Search,
  ShoppingBag,
  ChevronRight,
  Trash2,
  Lock,
  CheckCircle2,
  Users,
  Shield,
  Sprout,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import Pagination from '../Pagination';
import { formatPrice } from './adminConstants';

export default function CustomersTab({
  customers = [],
  customerSearch = '',
  setCustomerSearch,
  customerPage = 1,
  setCustomerPage,
  itemsPerPage = 10,
  getCustomerOrdersCountAndSpent,
  onOpenCustomerOrders,
  onRoleChange,
  onStatusChange,
  onDeleteCustomer
}) {
  const [roleFilter, setRoleFilter] = useState('all');

  // Reset page when search or role filter changes
  useEffect(() => {
    if (setCustomerPage) setCustomerPage(1);
  }, [customerSearch, roleFilter, setCustomerPage]);

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const q = customerSearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.phone && c.phone.includes(q));

      const matchRole =
        roleFilter === 'all' ||
        (roleFilter === 'admin' && c.role && c.role.toLowerCase().includes('admin')) ||
        (roleFilter === 'vip' && c.role && c.role.toLowerCase().includes('vip')) ||
        (roleFilter === 'member' && (!c.role || (!c.role.toLowerCase().includes('admin') && !c.role.toLowerCase().includes('vip'))));

      return matchSearch && matchRole;
    });
  }, [customers, customerSearch, roleFilter]);

  const customerTotalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const pagedCustomers = filteredCustomers.slice(
    (customerPage - 1) * itemsPerPage,
    customerPage * itemsPerPage
  );

  return (
    <div className="admin-tab-content">
      {/* Toolbar */}
      <div className="admin-toolbar" style={{ marginBottom: '18px' }}>
        <div className="admin-search-wrapper" style={{ maxWidth: '380px' }}>
          <Search size={16} />
          <input
            type="text"
            className="admin-search-input"
            placeholder="Tìm thành viên theo tên, email, số điện thoại..."
            value={customerSearch}
            onChange={(e) => setCustomerSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="select-filter"
            style={{ padding: '8px 28px 8px 12px', fontSize: '0.84rem' }}
          >
            <option value="all">Tất Cả Phân Quyền</option>
            <option value="admin">🛡️ Quản trị viên (Admin)</option>
            <option value="vip">⭐ Khách hàng VIP</option>
            <option value="member">🌱 Thành viên thường</option>
          </select>

          <span
            style={{
              fontSize: '0.82rem',
              color: 'var(--text-muted)',
              background: 'var(--bg-main)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-light)'
            }}
          >
            Tổng cộng: <strong style={{ color: 'var(--primary)' }}>{filteredCustomers.length}</strong> / {customers.length} thành viên
          </span>
        </div>
      </div>

      {/* Customers Table Card */}
      <div className="admin-table-wrapper">
        <div className="admin-table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '26%' }}>Khách Hàng</th>
                <th style={{ width: '22%' }}>Liên Hệ & Địa Chỉ</th>
                <th style={{ width: '12%' }}>Điểm Sen</th>
                <th style={{ width: '18%' }}>Lịch Sử Mua Hàng</th>
                <th style={{ width: '14%' }}>Vai Trò</th>
                <th style={{ textAlign: 'right', width: '8%' }}>Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                    <Users size={44} style={{ opacity: 0.25, marginBottom: '10px' }} />
                    <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '1rem' }}>
                      Không tìm thấy khách hàng nào phù hợp
                    </div>
                    <small style={{ color: 'var(--text-light)' }}>
                      Thử điều chỉnh từ khóa tìm kiếm hoặc chọn lại bộ lọc vai trò
                    </small>
                  </td>
                </tr>
              ) : (
                pagedCustomers.map((cust) => {
                  const { count, totalSpent } = getCustomerOrdersCountAndSpent(cust);
                  const isAdminRole = Boolean(cust.role && cust.role.toLowerCase().includes('admin'));

                  return (
                    <tr key={cust.id} style={{ transition: 'background 0.2s' }}>
                      {/* 1. Customer Avatar + Name */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img
                            src={
                              cust.avatar ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                            }
                            alt={cust.name}
                            style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: '2px solid var(--border-light)',
                              flexShrink: 0
                            }}
                          />
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <strong style={{ color: 'var(--text-main)', fontSize: '0.94rem' }}>
                                {cust.name}
                              </strong>
                              {isAdminRole && (
                                <span
                                  style={{
                                    background: '#DC2626',
                                    color: '#fff',
                                    fontSize: '0.68rem',
                                    padding: '1px 6px',
                                    borderRadius: 'var(--radius-full)',
                                    fontWeight: 800,
                                    letterSpacing: '0.5px'
                                  }}
                                >
                                  ADMIN
                                </span>
                              )}
                            </div>
                            <small style={{ color: 'var(--text-light)', fontSize: '0.74rem', fontFamily: 'monospace' }}>
                              ID: {cust.id}
                            </small>
                          </div>
                        </div>
                      </td>

                      {/* 2. Contact & Address */}
                      <td>
                        <div style={{ fontSize: '0.84rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-main)' }}>
                            <Mail size={12} color="var(--text-light)" />
                            <span>{cust.email || '—'}</span>
                          </div>
                          {cust.phone && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                              <Phone size={12} color="var(--text-light)" />
                              <span>{cust.phone}</span>
                            </div>
                          )}
                          {cust.address && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-light)', marginTop: '2px', fontSize: '0.78rem' }}>
                              <MapPin size={12} style={{ flexShrink: 0 }} />
                              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }} title={cust.address}>
                                {cust.address}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* 3. Sen Points */}
                      <td>
                        <span
                          style={{
                            background: '#ECFDF5',
                            color: '#047857',
                            fontWeight: 700,
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.82rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            border: '1px solid #A7F3D0'
                          }}
                        >
                          <Sprout size={13} />
                          <span>{cust.points || 0} điểm</span>
                        </span>
                      </td>

                      {/* 4. Orders History */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                          <div style={{ fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <strong style={{ color: count > 0 ? 'var(--primary)' : 'var(--text-light)' }}>
                              {count} đơn hàng
                            </strong>
                            {count > 0 && (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                                • {formatPrice(totalSpent)}
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            className="btn-customer-view-page"
                            onClick={() => onOpenCustomerOrders(cust)}
                            title={`Xem toàn bộ lịch sử ${count} đơn hàng của ${cust.name}`}
                          >
                            <ShoppingBag size={12} />
                            <span>Lịch Sử Mua Hàng</span>
                            <ChevronRight size={12} />
                          </button>
                        </div>
                      </td>

                      {/* 5. Role Select */}
                      <td>
                        <select
                          value={cust.role || 'Thành viên mới'}
                          onChange={(e) => onRoleChange(cust.id, e.target.value)}
                          className="select-filter"
                          style={{ padding: '6px 26px 6px 8px', fontSize: '0.8rem', width: '100%' }}
                        >
                          <option value="Quản trị viên (Admin)">Quản trị viên (Admin)</option>
                          <option value="Khách hàng VIP">Khách hàng VIP</option>
                          <option value="Thành viên thân thiết">Thành viên thân thiết</option>
                          <option value="Thành viên mới">Thành viên mới</option>
                        </select>
                      </td>

                      {/* 6. Status & Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <select
                            value={cust.status || 'ACTIVE'}
                            onChange={(e) => onStatusChange && onStatusChange(cust.id, e.target.value)}
                            className="select-filter"
                            style={{
                              padding: '5px 24px 5px 8px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              borderRadius: '6px',
                              color: cust.status === 'BANNED' ? '#B45309' : cust.status === 'DELETED' ? '#B91C1C' : '#047857',
                              borderColor: cust.status === 'BANNED' ? '#FDE68A' : cust.status === 'DELETED' ? '#FECACA' : '#A7F3D0',
                              background: cust.status === 'BANNED' ? '#FFFBEB' : cust.status === 'DELETED' ? '#FEF2F2' : '#ECFDF5'
                            }}
                          >
                            <option value="ACTIVE">Hoạt động</option>
                            <option value="BANNED">Khóa tài khoản</option>
                            <option value="DELETED">Đã xóa</option>
                          </select>

                          {cust.status !== 'DELETED' && onDeleteCustomer && (
                            <button
                              type="button"
                              className="btn-icon-action delete"
                              onClick={() => onDeleteCustomer(cust)}
                              title="Vô hiệu hóa (xóa mềm) tài khoản"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={customerPage}
          totalPages={customerTotalPages}
          totalItems={filteredCustomers.length}
          onPageChange={setCustomerPage}
        />
      </div>
    </div>
  );
}
