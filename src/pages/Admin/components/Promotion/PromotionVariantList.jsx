import React, { useState, useEffect, useCallback } from 'react';
import {
    Search, RefreshCw, Plus, Trash2, ImageIcon,
} from 'lucide-react';
import { promotionAPI } from '../../../../services/api';

const formatCurrency = (amount) => {
    if (amount == null) return '-';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const PromotionVariantList = ({ promotionId, promotion, onAddVariants }) => {
    const [variants, setVariants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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

    useEffect(() => { loadVariants(); }, [loadVariants]);

    const handleRemove = async (variant) => {
        if (!window.confirm(`Bỏ sản phẩm "${variant.productName} - ${variant.sizeName} / ${variant.colorName}" khỏi đợt giảm giá?`)) return;
        try {
            await promotionAPI.removeVariant(promotionId, variant.variantId);
            setVariants((prev) => prev.filter((v) => v.promotionDetailId !== variant.promotionDetailId));
        } catch (err) {
            alert('Không thể xóa. Vui lòng thử lại.');
            console.error('Error removing variant:', err);
        }
    };

    const handleRemoveAll = async () => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa TẤT CẢ sản phẩm khỏi đợt giảm giá này?')) return;
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

    /* loading */
    if (loading) {
        return (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>
                Đang tải danh sách sản phẩm...
            </div>
        );
    }

    /* error */
    if (error) {
        return (
            <div style={{ padding: 40, textAlign: 'center' }}>
                <p style={{ color: 'var(--danger-500)', marginBottom: 12 }}>{error}</p>
                <button className="pm-btn pm-btn-outline pm-btn-sm" onClick={loadVariants}>Thử lại</button>
            </div>
        );
    }

    return (
        <div>
            {/* header row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
                <div className="pm-search-box" style={{ flex: 1, minWidth: 180 }}>
                    <span className="pm-search-icon"><Search size={14} /></span>
                    <input
                        type="text"
                        placeholder="Tìm sản phẩm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="pm-btn pm-btn-primary pm-btn-sm" onClick={onAddVariants}>
                    <Plus size={14} /> Thêm sản phẩm
                </button>
                {variants.length > 0 && (
                    <button className="pm-btn pm-btn-danger-outline pm-btn-sm" onClick={handleRemoveAll}>
                        <Trash2 size={14} /> Xóa tất cả
                    </button>
                )}
            </div>

            {/* promo summary */}
            {promotion && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                    background: 'var(--primary-50)', borderRadius: 8, marginBottom: 12, fontSize: 13,
                }}>
                    <span style={{ fontWeight: 600, color: 'var(--primary-700)' }}>
                        {promotion.discountPercentage
                            ? `Giảm ${promotion.discountPercentage}%`
                            : 'Chưa có phần trăm giảm'}
                    </span>
                    <span style={{ color: 'var(--gray-500)' }}>
                        — Nếu sản phẩm có giá cố định riêng, giá đó sẽ được ưu tiên.
                    </span>
                </div>
            )}

            {/* table */}
            <div style={{ overflowX: 'auto' }}>
                <table className="pm-table" style={{ minWidth: 640 }}>
                    <thead>
                        <tr>
                            <th style={{ width: 50 }}>Ảnh</th>
                            <th>Sản phẩm</th>
                            <th>Code</th>
                            <th>SKU</th>
                            <th>Size</th>
                            <th>Màu</th>
                            <th>Giá gốc</th>
                            <th>Giá KM</th>
                            <th>Giảm %</th>
                            <th>Tồn kho</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan="11" style={{ textAlign: 'center', padding: 30, color: 'var(--gray-400)' }}>
                                    {variants.length === 0 ? 'Chưa có sản phẩm nào' : 'Không tìm thấy sản phẩm phù hợp'}
                                </td>
                            </tr>
                        ) : (
                            filtered.map((v) => (
                                <tr key={v.promotionDetailId}>
                                    <td>
                                        {v.productImageUrl ? (
                                            <img
                                                src={v.productImageUrl}
                                                alt={v.productName}
                                                className="pm-product-img"
                                            />
                                        ) : (
                                            <div className="pm-product-img" style={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: 'var(--gray-400)',
                                            }}>
                                                <ImageIcon size={18} />
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ fontWeight: 500 }}>{v.productName}</td>
                                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{v.productCode || v.code || '—'}</td>
                                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{v.sku || v.variantSku || '—'}</td>
                                    <td>{v.sizeName}</td>
                                    <td>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            {v.colorCode && (
                                                <span className="pm-color-dot" style={{ backgroundColor: v.colorCode }} />
                                            )}
                                            {v.colorName}
                                        </span>
                                    </td>
                                    <td>{formatCurrency(v.originalPrice)}</td>
                                    <td style={{ fontWeight: 700, color: 'var(--danger-500)' }}>
                                        {v.promotionPrice != null ? formatCurrency(v.promotionPrice) : '-'}
                                    </td>
                                    <td style={{ color: 'var(--success-600)', fontWeight: 600 }}>
                                        {v.discountPercentage != null ? `${v.discountPercentage}%` : '-'}
                                    </td>
                                    <td>{v.stock ?? '-'}</td>
                                    <td>
                                        <div className="pm-actions">
                                            <button className="pm-action-btn" aria-label="Delete" title="Xóa" onClick={() => handleRemove(v)}>
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

            {/* refresh */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
                <button className="pm-btn pm-btn-outline pm-btn-sm" onClick={loadVariants}>
                    <RefreshCw size={14} /> Làm mới
                </button>
            </div>
        </div>
    );
};

export default PromotionVariantList;
