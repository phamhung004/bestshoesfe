import React from 'react';
import { formatVND } from './posUtils';

/**
 * OrderSummary — pricing breakdown: subtotal, shipping, discount, total.
 */
const OrderSummary = ({ subtotal, discountAmount, appliedCoupon }) => {
    const total = subtotal - discountAmount;

    return (
        <div className="pos-order-summary">
            <div className="pos-summary-row">
                <span>Tạm tính:</span>
                <span>{formatVND(subtotal)}</span>
            </div>
            <div className="pos-summary-row">
                <span>Phí vận chuyển:</span>
                <span>0 ₫</span>
            </div>
            {discountAmount > 0 && (
                <div className="pos-summary-row discount">
                    <span>Giảm giá:</span>
                    <span>− {formatVND(discountAmount)}</span>
                </div>
            )}
            <div className="pos-summary-divider" />
            <div className="pos-summary-total">
                <span>TỔNG CỘNG:</span>
                <span className="pos-summary-total-amount">{formatVND(Math.max(0, total))}</span>
            </div>
        </div>
    );
};

export default OrderSummary;
