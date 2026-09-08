import React, { useMemo } from 'react';
import {
  Search,
  ShoppingBag,
  ChevronRight
} from 'lucide-react';
import Pagination from '../Pagination';
import { formatPrice } from './adminConstants';

export default function CustomersTab({
  customers,
  customerSearch,
  setCustomerSearch,
  customerPage,
  setCustomerPage,
  itemsPerPage = 10,
  getCustomerOrdersCountAndSpent,
  onOpenCustomerOrders,
  onRoleChange
}) {
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (!customerSearch) return true;
      const q = customerSearch.toLowerCase();
      return (
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.phone && c.phone.includes(q))
      );
    });
  }, [customers, customerSearch]);

  const customerTotalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const pagedCustomers = filteredCustomers.slice((customerPage - 1) * itemsPerPage, customerPage * itemsPerPage);

  return (
    <div>
      <div className="admin-toolbar">
        <div className="admin-search-wrapper">
          <Search size={17} />
          <input
            type="text"
            className="admin-search-input"
            placeholder="Tìm thành viên theo tên, email, số điện thoại..."
            value={customerSearch}
            onChange={(e) => setCustomerSearch(e.target.value)}
          />
        </div>

        <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Tổng cộng: <strong style={{ color: 'var(--primary)' }}>{filteredCustomers.length}</strong> người dùng
        </div>
      </div>

      <div className="admin-table-wrapper">
        <div className="admin-table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Khách Hàng</th>
                <th>Email & SĐT</th>
                <th>Địa Chỉ Giao Hàng</th>
                <th>Điểm Sen Thưởng</th>
                <th>Lịch Sử Mua Hàng</th>
                <th>Vai Trò & Phân Quyền</th>
              </tr>
            </thead>
            <tbody>
              {pagedCustomers.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-light)' }}>
                    Chưa có khách hàng nào phù hợp với bộ lọc tìm kiếm
                  </td>
                </tr>
              ) : (
                pagedCustomers.map((cust) => {
                  const { count, totalSpent } = getCustomerOrdersCountAndSpent(cust);

                  return (
                    <tr key={cust.id} style={{ transition: 'background 0.2s' }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img
                            src={
                              cust.avatar ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                            }
                            alt={cust.name}
                            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <div>
                            <strong style={{ color: 'var(--text-main)', fontSize: '0.94rem' }}>
                              {cust.name}
                            </strong>
                            {cust.role && cust.role.includes('Admin') && (
                              <span
                                style={{
                                  marginLeft: '6px',
                                  background: '#DC2626',
                                  color: '#fff',
                                  fontSize: '0.7rem',
                                  padding: '2px 6px',
                                  borderRadius: 'var(--radius-full)',
                                  fontWeight: 700
                                }}
                              >
                                ADMIN
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.88rem' }}>
                          <div>📧 {cust.email}</div>
                          {cust.phone && <div style={{ color: 'var(--text-muted)' }}>📞 {cust.phone}</div>}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                          {cust.address || 'Chưa cập nhật'}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            background: '#ECFDF5',
                            color: '#047857',
                            fontWeight: 700,
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.82rem'
                          }}
                        >
                          🌱 {cust.points || 0} điểm
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'flex-start' }}>
                          <div style={{ fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontWeight: 700, color: count > 0 ? 'var(--primary)' : 'var(--text-muted)' }}>
                              {count} đơn hàng
                            </span>
                            {count > 0 && (
                              <span style={{ color: 'var(--text-light)', fontSize: '0.78rem' }}>
                                ({formatPrice(totalSpent)})
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            className="btn-customer-view-page"
                            onClick={() => onOpenCustomerOrders(cust)}
                            title={`Xem toàn bộ lịch sử ${count} đơn hàng của ${cust.name} ở trang riêng`}
                          >
                            <ShoppingBag size={13} />
                            <span>Xem Lịch Sử Mua</span>
                            <ChevronRight size={13} />
                          </button>
                        </div>
                      </td>
                      <td>
                        <select
                          value={cust.role || 'Thành viên mới'}
                          onChange={(e) => onRoleChange(cust.id, e.target.value)}
                          className="select-filter"
                          style={{ padding: '6px 30px 6px 10px', fontSize: '0.82rem' }}
                        >
                          <option value="Quản trị viên (Admin)">Quản trị viên (Admin)</option>
                          <option value="Khách hàng VIP">Khách hàng VIP</option>
                          <option value="Thành viên thân thiết">Thành viên thân thiết</option>
                          <option value="Thành viên mới">Thành viên mới</option>
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
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
