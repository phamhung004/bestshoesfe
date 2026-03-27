import React, { useState, useEffect, useCallback, useRef } from 'react';
import { formatVND } from '../checkoutConstants';
import { couponApi } from '../../../api/couponApi';
import CouponPickerDrawer from '../../../components/common/CouponPickerDrawer';

/**
 * CouponSection — enhanced coupon UI with ticket card, picker drawer,
 * expiry countdown, auto-dismiss errors, and animations.
 */
const CouponSection = ({
    coupon,
    discountAmount,
    couponCode,
    couponLoading,
    couponError,
    onCouponCodeChange,
    onApplyCoupon,
    onRemoveCoupon,
    subtotal,
}) => {
    const [showInput, setShowInput] = useState(false);
    const [showPicker, setShowPicker] = useState(false);
    const [countdown, setCountdown] = useState('');
    const [localError, setLocalError] = useState('');
    const errorTimerRef = useRef(null);

    // ── Expiry countdown & auto-remove ────────────────────
    useEffect(() => {
        if (!coupon?.endDate) {
            setCountdown('');
            return;
        }

        const check = () => {
            const end = new Date(coupon.endDate).getTime();
            const now = Date.now();
            const diff = end - now;

            if (diff <= 0) {
                onRemoveCoupon();
                setLocalError('Mã giảm giá đã hết hạn');
                setCountdown('');
                return false;
            }

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
    }, [coupon, onRemoveCoupon]);

    // ── Auto-dismiss errors ───────────────────────────────
    const displayError = couponError || localError;
    useEffect(() => {
        if (displayError) {
            clearTimeout(errorTimerRef.current);
            errorTimerRef.current = setTimeout(() => setLocalError(''), 5000);
        }
        return () => clearTimeout(errorTimerRef.current);
    }, [displayError]);

    // ── Handler: select from picker ───────────────────────
    const handlePickerSelect = useCallback(async (c) => {
        setShowPicker(false);
        onApplyCoupon(c.code);
    }, [onApplyCoupon]);

    // ── Fetch coupons for picker (customer API) ───────────
    const fetchCoupons = useCallback(async (orderAmount) => {
        return couponApi.getAvailable(orderAmount);
    }, []);

    const formatDate = (d) => {
        if (!d) return '';
        return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    // ── APPLIED STATE — ticket card ───────────────────────
    if (coupon) {
        const hasLimit = coupon.perCustomerLimit != null;
        const remaining = coupon.customerRemainingUses;
        // remaining is "after applying this coupon" — the current remaining uses on this order
        // After successful apply, remaining = perCustomerLimit - usedCount (before this order)
        // So remaining === 1 means "this is the last time"
        const remainingLabel = hasLimit && remaining != null
            ? (remaining <= 1 ? 'Đây là lần cuối cùng' : `Còn ${remaining} lượt`)
            : null;
        const isLastUse = hasLimit && remaining != null && remaining <= 1;

        return (
            <div className="co-coupon-section">
                <div className="co-coupon-ticket">
                    {/* Left stub */}
                    <div className={`co-coupon-ticket-left ${coupon.type === 'Percentage' ? 'pct' : 'fixed'}`}>
                        <span className="co-coupon-ticket-value">
                            {coupon.type === 'Percentage' ? `${coupon.value}%` : formatVND(coupon.value)}
                        </span>
                        <span className="co-coupon-ticket-type">GIẢM</span>
                    </div>
                    {/* Right info */}
                    <div className="co-coupon-ticket-right">
                        <div className="co-coupon-ticket-header">
                            <span className="co-coupon-ticket-code">{coupon.code}</span>
                            <button className="co-coupon-ticket-remove" onClick={onRemoveCoupon} aria-label="Xóa mã giảm giá">×</button>
                        </div>
                        <span className="co-coupon-ticket-name">{coupon.name}</span>
                        <div className="co-coupon-ticket-meta">
                            {discountAmount > 0 && (
                                <span className="co-coupon-ticket-saving">−{formatVND(discountAmount)}</span>
                            )}
                            {coupon.endDate && (
                                <span className="co-coupon-ticket-expiry">HSD: {formatDate(coupon.endDate)}</span>
                            )}
                            {remainingLabel && (
                                <span
                                    className="co-coupon-ticket-remaining"
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '3px',
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        padding: '2px 7px',
                                        borderRadius: '999px',
                                        background: isLastUse ? '#fff7ed' : '#f0fdf4',
                                        color: isLastUse ? '#c2410c' : '#15803d',
                                        border: `1px solid ${isLastUse ? '#fed7aa' : '#bbf7d0'}`,
                                    }}
                                >
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                        <circle cx="12" cy="7" r="4"/>
                                    </svg>
                                    {remainingLabel}
                                </span>
                            )}
                        </div>
                        {countdown && (
                            <div className="co-coupon-countdown">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                {countdown}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // ── INPUT STATE — code entry + picker ─────────────────
    if (showInput) {
        return (
            <div className="co-coupon-section">
                <div className="co-coupon-input-wrap">
                    <div className="co-coupon-input-row">
                        <input
                            type="text"
                            className="co-form-input"
                            placeholder="Nhập mã giảm giá"
                            value={couponCode || ''}
                            onChange={(e) => onCouponCodeChange(e.target.value.toUpperCase())}
                            onKeyDown={(e) => e.key === 'Enter' && onApplyCoupon(couponCode)}
                            disabled={couponLoading}
                        />
                        <button
                            className="co-coupon-apply-btn"
                            onClick={() => onApplyCoupon(couponCode)}
                            disabled={couponLoading || !couponCode?.trim()}
                        >
                            {couponLoading ? <span className="co-coupon-spinner" /> : 'Áp dụng'}
                        </button>
                        <button
                            className="co-coupon-browse-btn"
                            onClick={() => setShowPicker(true)}
                            title="Xem mã giảm giá khả dụng"
                            disabled={couponLoading}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>
                        </button>
                    </div>
                    {displayError && (
                        <p className="co-coupon-error-msg co-shake">{displayError}</p>
                    )}
                    <button
                        className="co-coupon-cancel-link"
                        onClick={() => { setShowInput(false); setLocalError(''); }}
                    >
                        Hủy
                    </button>
                </div>
                <CouponPickerDrawer
                    open={showPicker}
                    onClose={() => setShowPicker(false)}
                    onSelect={handlePickerSelect}
                    subtotal={subtotal || 0}
                    fetchCoupons={fetchCoupons}
                    appliedCode={coupon?.code}
                />
            </div>
        );
    }

    // ── DEFAULT STATE — "add coupon" link ─────────────────
    return (
        <div className="co-coupon-section">
            <button className="co-coupon-add-link" onClick={() => setShowInput(true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>
                Thêm mã giảm giá
            </button>
            {displayError && (
                <p className="co-coupon-error-msg co-shake">{displayError}</p>
            )}
        </div>
    );
};

export default CouponSection;
