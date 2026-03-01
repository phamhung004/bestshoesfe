import React, { useState } from 'react';
import { formatVND } from '../checkoutConstants';

const CouponSection = ({
    coupon,
    discountAmount,
    couponCode,
    couponLoading,
    couponError,
    onCouponCodeChange,
    onApplyCoupon,
    onRemoveCoupon,
}) => {
    const [showInput, setShowInput] = useState(false);

    // Coupon already applied
    if (coupon) {
        return (
            <div className="co-coupon-row">
                <div className="co-coupon-left">
                    <span>🏷</span>
                    <span>{coupon.code} — {coupon.name}</span>
                    <button className="co-coupon-change" onClick={onRemoveCoupon}>Xóa</button>
                </div>
                <span className="co-coupon-discount">−{formatVND(discountAmount)}</span>
            </div>
        );
    }

    // Show input form
    if (showInput) {
        return (
            <div className="co-coupon-input-wrap">
                <div className="co-coupon-input-row">
                    <input
                        type="text"
                        className="co-form-input"
                        placeholder="Nhập mã giảm giá"
                        value={couponCode || ''}
                        onChange={(e) => onCouponCodeChange(e.target.value)}
                        disabled={couponLoading}
                    />
                    <button
                        className="co-coupon-apply-btn"
                        onClick={() => onApplyCoupon(couponCode)}
                        disabled={couponLoading || !couponCode?.trim()}
                    >
                        {couponLoading ? 'Đang kiểm tra...' : 'Áp dụng'}
                    </button>
                </div>
                {couponError && (
                    <p className="co-form-error" style={{ marginTop: 4 }}>⚠ {couponError}</p>
                )}
                <button
                    className="co-coupon-cancel-link"
                    onClick={() => setShowInput(false)}
                    style={{ marginTop: 4, fontSize: 13, color: '#888', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                    Hủy
                </button>
            </div>
        );
    }

    // Default: show "add coupon" button
    return (
        <button className="co-coupon-add-link" onClick={() => setShowInput(true)}>
            🏷 Thêm mã giảm giá
        </button>
    );
};

export default CouponSection;
