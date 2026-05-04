import React from 'react';
import {
  Eye, Edit, Trash2, Package, ChevronUp, ChevronDown, Plus,
} from 'lucide-react';
import {
  STATUS_CONFIG, getMinPrice, getMaxPrice, getUniqueColors, getRelativeTime, isNewProduct,
} from '../mockProducts';
import { formatPrice, formatPriceShort } from '../../../../utils/formatPrice';

/* ─── Status badge ───────────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.INACTIVE;
  return (
    <span className={`pm-badge ${cfg.className}`}>
      <span className="pm-badge-dot" />
      {cfg.label}
    </span>
  );
};

/* ─── Tag chips ──────────────────────────────────────────────── */
const TAG_MAP = {
  hot: { label: '🔥 HOT', cls: 'pm-tag-hot' },
  new: { label: '🆕 MỚI', cls: 'pm-tag-new' },
  sale: { label: '💰 SALE', cls: 'pm-tag-sale' },
  bestseller: { label: '⭐ BÁN CHẠY', cls: 'pm-tag-bestseller' },
};

/* ─── Stock colors ───────────────────────────────────────────── */
const stockClass = (stock) => {
  if (stock === 0) return 'pm-stock-red';
  if (stock <= 5) return 'pm-stock-red';
  if (stock <= 20) return 'pm-stock-orange';
  return 'pm-stock-green';
};
const stockColor = (stock) => {
  if (stock === 0) return '#ef4444';
  if (stock <= 5) return '#ef4444';
  if (stock <= 20) return '#f97316';
  return '#22c55e';
};
const stockBarWidth = (stock, max = 100) =>
  `${Math.min(100, (stock / max) * 100)}%`;

const getActiveVariantCount = (product) =>
  (product.variants || []).filter((v) => (v.status || 'ACTIVE') === 'ACTIVE').length;

const getVariantCount = (product) =>
  product.totalVariants ?? (product.variants || []).length;

/* ─── Sort header helper ─────────────────────────────────────── */
const SortIcon = ({ active, dir }) => {
  if (!active)
    return <span style={{ opacity: 0.3, fontSize: 10 }}>⇅</span>;
  return dir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />;
};

/* ─── Main component ─────────────────────────────────────────── */
const ProductTable = ({
  products,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onView,
  onEdit,
  onDelete,
  onAdd,
  sortConfig,
  onSort,
  loading,
}) => {
  const allSelected =
    products.length > 0 && products.every((p) => selectedIds.has(p.id));
  const someSelected = products.some((p) => selectedIds.has(p.id));

  const handleHeaderCheckbox = () => {
    if (allSelected) {
      // deselect all visible
      const newSet = new Set(selectedIds);
      products.forEach((p) => newSet.delete(p.id));
      onToggleSelectAll(newSet);
    } else {
      // select all visible
      const newSet = new Set(selectedIds);
      products.forEach((p) => newSet.add(p.id));
      onToggleSelectAll(newSet);
    }
  };

  const handleSortClick = (key) => {
    if (sortConfig.key === key) {
      onSort({ key, dir: sortConfig.dir === 'asc' ? 'desc' : 'asc' });
    } else {
      onSort({ key, dir: 'desc' });
    }
  };

  const renderSortTh = (label, key, style) => (
    <th
      className="sortable"
      style={style}
      onClick={() => handleSortClick(key)}
    >
      <span className="pm-th-sort">
        {label}
        <SortIcon active={sortConfig.key === key} dir={sortConfig.dir} />
      </span>
    </th>
  );

  /* Loading skeleton */
  if (loading) {
    return (
      <div className="pm-table-card">
        <table className="pm-table">
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                <td style={{ width: 40 }}>
                  <span className="pm-skeleton" style={{ width: 16, height: 16 }} />
                </td>
                <td style={{ width: 64 }}>
                  <span className="pm-skeleton" style={{ width: 44, height: 44, borderRadius: 10 }} />
                </td>
                <td>
                  <div className="pm-skeleton-row">
                    <div>
                      <span className="pm-skeleton" style={{ width: 160, height: 14, marginBottom: 6 }} />
                      <span className="pm-skeleton" style={{ width: 80, height: 10 }} />
                    </div>
                  </div>
                </td>
                {[80, 80, 90, 70, 70, 80, 70, 80].map((w, j) => (
                  <td key={j}>
                    <span className="pm-skeleton" style={{ width: w, height: 14 }} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  /* Empty state */
  if (products.length === 0) {
    return (
      <div className="pm-table-card">
        <div className="pm-empty">
          <div className="pm-empty-icon">
            <Package size={56} />
          </div>
          <h3 className="pm-empty-title">Không tìm thấy sản phẩm nào</h3>
          <p className="pm-empty-sub">Thử thay đổi bộ lọc hoặc thêm sản phẩm mới</p>
          {onAdd && (
            <button className="pm-btn pm-btn-primary" onClick={onAdd} type="button">
              <Plus size={15} />
              Thêm sản phẩm
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="pm-table-card">
      <table className="pm-table">
        <thead>
          <tr>
            <th style={{ width: 40 }}>
              <input
                type="checkbox"
                className="pm-checkbox"
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected && !allSelected;
                }}
                onChange={handleHeaderCheckbox}
              />
            </th>
            <th style={{ width: 56 }} />
            {renderSortTh('Sản phẩm', 'name', { minWidth: 200 })}
            <th style={{ width: 110 }}>Danh mục</th>
            <th style={{ width: 100 }}>Thương hiệu</th>
            {renderSortTh('Giá', 'price', { width: 130 })}
            <th style={{ width: 90 }}>Biến thể</th>
            {renderSortTh('Tồn kho', 'stock', { width: 100 })}
            <th style={{ width: 120 }}>Trạng thái</th>
            {renderSortTh('Cập nhật', 'updatedAt', { width: 110 })}
            <th style={{ width: 90 }}>Thao tác</th>
          </tr>
        </thead>

        <tbody>
          {products.map((product) => {
            const minP = getMinPrice(product);
            const maxP = getMaxPrice(product);
            const uniqueColors = getUniqueColors(product);
            const visibleColors = uniqueColors.slice(0, 4);
            const extraColors = uniqueColors.length - 4;
            const isNew = isNewProduct(product);

            return (
              <tr
                key={product.id}
                className="pm-clickable-row"
                tabIndex={0}
                role="button"
                onClick={() => onView(product)}
                onKeyDown={(e) => {
                  if (e.currentTarget !== e.target) return;
                  if (e.key === 'Enter') onView(product);
                }}
              >
                {/* Checkbox */}
                <td onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    className="pm-checkbox"
                    checked={selectedIds.has(product.id)}
                    onChange={() => onToggleSelect(product.id)}
                  />
                </td>

                {/* Image */}
                <td>
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="pm-img-thumb"
                    />
                  ) : (
                    <div className="pm-img-fallback">
                      <Package size={18} />
                    </div>
                  )}
                </td>

                {/* Name / Code */}
                <td>
                  <div>
                    <span className="pm-product-name">
                      {product.name}
                      {isNew && <span className="pm-badge-new">MỚI</span>}
                      {(product.tags || []).map((tag) =>
                        TAG_MAP[tag] ? (
                          <span key={tag} className={`pm-tag ${TAG_MAP[tag].cls}`}>
                            {TAG_MAP[tag].label}
                          </span>
                        ) : null
                      )}
                    </span>
                    <div className="pm-product-sku">Code: {product.code || product.productCode || '—'}</div>
                    {/* Color dots */}
                    {visibleColors.length > 0 && (
                      <div className="pm-color-dots">
                        {visibleColors.map((c) => (
                          <span
                            key={c.id}
                            className="pm-color-dot"
                            style={{ background: c.code }}
                            title={c.name}
                          />
                        ))}
                        {extraColors > 0 && (
                          <span className="pm-color-dot-more">+{extraColors}</span>
                        )}
                      </div>
                    )}
                  </div>
                </td>

                {/* Category */}
                <td style={{ color: '#475569', fontSize: 13 }}>
                  {product.category?.name || '—'}
                </td>

                {/* Brand */}
                <td style={{ color: '#475569', fontSize: 13 }}>
                  {product.brand?.name || '—'}
                </td>

                {/* Price */}
                <td>
                  {product.salePrice ? (
                    <div>
                      <span className="pm-price pm-price-sale">
                        {formatPriceShort(product.salePrice)}
                      </span>{' '}
                      <span className="pm-price-original">
                        {formatPriceShort(minP)}
                      </span>
                    </div>
                  ) : minP === maxP ? (
                    <span className="pm-price">{formatPriceShort(minP)}</span>
                  ) : (
                    <span className="pm-price">
                      {formatPriceShort(minP)} – {formatPriceShort(maxP)}
                    </span>
                  )}
                </td>

                {/* Variants */}
                <td style={{ color: '#64748b', fontSize: 13 }}>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>
                    {getActiveVariantCount(product)}/{getVariantCount(product)}
                  </span>{' '}
                  đang bán
                </td>

                {/* Stock */}
                <td>
                  <span className={stockClass(product.totalStock)}>
                    {product.totalStock === 0
                      ? 'Hết hàng'
                      : product.totalStock <= 5
                      ? `⚠ ${product.totalStock} còn lại`
                      : product.totalStock}
                  </span>
                  <div className="pm-stock-bar-wrap">
                    <div
                      className="pm-stock-bar"
                      style={{
                        width: stockBarWidth(product.totalStock),
                        background: stockColor(product.totalStock),
                      }}
                    />
                  </div>
                </td>

                {/* Status */}
                <td>
                  <StatusBadge status={product.status} />
                </td>

                {/* Updated */}
                <td title={new Date(product.updatedAt).toLocaleString('vi-VN')}>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>
                    {getRelativeTime(product.updatedAt)}
                  </span>
                </td>

                {/* Actions */}
                <td onClick={(e) => e.stopPropagation()}>
                  <div className="pm-actions">
                    <button
                      className="pm-btn-icon"
                      title="Xem chi tiết"
                      onClick={() => onView(product)}
                      type="button"
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      className="pm-btn-icon"
                      title="Chỉnh sửa"
                      onClick={() => onEdit(product)}
                      type="button"
                      style={{ '--hover-bg': '#eef2ff', '--hover-color': '#4f46e5' }}
                    >
                      <Edit size={15} />
                    </button>
                    <button
                      className="pm-btn-icon"
                      title="Xóa sản phẩm"
                      onClick={() => onDelete(product)}
                      type="button"
                      style={{ color: '#ef4444' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;
