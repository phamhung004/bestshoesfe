import React, { useState, useMemo } from 'react';
import { formatVND, getEffectivePrice } from './posUtils';
import { usePOS } from './POSContext';

/**
 * VariantPickerModal — size × color picker for a product.
 * Shows available variants, price, stock, quantity stepper, add-to-cart.
 */
const VariantPickerModal = ({ product, onClose, onAddToCart }) => {
    const { sizes, colors, getSizeName, getColor, getBrandName } = usePOS();
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);
    const [quantity, setQuantity] = useState(1);

    const activeVariants = product.variants.filter(v => v.status === 'ACTIVE');

    // Unique sizes and colors available for this product
    const availableSizeIds = [...new Set(activeVariants.map(v => v.sizeId))];
    const availableColorIds = [...new Set(activeVariants.map(v => v.colorId))];
    const productSizes = sizes.filter(s => availableSizeIds.includes(s.sizeId));
    const productColors = colors.filter(c => availableColorIds.includes(c.colorId));

    // Find selected variant
    const selectedVariant = useMemo(() => {
        if (!selectedSize || !selectedColor) return null;
        return activeVariants.find(v => v.sizeId === selectedSize && v.colorId === selectedColor) || null;
    }, [selectedSize, selectedColor, activeVariants]);

    // Check if a size+color combination exists
    const hasVariant = (sizeId, colorId) =>
        activeVariants.some(v => v.sizeId === sizeId && v.colorId === colorId);

    // Check if a size has any available colors
    const sizeHasStock = (sizeId) =>
        activeVariants.some(v => v.sizeId === sizeId && v.stock > 0);

    const colorHasStock = (colorId) =>
        activeVariants.some(v => v.colorId === colorId && v.stock > 0 && (!selectedSize || v.sizeId === selectedSize));

    const handleAdd = () => {
        if (!selectedVariant || selectedVariant.stock <= 0) return;
        onAddToCart(product, selectedVariant, quantity);
        onClose();
    };

    return (
        <div className="pos-modal-overlay" onClick={onClose}>
            <div className="pos-modal" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="pos-modal-header">
                    <img className="pos-modal-thumb" src={product.imageUrl} alt={product.name} />
                    <div>
                        <div className="pos-modal-title">{product.name}</div>
                        <div className="pos-modal-brand">{getBrandName(product.brandId)}</div>
                    </div>
                    <button className="pos-modal-close" onClick={onClose} aria-label="Đóng">×</button>
                </div>

                <div className="pos-modal-body">
                    {/* Size selector */}
                    <div className="pos-modal-section">
                        <div className="pos-modal-label">Kích cỡ</div>
                        <div className="pos-modal-sizes">
                            {productSizes.map(s => {
                                const hasStock = sizeHasStock(s.sizeId);
                                return (
                                    <button
                                        key={s.sizeId}
                                        className={`pos-modal-size-btn${selectedSize === s.sizeId ? ' active' : ''}${!hasStock ? ' disabled' : ''}`}
                                        onClick={() => hasStock && setSelectedSize(s.sizeId)}
                                        disabled={!hasStock}
                                    >
                                        {s.sizeName}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Color selector */}
                    <div className="pos-modal-section">
                        <div className="pos-modal-label">Màu sắc</div>
                        <div className="pos-modal-colors">
                            {Array.isArray(productColors) && productColors.map(c => {
                                const hasStock = colorHasStock(c.colorId);
                                return (
                                    <button
                                        key={c.colorId}
                                        className={`pos-modal-color-btn${selectedColor === c.colorId ? ' active' : ''}${!hasStock ? ' disabled' : ''}`}
                                        onClick={() => hasStock && setSelectedColor(c.colorId)}
                                        disabled={!hasStock}
                                    >
                                        <span className="pos-modal-color-swatch" style={{ background: c.colorCode }} />
                                        {c.colorName}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Selected variant info */}
                    {selectedVariant && (
                        <div className="pos-modal-variant-info">
                            {selectedVariant.promotionPrice != null ? (
                                <>
                                    <span className="pos-modal-variant-price promo">
                                        {formatVND(selectedVariant.promotionPrice)}
                                    </span>
                                    <span className="pos-modal-variant-original-price">
                                        {formatVND(selectedVariant.price)}
                                    </span>
                                    {selectedVariant.discountPercentage && (
                                        <span className="pos-modal-discount-badge">
                                            -{selectedVariant.discountPercentage}%
                                        </span>
                                    )}
                                    {selectedVariant.promotionName && (
                                        <span className="pos-modal-promo-name">
                                            {selectedVariant.promotionName}
                                        </span>
                                    )}
                                </>
                            ) : (
                                <span className="pos-modal-variant-price">{formatVND(selectedVariant.price)}</span>
                            )}
                            <span className={`pos-modal-variant-stock${selectedVariant.stock <= 0 ? ' out' : ''}`}>
                                {selectedVariant.stock > 0 ? `Còn ${selectedVariant.stock} sản phẩm` : 'Hết hàng'}
                            </span>
                        </div>
                    )}

                    {/* Quantity stepper */}
                    {selectedVariant && selectedVariant.stock > 0 && (
                        <div className="pos-modal-qty">
                            <div className="pos-modal-label" style={{ marginBottom: 0 }}>Số lượng</div>
                            <div className="pos-qty-stepper">
                                <button className="pos-qty-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1}>−</button>
                                <span className="pos-qty-value">{quantity}</span>
                                <button className="pos-qty-btn" onClick={() => setQuantity(q => Math.min(selectedVariant.stock, q + 1))} disabled={quantity >= selectedVariant.stock}>+</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="pos-modal-footer">
                    <button className="pos-modal-cancel-btn" onClick={onClose}>Đóng</button>
                    <button
                        className="pos-modal-add-btn"
                        onClick={handleAdd}
                        disabled={!selectedVariant || selectedVariant.stock <= 0}
                    >
                        Thêm vào giỏ {selectedVariant ? `— ${formatVND(getEffectivePrice(selectedVariant) * quantity)}` : ''}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VariantPickerModal;
