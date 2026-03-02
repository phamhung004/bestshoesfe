import React, { useState } from 'react';
import { formatVND } from './posUtils';
import { usePOS } from './POSContext';

/**
 * CartItem — single row in the order cart.
 */
const CartItem = ({ item, onUpdateQty, onRemove }) => {
    const { getSizeName, getColor } = usePOS();
    const [removing, setRemoving] = useState(false);
    const color = getColor(item.colorId);

    const handleRemove = () => {
        setRemoving(true);
        setTimeout(() => onRemove(item.cartKey), 300);
    };

    return (
        <div
            className={`pos-cart-item${removing ? ' removing' : ''}`}
            tabIndex={0}
            onKeyDown={e => e.key === 'Delete' && handleRemove()}
        >
            <img
                className="pos-cart-item-img"
                src={item.imageUrl}
                alt={item.productName}
            />
            <div className="pos-cart-item-info">
                <div className="pos-cart-item-name">{item.productName}</div>
                <div className="pos-cart-item-variant">
                    Size: {getSizeName(item.sizeId)} / Màu: {color.colorName}
                </div>
                <div className="pos-cart-item-price">
                    {formatVND(item.unitPrice)}
                    {item.originalPrice && item.unitPrice < item.originalPrice && (
                        <span className="pos-cart-item-original-price">
                            {formatVND(item.originalPrice)}
                        </span>
                    )}
                </div>
                {item.promotionName && (
                    <div className="pos-cart-item-promo-tag">
                        🏷️ {item.promotionName}
                        {item.discountPercentage ? ` (-${item.discountPercentage}%)` : ''}
                    </div>
                )}
            </div>

            <div className="pos-cart-item-qty">
                <div className="pos-qty-stepper">
                    <button
                        className="pos-qty-btn"
                        onClick={() => onUpdateQty(item.cartKey, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        aria-label="Giảm số lượng"
                    >−</button>
                    <span className="pos-qty-value">{item.quantity}</span>
                    <button
                        className="pos-qty-btn"
                        onClick={() => onUpdateQty(item.cartKey, item.quantity + 1)}
                        aria-label="Tăng số lượng"
                    >+</button>
                </div>
            </div>

            <div className="pos-cart-item-total">
                {formatVND(item.unitPrice * item.quantity)}
            </div>

            <button
                className="pos-cart-item-remove"
                onClick={handleRemove}
                aria-label={`Xóa ${item.productName}`}
            >×</button>
        </div>
    );
};

export default CartItem;
