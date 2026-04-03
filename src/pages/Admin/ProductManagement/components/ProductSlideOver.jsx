import React, { useState } from 'react';
import { X, Edit, Package } from 'lucide-react';
import {
  STATUS_CONFIG, getMinPrice, getMaxPrice, getRelativeTime,
} from '../mockProducts';
import { formatPrice } from '../../../../utils/formatPrice';

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.INACTIVE;
  return (
    <span className={`pm-badge ${cfg.className}`}>
      <span className="pm-badge-dot" />
      {cfg.label}
    </span>
  );
};

const MAX_DESC_CHARS = 200;

/**
 * ProductSlideOver
 * Props: product (null = hidden), onClose(), onEdit(product)
 */
const ProductSlideOver = ({ product, onClose, onEdit }) => {
  const [descExpanded, setDescExpanded] = useState(false);

  if (!product) return null;

  const minP = getMinPrice(product);
  const maxP = getMaxPrice(product);
  const desc = product.description || '';
  const showMore = desc.length > MAX_DESC_CHARS;
  const displayDesc = !descExpanded && showMore ? desc.slice(0, MAX_DESC_CHARS) + '...' : desc;

  const infoRows = [
    { label: 'Danh mục',     value: product.category?.name || '—' },
    { label: 'Thương hiệu',  value: product.brand?.name    || '—' },
    { label: 'Chất liệu',   value: product.material?.name  || '—' },
    { label: 'Code',         value: product.code || product.productCode || '—' },
    {
      label: 'Ngày tạo',
      value: product.createdAt
        ? new Date(product.createdAt).toLocaleDateString('vi-VN')
        : '—',
    },
    {
      label: 'Cập nhật',
      value: getRelativeTime(product.updatedAt),
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <div className="pm-overlay" onClick={onClose} style={{ zIndex: 40 }} />

      {/* Panel */}
      <div className="pm-slide-over">
        {/* Header */}
        <div className="pm-so-header">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="pm-so-title" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ flex: 1, minWidth: 0, overflowWrap: 'anywhere' }}>{product.name}</span>
              <StatusBadge status={product.status} />
            </div>
            <span style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>Code: {product.code || product.productCode || '—'}</span>
          </div>
          <button className="pm-btn-icon" onClick={onClose} type="button" title="Đóng">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="pm-so-body">
          {/* Hero image */}
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="pm-so-img" />
          ) : (
            <div
              className="pm-so-img"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eef2ff', color: '#6366f1' }}
            >
              <Package size={48} />
            </div>
          )}

          {/* Info grid */}
          <div className="pm-so-section">
            <div className="pm-so-section-title">Thông tin sản phẩm</div>
            <div className="pm-so-grid">
              {infoRows.map(({ label, value }) => (
                <div key={label} className="pm-so-field">
                  <span className="pm-so-field-label">{label}</span>
                  <span className="pm-so-field-value">{value}</span>
                </div>
              ))}
              <div className="pm-so-field">
                <span className="pm-so-field-label">Giá bán</span>
                <span className="pm-so-field-value" style={{ color: '#4f46e5', fontWeight: 700 }}>
                  {minP === maxP
                    ? formatPrice(minP)
                    : `${formatPrice(minP)} – ${formatPrice(maxP)}`}
                </span>
              </div>
              {(product.tags || []).length > 0 && (
                <div className="pm-so-field">
                  <span className="pm-so-field-label">Tags</span>
                  <span className="pm-so-field-value">{product.tags.join(', ')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {desc && (
            <div className="pm-so-section">
              <div className="pm-so-section-title">Mô tả sản phẩm</div>
              <p className="pm-so-description">
                {displayDesc}
                {showMore && (
                  <button
                    onClick={() => setDescExpanded((e) => !e)}
                    style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontSize: 13, fontWeight: 600, marginLeft: 4 }}
                    type="button"
                  >
                    {descExpanded ? 'Thu gọn' : 'Xem thêm'}
                  </button>
                )}
              </p>
            </div>
          )}

          {/* Variants table */}
          {product.variants && product.variants.length > 0 && (
            <div className="pm-so-section">
              <div className="pm-so-section-title">
                Biến thể ({product.totalVariants} biến thể · {product.totalStock} trong kho)
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="pm-variant-table-sm">
                  <thead>
                    <tr>
                      <th>SKU</th>
                      <th>Size</th>
                      <th>Màu</th>
                      <th>Giá bán</th>
                      <th>Tồn kho</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.variants.map((v) => (
                      <tr key={v.id}>
                        <td>
                          <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{v.sku || v.variantSku || '—'}</span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600 }}>{v.size}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span
                              style={{
                                width: 14, height: 14, borderRadius: '50%',
                                background: v.color.code, border: '1px solid rgba(0,0,0,0.1)',
                                flexShrink: 0,
                              }}
                            />
                            {v.color.name}
                          </div>
                        </td>
                        <td style={{ fontWeight: 600 }}>{formatPrice(v.price)}</td>
                        <td>
                          <span
                            style={{
                              fontWeight: 600,
                              color: v.stock === 0 ? '#ef4444' : v.stock <= 5 ? '#f97316' : '#16a34a',
                            }}
                          >
                            {v.stock === 0 ? 'Hết' : v.stock}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SEO preview */}
          {product.seoTitle && (
            <div className="pm-so-section">
              <div className="pm-so-section-title">SEO</div>
              <div style={{ background: '#f8fafc', borderRadius: 10, padding: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1a73e8', marginBottom: 4 }}>
                  {product.seoTitle}
                </div>
                <div style={{ fontSize: 12, color: '#5f6368', lineHeight: 1.5 }}>
                  {product.seoDescription}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pm-so-footer">
          <button
            className="pm-btn pm-btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => onEdit(product)}
            type="button"
          >
            <Edit size={15} />
            Chỉnh sửa sản phẩm
          </button>
        </div>
      </div>
    </>
  );
};

export default ProductSlideOver;
