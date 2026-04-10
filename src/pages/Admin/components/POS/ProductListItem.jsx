import React from 'react';
import { Plus, AlertTriangle } from 'lucide-react';
import { formatVND, getPriceRange, hasPromotion, getEffectivePrice } from './posUtils';
import { usePOS } from './POSContext';

/**
 * ProductListItem — compact horizontal row for list-view mode.
 * [40px img] [name + brand] [price] [stock] [+ button]
 */
const ProductListItem = ({ product, onCardClick, onQuickAdd, pulseId }) => {
    const { getBrandName } = usePOS();
    const activeVariants = product.variants.filter(v => v.status === 'ACTIVE');
    const brandName = getBrandName(product.brandId);
    const priceRange = getPriceRange(activeVariants);
    const hasPromo = hasPromotion(activeVariants);
    const totalStock = activeVariants.reduce((sum, v) => sum + (v.stock || 0), 0);
    const lowStock = totalStock > 0 && totalStock < 5;

    const handleQuickAdd = (e) => {
        e.stopPropagation();
        const inStock = activeVariants.filter(v => v.stock > 0);
        if (inStock.length === 0) return;
        const cheapest = inStock.reduce((a, b) =>
            getEffectivePrice(a) < getEffectivePrice(b) ? a : b
        );
        onQuickAdd(product, cheapest);
    };

    const isPulsing = pulseId === product.productId;

    return (
        <div
            className={`pos-list-item${isPulsing ? ' pulse-green' : ''}${totalStock === 0 ? ' out-of-stock' : ''}`}
            onClick={() => onCardClick(product)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onCardClick(product)}
        >
            <img
                className="pos-list-item-img"
                src={product.imageUrl || '/images/product-placeholder.svg'}
                alt={product.name}
                loading="lazy"
                onError={(e) => { e.target.onerror = null; e.target.src = '/images/product-placeholder.svg'; }}
            />
            <div className="pos-list-item-info">
                <span className="pos-list-item-name">{product.name}</span>
                <span className="pos-list-item-brand">{brandName}</span>
                <span style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' }}>
                    Mã SP: {product.code || product.productCode || '—'}
                </span>
            </div>
            <div className={`pos-list-item-price${hasPromo ? ' has-promo' : ''}`}>{priceRange}</div>
            <div className="pos-list-item-stock">
                {totalStock === 0 ? (
                    <span className="stock-empty">Hết</span>
                ) : lowStock ? (
                    <span className="stock-low"><AlertTriangle size={12} /> {totalStock}</span>
                ) : (
                    <span className="stock-ok">{totalStock}</span>
                )}
            </div>
            <button
                className="pos-list-item-add"
                onClick={handleQuickAdd}
                disabled={totalStock === 0}
                aria-label={`Thêm ${product.name}`}
            >
                <Plus size={16} />
            </button>
        </div>
    );
};

export default ProductListItem;
