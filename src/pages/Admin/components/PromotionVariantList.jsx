import React, { useState, useEffect, useCallback } from 'react';
import { promotionAPI } from '../../../services/api';
import './PromotionVariantList.css';

const PromotionVariantList = ({ promotionId, promotion, onAddVariants }) => {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editFixedPrice, setEditFixedPrice] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const loadVariants = useCallback(async () => {
    if (!promotionId) return;
    try {
      setLoading(true);
      const data = await promotionAPI.getVariants(promotionId);
      setVariants(data);
      setError(null);
    } catch (err) {
      setError('Không thể tải danh sách sản phẩm áp dụng');
      console.error('Error loading promotion variants:', err);
    } finally {
      setLoading(false);
    }
  }, [promotionId]);

  useEffect(() => {
    loadVariants();
  }, [loadVariants]);

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '-';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const handleEditStart = (variant) => {
    setEditingId(variant.promotionDetailId);
    setEditFixedPrice(variant.fixedPrice ?? '');
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditFixedPrice('');
  };

  const handleEditSave = async (variant) => {
    try {
      const data = {
        variantId: variant.variantId,
        fixedPrice: editFixedPrice === '' ? null : Number(editFixedPrice),
      };
      await promotionAPI.updateVariant(variant.promotionDetailId, data);
      setEditingId(null);
      setEditFixedPrice('');
      loadVariants();
    } catch (err) {
      alert('Không thể cập nhật. Vui lòng thử lại.');
      console.error('Error updating variant:', err);
    }
  };

  const handleRemove = async (variant) => {
    if (
      !window.confirm(
        `Bỏ sản phẩm "${variant.productName} - ${variant.sizeName} / ${variant.colorName}" khỏi đợt giảm giá?`
      )
    )
      return;
    try {
      await promotionAPI.removeVariant(promotionId, variant.variantId);
      setVariants((prev) =>
        prev.filter((v) => v.promotionDetailId !== variant.promotionDetailId)
      );
    } catch (err) {
      alert('Không thể xóa. Vui lòng thử lại.');
      console.error('Error removing variant:', err);
    }
  };

  const handleRemoveAll = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa TẤT CẢ sản phẩm khỏi đợt giảm giá này?'))
      return;
    try {
      await promotionAPI.removeAllVariants(promotionId);
      setVariants([]);
    } catch (err) {
      alert('Không thể xóa tất cả. Vui lòng thử lại.');
      console.error('Error removing all variants:', err);
    }
  };

  const filtered = variants.filter((v) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      v.productName?.toLowerCase().includes(q) ||
      v.sizeName?.toLowerCase().includes(q) ||
      v.colorName?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="pv-list-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải danh sách sản phẩm...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pv-list-error">
        <p>{error}</p>
        <button onClick={loadVariants} className="btn-retry">Thử lại</button>
      </div>
    );
  }

  return (
    <div className="pv-list">
      <div className="pv-list-header">
        <div className="pv-header-left">
          <h3>Sản phẩm áp dụng ({variants.length})</h3>
        </div>
        <div className="pv-header-right">
          <div className="pv-search-box">
            <input
              type="text"
              placeholder="Tìm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pv-search-input"
            />
            <span className="pv-search-icon">🔍</span>
          </div>
          <button className="btn-primary pv-btn-add" onClick={onAddVariants}>
            + Thêm sản phẩm
          </button>
          {variants.length > 0 && (
            <button className="btn-danger pv-btn-remove-all" onClick={handleRemoveAll}>
              Xóa tất cả
            </button>
          )}
        </div>
      </div>

      {promotion && (
        <div className="pv-promo-summary">
          <span className="pv-promo-badge">
            {promotion.discountPercentage
              ? `Giảm ${promotion.discountPercentage}%`
              : promotion.discountAmount
              ? `Giảm ${formatCurrency(promotion.discountAmount)}`
              : 'Giá cố định theo SP'}
          </span>
          <span className="pv-promo-note">
            Nếu sản phẩm có giá cố định riêng, giá đó sẽ được ưu tiên.
          </span>
        </div>
      )}

      <div className="pv-table-container">
        <table className="pv-table">
          <thead>
            <tr>
              <th className="th-img">Ảnh</th>
              <th>Sản phẩm</th>
              <th>Size</th>
              <th>Màu</th>
              <th className="th-number">Giá gốc</th>
              <th className="th-number">Giá cố định</th>
              <th className="th-number">Giá KM</th>
              <th className="th-number">Giảm %</th>
              <th className="th-number">Tồn kho</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="10" className="pv-no-data">
                  {variants.length === 0
                    ? 'Chưa có sản phẩm nào được thêm vào đợt giảm giá này.'
                    : 'Không tìm thấy sản phẩm phù hợp.'}
                </td>
              </tr>
            ) : (
              filtered.map((v) => (
                <tr key={v.promotionDetailId}>
                  <td className="td-img">
                    {v.productImageUrl ? (
                      <img src={v.productImageUrl} alt={v.productName} className="pv-product-img" />
                    ) : (
                      <div className="pv-no-img">📷</div>
                    )}
                  </td>
                  <td className="td-name">{v.productName}</td>
                  <td>{v.sizeName}</td>
                  <td>
                    <span className="pv-color-cell">
                      {v.colorCode && (
                        <span
                          className="pv-color-dot"
                          style={{ backgroundColor: v.colorCode }}
                        ></span>
                      )}
                      {v.colorName}
                    </span>
                  </td>
                  <td className="td-number">{formatCurrency(v.originalPrice)}</td>
                  <td className="td-number">
                    {editingId === v.promotionDetailId ? (
                      <input
                        type="number"
                        className="pv-edit-input"
                        value={editFixedPrice}
                        onChange={(e) => setEditFixedPrice(e.target.value)}
                        placeholder="Bỏ trống = dùng % chung"
                        min="0"
                      />
                    ) : (
                      formatCurrency(v.fixedPrice)
                    )}
                  </td>
                  <td className="td-number td-promo-price">
                    {v.promotionPrice != null ? formatCurrency(v.promotionPrice) : '-'}
                  </td>
                  <td className="td-number td-discount">
                    {v.discountPercentage != null ? `${v.discountPercentage}%` : '-'}
                  </td>
                  <td className="td-number">{v.stock ?? '-'}</td>
                  <td>
                    <div className="pv-actions">
                      {editingId === v.promotionDetailId ? (
                        <>
                          <button
                            className="btn-save-sm"
                            onClick={() => handleEditSave(v)}
                            title="Lưu"
                          >
                            ✅
                          </button>
                          <button
                            className="btn-cancel-sm"
                            onClick={handleEditCancel}
                            title="Hủy"
                          >
                            ❌
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="btn-edit-sm"
                            onClick={() => handleEditStart(v)}
                            title="Sửa giá cố định"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-remove-sm"
                            onClick={() => handleRemove(v)}
                            title="Xóa"
                          >
                            🗑️
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="pv-refresh">
        <button className="btn-secondary" onClick={loadVariants}>
          🔄 Làm mới
        </button>
      </div>
    </div>
  );
};

export default PromotionVariantList;
