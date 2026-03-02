import React from 'react';
import { Link } from 'react-router-dom';
import OrderItemList from './OrderItemList';
import CouponSection from './CouponSection';
import PriceBreakdown from './PriceBreakdown';

const OrderReviewPanel = ({
    items,
    coupon,
    subtotal,
    shippingCost,
    discountAmount,
    total,
    isSubmitting,
    onSubmit,
    couponCode,
    couponLoading,
    couponError,
    onCouponCodeChange,
    onApplyCoupon,
    onRemoveCoupon,
}) => {
    return (
        <div className="co-review-card co-right-entrance">
            {/* Header */}
            <div className="co-review-header">
                <h2 className="co-review-title">Đơn hàng của bạn</h2>
                <Link to="/cart" className="co-review-edit-link">Chỉnh sửa</Link>
            </div>

            {/* Item list */}
            <OrderItemList items={items} />

            {/* Coupon */}
            <CouponSection
                coupon={coupon}
                discountAmount={discountAmount}
                couponCode={couponCode}
                couponLoading={couponLoading}
                couponError={couponError}
                onCouponCodeChange={onCouponCodeChange}
                onApplyCoupon={onApplyCoupon}
                onRemoveCoupon={onRemoveCoupon}
                subtotal={subtotal}
            />

            {/* Price breakdown */}
            <PriceBreakdown
                subtotal={subtotal}
                shippingCost={shippingCost}
                discountAmount={discountAmount}
                total={total}
                couponState={coupon}
            />

            {/* Submit button */}
            <button
                className="co-submit-btn"
                style={{ marginTop: 16 }}
                disabled={isSubmitting}
                onClick={onSubmit}
            >
                {isSubmitting ? (
                    <>
                        <span className="co-submit-spinner" />
                        Đang xử lý...
                    </>
                ) : (
                    'Đặt hàng ngay →'
                )}
            </button>

            {/* Trust signals */}
            <div className="co-trust-grid">
                <div className="co-trust-item">
                    <span className="co-trust-icon">🔒</span>
                    Bảo mật SSL 256-bit
                </div>
                <div className="co-trust-item">
                    <span className="co-trust-icon">✅</span>
                    Hàng chính hãng 100%
                </div>
                <div className="co-trust-item">
                    <span className="co-trust-icon">🔄</span>
                    Đổi trả miễn phí 7 ngày
                </div>
                <div className="co-trust-item">
                    <span className="co-trust-icon">🚚</span>
                    Giao hàng toàn quốc
                </div>
            </div>
        </div>
    );
};

export default OrderReviewPanel;
