// --- MODIFIED: OrderReviewPanel ---
// Added `outOfStockItems` and `onRemoveItem` props forwarded to OrderItemList.
// The submit button is disabled and text/style changed when stock errors exist.

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
    shippingFeeLoading,
    shippingFeeError,
    // --- ADDED: out-of-stock props ---
    outOfStockItems,
    onRemoveItem,
}) => {
    // --- ADDED: Derive disabled state from outOfStockItems ---
    const hasStockError = outOfStockItems && outOfStockItems.length > 0;

    return (
        <div className="co-review-card co-right-entrance">
            {/* Header */}
            <div className="co-review-header">
                <h2 className="co-review-title">Đơn hàng của bạn</h2>
                <Link to="/cart" className="co-review-edit-link">Chỉnh sửa</Link>
            </div>

            {/* --- MODIFIED: Item list now receives out-of-stock data --- */}
            <OrderItemList
                items={items}
                outOfStockItems={outOfStockItems}
                onRemoveItem={onRemoveItem}
            />

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
                shippingFeeLoading={shippingFeeLoading}
                shippingFeeError={shippingFeeError}
            />

            {/* --- MODIFIED: Submit button disabled + tooltip when stock error --- */}
            <div
                className="co-submit-btn-wrapper"
                /* Tooltip via title attribute; also handled by CSS ::after for richer look */
                title={hasStockError ? 'Giỏ hàng có sản phẩm hết hàng — vui lòng xóa trước khi đặt hàng' : undefined}
            >
                <button
                    className={`co-submit-btn${hasStockError ? ' co-submit-btn--disabled-oos' : ''}`}
                    style={{ marginTop: 16 }}
                    disabled={isSubmitting || hasStockError}
                    onClick={hasStockError ? undefined : onSubmit}
                    aria-disabled={hasStockError || isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <span className="co-submit-spinner" />
                            Đang xử lý...
                        </>
                    ) : hasStockError ? (
                        'Không thể đặt hàng — Giỏ hàng có sản phẩm hết hàng'
                    ) : (
                        'Đặt hàng ngay →'
                    )}
                </button>
            </div>
        </div>
    );
};

export default OrderReviewPanel;
