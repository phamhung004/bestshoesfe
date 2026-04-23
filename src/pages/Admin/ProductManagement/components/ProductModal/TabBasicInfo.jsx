import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { slugify } from '../../mockProducts';

/**
 * TabBasicInfo
 *
 * Props:
 *   data       { name, description, categoryId, brandId, materialId, status, seoTitle, seoDesc, slug }
 *   onChange   (field, value) => void
 *   errors     { name?, categoryId?, brandId? }
 *   categories Category[]  from API
 *   brands     Brand[]     from API
 *   materials  Material[]  from API
 */
const TabBasicInfo = ({ data, onChange, errors = {}, categories = [], brands = [], materials = [] }) => {
  const [seoOpen, setSeoOpen] = useState(false);

  // Auto-generate slug from name (only if slug hasn't been manually edited)
  useEffect(() => {
    if (data.name && !data._slugManual) {
      onChange('slug', slugify(data.name));
    }
  }, [data.name]);

  return (
    <div>
      {/* Thông tin chung */}
      <div className="pm-form-section">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span className="pm-form-section-title" style={{ marginBottom: 0 }}>Thông tin chung</span>
            <div className="pm-toggle-row" style={{ gap: 12, width: 'auto' }}>
              <div className="pm-toggle-label-wrap" style={{ textAlign: 'right' }}>
                <span className="pm-toggle-title">
                  {data.status === 'ACTIVE' ? 'Đang bán' : 'Ngừng bán'}
                </span>
                <span className="pm-toggle-sub">
                  {data.status === 'ACTIVE'
                    ? 'Đang hiển thị trên cửa hàng'
                    : 'Đã ẩn khỏi cửa hàng'}
                </span>
              </div>
              <label className="pm-toggle">
                <input
                  type="checkbox"
                  className="pm-toggle-input"
                  checked={data.status === 'ACTIVE'}
                  onChange={(e) =>
                    onChange('status', e.target.checked ? 'ACTIVE' : 'INACTIVE')
                  }
                />
                <span className="pm-toggle-slider" />
              </label>
            </div>
          </div>

          {/* Tên sản phẩm */}
          <div className="pm-field">
            <label className="pm-label">
              Tên sản phẩm <span className="req">*</span>
            </label>
            <input
              className={`pm-input ${errors.name ? 'error' : ''}`}
              placeholder="VD: Nike Air Max 270 React"
              maxLength={255}
              value={data.name}
              onChange={(e) => onChange('name', e.target.value)}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {errors.name && <span className="pm-field-error">{errors.name}</span>}
              <span className="pm-char-count" style={{ marginLeft: 'auto' }}>
                {(data.name || '').length}/255
              </span>
            </div>
          </div>

          {/* Mô tả */}
          <div className="pm-field">
            <label className="pm-label">Mô tả sản phẩm</label>
            <textarea
              className="pm-textarea"
              placeholder="Mô tả chi tiết về sản phẩm, chất liệu, công nghệ, ứng dụng..."
              rows={5}
              maxLength={2000}
              value={data.description}
              onChange={(e) => onChange('description', e.target.value)}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="pm-field-hint">💡 Mô tả tốt giúp tăng tỷ lệ chuyển đổi</span>
              <span className="pm-char-count">{(data.description || '').length}/2000</span>
            </div>
          </div>
        </div>

        {/* Phân loại */}
        <div className="pm-form-section">
          <div className="pm-form-section-title">Phân loại</div>

          {/* Danh mục */}
          <div className="pm-field">
            <label className="pm-label">
              Danh mục <span className="req">*</span>
            </label>
            <select
              className={`pm-select ${errors.categoryId ? 'error' : ''}`}
              value={data.categoryId}
              onChange={(e) => onChange('categoryId', e.target.value)}
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map((c) => {
                const id = c.categoryId ?? c.id;
                return (
                  <option key={id} value={String(id)}>
                    {c.name}
                  </option>
                );
              })}
            </select>
            {errors.categoryId && (
              <span className="pm-field-error">{errors.categoryId}</span>
            )}
          </div>

          {/* Thương hiệu */}
          <div className="pm-field">
            <label className="pm-label">
              Thương hiệu <span className="req">*</span>
            </label>
            <select
              className={`pm-select ${errors.brandId ? 'error' : ''}`}
              value={data.brandId}
              onChange={(e) => onChange('brandId', e.target.value)}
            >
              <option value="">-- Chọn thương hiệu --</option>
              {brands.map((b) => {
                const id = b.brandId ?? b.id;
                return (
                  <option key={id} value={String(id)}>
                    {b.name}
                  </option>
                );
              })}
            </select>
            {errors.brandId && (
              <span className="pm-field-error">{errors.brandId}</span>
            )}
          </div>

          {/* Chất liệu */}
          <div className="pm-field">
            <label className="pm-label">Chất liệu</label>
            <select
              className="pm-select"
              value={data.materialId}
              onChange={(e) => onChange('materialId', e.target.value)}
            >
              <option value="">-- Chọn chất liệu --</option>
              {materials.map((m) => {
                const id = m.materialId ?? m.id;
                return (
                  <option key={id} value={String(id)}>
                    {m.materialName ?? m.name}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* SEO (collapsible) */}
        <div className="pm-form-section">
          <button
            type="button"
            className="pm-accordion-toggle"
            onClick={() => setSeoOpen((o) => !o)}
          >
            <span>SEO &amp; Đường dẫn</span>
            {seoOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {seoOpen && (
            <div className="pm-accordion-body">
              <div className="pm-field">
                <label className="pm-label">Slug (đường dẫn)</label>
                <input
                  className="pm-input"
                  value={data.slug || ''}
                  onChange={(e) => {
                    onChange('_slugManual', true);
                    onChange('slug', e.target.value);
                  }}
                  placeholder="nike-air-max-270"
                />
                <div className="pm-field-hint">
                  bestshoes.com/products/{data.slug || 'duong-dan-san-pham'}
                </div>
              </div>

              <div className="pm-field">
                <label className="pm-label">Tiêu đề Meta</label>
                <input
                  className="pm-input"
                  maxLength={60}
                  placeholder="Tiêu đề SEO (tối đa 60 ký tự)"
                  value={data.seoTitle || ''}
                  onChange={(e) => onChange('seoTitle', e.target.value)}
                />
                <span className="pm-char-count">{(data.seoTitle || '').length}/60</span>
              </div>

              <div className="pm-field">
                <label className="pm-label">Mô tả Meta</label>
                <textarea
                  className="pm-textarea"
                  rows={3}
                  maxLength={160}
                  placeholder="Mô tả SEO (tối đa 160 ký tự)"
                  value={data.seoDescription || ''}
                  onChange={(e) => onChange('seoDescription', e.target.value)}
                />
                <span className="pm-char-count">{(data.seoDescription || '').length}/160</span>
              </div>
            </div>
          )}
        </div>
    </div>
  );
};

export default TabBasicInfo;

