// --- ADDED: OrderSummaryItem ---
// Reusable order-summary line item that visually flags out-of-stock products.

import React from 'react';
import { formatVND, getItemSubtotal } from '../checkoutConstants';

/**
 * OrderSummaryItem
 *
 * @param {object}   item          - Cart item object
 * @param {boolean}  isOutOfStock  - When true, renders with red border, strikethrough price,
 *                                   "Hết hàng" badge and an inline [Xóa] button
 * @param {function} onRemove      - Called when user clicks the inline remove button
 */
const OrderSummaryItem = ({ item, isOutOfStock = false, onRemove }) => {
    const basePrice = (item.variant?.price || 0) * item.quantity;
    const effectivePrice = getItemSubtotal(item);
    const hasPromo = item.promotion && effectivePrice < basePrice;

    return (
        <div className={`co-item-row${isOutOfStock ? ' co-item-row--oos' : ''}`}>
            {/* Product image with quantity badge */}
            <div className="co-item-img-wrap">
                <img src={item.image_url} alt={item.product.name} />
                {item.quantity > 1 && (
                    <span className="co-item-qty-badge">{item.quantity}</span>
                )}
                {/* "Hết hàng" badge overlaid on image when out-of-stock */}
                {isOutOfStock && (
                    <span className="co-item-oos-badge" aria-label="Hết hàng">Hết hàng</span>
                )}
            </div>

            {/* Product info */}
            <div className="co-item-info">
                <p className={`co-item-name${isOutOfStock ? ' co-item-name--oos' : ''}`}>
                    {item.product.name}
                </p>
                <p className="co-item-variant">
                    Size {item.variant.size_name} · {item.variant.color_name}
                </p>
                {hasPromo && !isOutOfStock && (
                    <p className="co-item-promo-label">🏷️ {item.promotion.name}</p>
                )}
                {/* Inline [Xóa] button for out-of-stock items */}
                {isOutOfStock && onRemove && (
                    <button
                        type="button"
                        className="co-item-remove-btn"
                        onClick={() => onRemove(item)}
                        aria-label={`Xóa ${item.product.name} khỏi giỏ hàng`}
                    >
                        Xóa
                    </button>
                )}
            </div>

            {/* Price — strike-through when out-of-stock */}
            <div className="co-item-price-wrap">
                {(hasPromo || isOutOfStock) && (
                    <span className="co-item-price-original">{formatVND(basePrice)}</span>
                )}
                <span className={`co-item-price${hasPromo && !isOutOfStock ? ' promo' : ''}${isOutOfStock ? ' co-item-price--oos' : ''}`}>
                    {formatVND(effectivePrice)}
                </span>
            </div>
        </div>
    );
};

export default OrderSummaryItem;
