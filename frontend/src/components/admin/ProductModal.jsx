import React from 'react';
import { Sprout, X, Check } from 'lucide-react';
import { CATEGORIES } from '../../data/products';
import { SAMPLE_IMAGES } from './adminConstants';

export default function ProductModal({
  isOpen,
  editingProduct,
  productFormData,
  setProductFormData,
  onClose,
  onSave
}) {
  if (!isOpen) return null;

  return (
    <div
      className="admin-modal-overlay"
      onClick={onClose}
      onWheel={(e) => {
        if (e.target === e.currentTarget) e.preventDefault();
      }}
    >
      <div
        className="admin-modal-container"
        onClick={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
      >
        <div className="admin-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sprout size={20} color="var(--primary)" />
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)' }}>
              {editingProduct ? 'Chỉnh Sửa Thông Tin Sen Đá' : 'Thêm Sen Đá Mới Vào Vườn'}
            </h3>
          </div>
          <button
            className="btn-icon-action"
            onClick={onClose}
            title="Đóng cửa sổ"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSave} style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}>
          <div className="admin-modal-body">
            {/* Basic info */}
            <div className="admin-form-row">
              <div className="admin-form-control">
                <label>Tên Sen Đá *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Sen Đá Kim Cương Pha Lê"
                  value={productFormData.name}
                  onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                />
              </div>
              <div className="admin-form-control">
                <label>Tên Khoa Học</label>
                <input
                  type="text"
                  placeholder="VD: Haworthia Cooperi"
                  value={productFormData.scientificName}
                  onChange={(e) => setProductFormData({ ...productFormData, scientificName: e.target.value })}
                />
              </div>
            </div>

            <div className="admin-form-row">
              <div className="admin-form-control">
                <label>Danh Mục</label>
                <select
                  value={productFormData.category}
                  onChange={(e) => setProductFormData({ ...productFormData, category: e.target.value })}
                >
                  {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="admin-form-control">
                <label>Huy Hiệu (Badge)</label>
                <input
                  type="text"
                  placeholder="VD: Bán chạy, Mới về, Ưa chuộng..."
                  value={productFormData.badge || ''}
                  onChange={(e) => setProductFormData({ ...productFormData, badge: e.target.value })}
                />
              </div>
            </div>

            {/* Pricing & Stock */}
            <div className="admin-form-row">
              <div className="admin-form-control">
                <label>Giá Bán (VNĐ) *</label>
                <input
                  type="number"
                  required
                  min="1000"
                  step="1000"
                  value={productFormData.price}
                  onChange={(e) =>
                    setProductFormData({ ...productFormData, price: Number(e.target.value) })
                  }
                />
              </div>
              <div className="admin-form-control">
                <label>Giá Gốc (Trước giảm)</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={productFormData.originalPrice}
                  onChange={(e) =>
                    setProductFormData({ ...productFormData, originalPrice: Number(e.target.value) })
                  }
                />
              </div>
            </div>

            <div className="admin-form-row">
              <div className="admin-form-control">
                <label>Số Lượng Tồn Kho *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={productFormData.inStock}
                  onChange={(e) =>
                    setProductFormData({ ...productFormData, inStock: Number(e.target.value) })
                  }
                />
              </div>
              <div className="admin-form-control">
                <label>Kích Thước Cây</label>
                <input
                  type="text"
                  placeholder="VD: Mini (6 - 8cm), Trung (8 - 10cm)..."
                  value={productFormData.size || ''}
                  onChange={(e) => setProductFormData({ ...productFormData, size: e.target.value })}
                />
              </div>
            </div>

            {/* Image URL & Sample images */}
            <div className="admin-form-control">
              <label>Đường Dẫn Hình Ảnh (URL)</label>
              <input
                type="url"
                value={productFormData.image}
                onChange={(e) => setProductFormData({ ...productFormData, image: e.target.value })}
                placeholder="https://..."
              />
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>Chọn ảnh mẫu:</span>
                {SAMPLE_IMAGES.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Sample ${idx}`}
                    onClick={() => setProductFormData({ ...productFormData, image: img })}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      objectFit: 'cover',
                      border: productFormData.image === img ? '2px solid var(--primary)' : '1px solid var(--border-light)'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Care specs */}
            <div className="admin-form-row">
              <div className="admin-form-control">
                <label>Yêu Cầu Ánh Sáng</label>
                <select
                  value={productFormData.lightType}
                  onChange={(e) =>
                    setProductFormData({
                      ...productFormData,
                      lightType: e.target.value,
                      light:
                        e.target.value === 'full_sun'
                          ? 'Nhiều nắng trực tiếp'
                          : e.target.value === 'indirect'
                          ? 'Nhiều nắng gián tiếp'
                          : 'Trong nhà / Bàn làm việc'
                    })
                  }
                >
                  <option value="indirect">Nhiều nắng gián tiếp</option>
                  <option value="full_sun">Nhiều nắng trực tiếp</option>
                  <option value="indoor">Trong nhà / Bàn làm việc</option>
                </select>
              </div>
              <div className="admin-form-control">
                <label>Chu Kỳ Tưới Nước</label>
                <input
                  type="text"
                  placeholder="VD: 1 tuần / 1 lần"
                  value={productFormData.watering}
                  onChange={(e) => setProductFormData({ ...productFormData, watering: e.target.value })}
                />
              </div>
            </div>

            <div className="admin-form-control">
              <label>Mô Tả Sản Phẩm</label>
              <textarea
                rows={3}
                value={productFormData.description}
                onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
                placeholder="Mô tả đặc điểm nổi bật, dáng cây, màu sắc khi tắm nắng..."
              />
            </div>

            <div className="admin-form-control">
              <label>Ý Nghĩa Phong Thủy</label>
              <input
                type="text"
                value={productFormData.meaning}
                onChange={(e) => setProductFormData({ ...productFormData, meaning: e.target.value })}
                placeholder="VD: Mang lại tài lộc, sự may mắn và bình an..."
              />
            </div>
          </div>

          <div className="admin-modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
            >
              Hủy Bỏ
            </button>
            <button type="submit" className="btn-primary">
              <Check size={16} />
              <span>{editingProduct ? 'Cập Nhật Sen Đá' : 'Lưu Vào Cửa Hàng'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
