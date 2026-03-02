import React, { useState, useEffect, useCallback } from 'react';
import { productAPI, productVariantAPI, promotionAPI } from '../../../services/api';
import './PromotionVariantPicker.css';

const PromotionVariantPicker = ({ promotionId, onClose, onSaved }) => {
  const [products, setProducts] = useState([]);
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState({}); // { variantId: { variantId, fixedPrice } }
  const [saving, setSaving] = useState(false);
  const [existingVariantIds, setExistingVariantIds] = useState(new Set());

  // Load products list
  const loadProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);
      const data = await productAPI.getAll({ pageNum: 0, pageSize: 200 });
      const list = data?.content || data || [];
      setProducts(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  // Load already-assigned variant IDs so we can mark them
  const loadExistingVariants = useCallback(async () => {
    if (!promotionId) return;
    try {
      const data = await promotionAPI.getVariants(promotionId);
      setExistingVariantIds(new Set(data.map((v) => v.variantId)));
    } catch (err) {
      console.error('Error loading existing variants:', err);
    }
  }, [promotionId]);

  useEffect(() => {
    loadProducts();
    loadExistingVariants();
  }, [loadProducts, loadExistingVariants]);

  // Load variants when a product is expanded
  const handleExpandProduct = async (productId) => {
    if (expandedProduct === productId) {
      setExpandedProduct(null);
      setVariants([]);
      return;
    }
    setExpandedProduct(productId);
    setLoadingVariants(true);
    try {
      const response = await productVariantAPI.getByProduct(productId);
      // Handle both direct array and wrapped { status, message, data: [...] } responses
      const list = Array.isArray(response)
        ? response
        : response?.data?.content || response?.data || response?.content || [];
      setVariants(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Error loading variants:', err);
      setVariants([]);
    } finally {
      setLoadingVariants(false);
    }
  };

  const toggleSelect = (variant) => {
    setSelected((prev) => {
      const copy = { ...prev };
      const vid = variant.id || variant.variantId;
      if (copy[vid]) {
        delete copy[vid];
      } else {
        copy[vid] = { variantId: vid, fixedPrice: null };
      }
      return copy;
    });
  };

  const updateFixedPrice = (variantId, value) => {
    setSelected((prev) => ({
      ...prev,
      [variantId]: {
        ...prev[variantId],
        fixedPrice: value === '' ? null : Number(value),
      },
    }));
  };

  const handleSelectAllVariants = () => {
    const unselected = variants.filter(
      (v) => {
        const vid = v.id || v.variantId;
        return !selected[vid] && !existingVariantIds.has(vid);
      }
    );
    if (unselected.length === 0) return;
    setSelected((prev) => {
      const copy = { ...prev };
      unselected.forEach((v) => {
        const vid = v.id || v.variantId;
        copy[vid] = { variantId: vid, fixedPrice: null };
      });
      return copy;
    });
  };

  const handleSave = async () => {
    const items = Object.values(selected);
    if (items.length === 0) {
      alert('Vui lòng chọn ít nhất 1 sản phẩm.');
      return;
    }
    try {
      setSaving(true);
      await promotionAPI.addVariants(promotionId, items);
      onSaved && onSaved();
      onClose();
    } catch (err) {
      alert('Không thể thêm sản phẩm. Vui lòng thử lại.');
      console.error('Error saving variants:', err);
    } finally {
      setSaving(false);
    }
  };

  const selectedCount = Object.keys(selected).length;

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '-';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const filteredProducts = products.filter((p) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.productId?.toString().includes(q)
    );
  });

  return (
    <div className="pvp-overlay" onClick={onClose}>
      <div className="pvp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pvp-header">
          <h3>Chọn sản phẩm áp dụng khuyến mãi</h3>
          <button className="pvp-close" onClick={onClose}>&times;</button>
        </div>

        <div className="pvp-search">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pvp-search-input"
          />
        </div>

        <div className="pvp-body">
          {loadingProducts ? (
            <div className="pvp-loading">
              <div className="loading-spinner"></div>
              <p>Đang tải danh sách sản phẩm...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="pvp-empty">Không tìm thấy sản phẩm nào.</div>
          ) : (
            <div className="pvp-product-list">
              {filteredProducts.map((product) => (
                <div key={product.productId} className="pvp-product-item">
                  <div
                    className={`pvp-product-row ${
                      expandedProduct === product.productId ? 'expanded' : ''
                    }`}
                    onClick={() => handleExpandProduct(product.productId)}
                  >
                    <span className="pvp-expand-icon">
                      {expandedProduct === product.productId ? '▼' : '▶'}
                    </span>
                    <div className="pvp-product-img-wrap">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="pvp-product-img" />
                      ) : (
                        <div className="pvp-no-img">📷</div>
                      )}
                    </div>
                    <div className="pvp-product-info">
                      <span className="pvp-product-name">{product.name}</span>
                      <span className="pvp-product-id">#{product.productId}</span>
                    </div>
                  </div>

                  {expandedProduct === product.productId && (
                    <div className="pvp-variants-panel">
                      {loadingVariants ? (
                        <div className="pvp-loading-sm">Đang tải biến thể...</div>
                      ) : variants.length === 0 ? (
                        <div className="pvp-empty-sm">Không có biến thể nào.</div>
                      ) : (
                        <>
                          <div className="pvp-variant-actions">
                            <button
                              className="btn-secondary btn-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectAllVariants();
                              }}
                            >
                              Chọn tất cả
                            </button>
                          </div>
                          <table className="pvp-variant-table">
                            <thead>
                              <tr>
                                <th></th>
                                <th>Size</th>
                                <th>Màu</th>
                                <th>Giá</th>
                                <th>Tồn kho</th>
                                <th>Giá cố định (tùy chọn)</th>
                                <th>TT</th>
                              </tr>
                            </thead>
                            <tbody>
                              {variants.map((v) => {
                                const vid = v.id || v.variantId;
                                const isExisting = existingVariantIds.has(vid);
                                const isSelected = !!selected[vid];
                                return (
                                  <tr
                                    key={vid}
                                    className={`${isSelected ? 'selected-row' : ''} ${
                                      isExisting ? 'existing-row' : ''
                                    }`}
                                  >
                                    <td>
                                      {isExisting ? (
                                        <span title="Đã có trong đợt giảm giá" className="pvp-existing-badge">✓</span>
                                      ) : (
                                        <input
                                          type="checkbox"
                                          checked={isSelected}
                                          onChange={() => toggleSelect(v)}
                                        />
                                      )}
                                    </td>
                                    <td>{v.size || v.size?.name || v.sizeName || '-'}</td>
                                    <td>
                                      <span className="pvp-color-cell">
                                        {(v.color?.code || v.color?.colorCode || v.colorCode) && (
                                          <span
                                            className="pvp-color-dot"
                                            style={{ backgroundColor: v.color?.code || v.color?.colorCode || v.colorCode }}
                                          ></span>
                                        )}
                                        {v.color?.name || v.colorName || '-'}
                                      </span>
                                    </td>
                                    <td>{formatCurrency(v.price)}</td>
                                    <td>{v.stock ?? '-'}</td>
                                    <td>
                                      {isSelected ? (
                                        <input
                                          type="number"
                                          className="pvp-fixed-price-input"
                                          placeholder="Bỏ trống = dùng % chung"
                                          value={selected[vid]?.fixedPrice ?? ''}
                                          onChange={(e) =>
                                            updateFixedPrice(vid, e.target.value)
                                          }
                                          onClick={(e) => e.stopPropagation()}
                                          min="0"
                                        />
                                      ) : (
                                        '-'
                                      )}
                                    </td>
                                    <td>
                                      {isExisting ? (
                                        <span className="pvp-badge existing">Đã có</span>
                                      ) : v.status === 'active' || v.isActive ? (
                                        <span className="pvp-badge active">Active</span>
                                      ) : (
                                        <span className="pvp-badge inactive">Inactive</span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pvp-footer">
          <div className="pvp-selected-count">
            Đã chọn: <strong>{selectedCount}</strong> biến thể
          </div>
          <div className="pvp-footer-actions">
            <button className="btn-secondary" onClick={onClose} disabled={saving}>
              Hủy
            </button>
            <button
              className="btn-primary"
              onClick={handleSave}
              disabled={saving || selectedCount === 0}
            >
              {saving ? 'Đang lưu...' : `Thêm ${selectedCount} sản phẩm`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionVariantPicker;
