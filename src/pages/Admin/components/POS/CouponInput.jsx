import React, { useState } from 'react';
import { coupons, formatVND } from './mockPOSData';

/**
 * CouponInput — coupon code input + validation.
 */
const CouponInput = ({ subtotal, appliedCoupon, setAppliedCoupon, setDiscountAmount }) => {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');

    const handleApply = () => {
        setError('');
        const trimmed = code.trim().toUpperCase();
        if (!trimmed) return;

        // Find coupon
        const coupon = coupons.find(c => c.code === trimmed);
        if (!coupon) { setError('Mã giảm giá không tồn tại'); return; }
        if (coupon.status !== 1) { setError('Mã giảm giá đã hết hiệu lực'); return; }

        // Check date range
        const now = new Date();
        if (now < new Date(coupon.start_date) || now > new Date(coupon.end_date)) {
            setError('Mã giảm giá đã hết hạn'); return;
        }

        // Check minimum amount
        if (subtotal < coupon.minimum_amount) {
            setError(`Đơn hàng tối thiểu ${formatVND(coupon.minimum_amount)} để sử dụng mã này`);
            return;
        }

        // Calculate discount
        let discount = 0;
        if (coupon.type === 'Percentage') {
            discount = subtotal * (coupon.value / 100);
            if (coupon.maximum_discount && discount > coupon.maximum_discount) {
                discount = coupon.maximum_discount;
            }
        } else {
            discount = coupon.value;
        }

        setAppliedCoupon(coupon);
        setDiscountAmount(discount);
        setCode('');
    };

    const handleRemove = () => {
        setAppliedCoupon(null);
        setDiscountAmount(0);
        setError('');
    };

    return (
        <div className="pos-coupon-section">
            {!appliedCoupon ? (
                <>
                    <div className="pos-coupon-row">
                        <input
                            placeholder="Nhập mã giảm giá"
                            value={code}
                            onChange={e => setCode(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleApply()}
                            aria-label="Mã giảm giá"
                        />
                        <button className="pos-coupon-apply-btn" onClick={handleApply}>Áp dụng</button>
                    </div>
                    {error && <div className="pos-coupon-error">{error}</div>}
                </>
            ) : (
                <div className="pos-coupon-success">
                    <span>🎉</span>
                    <span>Mã <strong>{appliedCoupon.code}</strong> — {appliedCoupon.name}</span>
                    <button className="pos-coupon-remove" onClick={handleRemove} aria-label="Xóa mã giảm giá">×</button>
                </div>
            )}
        </div>
    );
};

export default CouponInput;
