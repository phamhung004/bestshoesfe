import React from 'react';
import { formatVND } from '../checkoutConstants';

const PriceBreakdown = ({ subtotal, shippingCost, discountAmount, total }) => {
    return (
        <div className="co-price-rows">
            <div className="co-price-row">
                <span className="co-price-label">Tạm tính</span>
                <span className="co-price-value">{formatVND(subtotal)}</span>
            </div>
            <div className="co-price-row">
                <span className="co-price-label">Phí vận chuyển</span>
                <span className={`co-price-value ${shippingCost === 0 ? 'free' : ''}`}>
                    {shippingCost === 0 ? 'Miễn phí' : formatVND(shippingCost)}
                </span>
            </div>
            {discountAmount > 0 && (
                <div className="co-price-row">
                    <span className="co-price-label">Giảm giá</span>
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
