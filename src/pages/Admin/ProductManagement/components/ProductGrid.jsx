import React from 'react';
import { Eye, Edit, Trash2, Package, Plus } from 'lucide-react';
import {
  STATUS_CONFIG, getMinPrice, getMaxPrice, getUniqueColors, isNewProduct,
} from '../mockProducts';
import { formatPriceShort } from '../../../../utils/formatPrice';

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.INACTIVE;
  return (
    <span className={`pm-badge ${cfg.className}`} style={{ fontSize: 11, padding: '2px 8px' }}>
      <span className="pm-badge-dot" />
      {cfg.label}
    </span>
  );
};

const TAG_MAP = {
  hot: { label: '🔥 HOT', cls: 'pm-tag-hot' },
  new: { label: '🆕 MỚI', cls: 'pm-tag-new' },
  sale: { label: '💰 SALE', cls: 'pm-tag-sale' },
  bestseller: { label: '⭐ BÁN CHẠY', cls: 'pm-tag-bestseller' },
};

const stockInfo = (stock) => {
  if (stock === 0) return { label: 'Hết hàng', cls: 'red', pct: 0 };
  if (stock <= 5)  return { label: `⚠ ${stock} còn lại`, cls: 'red',    pct: Math.min(100, (stock / 20) * 100) };
  if (stock <= 20) return { label: `${stock} trong kho`,  cls: 'orange', pct: Math.min(100, (stock / 50) * 100) };
  return              { label: `${stock} trong kho`,      cls: 'green',  pct: Math.min(100, (stock / 100) * 100) };
};

const STOCK_COLORS = { red: '#ef4444', orange: '#f97316', green: '#22c55e' };

/**
 * ProductGrid
 * Props: products, selectedIds, onToggleSelect, onView, onEdit, onDelete, onAdd
 */
const ProductGrid = ({
  products,
  selectedIds,
  onToggleSelect,
  onView,
  onEdit,
  onDelete,
  onAdd,
}) => {
  if (products.length === 0) {
    return (
      <div className="pm-card" style={{ padding: '60px 24px', textAlign: 'center', marginBottom: 16 }}>
        <div className="pm-empty-icon" style={{ color: '#cbd5e1', marginBottom: 16 }}>
          <Package size={56} />
        </div>
        <h3 className="pm-empty-title">Không tìm thấy sản phẩm nào</h3>
        <p className="pm-empty-sub">Thử thay đổi bộ lọc hoặc thêm sản phẩm mới</p>
        {onAdd && (
          <button className="pm-btn pm-btn-primary" onClick={onAdd} type="button" style={{ marginTop: 12 }}>
            <Plus size={15} />
            Thêm sản phẩm
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="pm-product-grid">
      {products.map((product) => {
        const minP = getMinPrice(product);
        const maxP = getMaxPrice(product);
        const colors = getUniqueColors(product).slice(0, 6);
        const extraColors = getUniqueColors(product).length - 6;
        const isNew = isNewProduct(product);
        const { label: stockLabel, cls: stockCls, pct } = stockInfo(product.totalStock);
        const isSelected = selectedIds.has(product.id);

        return (
          <div key={product.id} className={`pm-grid-card ${isSelected ? 'pm-grid-card-selected' : ''}`}>
            {/* Image area */}
            <div className="pm-grid-img-wrap">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="pm-grid-img" />
              ) : (
                <div className="pm-grid-img-fallback">
                  <Package size={40} />
                </div>
              )}

              {/* Status badge */}
              <div className="pm-grid-badge">
                <StatusBadge status={product.status} />
              </div>

              {/* Checkbox */}
              <div className={`pm-grid-check ${isSelected ? 'visible' : ''}`}>
                <input
                  type="checkbox"
                  className="pm-checkbox"
                  checked={isSelected}
                  onChange={() => onToggleSelect(product.id)}
                />
              </div>

              {/* Hover actions overlay */}
              <div className="pm-grid-hover-actions">
                <button
                  className="pm-bulk-btn pm-bulk-btn-outline"
                  onClick={() => onView(product)}
                  type="button"
                  title="Xem chi tiết"
                >
                  <Eye size={13} /> Xem
                </button>
                <button
                  className="pm-bulk-btn pm-bulk-btn-outline"
                  onClick={() => onEdit(product)}
                  type="button"
                  title="Chỉnh sửa"
                >
                  <Edit size={13} /> Sửa
                </button>
              </div>
            </div>

            {/* Card body */}
            <div className="pm-grid-body">
              <div className="pm-grid-brand">{product.brand?.name}</div>
              <div className="pm-grid-name">
                {product.name}
                {isNew && <span className="pm-badge-new" style={{ marginLeft: 4 }}>MỚI</span>}
              </div>
              {product.sku && (
                <div className="pm-product-sku" style={{ marginTop: 2 }}>SKU: {product.sku}</div>
              )}

              {/* Tag chips */}
              {(product.tags || []).length > 0 && (
                <div style={{ marginTop: 6, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {product.tags.map((tag) =>
                    TAG_MAP[tag] ? (
                      <span key={tag} className={`pm-tag ${TAG_MAP[tag].cls}`}>
                        {TAG_MAP[tag].label}
                      </span>
                    ) : null
                  )}
                </div>
              )}

              {/* Color dots */}
              {colors.length > 0 && (
                <div style={{ display: 'flex', gap: 4, marginTop: 8, alignItems: 'center' }}>
                  {colors.map((c) => (
                    <span
                      key={c.id}
                      style={{
                        width: 14, height: 14, borderRadius: '50%',
                        background: c.code, border: '1px solid rgba(0,0,0,0.12)',
                      }}
                      title={c.name}
                    />
                  ))}
                  {extraColors > 0 && (
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>+{extraColors}</span>
                  )}
                </div>
              )}

              {/* Price + variants */}
              <div className="pm-grid-stats">
                <span className="pm-grid-price">
                  {minP === maxP
                    ? formatPriceShort(minP)
                    : `${formatPriceShort(minP)} – ${formatPriceShort(maxP)}`}
                </span>
                <span className="pm-grid-variants">{product.totalVariants} biến thể</span>
              </div>

              {/* Stock bar */}
              <div className="pm-grid-stock-bar">
                <div
                  className="pm-grid-stock-fill"
                  style={{ width: `${pct}%`, background: STOCK_COLORS[stockCls] }}
                />
              </div>
              <div className={`pm-grid-stock-label ${stockCls}`}>{stockLabel}</div>
            </div>

            {/* Footer */}
            <div className="pm-grid-footer">
              <button
                style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 0 }}
                onClick={() => onEdit(product)}
                type="button"
              >
                Sửa nhanh
              </button>
              <button
                className="pm-btn-icon"
                title="Xóa sản phẩm"
                onClick={() => onDelete(product)}
                type="button"
                style={{ color: '#ef4444' }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProductGrid;
