import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Tag, X, Ticket, Clock } from 'lucide-react';
import { formatVND } from './posUtils';
import { posAPI, couponAPI } from '../../../../services/api';
import CouponPickerDrawer from '../../../../components/common/CouponPickerDrawer';

/**
 * CouponInput — collapsible coupon section.
 * Collapsed: shows a small "Mã giảm giá" toggle or applied badge.
 * Expanded: shows input row + picker.
 */
const CouponInput = ({ subtotal, appliedCoupon, setAppliedCoupon, setDiscountAmount }) => {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [validating, setValidating] = useState(false);
    const [showPicker, setShowPicker] = useState(false);
    const [countdown, setCountdown] = useState('');
    const [expanded, setExpanded] = useState(false);
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
            {/* ── Applied coupon badge (always visible when applied) ── */}
            {appliedCoupon && (
                <div className="pos-coupon-applied-badge">
                    <Tag size={14} />
                    <span className="pos-coupon-badge-code">{appliedCoupon.code}</span>
                    <span className="pos-coupon-badge-saving">−{formatVND(appliedCoupon.discountAmount || 0)}</span>
                    {countdown && (
                        <span className="pos-coupon-badge-timer"><Clock size={12} /> {countdown}</span>
                    )}
                    <button className="pos-coupon-badge-remove" onClick={handleRemove} aria-label="Xóa mã giảm giá">
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* ── Collapsed toggle (no coupon applied) ── */}
            {!appliedCoupon && !expanded && (
                <button className="pos-coupon-toggle" onClick={() => setExpanded(true)}>
                    <Tag size={14} /> Mã giảm giá
                </button>
            )}

            {/* ── Expanded input (no coupon applied) ── */}
            {!appliedCoupon && expanded && (
                <>
                    <div className="pos-coupon-row">
                        <input
                            placeholder="Nhập mã giảm giá"
                            value={code}
                            onChange={e => setCode(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleApply()}
                            aria-label="Mã giảm giá"
                            disabled={validating}
                            autoFocus
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
                            <Ticket size={16} />
                        </button>
                        <button
                            className="pos-coupon-collapse-btn"
                            onClick={() => { setExpanded(false); setCode(''); setError(''); }}
                            title="Thu gọn"
                        >
                            <X size={14} />
                        </button>
                    </div>
                    {error && <div className={`pos-coupon-error ${error ? 'shake' : ''}`}>{error}</div>}
                </>
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
