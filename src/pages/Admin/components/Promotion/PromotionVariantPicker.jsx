import React, { useState, useEffect, useCallback } from 'react';
import {
    X, Search, ChevronDown, ChevronRight, Check, ImageIcon,
} from 'lucide-react';
import { productAPI, productVariantAPI, promotionAPI } from '../../../../services/api';

const formatCurrency = (amount) => {
    if (amount == null) return '-';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const getProductId = (product) => product.id || product.productId;

const PromotionVariantPicker = ({ promotionId, onClose, onSaved }) => {
    const [products, setProducts] = useState([]);
    const [expandedProduct, setExpandedProduct] = useState(null);
    const [variants, setVariants] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [loadingVariants, setLoadingVariants] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selected, setSelected] = useState({});
    const [saving, setSaving] = useState(false);
    const [existingVariantIds, setExistingVariantIds] = useState(new Set());

    const loadProducts = useCallback(async () => {
        try {
            setLoadingProducts(true);
            const response = await productAPI.getAll({ pageNum: 0, pageSize: 200 });
            // Backend returns: { status, message, data: { content: [...] } }
            const list = response?.data?.content || response?.content || response || [];
            setProducts(Array.isArray(list) ? list : []);
        } catch (err) {
            console.error('Error loading products:', err);
        } finally {
            setLoadingProducts(false);
        }
    }, []);

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
            if (copy[vid]) delete copy[vid];
            else copy[vid] = { variantId: vid, fixedPrice: null };
            return copy;
        });
    };

    const updateFixedPrice = (variantId, value) => {
        setSelected((prev) => ({
            ...prev,
            [variantId]: { ...prev[variantId], fixedPrice: value === '' ? null : Number(value) },
        }));
    };

    const handleSelectAllVariants = () => {
        const unselected = variants.filter((v) => {
            const vid = v.id || v.variantId;
            return !selected[vid] && !existingVariantIds.has(vid);
        });
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
        if (items.length === 0) { alert('Vui lòng chọn ít nhất 1 sản phẩm.'); return; }
        try {
            setSaving(true);
            await promotionAPI.addVariants(promotionId, items);
            onSaved?.();
            onClose();
        } catch (err) {
            alert('Không thể thêm sản phẩm. Vui lòng thử lại.');
            console.error('Error saving variants:', err);
        } finally {
            setSaving(false);
        }
    };

    const selectedCount = Object.keys(selected).length;

    const filteredProducts = products.filter((p) => {
        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase();
        return p.name?.toLowerCase().includes(q) || getProductId(p)?.toString().includes(q);
    });

    return (
        <div className="pm-picker-overlay" onClick={onClose}>
            <div className="pm-picker-modal" onClick={(e) => e.stopPropagation()}>
                {/* header */}
                <div className="pm-picker-header">
                    <h2>Chọn sản phẩm áp dụng khuyến mãi</h2>
                    <button className="pm-picker-close" onClick={onClose} aria-label="Đóng">
                        <X size={18} />
                    </button>
                </div>

                {/* search */}
                <div className="pm-picker-search">
                    <div className="pm-picker-search-wrapper">
                        <span className="pm-search-icon"><Search size={14} /></span>
                        <input
                            type="text"
                            placeholder="Tìm kiếm sản phẩm..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* body */}
                <div className="pm-picker-body">
                    {loadingProducts ? (
                        <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>
                            Đang tải danh sách sản phẩm...
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>
                            Không tìm thấy sản phẩm nào.
                        </div>
                    ) : (
                        filteredProducts.map((product) => (
                            <div key={getProductId(product)}>
                                {/* product row */}
                                <div
                                    className={`pm-picker-product-row ${expandedProduct === getProductId(product) ? 'expanded' : ''}`}
                                    onClick={() => handleExpandProduct(getProductId(product))}
                                >
                                    <span className="pm-picker-expand-icon">
                                        {expandedProduct === getProductId(product)
                                            ? <ChevronDown size={14} />
                                            : <ChevronRight size={14} />}
                                    </span>
                                    {product.imageUrl ? (
                                        <img className="pm-picker-product-thumb" src={product.imageUrl} alt={product.name} />
                                    ) : (
                                        <div className="pm-picker-product-thumb" style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: 'var(--gray-400)',
                                        }}>
                                            <ImageIcon size={18} />
                                        </div>
                                    )}
                                    <div className="pm-picker-product-info">
                                        <span className="pm-picker-product-name">{product.name}</span>
                                        <span className="pm-picker-product-sku">#{getProductId(product)}</span>
                                    </div>
                                </div>

                                {/* expanded variants */}
                                {expandedProduct === getProductId(product) && (
                                    <div className="pm-picker-variants-panel">
                                        {loadingVariants ? (
                                            <div style={{ padding: 16, textAlign: 'center', fontSize: 13, color: 'var(--gray-400)' }}>
                                                Đang tải biến thể...
                                            </div>
                                        ) : variants.length === 0 ? (
                                            <div style={{ padding: 16, textAlign: 'center', fontSize: 13, color: 'var(--gray-400)' }}>
                                                Không có biến thể nào.
                                            </div>
                                        ) : (
                                            <>
                                                <div style={{ padding: '8px 24px 8px 0' }}>
                                                    <button
                                                        className="pm-btn pm-btn-outline pm-btn-sm"
                                                        onClick={(e) => { e.stopPropagation(); handleSelectAllVariants(); }}
                                                    >
                                                        Chọn tất cả
                                                    </button>
                                                </div>
                                {variants.map((v) => {
                                                    const vid = v.id || v.variantId;
                                                    const isExisting = existingVariantIds.has(vid);
                                                    const isSelected = !!selected[vid];
                                                    return (
                                                        <div
                                                            key={vid}
                                                            className={`pm-picker-variant-row ${isSelected ? 'selected' : ''} ${isExisting ? 'existing' : ''}`}
                                                            onClick={() => !isExisting && toggleSelect(v)}
                                                        >
                                                            {isExisting ? (
                                                                <span title="Đã có trong đợt giảm giá" style={{ color: 'var(--success-500)' }}>
                                                                    <Check size={14} />
                                                                </span>
                                                            ) : (
                                                                <input
                                                                    type="checkbox"
                                                                    className="pm-picker-variant-checkbox"
                                                                    checked={isSelected}
                                                                    onChange={() => toggleSelect(v)}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                />
                                                            )}
                                                            {(v.imageUrl || v.productImageUrl || v.images?.[0]?.imageUrl) ? (
                                                                <img
                                                                    className="pm-picker-variant-thumb"
                                                                    src={v.imageUrl || v.productImageUrl || v.images?.[0]?.imageUrl}
                                                                    alt=""
                                                                />
                                                            ) : (
                                                                <div className="pm-picker-variant-thumb" style={{
                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                    color: 'var(--gray-400)',
                                                                }}>
                                                                    <ImageIcon size={14} />
                                                                </div>
                                                            )}
                                                            <span className="pm-picker-variant-name">
                                                                {v.productName || product.name}
                                                            </span>
                                                            <span className="pm-picker-variant-size">
                                                                {v.size || v.size?.name || v.sizeName || '-'}
                                                            </span>
                                                            <span className="pm-picker-variant-color">
                                                                {(v.color?.code || v.color?.colorCode || v.colorCode) && (
                                                                    <span
                                                                        className="pm-color-dot"
                                                                        style={{ backgroundColor: v.color?.code || v.color?.colorCode || v.colorCode }}
                                                                    />
                                                                )}
                                                                {v.color?.name || v.colorName || '-'}
                                                            </span>
                                                            <span className="pm-picker-variant-price">
                                                                {formatCurrency(v.price)}
                                                            </span>
                                                            <span className="pm-picker-variant-stock">
                                                                Kho: {v.stock ?? '-'}
                                                            </span>
                                                            {isSelected && (
                                                                <input
                                                                    type="number"
                                                                    className="pm-form-input"
                                                                    style={{ width: 100, padding: '3px 6px', fontSize: 12 }}
                                                                    placeholder="Giá cố định"
                                                                    value={selected[vid]?.fixedPrice ?? ''}
                                                                    onChange={(e) => updateFixedPrice(vid, e.target.value)}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    min="0"
                                                                />
                                                            )}
                                                            {isExisting && (
                                                                <span style={{
                                                                    fontSize: 11, fontWeight: 600, color: 'var(--gray-400)',
                                                                    background: 'var(--gray-100)', padding: '2px 8px',
                                                                    borderRadius: 10,
                                                                }}>
                                                                    Đã có
                                                                </span>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* footer */}
                <div className="pm-picker-footer">
                    <span className="pm-picker-footer-info">
                        Đã chọn: <strong>{selectedCount}</strong> biến thể
                    </span>
                    <div className="pm-picker-footer-actions">
                        <button className="pm-btn pm-btn-outline" onClick={onClose} disabled={saving}>
                            Hủy
                        </button>
                        <button
                            className="pm-btn pm-btn-primary"
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
