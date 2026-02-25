import React, { useState } from 'react';
import { formatVND, COUPONS, FREESHIP_THRESHOLD } from '../mockCartData';

const OrderSummary = ({ subtotal, itemCount, couponState, onApplyCoupon, onRemoveCoupon }) => {
    const [couponOpen, setCouponOpen] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponError, setCouponError] = useState(null);

    const isFreeship = subtotal >= FREESHIP_THRESHOLD;
    const shippingFee = isFreeship ? 0 : 45000;
    const discountAmount = couponState ? couponState.discountAmount : 0;
    const total = subtotal - discountAmount + shippingFee;

    const handleApplyCoupon = () => {
        if (!couponCode.trim()) return;
        setCouponLoading(true);
        setCouponError(null);

        // Simulate API delay
        setTimeout(() => {
            const coupon = COUPONS.find(c => c.code.toLowerCase() === couponCode.trim().toLowerCase() && c.status === 1);

            if (!coupon) {
                setCouponError({ type: 'invalid', message: 'Mã giảm giá không hợp lệ hoặc đã hết hạn' });
                setCouponLoading(false);
                return;
            }

            if (subtotal < coupon.minimum_amount) {
                setCouponError({
                    type: 'min-amount',
                    message: `Đơn hàng tối thiểu ${formatVND(coupon.minimum_amount)} để dùng mã này`
                });
                setCouponLoading(false);
                return;
            }

            let discount = 0;
            if (coupon.type === 'Percentage') {
                discount = subtotal * (coupon.value / 100);
                if (coupon.maximum_discount) {
                    discount = Math.min(discount, coupon.maximum_discount);
                }
            } else {
                discount = coupon.value;
            }

            onApplyCoupon({
                code: coupon.code,
                name: coupon.name,
                discountAmount: discount,
                displayText: coupon.type === 'Percentage'
                    ? `Giảm ${coupon.value}%`
                    : `Giảm ${formatVND(coupon.value)}`,
            });
            setCouponCode('');
            setCouponError(null);
            setCouponLoading(false);
        }, 800);
    };

    const handleChipClick = (code) => {
        setCouponCode(code);
        setCouponError(null);
    };

    const suggestedCoupons = ['SALE10', 'GIAM50K', 'VIP20'];

    return (
        <div className="cart-summary-card">
            <h2 className="cart-summary-title">Tóm tắt đơn hàng</h2>

            {/* Price Breakdown */}
            <div className="cart-summary-row">
                <span className="cart-summary-label">Tạm tính ({itemCount} sản phẩm)</span>
                <span className="cart-summary-value">{formatVND(subtotal)}</span>
            </div>
            <div className="cart-summary-row">
                <span className="cart-summary-label">Phí vận chuyển</span>
                <span className={`cart-summary-value ${isFreeship ? 'free' : ''}`}>
                    {isFreeship ? 'Miễn phí ✓' : formatVND(shippingFee)}
                </span>
            </div>
            {couponState && (
                <div className="cart-summary-row">
                    <span className="cart-summary-label">Giảm giá ({couponState.code})</span>
                    <span className="cart-summary-value discount">−{formatVND(couponState.discountAmount)}</span>
                </div>
            )}

            <div className="cart-summary-divider" />

            <div className="cart-summary-total-row">
                <span className="cart-summary-total-label">TỔNG CỘNG</span>
                <span className="cart-summary-total-value">{formatVND(total)}</span>
            </div>
            <div className="cart-summary-total-accent" />
            <div className="cart-summary-vat">Đã bao gồm VAT (nếu có)</div>

            {/* Coupon Section */}
            <div style={{ marginTop: '16px' }}>
                <button className="cart-coupon-toggle" onClick={() => setCouponOpen(!couponOpen)}>
                    🏷 Bạn có mã giảm giá?
                    <span className={`cart-coupon-toggle-chevron ${couponOpen ? 'open' : ''}`}>▼</span>
                </button>

                <div className={`cart-coupon-body ${couponOpen ? 'expanded' : 'collapsed'}`}>
                    {!couponState ? (
                        <>
                            <div className="cart-coupon-input-row">
                                <input
                                    className={`cart-coupon-input ${couponError?.type === 'invalid' ? 'error' : ''}`}
                                    type="text"
                                    placeholder="Nhập mã giảm giá..."
                                    value={couponCode}
                                    onChange={(e) => { setCouponCode(e.target.value); setCouponError(null); }}
                                    onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                                    disabled={couponLoading}
                                />
                                <button
                                    className="cart-coupon-apply-btn"
                                    onClick={handleApplyCoupon}
                                    disabled={couponLoading || !couponCode.trim()}
                                >
                                    {couponLoading ? <span className="cart-coupon-spinner" /> : 'Áp dụng'}
                                </button>
                            </div>

                            {couponError && (
                                <div className={`cart-coupon-error ${couponError.type}`}>
                                    {couponError.message}
                                </div>
                            )}

                            <div className="cart-coupon-chips">
                                {suggestedCoupons.map(code => (
                                    <button
                                        key={code}
                                        className="cart-coupon-chip"
                                        onClick={() => handleChipClick(code)}
                                    >
                                        {code}
                                    </button>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="cart-coupon-success">
                            <div className="cart-coupon-success-info">
                                <div className="cart-coupon-success-name">
                                    🎉 Mã {couponState.code} — {couponState.displayText}
                                </div>
                                <div className="cart-coupon-success-amount">
                                    −{formatVND(couponState.discountAmount)}
                                </div>
                            </div>
                            <button className="cart-coupon-remove-btn" onClick={onRemoveCoupon}>
                                ✕
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Checkout Button */}
            <button className="cart-checkout-btn">
                Tiến hành thanh toán →
            </button>
            <div className="cart-checkout-secure">🔒 Thanh toán an toàn & bảo mật</div>

            {/* Payment Icons */}
            <div className="cart-payment-icons">
                <span className="cart-payment-icon">💳 Visa</span>
                <span className="cart-payment-icon">💳 Mastercard</span>
                <span className="cart-payment-icon">🏦 ATM</span>
                <span className="cart-payment-icon">📱 MoMo</span>
                <span className="cart-payment-icon">📱 ZaloPay</span>
            </div>

            {/* Trust Signals */}
            <div className="cart-trust-list">
                <div className="cart-trust-item">
                    <span className="cart-trust-item-icon">🔒</span>
                    <span>Bảo mật SSL 256-bit</span>
                </div>
                <div className="cart-trust-item">
                    <span className="cart-trust-item-icon">✅</span>
                    <span>Hàng chính hãng 100% — hoặc hoàn tiền</span>
                </div>
                <div className="cart-trust-item">
                    <span className="cart-trust-item-icon">🔄</span>
                    <span>Đổi trả miễn phí trong 7 ngày</span>
                </div>
            </div>

            {/* Help */}
            <div className="cart-help-section">
                Cần hỗ trợ?{' '}
                <button className="cart-help-link" onClick={() => { }}>Chat ngay →</button>
            </div>
        </div>
    );
};

export default OrderSummary;
