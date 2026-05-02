import React, { useState, useRef } from 'react';
import { Zap, Trash2, Plus, X, Loader2 } from 'lucide-react';
import { MOCK_SIZES, MOCK_COLORS } from '../../mockProducts';
import { formatPrice } from '../../../../../utils/formatPrice';
import { sizeAPI, colorAPI } from '../../../../../services/api';

/** Normalise a size object from either mock or API format */
const normSize = (s) =>
  typeof s === 'string'
    ? { id: null, name: s }
    : { id: s.sizeId ?? s.id ?? null, name: s.sizeName ?? s.name };

/** Normalise a color object from either mock or API format */
const normalizeColorCode = (code) => {
  if (!code) return '#cccccc';
  const trimmed = String(code).trim();
  return trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
};

const normColor = (c) => ({
  id:   c.colorId   ?? c.id,
  name: c.colorName ?? c.name,
  code: normalizeColorCode(c.colorCode ?? c.code),
});

/** Generate variant combinations (additive — preserves existing) */
const generateVariants = (sizes, colors, existing) => {
  const map = new Map(
    existing.map((v) => {
      const vSizeName = typeof v.size === 'object' ? v.size?.name : (v.sizeName || v.size);
      const vColorName = v.color?.name || v.colorName || v.color;
      return [`${vSizeName}-${vColorName}`, v];
    })
  );
  return sizes.flatMap((size) =>
    colors.map((color) => {
      const vSizeName = size.name;
      const vColorName = color.name;
      return map.get(`${vSizeName}-${vColorName}`) || {
        id: `new-${Date.now()}-${Math.random().toString(36).slice(2)}-${vSizeName}-${vColorName}`,
        size:    size.name,
        sizeId:  size.id,
        color,
        colorId: color.id,
        price: '',
        costPrice: '',
        stock: '',
        weight: '',
        status: 'ACTIVE',
        images: [],
      };
    })
  );
};

const calcMargin = (price, costPrice) => {
  const p = parseFloat(price);
  const c = parseFloat(costPrice);
  if (!p || !c || p === 0) return null;
  return ((p - c) / p) * 100;
};

const MarginBadge = ({ price, costPrice }) => {
  const margin = calcMargin(price, costPrice);
  if (margin === null) return null;
  const cls = margin < 0 ? 'bad' : margin < 10 ? 'ok' : 'good';
  const label = margin < 0 ? `Lỗ ${Math.abs(margin).toFixed(0)}%` : `Lãi ${margin.toFixed(0)}%`;
  return <span className={`pm-profit ${cls}`}>{label}</span>;
};

/**
 * TabVariants
 *
 * Props:
 *   variants        Variant[]
 *   onChange        (variants) => void
 *   errors          { variants? }
 *   sizes           Size[]   from API (optional, falls back to MOCK_SIZES)
 *   colors          Color[]  from API (optional, falls back to MOCK_COLORS)
 *   onSizeCreated   (size)  => void  — notify parent when a new size is saved to DB
 *   onColorCreated  (color) => void  — notify parent when a new color is saved to DB
 */
const TabVariants = ({ variants = [], onChange, errors = {}, sizes: sizeProp, colors: colorProp, onSizeCreated, onColorCreated }) => {
  // Normalise sizes and colors — prefer real API data, fall back to mock
  const [allSizes,  setAllSizes]  = useState(() => (sizeProp  && sizeProp.length  ? sizeProp  : MOCK_SIZES ).map(normSize));
  const [allColors, setAllColors] = useState(() => (colorProp && colorProp.length ? colorProp : MOCK_COLORS).map(normColor));

  // Quick-add size state
  const [showAddSize,    setShowAddSize]    = useState(false);
  const [newSizeName,    setNewSizeName]    = useState('');
  const [addingSizeLoading, setAddingSizeLoading] = useState(false);
  const [sizeAddError,   setSizeAddError]   = useState('');
  const sizeInputRef = useRef(null);

  // Quick-add color state
  const [showAddColor,      setShowAddColor]      = useState(false);
  const [newColorName,      setNewColorName]      = useState('');
  const [newColorCode,      setNewColorCode]      = useState('#000000');
  const [addingColorLoading, setAddingColorLoading] = useState(false);
  const [colorAddError,     setColorAddError]     = useState('');
  const colorNameInputRef = useRef(null);

  const [selectedSizes, setSelectedSizes] = useState(
    () => {
      const names = new Set(variants.map((v) => v.size));
      return allSizes.filter((s) => names.has(s.name));
    }
  );
  const [selectedColors, setSelectedColors] = useState(
    () => {
      const colorNames = new Set(variants.map((v) => v.color?.name));
      return allColors.filter((c) => colorNames.has(c.name));
    }
  );

  // Bulk edit state
  const [bulkPrice, setBulkPrice] = useState('');
  const [bulkCost,  setBulkCost]  = useState('');
  const [bulkStock, setBulkStock] = useState('');

  const handleAddSize = async () => {
    const name = newSizeName.trim();
    if (!name) return;
    if (allSizes.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
      setNewSizeName('');
      setShowAddSize(false);
      return;
    }
    setAddingSizeLoading(true);
    setSizeAddError('');
    try {
      const res = await sizeAPI.create({ sizeName: name, status: true });
      const saved = res?.data ?? res;
      const newSize = normSize(saved);
      setAllSizes((prev) => [...prev, newSize]);
      setSelectedSizes((prev) => [...prev, newSize]);
      setNewSizeName('');
      setShowAddSize(false);
      if (onSizeCreated) onSizeCreated(saved);
    } catch (err) {
      setSizeAddError(err?.response?.data?.message || 'Không thể thêm size. Vui lòng thử lại.');
    } finally {
      setAddingSizeLoading(false);
    }
  };

  const handleAddColor = async () => {
    const name = newColorName.trim();
    if (!name) return;
    if (allColors.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      setNewColorName('');
      setShowAddColor(false);
      return;
    }
    setAddingColorLoading(true);
    setColorAddError('');
    try {
      const res = await colorAPI.create({ colorName: name, colorCode: newColorCode, status: true });
      const saved = res?.data ?? res;
      const newColor = normColor(saved);
      setAllColors((prev) => [...prev, newColor]);
      setSelectedColors((prev) => [...prev, newColor]);
      setNewColorName('');
      setNewColorCode('#000000');
      setShowAddColor(false);
      if (onColorCreated) onColorCreated(saved);
    } catch (err) {
      setColorAddError(err?.response?.data?.message || 'Không thể thêm màu. Vui lòng thử lại.');
    } finally {
      setAddingColorLoading(false);
    }
  };

  const toggleSize = (size) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (color) => {
    setSelectedColors((prev) => {
      const exists = prev.some((c) => c.id === color.id);
      return exists ? prev.filter((c) => c.id !== color.id) : [...prev, color];
    });
  };

  const handleGenerate = () => {
    if (selectedSizes.length === 0 || selectedColors.length === 0) return;
    const generated = generateVariants(selectedSizes, selectedColors, variants);
    onChange(generated);
  };

  const handleUpdateField = (variantId, field, value) => {
    onChange(variants.map((v) => (v.id === variantId ? { ...v, [field]: value } : v)));
  };

  const handleDeleteVariant = (variantId) => {
    onChange(variants.filter((v) => v.id !== variantId));
  };

  const handleAddManual = () => {
    const firstColor = allColors[0] ?? { id: null, name: 'Mặc định', code: '#cccccc' };
    const firstSize  = allSizes[0]  ?? { id: null, name: '40' };
    onChange([
      ...variants,
      {
        id: `new-manual-${Date.now()}`,
        size:    firstSize.name,
        sizeId:  firstSize.id,
        color:   firstColor,
        colorId: firstColor.id,
        price: '',
        costPrice: '',
        stock: '',
        weight: '',
        status: 'ACTIVE',
        images: [],
      },
    ]);
  };

  const handleBulkApply = () => {
    onChange(
      variants.map((v) => ({
        ...v,
        price:     bulkPrice !== '' && v.price === '' ? bulkPrice : v.price,
        costPrice: bulkCost  !== '' && v.costPrice === '' ? bulkCost : v.costPrice,
        stock:     bulkStock !== '' && v.stock === '' ? bulkStock : v.stock,
      }))
    );
  };

  // Summary stats
  const validPrices = variants.map((v) => parseFloat(v.price)).filter((p) => !isNaN(p) && p > 0);
  const totalStock  = variants.reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0);
  const avgMargin   = (() => {
    const margins = variants
      .map((v) => calcMargin(v.price, v.costPrice))
      .filter((m) => m !== null);
    return margins.length ? margins.reduce((a, b) => a + b, 0) / margins.length : null;
  })();

  return (
    <div>
      {/* Step 1 — Sizes */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
            1. Chọn kích thước có sẵn
          </span>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
              onClick={() => setSelectedSizes([...allSizes])}
            >
              Chọn tất cả
            </button>
            <button
              type="button"
              style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
              onClick={() => setSelectedSizes([])}
            >
              Bỏ chọn tất cả
            </button>
          </div>
        </div>
        <div className="pm-size-grid">
          {allSizes.map((size) => (
            <button
              key={size.name}
              type="button"
              className={`pm-size-chip ${selectedSizes.some((s) => s.name === size.name) ? 'selected' : ''}`}
              onClick={() => toggleSize(size)}
            >
              {size.name}
            </button>
          ))}
        </div>

        {/* Quick-add size */}
        {showAddSize ? (
          <div>
            <div className="pm-quick-add-row">
              <input
                ref={sizeInputRef}
                className="pm-quick-add-input"
                placeholder="Tên size (vd: 46)"
                value={newSizeName}
                disabled={addingSizeLoading}
                onChange={(e) => { setNewSizeName(e.target.value); setSizeAddError(''); }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); handleAddSize(); }
                  if (e.key === 'Escape') { setShowAddSize(false); setNewSizeName(''); setSizeAddError(''); }
                }}
                autoFocus
              />
              <button
                type="button"
                className="pm-quick-add-confirm"
                onClick={handleAddSize}
                disabled={addingSizeLoading || !newSizeName.trim()}
              >
                {addingSizeLoading ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : 'Thêm'}
              </button>
              <button type="button" className="pm-quick-add-cancel" disabled={addingSizeLoading} onClick={() => { setShowAddSize(false); setNewSizeName(''); setSizeAddError(''); }}>
                <X size={13} />
              </button>
            </div>
            {sizeAddError && <div className="pm-quick-add-error">{sizeAddError}</div>}
          </div>
        ) : (
          <button
            type="button"
            className="pm-quick-add-trigger"
            onClick={() => { setShowAddSize(true); setTimeout(() => sizeInputRef.current?.focus(), 50); }}
          >
            <Plus size={12} /> Thêm size mới
          </button>
        )}
      </div>

      {/* Step 2 — Colors */}
      <div style={{ marginBottom: 20 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: 10 }}>
          2. Chọn màu sắc có sẵn
        </span>
        <div className="pm-color-grid">
          {allColors.map((color) => {
            const selected = selectedColors.some((c) => c.id === color.id);
            return (
              <button
                key={color.id}
                type="button"
                className={`pm-color-swatch-btn ${selected ? 'selected' : ''}`}
                onClick={() => toggleColor(color)}
                title={color.name}
              >
                <span
                  className="pm-color-swatch-inner"
                  style={{
                    background: color.code,
                    border: ['#fff', '#ffffff', '#f5f5f5'].includes((color.code || '').toLowerCase())
                      ? '1px solid #e2e8f0'
                      : 'none',
                  }}
                />
              </button>
            );
          })}
        </div>

        {/* Quick-add color */}
        {showAddColor ? (
          <div>
            <div className="pm-quick-add-row">
              <input
                type="color"
                className="pm-quick-add-color-picker"
                value={newColorCode}
                disabled={addingColorLoading}
                onChange={(e) => setNewColorCode(e.target.value)}
                title="Chọn màu"
              />
              <input
                ref={colorNameInputRef}
                className="pm-quick-add-input"
                placeholder="Tên màu (vd: Nâu đất)"
                value={newColorName}
                disabled={addingColorLoading}
                onChange={(e) => { setNewColorName(e.target.value); setColorAddError(''); }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); handleAddColor(); }
                  if (e.key === 'Escape') { setShowAddColor(false); setNewColorName(''); setNewColorCode('#000000'); setColorAddError(''); }
                }}
                autoFocus
              />
              <button
                type="button"
                className="pm-quick-add-confirm"
                onClick={handleAddColor}
                disabled={addingColorLoading || !newColorName.trim()}
              >
                {addingColorLoading ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : 'Thêm'}
              </button>
              <button type="button" className="pm-quick-add-cancel" disabled={addingColorLoading} onClick={() => { setShowAddColor(false); setNewColorName(''); setNewColorCode('#000000'); setColorAddError(''); }}>
                <X size={13} />
              </button>
            </div>
            {colorAddError && <div className="pm-quick-add-error">{colorAddError}</div>}
          </div>
        ) : (
          <button
            type="button"
            className="pm-quick-add-trigger"
            onClick={() => { setShowAddColor(true); setTimeout(() => colorNameInputRef.current?.focus(), 50); }}
          >
            <Plus size={12} /> Thêm màu mới
          </button>
        )}
        {selectedColors.length > 0 && (
          <div style={{ marginTop: 8, fontSize: 12, color: '#64748b' }}>
            Đã chọn: {selectedColors.map((c) => c.name).join(', ')}
          </div>
        )}
      </div>

      {/* Step 3 — Generate */}
      <div className="pm-generate-btn-wrap">
        <button
          type="button"
          className="pm-btn pm-btn-primary"
          disabled={selectedSizes.length === 0 || selectedColors.length === 0}
          onClick={handleGenerate}
        >
          <Zap size={15} />
          {variants.length > 0 ? 'Cập nhật biến thể' : `Tạo ${selectedSizes.length * selectedColors.length} biến thể`}
        </button>
        {selectedSizes.length > 0 && selectedColors.length > 0 && (
          <span style={{ fontSize: 13, color: '#64748b' }}>
            Sẽ tạo {selectedSizes.length * selectedColors.length} biến thể từ{' '}
            {selectedSizes.length} size × {selectedColors.length} màu
          </span>
        )}
      </div>

      {errors.variants && (
        <div className="pm-field-error" style={{ marginBottom: 12 }}>{errors.variants}</div>
      )}

      {/* Variant table */}
      {variants.length > 0 && (
        <>
          {/* Bulk edit bar */}
          <div className="pm-bulk-edit-bar">
            <span className="pm-bulk-edit-label">Áp dụng cho tất cả:</span>
            <input
              className="pm-bulk-edit-input"
              placeholder="Giá bán (₫)"
              type="number"
              min={0}
              value={bulkPrice}
              onChange={(e) => setBulkPrice(e.target.value)}
            />
            <input
              className="pm-bulk-edit-input"
              placeholder="Giá vốn (₫)"
              type="number"
              min={0}
              value={bulkCost}
              onChange={(e) => setBulkCost(e.target.value)}
            />
            <input
              className="pm-bulk-edit-input"
              placeholder="Tồn kho"
              type="number"
              min={0}
              value={bulkStock}
              onChange={(e) => setBulkStock(e.target.value)}
            />
            <button
              type="button"
              className="pm-btn pm-btn-primary pm-btn-sm"
              onClick={handleBulkApply}
            >
              → Áp dụng
            </button>
          </div>

          <div className="pm-variant-tbl-wrap">
            <table className="pm-variant-tbl">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Size</th>
                  <th>Màu</th>
                  <th style={{ minWidth: 110 }}>Giá bán (₫)</th>
                  <th style={{ minWidth: 110 }}>Giá vốn (₫)</th>
                  <th style={{ width: 80 }}>Tồn kho</th>
                  <th style={{ width: 90 }}>Khối lượng (g)</th>
                  <th style={{ width: 120 }}>Trạng thái bán</th>
                  <th style={{ width: 40 }} />
                </tr>
              </thead>
              <tbody>
                {variants.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: 12 }}>
                        {v.sku || v.variantSku || '—'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, fontSize: 13 }}>{v.size}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span
                          style={{
                            width: 14, height: 14, borderRadius: '50%',
                            background: v.color.code,
                            border: v.color.code === '#f5f5f5' ? '1px solid #e2e8f0' : '1px solid rgba(0,0,0,0.1)',
                            flexShrink: 0,
                          }}
                        />
                        <span style={{ fontSize: 13 }}>{v.color.name}</span>
                      </div>
                    </td>
                    <td>
                      <input
                        className="pm-inline-input"
                        type="number"
                        min={0}
                        placeholder="0"
                        value={v.price}
                        onChange={(e) => handleUpdateField(v.id, 'price', e.target.value)}
                      />
                      <MarginBadge price={v.price} costPrice={v.costPrice} />
                    </td>
                    <td>
                      <input
                        className="pm-inline-input"
                        type="number"
                        min={0}
                        placeholder="0"
                        value={v.costPrice}
                        onChange={(e) => handleUpdateField(v.id, 'costPrice', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        className="pm-inline-input"
                        type="number"
                        min={0}
                        placeholder="0"
                        value={v.stock}
                        onChange={(e) => handleUpdateField(v.id, 'stock', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        className="pm-inline-input"
                        type="number"
                        min={0}
                        placeholder="0"
                        value={v.weight}
                        onChange={(e) => handleUpdateField(v.id, 'weight', e.target.value)}
                      />
                    </td>
                    <td>
                      <label className="pm-variant-status-toggle">
                        <input
                          type="checkbox"
                          checked={(v.status || 'ACTIVE') === 'ACTIVE'}
                          onChange={(e) => handleUpdateField(v.id, 'status', e.target.checked ? 'ACTIVE' : 'INACTIVE')}
                        />
                        <span className="pm-variant-status-track" />
                        <span className="pm-variant-status-text">
                          {(v.status || 'ACTIVE') === 'ACTIVE' ? 'Đang bán' : 'Ngừng bán'}
                        </span>
                      </label>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="pm-btn-icon"
                        style={{ color: '#ef4444' }}
                        title="Xóa biến thể này"
                        onClick={() => handleDeleteVariant(v.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add manual variant */}
          <button
            type="button"
            className="pm-btn pm-btn-outline pm-btn-sm"
            style={{ marginTop: 10 }}
            onClick={handleAddManual}
          >
            <Plus size={13} />
            Thêm biến thể thủ công
          </button>

          {/* Summary stats */}
          <div className="pm-variant-stats">
            <div className="pm-variant-stat">
              <label>Tổng biến thể</label>
              <span>{variants.length}</span>
            </div>
            <div className="pm-variant-stat">
              <label>Tổng tồn kho</label>
              <span>{totalStock}</span>
            </div>
            {validPrices.length > 0 && (
              <>
                <div className="pm-variant-stat">
                  <label>Giá thấp nhất</label>
                  <span className="indigo">{formatPrice(Math.min(...validPrices))}</span>
                </div>
                <div className="pm-variant-stat">
                  <label>Giá cao nhất</label>
                  <span className="indigo">{formatPrice(Math.max(...validPrices))}</span>
                </div>
              </>
            )}
            {avgMargin !== null && (
              <div className="pm-variant-stat">
                <label>Lãi TB</label>
                <span className="green">{avgMargin.toFixed(1)}%</span>
              </div>
            )}
          </div>
        </>
      )}

      {variants.length === 0 && (
        <div style={{ textAlign: 'center', padding: '32px 20px', color: '#94a3b8' }}>
          <Zap size={40} style={{ margin: '0 auto 12px', color: '#c7d2fe' }} />
          <div style={{ fontSize: 14, fontWeight: 600, color: '#64748b' }}>
            Chọn size và màu sắc để tạo biến thể
          </div>
          <div style={{ fontSize: 13, marginTop: 4 }}>
            Hệ thống sẽ tự động tạo tất cả tổ hợp
          </div>
        </div>
      )}
    </div>
  );
};

export default TabVariants;
