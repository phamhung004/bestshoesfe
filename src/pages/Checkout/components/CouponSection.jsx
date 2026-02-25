import React from 'react';
import { formatVND } from '../mockCheckoutData';

const CouponSection = ({ coupon, discountAmount }) => {
    if (!coupon) {
        return (
            <button className="co-coupon-add-link">
                🏷 Thêm mã giảm giá
            </button>
        );
    }

    return (
        <div className="co-coupon-row">
            <div className="co-coupon-left">
                <span>🏷</span>
                <span>{coupon.code} — {coupon.name}</span>
                <button className="co-coupon-change">Đổi mã</button>
            </div>
            <span className="co-coupon-discount">−{formatVND(discountAmount)}</span>
        </div>
    );
};

export default CouponSection;
