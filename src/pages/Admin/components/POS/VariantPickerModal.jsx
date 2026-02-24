import React, { useState, useMemo } from 'react';
import { formatVND, getSizeName, getColor, getBrandName, sizes, colors } from './mockPOSData';

/**
 * VariantPickerModal — size × color picker for a product.
 * Shows available variants, price, stock, quantity stepper, add-to-cart.
 */
const VariantPickerModal = ({ product, onClose, onAddToCart }) => {
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);
    const [quantity, setQuantity] = useState(1);

    const activeVariants = product.variants.filter(v => v.status === 1);

    // Unique sizes and colors available for this product
    const availableSizeIds = [...new Set(activeVariants.map(v => v.size_id))];
    const availableColorIds = [...new Set(activeVariants.map(v => v.color_id))];
    const productSizes = sizes.filter(s => availableSizeIds.includes(s.size_id));
    const productColors = colors.filter(c => availableColorIds.includes(c.color_id));

    // Find selected variant
    const selectedVariant = useMemo(() => {
        if (!selectedSize || !selectedColor) return null;
        return activeVariants.find(v => v.size_id === selectedSize && v.color_id === selectedColor) || null;
    }, [selectedSize, selectedColor, activeVariants]);

    // Check if a size+color combination exists
    const hasVariant = (sizeId, colorId) =>
        activeVariants.some(v => v.size_id === sizeId && v.color_id === colorId);

    // Check if a size has any available colors
    const sizeHasStock = (sizeId) =>
        activeVariants.some(v => v.size_id === sizeId && v.stock > 0);

    const colorHasStock = (colorId) =>
        activeVariants.some(v => v.color_id === colorId && v.stock > 0 && (!selectedSize || v.size_id === selectedSize));

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
                    <img className="pos-modal-thumb" src={product.image_url} alt={product.name} />
                    <div>
                        <div className="pos-modal-title">{product.name}</div>
                        <div className="pos-modal-brand">{getBrandName(product.brand_id)}</div>
                    </div>
                    <button className="pos-modal-close" onClick={onClose} aria-label="Đóng">×</button>
                </div>

                <div className="pos-modal-body">
                    {/* Size selector */}
                    <div className="pos-modal-section">
                        <div className="pos-modal-label">Kích cỡ</div>
                        <div className="pos-modal-sizes">
                            {productSizes.map(s => {
                                const hasStock = sizeHasStock(s.size_id);
                                return (
                                    <button
                                        key={s.size_id}
                                        className={`pos-modal-size-btn${selectedSize === s.size_id ? ' active' : ''}${!hasStock ? ' disabled' : ''}`}
                                        onClick={() => hasStock && setSelectedSize(s.size_id)}
                                        disabled={!hasStock}
                                    >
                                        {s.size_name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Color selector */}
                    <div className="pos-modal-section">
                        <div className="pos-modal-label">Màu sắc</div>
                        <div className="pos-modal-colors">
                            {productColors.map(c => {
                                const hasStock = colorHasStock(c.color_id);
                                return (
                                    <button
                                        key={c.color_id}
                                        className={`pos-modal-color-btn${selectedColor === c.color_id ? ' active' : ''}${!hasStock ? ' disabled' : ''}`}
                                        onClick={() => hasStock && setSelectedColor(c.color_id)}
                                        disabled={!hasStock}
                                    >
                                        <span className="pos-modal-color-swatch" style={{ background: c.color_code }} />
                                        {c.color_name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Selected variant info */}
                    {selectedVariant && (
                        <div className="pos-modal-variant-info">
                            <span className="pos-modal-variant-price">{formatVND(selectedVariant.price)}</span>
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
                        Thêm vào giỏ {selectedVariant ? `— ${formatVND(selectedVariant.price * quantity)}` : ''}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VariantPickerModal;
