import React from 'react';
import {
  Sprout,
  Package,
  Tag,
  Users,
  PanelLeft
} from 'lucide-react';
import { USE_MOCK_DATA } from '../../services/api';

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  viewMode,
  setViewMode,
  sidebarCollapsed,
  setSidebarCollapsed,
  mobileSidebarOpen,
  setMobileSidebarOpen
}) {
  return (
    <>
      <aside className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileSidebarOpen ? 'mobile-open' : ''}`}>
        {/* Sidebar Brand Header */}
        <div className="admin-sidebar-header">
          <div
            className="admin-sidebar-brand"
            onClick={() => {
              setActiveTab('orders');
              setViewMode('tabs');
            }}
            title="Bảng điều khiển quản trị"
          >
            <div className="admin-brand-logo">
              <Sprout size={22} color="#FFFFFF" />
            </div>
            {!sidebarCollapsed && (
              <div className="admin-brand-text">
                <span className="admin-brand-name">
                  SEN XINH <span className="admin-brand-accent">ADMIN</span>
                </span>
                <span className="admin-brand-sub">Quản Trị Nhà Vườn</span>
              </div>
            )}
          </div>
        </div>

        {/* Database Status Card */}
        {!sidebarCollapsed && (
          <div className="admin-sidebar-mode-card">
            {USE_MOCK_DATA ? (
              <div className="admin-mode-pill mock" title="Đang chạy ở chế độ giả lập dữ liệu JSON nội bộ">
                <span className="dot" />
                <div className="mode-info">
                  <strong>Mock Data JSON</strong>
                  <small>Chế độ giả lập</small>
                </div>
              </div>
            ) : (
              <div className="admin-mode-pill live" title="Đang kết nối API Spring Boot 3.4 & PostgreSQL thực tế">
                <span className="dot" />
                <div className="mode-info">
                  <strong>PostgreSQL Live</strong>
                  <small>Spring Boot REST API</small>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation Section */}
        <nav className="admin-sidebar-nav">
          <div className="admin-nav-group-label">
            {!sidebarCollapsed ? 'QUẢN LÝ KHO BÃI' : '•••'}
          </div>

          <button
            type="button"
            className={`admin-nav-item ${(viewMode === 'order-detail' || (viewMode === 'tabs' && activeTab === 'orders')) ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('orders');
              setViewMode('tabs');
              setMobileSidebarOpen(false);
            }}
            title="Đơn Hàng & Vận Chuyển"
          >
            <Package size={19} className="nav-icon" />
            {!sidebarCollapsed && (
              <span className="nav-text">Đơn Hàng & Vận Chuyển</span>
            )}
          </button>

          <button
            type="button"
            className={`admin-nav-item ${(viewMode === 'tabs' && activeTab === 'products') ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('products');
              setViewMode('tabs');
              setMobileSidebarOpen(false);
            }}
            title="Quản Lý Sen Đá & Tồn Kho"
          >
            <Sprout size={19} className="nav-icon" />
            {!sidebarCollapsed && (
              <span className="nav-text">Sen Đá & Tồn Kho</span>
            )}
          </button>

          <div className="admin-nav-group-label">
            {!sidebarCollapsed ? 'MARKETING & KHÁCH' : '•••'}
          </div>

          <button
            type="button"
            className={`admin-nav-item ${(viewMode === 'tabs' && activeTab === 'coupons') ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('coupons');
              setViewMode('tabs');
              setMobileSidebarOpen(false);
            }}
            title="Mã Ưu Đãi & Voucher"
          >
            <Tag size={19} className="nav-icon" />
            {!sidebarCollapsed && (
              <span className="nav-text">Mã Giảm Giá & Voucher</span>
            )}
          </button>

          <button
            type="button"
            className={`admin-nav-item ${(viewMode === 'customer-orders' || (viewMode === 'tabs' && activeTab === 'customers')) ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('customers');
              setViewMode('tabs');
              setMobileSidebarOpen(false);
            }}
            title="Khách Hàng & Phân Quyền"
          >
            <Users size={19} className="nav-icon" />
            {!sidebarCollapsed && (
              <span className="nav-text">Khách Hàng & Quyền</span>
            )}
          </button>
        </nav>

        {/* Dedicated Bottom Collapse Bar */}
        <div className="admin-sidebar-collapse-bar">
          <button
            type="button"
            className="admin-sidebar-collapse-btn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? "Mở rộng thanh điều hướng" : "Thu gọn thanh điều hướng"}
            aria-label={sidebarCollapsed ? "Mở rộng thanh điều hướng" : "Thu gọn thanh điều hướng"}
          >
            <PanelLeft size={18} />
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="admin-sidebar-backdrop"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
    </>
  );
}
