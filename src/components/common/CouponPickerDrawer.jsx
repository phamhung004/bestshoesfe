import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import './CouponPickerDrawer.css';

/**
 * CouponPickerDrawer — shared drawer showing available coupons.
 * Works for both POS (admin) and online Checkout (customer).
 *
 * Props:
 *   open        - boolean: drawer visibility
 *   onClose     - () => void
 *   onSelect    - (coupon) => void: called when user picks a coupon
 *   subtotal    - number: current order subtotal to calculate discounts
 *   fetchCoupons - (orderAmount) => Promise<couponList>: API call abstracted so caller decides admin vs customer API
 *   appliedCode - string|null: currently applied coupon code (to highlight)
 */
const CouponPickerDrawer = ({ open, onClose, onSelect, subtotal = 0, fetchCoupons, appliedCode }) => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        if (!open) return;
        let cancelled = false;
        setLoading(true);
        setError('');

        fetchCoupons(subtotal)
            .then(data => {
                if (!cancelled) {
                    // Normalize: axios wraps in { data: ApiResponse }, ApiResponse has { data: [...] }
                    // So: data.data.data or data.data (if already array)
                    let list = data;
                    if (list && typeof list === 'object' && !Array.isArray(list)) {
                        list = list.data ?? list;
                    }
                    if (list && typeof list === 'object' && !Array.isArray(list)) {
                        list = list.data ?? list;
                    }
                    setCoupons(Array.isArray(list) ? list : []);
                }
            })
            .catch(() => {
                if (!cancelled) setError('Không thể tải danh sách mã giảm giá');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true; };
    }, [open, subtotal, fetchCoupons, retryCount]);

    const handleRetry = () => setRetryCount(c => c + 1);

    // Find best deal
    const bestCouponId = useMemo(() => {
        const eligible = coupons.filter(c => c.eligible);
        if (eligible.length === 0) return null;
        const best = eligible.reduce((a, b) =>
            (b.discountAmount || 0) > (a.discountAmount || 0) ? b : a
        );
        return best.couponId;
    }, [coupons]);

    const formatVND = (n) => {
        if (n == null) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
    };

    const formatDate = (d) => {
        if (!d) return '';
        return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    if (!open) return null;

    return createPortal(
        <>
            <div className="cpd-overlay" onClick={onClose} />
            <div className="cpd-drawer">
                {/* Header */}
                <div className="cpd-header">
                    <div className="cpd-header-title">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" /><path d="M13 5v2" /><path d="M13 17v2" /><path d="M13 11v2" /></svg>
                        <span>Chọn mã giảm giá</span>
                        <span className="cpd-count">{coupons.length}</span>
                    </div>
                    <button className="cpd-close" onClick={onClose} aria-label="Đóng">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                    </button>
                </div>

                {/* Body */}
                <div className="cpd-body">
                    {loading ? (
                        <div className="cpd-loading">
                            <div className="cpd-spinner" />
                            <span>Đang tải mã giảm giá...</span>
                        </div>
                    ) : error ? (
                        <div className="cpd-error">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                            <p>{error}</p>
                            <button className="cpd-retry-btn" onClick={handleRetry}>Thử lại</button>
                        </div>
                    ) : coupons.length === 0 ? (
                        <div className="cpd-empty">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" /><path d="M13 5v2" /><path d="M13 17v2" /><path d="M13 11v2" /></svg>
                            <p>Không có mã giảm giá khả dụng</p>
                        </div>
                    ) : (
                        <div className="cpd-list">
                            {coupons.map(coupon => {
                                const isApplied = appliedCode && coupon.code === appliedCode;
                                const isBest = coupon.couponId === bestCouponId && !isApplied;
                                return (
                                    <button
                                        key={coupon.couponId}
                                        className={`cpd-card ${!coupon.eligible ? 'ineligible' : ''} ${isApplied ? 'applied' : ''}`}
                                        onClick={() => coupon.eligible && !isApplied && onSelect(coupon)}
                                        disabled={!coupon.eligible || isApplied}
                                    >
                                        {/* Left ticket stub */}
                                        <div className={`cpd-card-left ${coupon.type === 'Percentage' ? 'pct' : 'fixed'}`}>
                                            <span className="cpd-card-value">
                                                {coupon.type === 'Percentage' ? `${coupon.value}%` : formatVND(coupon.value)}
                                            </span>
                                            <span className="cpd-card-type">GIẢM</span>
                                        </div>

                                        {/* Right details */}
                                        <div className="cpd-card-right">
                                            <div className="cpd-card-header-row">
                                                <span className="cpd-card-code">{coupon.code}</span>
                                                {isBest && <span className="cpd-badge-best">Tốt nhất</span>}
                                                {isApplied && <span className="cpd-badge-applied">Đang dùng</span>}
                                            </div>
                                            <span className="cpd-card-name">{coupon.name}</span>

                                            <div className="cpd-card-details">
                                                {coupon.minimumAmount > 0 && (
                                                    <span className="cpd-detail">Đơn tối thiểu {formatVND(coupon.minimumAmount)}</span>
                                                )}
                                                {coupon.type === 'Percentage' && coupon.maximumDiscount > 0 && (
                                                    <span className="cpd-detail">Giảm tối đa {formatVND(coupon.maximumDiscount)}</span>
                                                )}
                                                {coupon.endDate && (
                                                    <span className="cpd-detail">HSD: {formatDate(coupon.endDate)}</span>
                                                )}
                                            </div>

                                            {coupon.eligible && coupon.discountAmount > 0 && (
                                                <div className="cpd-card-saving">
                                                    Tiết kiệm {formatVND(coupon.discountAmount)}
                                                </div>
                                            )}

                                            {!coupon.eligible && coupon.amountNeeded > 0 && (
                                                <div className="cpd-card-needed">
                                                    Thêm {formatVND(coupon.amountNeeded)} để áp dụng
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </>,
        document.body
    );
};

export default CouponPickerDrawer;
