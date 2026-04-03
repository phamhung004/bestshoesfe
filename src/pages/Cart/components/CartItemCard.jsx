import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatVND, getItemPrice, getItemSubtotal } from '../mockCartData';

const CartItemCard = ({
    item,
    isSelected,
    onToggleSelect,
    onQtyChange,
    onRemove,
    onSave,
    confirmDeleteId,
    onConfirmDelete,
    onCancelDelete,
    animationDelay = 0,
}) => {
    const colorName = item.variant?.color_name || '';
    const colorCode = item.variant?.color_code || '#ccc';
    const sizeName = item.variant?.size_name || '';
    const brandName = item.product?.brand_name || '';
    const unitPrice = getItemPrice(item);
    const subtotal = getItemSubtotal(item);
    const hasPromo = item.promotion && (item.promotion.discount_percentage || item.promotion.promotion_price != null);
    const isLowStock = item.variant.stock <= 5;
    const isConfirming = confirmDeleteId === item.cart_item_id;

    return (
        <div
            className={`cart-item-card ${isSelected ? 'selected-bg' : ''}`}
            style={{ animationDelay: `${animationDelay}ms` }}
        >
            <div className="cart-item-top">
                {/* Checkbox */}
                <div className="cart-item-checkbox">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(item.cart_item_id)}
                    />
                </div>

                {/* Product Image */}
                <div className="cart-item-image-wrap">
                    <img src={item.image_url} alt={item.product.name} />
                    {hasPromo && (
                        <span className="cart-item-image-promo-badge">
                            {item.promotion.discount_percentage
                                ? `−${item.promotion.discount_percentage}%`
                                : 'KM'}
                        </span>
                    )}
                </div>

                {/* Details */}
                <div className="cart-item-details">
                    <div className="cart-item-brand">{brandName}</div>
                    <h3 className="cart-item-name">
                        <Link to={`/products/${item.product.product_id}`} className="cart-item-name-link">
                            {item.product.name}
                        </Link>
                    </h3>
                    <div className="cart-item-variant-row">
                        <span
                            className="cart-item-color-dot"
                            style={{ backgroundColor: colorCode }}
                        />
                        <span>{colorName}</span>
                        <span className="cart-item-variant-sep">·</span>
                        <span>Size: {sizeName}</span>
                        <span className="cart-item-variant-sep">·</span>
                        <span className="cart-item-gender-chip">{item.gender}</span>
                    </div>
                    {isLowStock ? (
                        <div className="cart-item-stock low-stock">⚠ Chỉ còn {item.variant.stock} sản phẩm</div>
                    ) : (
                        <div className="cart-item-stock in-stock">✓ Còn hàng</div>
                    )}
                </div>

                {/* Subtotal */}
                <div className="cart-item-subtotal">
                    <div className="cart-item-subtotal-label">Thành tiền</div>
                    {hasPromo ? (
                        <>
                            <div className="cart-item-subtotal-price sale">{formatVND(subtotal)}</div>
                            <div className="cart-item-original-price">{formatVND(item.variant.price * item.quantity)}</div>
                            {item.promotion.discount_percentage && (
                                <span className="cart-item-discount-badge">−{item.promotion.discount_percentage}%</span>
                            )}
                            {item.promotion.name && (
                                <div className="cart-item-promo-name">🏷️ {item.promotion.name}</div>
                            )}
                        </>
                    ) : (
                        <div className="cart-item-subtotal-price">{formatVND(subtotal)}</div>
                    )}
                </div>
            </div>

            {/* Bottom row */}
            <div className="cart-item-bottom">
                {/* Quantity Stepper */}
                <div className="cart-qty-stepper">
                    <button
                        className="cart-qty-btn minus"
                        onClick={() => onQtyChange(item.cart_item_id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                    >
                        −
                    </button>
                    <input
                        className="cart-qty-value"
                        type="number"
                        min={1}
                        max={item.variant.stock}
                        value={item.quantity}
                        onChange={e => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val) && val >= 1 && val <= item.variant.stock) {
                                onQtyChange(item.cart_item_id, val);
                            }
                        }}
                        onBlur={e => {
                            const val = parseInt(e.target.value, 10);
                            const clamped = isNaN(val) || val < 1 ? 1 : Math.min(item.variant.stock, val);
                            onQtyChange(item.cart_item_id, clamped);
                        }}
                        aria-label="Số lượng"
                    />
                    <button
                        className="cart-qty-btn plus"
                        onClick={() => onQtyChange(item.cart_item_id, item.quantity + 1)}
                        disabled={item.quantity >= item.variant.stock}
                    >
                        +
                    </button>
                </div>

                {/* Actions */}
                <div className="cart-item-actions">
                    <button className="cart-action-btn save" onClick={() => onSave(item.cart_item_id)}>
                        💾 Lưu lại
                    </button>
                    <span className="cart-action-divider">|</span>
                    <button className="cart-action-btn delete" onClick={() => onConfirmDelete(item.cart_item_id)}>
                        🗑 Xóa
                    </button>
                </div>
            </div>

            {/* Inline Confirm */}
            {isConfirming && (
                <div className="cart-inline-confirm">
                    <span className="cart-inline-confirm-text">Xóa sản phẩm này?</span>
                    <button className="cart-inline-confirm-btn confirm" onClick={() => onRemove(item.cart_item_id)}>
                        Xác nhận
                    </button>
                    <button className="cart-inline-confirm-btn cancel" onClick={onCancelDelete}>
                        Hủy
                    </button>
                </div>
            )}
        </div>
    );
};

export default CartItemCard;
