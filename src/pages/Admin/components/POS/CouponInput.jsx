import React, { useState } from 'react';
import { formatVND } from './posUtils';
import { posAPI } from '../../../../services/api';

/**
 * CouponInput — coupon code input + server-side validation via API.
 */
const CouponInput = ({ subtotal, appliedCoupon, setAppliedCoupon, setDiscountAmount }) => {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [validating, setValidating] = useState(false);

    const handleApply = async () => {
        setError('');
        const trimmed = code.trim().toUpperCase();
        if (!trimmed) return;

        setValidating(true);
        try {
            const res = await posAPI.validateCoupon(trimmed, subtotal);
            const couponData = res.data; // POSCouponResponse

            if (!couponData.valid) {
                setError(couponData.message || 'Mã giảm giá không hợp lệ');
                return;
            }

            setAppliedCoupon(couponData);
            setDiscountAmount(couponData.discountAmount || 0);
            setCode('');
        } catch (err) {
            console.error('Coupon validation failed:', err);
            const msg = err.response?.data?.message || 'Không thể xác thực mã giảm giá';
            setError(msg);
        } finally {
            setValidating(false);
        }
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
                            disabled={validating}
                        />
                        <button
                            className="pos-coupon-apply-btn"
                            onClick={handleApply}
                            disabled={validating}
                        >
                            {validating ? '...' : 'Áp dụng'}
                        </button>
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
