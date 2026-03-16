import React from 'react';
import CartItem from './CartItem';
import CustomerLookup from './CustomerLookup';
import CouponInput from './CouponInput';
import OrderSummary from './OrderSummary';
import PaymentSelector from './PaymentSelector';
import RecentOrdersDropdown from './RecentOrdersDropdown';
import { formatVND } from './posUtils';

/**
 * OrderCart — right panel: header, customer, cart items, coupon, summary, payment, checkout.
 */
const OrderCart = ({
    cartItems, subtotal, discountAmount, totalAmount,
    onUpdateQty, onRemoveItem, onClearCart,
    isWalkIn, setIsWalkIn, selectedCustomer, setSelectedCustomer,
    guestName, setGuestName, guestPhone, setGuestPhone,
    appliedCoupon, setAppliedCoupon, setDiscountAmount,
    paymentMethod, setPaymentMethod, cashReceived, setCashReceived,
    onCheckout, isCheckingOut, cartBounce,
    // Hold order props
    holdOrders = [], isSavingHold = false,
    onSaveHold, onRestoreHold, onDiscardHold,
}) => {
    const handleClear = () => {
        if (cartItems.length === 0) return;
        if (window.confirm('Xóa toàn bộ đơn hàng?')) onClearCart();
    };

    return (
        <div className="pos-right-panel">
            {/* Header */}
            <div className="pos-cart-header">
                <div className="pos-cart-header-left">
                    <h2>Thanh toán</h2>
                </div>
                <div className="pos-cart-header-btns">
                    <RecentOrdersDropdown />
                    <button
                        className="pos-icon-btn"
                        onClick={onSaveHold}
                        disabled={cartItems.length === 0 || isSavingHold || holdOrders.length >= 10}
                        title="Lưu hóa đơn chờ"
                        aria-label="Lưu hóa đơn chờ"
                        style={{ fontSize: 18, position: 'relative' }}
                    >
                        {isSavingHold ? <span className="pos-hold-mini-spin" /> : '💾'}
                        {holdOrders.length > 0 && (
                            <span className="pos-hold-badge">{holdOrders.length}</span>
                        )}
                    </button>
                    <button
                        className="pos-icon-btn danger"
                        onClick={handleClear}
                        aria-label="Xóa đơn"
                        title="Xóa đơn"
                    >
                        🗑️
                    </button>
                </div>
            </div>

            {/* Hold orders strip */}
            {holdOrders.length > 0 && (
                <div className="pos-hold-strip">
                    {holdOrders.map((h, idx) => (
                        <div key={h.orderId} className="pos-hold-tab" title={`${h.customerName} • ${h.itemCount} món`}>
                            <button
                                className="pos-hold-tab-btn"
                                onClick={() => onRestoreHold(h)}
                            >
                                <span className="pos-hold-tab-num">{idx + 1}</span>
                                <span className="pos-hold-tab-name">{h.customerName}</span>
                                <span className="pos-hold-tab-count">{h.itemCount} món</span>
                            </button>
                            <button
                                className="pos-hold-tab-close"
                                onClick={() => onDiscardHold(h.orderId)}
                                title="Xóa hóa đơn chờ"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Customer lookup */}
            <CustomerLookup
                isWalkIn={isWalkIn}
                setIsWalkIn={setIsWalkIn}
                selectedCustomer={selectedCustomer}
                setSelectedCustomer={setSelectedCustomer}
                guestName={guestName}
                setGuestName={setGuestName}
                guestPhone={guestPhone}
                setGuestPhone={setGuestPhone}
            />

            {/* Cart items */}
            <div className="pos-cart-items">
                {cartItems.length === 0 ? (
                    <div className="pos-cart-empty">
                        <div className="icon">🛒</div>
                        <h3>Chưa có sản phẩm</h3>
                        <p>Chọn sản phẩm từ danh sách bên trái</p>
                    </div>
                ) : (
                    cartItems.map(item => (
                        <CartItem
                            key={item.cartKey}
                            item={item}
                            onUpdateQty={onUpdateQty}
                            onRemove={onRemoveItem}
                        />
                    ))
                )}
            </div>

            {/* Coupon */}
            <CouponInput
                subtotal={subtotal}
                appliedCoupon={appliedCoupon}
                setAppliedCoupon={setAppliedCoupon}
                setDiscountAmount={setDiscountAmount}
            />

            {/* Summary */}
            <OrderSummary
                subtotal={subtotal}
                discountAmount={discountAmount}
                appliedCoupon={appliedCoupon}
            />

            {/* Payment */}
            <PaymentSelector
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                totalAmount={totalAmount}
                cashReceived={cashReceived}
                setCashReceived={setCashReceived}
            />

            {/* Checkout */}
            <div className="pos-checkout-section">
                <button
                    className="pos-btn-hold"
                    onClick={onSaveHold}
                    disabled={cartItems.length === 0 || isSavingHold || holdOrders.length >= 10}
                    title={holdOrders.length >= 10 ? 'Tối đa 10 hóa đơn chờ' : 'Lưu hóa đơn chờ'}
                >
                    {isSavingHold ? <span className="pos-checkout-spinner" /> : '💾'} Lưu hóa đơn chờ
                </button>
                <button
                    className="pos-checkout-btn"
                    onClick={onCheckout}
                    disabled={cartItems.length === 0 || isCheckingOut}
                    title={cartItems.length === 0 ? 'Giỏ hàng trống' : ''}
                >
                    {isCheckingOut ? (
                        <span className="pos-checkout-spinner" />
                    ) : (
                        <>Thanh toán {cartItems.length > 0 ? formatVND(totalAmount) : ''}</>
                    )}
                </button>
            </div>
        </div>
    );
};

export default OrderCart;
