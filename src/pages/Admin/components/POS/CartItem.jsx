import React, { useState } from 'react';
import { formatVND, getSizeName, getColor } from './mockPOSData';

/**
 * CartItem — single row in the order cart.
 */
const CartItem = ({ item, onUpdateQty, onRemove }) => {
    const [removing, setRemoving] = useState(false);
    const color = getColor(item.color_id);

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
                src={item.image_url}
                alt={item.productName}
            />
            <div className="pos-cart-item-info">
                <div className="pos-cart-item-name">{item.productName}</div>
                <div className="pos-cart-item-variant">
                    Size: {getSizeName(item.size_id)} / Màu: {color.color_name}
                </div>
                <div className="pos-cart-item-price">{formatVND(item.unit_price)}</div>
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
                {formatVND(item.unit_price * item.quantity)}
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
