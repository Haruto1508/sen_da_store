import React, { useState, useEffect } from 'react';
import {
  Truck,
  Plus,
  Edit2,
  Trash2,
  Search,
  RotateCcw,
  Check,
  ShieldCheck,
  Sparkles,
  MapPin,
  Clock,
  HelpCircle,
  Save,
  DollarSign
} from 'lucide-react';
import ShippingRateModal from './ShippingRateModal';
import Pagination from '../Pagination';
import { formatPrice } from './adminConstants';


export default function ShippingTab({
  shippingConfig,
  onUpdateShippingConfig,
  onResetShippingConfig,
  addToast
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [shippingPage, setShippingPage] = useState(1);
  const itemsPerPage = 8;
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Reset page on search query change
  useEffect(() => {
    setShippingPage(1);
  }, [searchQuery]);

  // Policy Form State
  const [policyForm, setPolicyForm] = useState({
    freeShippingEnabled: shippingConfig?.freeShippingEnabled !== false,
    freeShippingThreshold: shippingConfig?.freeShippingThreshold || 200000,
    defaultShippingFee: shippingConfig?.defaultShippingFee || 35000
  });

  // Sync state if prop changes from parent
  useEffect(() => {
    if (shippingConfig) {
      setPolicyForm({
        freeShippingEnabled: shippingConfig.freeShippingEnabled !== false,
        freeShippingThreshold: shippingConfig.freeShippingThreshold || 200000,
        defaultShippingFee: shippingConfig.defaultShippingFee || 35000
      });
    }
  }, [shippingConfig]);

  const [policySaved, setPolicySaved] = useState(false);

  const provinceRates = shippingConfig?.provinceRates || [];

  const filteredRates = provinceRates.filter((rate) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      rate.province.toLowerCase().includes(q) ||
      (rate.note && rate.note.toLowerCase().includes(q))
    );
  });

  const shippingTotalPages = Math.ceil(filteredRates.length / itemsPerPage);
  const pagedRates = filteredRates.slice((shippingPage - 1) * itemsPerPage, shippingPage * itemsPerPage);

  const handleSavePolicy = (e) => {
    e.preventDefault();
    const updated = {
      ...shippingConfig,
      freeShippingEnabled: policyForm.freeShippingEnabled,
      freeShippingThreshold: Math.max(0, Number(policyForm.freeShippingThreshold) || 0),
      defaultShippingFee: Math.max(0, Number(policyForm.defaultShippingFee) || 0)
    };
    onUpdateShippingConfig(updated);
    setPolicySaved(true);
    setTimeout(() => setPolicySaved(false), 2500);
    if (addToast) {
      addToast('Đã lưu chính sách miễn phí vận chuyển & cước mặc định thành công!', 'success');
    }
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleSaveRate = (itemData) => {
    let newRates;
    const isEdit = provinceRates.some((r) => r.id === itemData.id);
    if (isEdit) {
      newRates = provinceRates.map((r) => (r.id === itemData.id ? itemData : r));
    } else {
      newRates = [itemData, ...provinceRates];
    }
    const updated = {
      ...shippingConfig,
      provinceRates: newRates
    };
    onUpdateShippingConfig(updated);
    if (addToast) {
      addToast(`Đã ${isEdit ? 'cập nhật' : 'thêm'} cước phí cho ${itemData.province}!`, 'success');
    }
  };

  const handleDeleteRate = (id, provinceName) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa biểu phí của "${provinceName}" khỏi danh sách?`)) {
      const newRates = provinceRates.filter((r) => r.id !== id);
      const updated = {
        ...shippingConfig,
        provinceRates: newRates
      };
      onUpdateShippingConfig(updated);
      if (addToast) {
        addToast(`Đã xóa biểu phí của ${provinceName}!`, 'info');
      }
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('Bạn có chắc muốn khôi phục biểu phí ship về cài đặt gốc ban đầu của hệ thống?')) {
      const resetConf = onResetShippingConfig();
      if (resetConf) {
        setPolicyForm({
          freeShippingEnabled: resetConf.freeShippingEnabled,
          freeShippingThreshold: resetConf.freeShippingThreshold,
          defaultShippingFee: resetConf.defaultShippingFee
        });
      }
      setShippingPage(1);
      if (addToast) {
        addToast('Đã khôi phục cài đặt cước phí vận chuyển về mặc định!', 'info');
      }
    }
  };

  return (
    <div className="admin-tab-content">
      {/* 1. Policy Settings Card */}
      <div className="admin-card" style={{ marginBottom: '24px' }}>
        <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h3 style={{ fontSize: '1.18rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Truck size={20} />
              </div>
              <span>Chính Sách Vận Chuyển Toàn Hệ Thống</span>
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', marginTop: '6px' }}>
              Thiết lập chính sách Freeship tự động và mức phí vận chuyển mặc định toàn quốc được lưu trữ an toàn trong Database.
            </p>
          </div>

          <button
            type="button"
            className="btn-secondary"
            onClick={handleResetDefaults}
            title="Khôi phục toàn bộ biểu phí về mặc định"
            style={{ fontSize: '0.84rem', padding: '8px 14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <RotateCcw size={15} />
            <span>Khôi Phục Mặc Định</span>
          </button>
        </div>

        <form onSubmit={handleSavePolicy} style={{ marginTop: '18px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {/* Box 1: Freeship Switch & Threshold */}
            <div
              style={{
                background: policyForm.freeShippingEnabled ? '#F0FDF4' : 'var(--bg-main)',
                border: `1.5px solid ${policyForm.freeShippingEnabled ? '#86EFAC' : 'var(--border-light)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                transition: 'var(--transition)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Sparkles size={18} color={policyForm.freeShippingEnabled ? '#15803D' : 'var(--text-light)'} />
                  <strong style={{ fontSize: '0.96rem', color: policyForm.freeShippingEnabled ? '#15803D' : 'var(--text-main)' }}>
                    Chính Sách Miễn Phí Vận Chuyển
                  </strong>
                </div>

                <label className="admin-toggle" title="Bật / tắt chính sách Freeship">
                  <input
                    type="checkbox"
                    checked={policyForm.freeShippingEnabled}
                    onChange={(e) => setPolicyForm({ ...policyForm, freeShippingEnabled: e.target.checked })}
                  />
                  <span className="admin-toggle-slider" />
                </label>
              </div>

              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                {policyForm.freeShippingEnabled
                  ? 'Đang kích hoạt: Tự động miễn phí ship cho các đơn hàng đạt hoặc vượt ngưỡng tiền tối thiểu.'
                  : 'Đang tạm dừng: Mọi đơn hàng đều sẽ áp dụng tính phí ship theo biểu phí.'}
              </p>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Ngưỡng Tiền Đạt Freeship (VND)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    step="10000"
                    min="0"
                    disabled={!policyForm.freeShippingEnabled}
                    className="admin-search-input"
                    value={policyForm.freeShippingThreshold}
                    onChange={(e) => setPolicyForm({ ...policyForm, freeShippingThreshold: e.target.value })}
                    style={{
                      paddingLeft: '14px',
                      paddingRight: '60px',
                      fontWeight: 700,
                      fontSize: '1rem',
                      color: policyForm.freeShippingEnabled ? 'var(--primary)' : 'var(--text-light)',
                      opacity: policyForm.freeShippingEnabled ? 1 : 0.6
                    }}
                  />
                  <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--text-light)', fontSize: '0.85rem' }}>
                    VNĐ
                  </span>
                </div>
                <small style={{ color: 'var(--text-light)', fontSize: '0.78rem', display: 'block', marginTop: '4px' }}>
                  Hiện tại: <strong>{formatPrice(policyForm.freeShippingThreshold)}</strong>
                </small>
              </div>
            </div>

            {/* Box 2: Default Shipping Fee */}
            <div
              style={{
                background: '#F8FAFC',
                border: '1.5px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: '20px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <ShieldCheck size={18} color="var(--primary)" />
                <strong style={{ fontSize: '0.96rem', color: 'var(--text-main)' }}>
                  Phí Vận Chuyển Mặc Định Toàn Quốc
                </strong>
              </div>

              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                Mức cước áp dụng tự động cho các tỉnh thành phố chưa được thiết lập bảng giá riêng trong danh sách bên dưới.
              </p>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Cước Mặc Định Toàn Quốc (VND)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    step="5000"
                    min="0"
                    className="admin-search-input"
                    value={policyForm.defaultShippingFee}
                    onChange={(e) => setPolicyForm({ ...policyForm, defaultShippingFee: e.target.value })}
                    style={{
                      paddingLeft: '14px',
                      paddingRight: '60px',
                      fontWeight: 700,
                      fontSize: '1rem',
                      color: 'var(--primary)'
                    }}
                  />
                  <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--text-light)', fontSize: '0.85rem' }}>
                    VNĐ
                  </span>
                </div>
                <small style={{ color: 'var(--text-light)', fontSize: '0.78rem', display: 'block', marginTop: '4px' }}>
                  Hiện tại: <strong>{formatPrice(policyForm.defaultShippingFee)}</strong>
                </small>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button
              type="submit"
              className="btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 22px',
                fontSize: '0.9rem',
                background: policySaved ? '#059669' : undefined
              }}
            >
              {policySaved ? <Check size={16} /> : <Save size={16} />}
              <span>{policySaved ? 'Đã Lưu Thành Công!' : 'Lưu Thay Đổi Chính Sách'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. Rates by Province Card */}
      <div className="admin-card">
        {/* Toolbar */}
        <div className="admin-toolbar" style={{ margin: 0, border: 'none', boxShadow: 'none', padding: '0 0 16px 0', borderBottom: '1px solid var(--border-light)' }}>
          <div className="admin-search-wrapper" style={{ maxWidth: '380px' }}>
            <Search size={16} />
            <input
              type="text"
              className="admin-search-input"
              placeholder="Tìm theo tỉnh thành, khu vực..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', background: 'var(--bg-main)', padding: '6px 12px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-light)' }}>
              Đang có <strong style={{ color: 'var(--primary)' }}>{filteredRates.length}</strong> biểu phí
            </span>

            <button
              type="button"
              className="btn-primary"
              onClick={handleOpenAddModal}
              style={{ padding: '9px 18px', fontSize: '0.86rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={16} />
              <span>Thêm Tỉnh Thành Mới</span>
            </button>
          </div>
        </div>

        {/* Rates Table */}
        <div className="admin-table-responsive" style={{ marginTop: '12px' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '28%' }}>Tỉnh / Thành Phố</th>
                <th style={{ width: '18%' }}>Cước Phí Vận Chuyển</th>
                <th style={{ width: '22%' }}>Thời Gian Giao Dự Kiến</th>
                <th>Ghi Chú Vùng / Vườn</th>
                <th style={{ textAlign: 'right', width: '15%' }}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredRates.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
                    Không tìm thấy tỉnh / thành phố nào phù hợp với từ khóa "{searchQuery}"
                  </td>
                </tr>
              ) : (
                pagedRates.map((rate) => (
                  <tr key={rate.id} style={{ transition: 'background 0.2s' }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <MapPin size={16} />
                        </div>
                        <div>
                          <strong style={{ fontSize: '0.94rem', color: 'var(--text-main)', display: 'block' }}>
                            {rate.province}
                          </strong>
                          {rate.id && (
                            <small style={{ fontSize: '0.72rem', color: 'var(--text-light)', fontFamily: 'monospace' }}>
                              ID: {rate.id}
                            </small>
                          )}
                        </div>
                      </div>
                    </td>

                    <td>
                      <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'Outfit, sans-serif' }}>
                        {formatPrice(rate.fee)}
                      </span>
                    </td>

                    <td>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', color: '#1E293B', background: '#F1F5F9', padding: '4px 10px', borderRadius: 'var(--radius-full)' }}>
                        <Clock size={13} color="#64748B" />
                        <span>{rate.estimatedDays || '2 - 3 ngày'}</span>
                      </div>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                        {rate.note || '—'}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          type="button"
                          className="btn-icon-action"
                          onClick={() => handleOpenEditModal(rate)}
                          title={`Chỉnh sửa phí ship ${rate.province}`}
                        >
                          <Edit2 size={15} />
                        </button>

                        <button
                          type="button"
                          className="btn-icon-action delete"
                          onClick={() => handleDeleteRate(rate.id, rate.province)}
                          title={`Xóa ${rate.province}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <Pagination
          currentPage={shippingPage}
          totalPages={shippingTotalPages}
          totalItems={filteredRates.length}
          onPageChange={setShippingPage}
        />
      </div>

      {/* Modal Add / Edit Rate */}
      <ShippingRateModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveRate}
        initialData={editingItem}
        existingProvinces={provinceRates.map((r) => r.province)}
      />
    </div>
  );
}
