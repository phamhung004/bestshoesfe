import React from 'react';
import { formatVND } from './posUtils';

/**
 * OrderSummary — pricing breakdown: subtotal, shipping, discount, total.
 * Now shows coupon code & type info in the discount line.
 */
const OrderSummary = ({ subtotal, discountAmount, appliedCoupon }) => {
    const total = subtotal - discountAmount;

    // Build discount label with coupon details
    const getDiscountLabel = () => {
        if (!appliedCoupon) return 'Giảm giá:';
        const code = appliedCoupon.code || '';
        const typeStr = appliedCoupon.type === 'Percentage'
            ? `${appliedCoupon.value}%`
            : formatVND(appliedCoupon.value);
        return `Giảm giá (${code} − ${typeStr}):`;
    };

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
                    <span className="pos-summary-discount-label">{getDiscountLabel()}</span>
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
