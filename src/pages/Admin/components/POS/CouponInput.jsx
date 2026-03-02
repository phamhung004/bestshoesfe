import React, { useState, useEffect, useCallback, useRef } from 'react';
import { formatVND } from './posUtils';
import { posAPI, couponAPI } from '../../../../services/api';
import CouponPickerDrawer from '../../../../components/common/CouponPickerDrawer';

/**
 * CouponInput — coupon code input + server-side validation via API.
 * Enhanced with: coupon ticket card, picker drawer, expiry timer, animations.
 */
const CouponInput = ({ subtotal, appliedCoupon, setAppliedCoupon, setDiscountAmount }) => {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [validating, setValidating] = useState(false);
    const [showPicker, setShowPicker] = useState(false);
    const [countdown, setCountdown] = useState('');
    const errorTimerRef = useRef(null);

    // ── Expiry countdown & auto-remove ────────────────────
    useEffect(() => {
        if (!appliedCoupon?.endDate) {
            setCountdown('');
            return;
        }

        const check = () => {
            const end = new Date(appliedCoupon.endDate).getTime();
            const now = Date.now();
            const diff = end - now;

            if (diff <= 0) {
                // Coupon expired — auto-remove
                setAppliedCoupon(null);
                setDiscountAmount(0);
                setError('Mã giảm giá đã hết hạn');
                setCountdown('');
                return false;
            }

            // Show countdown when < 30 minutes
            if (diff < 30 * 60 * 1000) {
                const mins = Math.floor(diff / 60000);
                const secs = Math.floor((diff % 60000) / 1000);
                setCountdown(`Còn ${mins}:${String(secs).padStart(2, '0')}`);
            } else {
                setCountdown('');
            }
            return true;
        };

        if (!check()) return;
        const interval = setInterval(() => {
            if (!check()) clearInterval(interval);
        }, 1000);

        return () => clearInterval(interval);
    }, [appliedCoupon, setAppliedCoupon, setDiscountAmount]);

    // ── Auto-dismiss error ────────────────────────────────
    useEffect(() => {
        if (error) {
            clearTimeout(errorTimerRef.current);
            errorTimerRef.current = setTimeout(() => setError(''), 5000);
        }
        return () => clearTimeout(errorTimerRef.current);
    }, [error]);

    // ── Apply coupon via code ─────────────────────────────
    const handleApply = async () => {
        if (validating) return; // debounce guard
        setError('');
        const trimmed = code.trim().toUpperCase();
        if (!trimmed) return;

        setValidating(true);
        try {
            const res = await posAPI.validateCoupon(trimmed, subtotal);
            const couponData = res.data;

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

    // ── Apply coupon from picker ──────────────────────────
    const handlePickerSelect = useCallback(async (coupon) => {
        setShowPicker(false);
        setError('');
        setValidating(true);

        try {
            const res = await posAPI.validateCoupon(coupon.code, subtotal);
            const couponData = res.data;

            if (!couponData.valid) {
                setError(couponData.message || 'Mã giảm giá không hợp lệ');
                return;
            }

            setAppliedCoupon(couponData);
            setDiscountAmount(couponData.discountAmount || 0);
            setCode('');
        } catch (err) {
            setError('Không thể áp dụng mã giảm giá');
        } finally {
            setValidating(false);
        }
    }, [subtotal, setAppliedCoupon, setDiscountAmount]);

    // ── Fetch coupons for picker (POS uses admin API) ─────
    const fetchCoupons = useCallback(async (orderAmount) => {
        return couponAPI.getAvailable(orderAmount);
    }, []);

    const handleRemove = () => {
        setAppliedCoupon(null);
        setDiscountAmount(0);
        setError('');
        setCountdown('');
    };

    const formatDate = (d) => {
        if (!d) return '';
        return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
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
                            {validating ? <span className="pos-coupon-spinner" /> : 'Áp dụng'}
                        </button>
                        <button
                            className="pos-coupon-browse-btn"
                            onClick={() => setShowPicker(true)}
                            title="Xem mã giảm giá khả dụng"
                            disabled={validating}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>
                        </button>
                    </div>
                    {error && <div className={`pos-coupon-error ${error ? 'shake' : ''}`}>{error}</div>}
                </>
            ) : (
                <div className="pos-coupon-ticket">
                    {/* Left stub */}
                    <div className={`pos-coupon-ticket-left ${appliedCoupon.type === 'Percentage' ? 'pct' : 'fixed'}`}>
                        <span className="pos-coupon-ticket-value">
                            {appliedCoupon.type === 'Percentage' ? `${appliedCoupon.value}%` : formatVND(appliedCoupon.value)}
                        </span>
                        <span className="pos-coupon-ticket-type">GIẢM</span>
                    </div>
                    {/* Right info */}
                    <div className="pos-coupon-ticket-right">
                        <div className="pos-coupon-ticket-header">
                            <span className="pos-coupon-ticket-code">{appliedCoupon.code}</span>
                            <button className="pos-coupon-remove" onClick={handleRemove} aria-label="Xóa mã giảm giá">×</button>
                        </div>
                        <span className="pos-coupon-ticket-name">{appliedCoupon.name}</span>
                        <div className="pos-coupon-ticket-meta">
                            {appliedCoupon.discountAmount > 0 && (
                                <span className="pos-coupon-saving">−{formatVND(appliedCoupon.discountAmount)}</span>
                            )}
                            {appliedCoupon.endDate && (
                                <span className="pos-coupon-expiry">HSD: {formatDate(appliedCoupon.endDate)}</span>
                            )}
                        </div>
                        {countdown && (
                            <div className="pos-coupon-countdown">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                {countdown}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Coupon picker drawer */}
            <CouponPickerDrawer
                open={showPicker}
                onClose={() => setShowPicker(false)}
                onSelect={handlePickerSelect}
                subtotal={subtotal}
                fetchCoupons={fetchCoupons}
                appliedCode={appliedCoupon?.code}
            />
        </div>
    );
};

export default CouponInput;
