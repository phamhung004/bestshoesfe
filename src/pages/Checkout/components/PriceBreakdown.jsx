import React from 'react';
import { formatVND } from '../checkoutConstants';

const PriceBreakdown = ({ subtotal, shippingCost, discountAmount, total, couponState, shippingFeeLoading, shippingFeeError }) => {
    // Build discount label with coupon details
    const getDiscountLabel = () => {
        if (!couponState) return 'Giảm giá';
        const code = couponState.code || '';
        const typeStr = couponState.type === 'Percentage'
            ? `${couponState.value}%`
            : formatVND(couponState.value);
        return `Giảm giá (${code} − ${typeStr})`;
    };

    return (
        <div className="co-price-rows">
            <div className="co-price-row">
                <span className="co-price-label">Tạm tính</span>
                <span className="co-price-value">{formatVND(subtotal)}</span>
            </div>
            <div className="co-price-row">
                <span className="co-price-label">Phí vận chuyển</span>
                <span className={`co-price-value ${shippingCost === 0 && !shippingFeeLoading ? 'free' : ''}`}>
                    {shippingFeeLoading
                        ? 'Đang tính...'
                        : shippingFeeError
                            ? 'Lỗi tính phí'
                            : shippingCost === 0
                                ? 'Chọn địa chỉ để tính phí'
                                : formatVND(shippingCost)}
                </span>
            </div>
            {discountAmount > 0 && (
                <div className="co-price-row">
                    <span className="co-price-label co-price-discount-label">{getDiscountLabel()}</span>
                    <span className="co-price-value discount">−{formatVND(discountAmount)}</span>
                </div>
            )}

            <div className="co-price-total-row">
                <span className="co-price-total-label">TỔNG CỘNG</span>
                <span className="co-price-total-value">{formatVND(total)}</span>
            </div>
            <p className="co-price-vat">Đã bao gồm VAT (nếu có)</p>
        </div>
    );
};

export default PriceBreakdown;
