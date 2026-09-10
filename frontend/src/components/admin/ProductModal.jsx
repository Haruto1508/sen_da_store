import React, { useState, useRef } from 'react';
import { Sprout, X, Check, UploadCloud, Image as ImageIcon, Loader2, Link2, Trash2, CheckCircle2 } from 'lucide-react';
import { CATEGORIES } from '../../data/products';
import { SAMPLE_IMAGES } from './adminConstants';
import { uploadProductImage } from '../../services/api';

export default function ProductModal({
  isOpen,
  editingProduct,
  productFormData,
  setProductFormData,
  onClose,
  onSave
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const handleUploadFile = async (file) => {
    if (!file) return;

    // 1. Kiểm tra kích thước file
    if (file.size > MAX_FILE_SIZE) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      setUploadError(`Ảnh có dung lượng quá lớn (${sizeMb} MB). Kích thước tối đa cho phép là 5 MB.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // 2. Kiểm tra định dạng file ảnh
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setUploadError('Chỉ hỗ trợ file ảnh định dạng JPG, PNG, WEBP hoặc GIF.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      const res = await uploadProductImage(file);
      if (res && res.url) {
        setProductFormData((prev) => ({
          ...prev,
          image: res.url
        }));
      }
    } catch (err) {
      setUploadError(err.message || 'Lỗi khi tải ảnh lên cloud');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUploadFile(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleUploadFile(file);
    }
  };

  const handleRemoveImage = () => {
    setProductFormData((prev) => ({
      ...prev,
      image: ''
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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

            {/* Cloud Image Upload */}
            <div className="admin-form-control full-width" style={{ marginTop: '6px', marginBottom: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                  <ImageIcon size={16} color="var(--primary)" />
                  <span>Hình Ảnh Sen Đá</span>
                  <span className="admin-cloud-badge">Cloud Storage</span>
                </label>
                <button
                  type="button"
                  className="admin-link-toggle-btn"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                >
                  <Link2 size={13} />
                  <span>{showUrlInput ? 'Ẩn URL thủ công' : 'Nhập URL / Chọn ảnh mẫu'}</span>
                </button>
              </div>

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/jpeg,image/png,image/webp,image/gif"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />

              {/* Upload Drop Zone & Preview */}
              {productFormData.image ? (
                <div className="admin-image-preview-card">
                  <img
                    src={productFormData.image}
                    alt={productFormData.name || 'Preview'}
                    className="admin-image-preview-thumb"
                  />
                  <div className="admin-image-preview-info">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={16} color="#10B981" />
                      <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                        {productFormData.image.includes('cloudinary.com')
                          ? 'Đã lưu trên Cloudinary CDN'
                          : 'Ảnh sản phẩm đã sẵn sàng'}
                      </span>
                    </div>
                    <span className="admin-image-url-truncate" title={productFormData.image}>
                      {productFormData.image}
                    </span>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                      <button
                        type="button"
                        className="btn-upload-action"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                      >
                        {isUploading ? <Loader2 size={13} className="spin" /> : <UploadCloud size={13} />}
                        <span>Thay Ảnh Khác</span>
                      </button>
                      <button
                        type="button"
                        className="btn-upload-remove"
                        onClick={handleRemoveImage}
                        disabled={isUploading}
                      >
                        <Trash2 size={13} />
                        <span>Xóa</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className={`admin-upload-dropzone ${isDragOver ? 'drag-over' : ''} ${isUploading ? 'uploading' : ''}`}
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                >
                  {isUploading ? (
                    <div className="admin-upload-loading">
                      <Loader2 size={32} className="spin" color="var(--primary)" />
                      <p style={{ fontWeight: 600, marginTop: '8px', color: 'var(--primary)' }}>
                        Đang tải ảnh lên Cloud Storage...
                      </p>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Vui lòng đợi trong giây lát</span>
                    </div>
                  ) : (
                    <div className="admin-upload-placeholder">
                      <div className="admin-upload-icon-circle">
                        <UploadCloud size={24} color="var(--primary)" />
                      </div>
                      <p style={{ fontWeight: 600, margin: '8px 0 4px', fontSize: '0.92rem' }}>
                        Kéo thả ảnh sen đá vào đây hoặc <span style={{ color: 'var(--primary)', textDecoration: 'underline' }}>chọn từ máy tính</span>
                      </p>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Hỗ trợ JPG, PNG, WEBP, GIF tối đa 5MB • Tự động tối ưu và lưu trên Cloud
                      </span>
                    </div>
                  )}
                </div>
              )}

              {uploadError && (
                <div className="admin-upload-error">
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Collapsible Manual URL & Sample Images */}
              {showUrlInput && (
                <div className="admin-manual-url-box">
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
                    Hoặc dán URL ảnh trực tiếp:
                  </label>
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
              )}
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
