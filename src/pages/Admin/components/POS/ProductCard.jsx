import React from 'react';
import { formatVND, getPriceRange } from './posUtils';
import { usePOS } from './POSContext';

/**
 * ProductCard — individual product card in the POS grid.
 * Click card → opens variant modal; click button → adds cheapest variant.
 */
const ProductCard = ({ product, onCardClick, onQuickAdd, pulseId }) => {
    const { getBrandName, getSizeName, getColor } = usePOS();
    const activeVariants = product.variants.filter(v => v.status === 'ACTIVE');
    const brandName = getBrandName(product.brandId);
    const priceRange = getPriceRange(activeVariants);

    // Show first 3 variants as chips, rest as "+N more"
    const displayVariants = activeVariants.slice(0, 3);
    const moreCount = activeVariants.length - 3;

    // Quick add — cheapest available variant
    const handleQuickAdd = (e) => {
        e.stopPropagation();
        const inStock = activeVariants.filter(v => v.stock > 0);
        if (inStock.length === 0) return;
        // If only one variant, skip modal
        const cheapest = inStock.reduce((a, b) => a.price < b.price ? a : b);
        onQuickAdd(product, cheapest);
    };

    const isPulsing = pulseId === product.productId;

    return (
        <div
            className={`pos-product-card${isPulsing ? ' pulse-green' : ''}`}
            onClick={() => onCardClick(product)}
            role="button"
            tabIndex={0}
            aria-label={`Xem chi tiết ${product.name}`}
            onKeyDown={(e) => e.key === 'Enter' && onCardClick(product)}
        >
            <img
                className="pos-card-img"
                src={product.imageUrl}
                alt={product.name}
                loading="lazy"
            />
            <div className="pos-card-body">
                <div className="pos-card-name">{product.name}</div>
                <div className="pos-card-brand">{brandName}</div>
                <div className="pos-card-price">{priceRange}</div>

                <div className="pos-card-variants">
                    {displayVariants.map((v) => {
                        const color = getColor(v.colorId);
                        return (
                            <span key={v.variantId} className="pos-card-var-chip">
                                <span
                                    className="pos-card-var-dot"
                                    style={{ background: color.colorCode }}
                                />
                                {getSizeName(v.sizeId)}
                            </span>
                        );
                    })}
                    {moreCount > 0 && (
                        <span className="pos-card-more">+{moreCount}</span>
                    )}
                </div>

                <button
                    className="pos-card-add-btn"
                    onClick={handleQuickAdd}
                    aria-label={`Thêm ${product.name} vào giỏ`}
                >
                    Thêm vào giỏ
                </button>
            </div>
        </div>
    );
};

export default ProductCard;
