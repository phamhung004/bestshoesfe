import React, { useState, useEffect } from 'react';
import { Trash2, Save, ShoppingCart, Clock, CreditCard } from 'lucide-react';
import CartItem from './CartItem';
import CustomerLookup from './CustomerLookup';
import CouponInput from './CouponInput';
import OrderSummary from './OrderSummary';
import PaymentSelector from './PaymentSelector';
import RecentOrdersDropdown from './RecentOrdersDropdown';
import { formatVND } from './posUtils';

/**
 * OrderCart — right panel: dynamic header, customer, scrollable cart items,
 * sticky footer with coupon/summary/payment/checkout.
 */
const OrderCart = ({
    cartItems, subtotal, discountAmount, totalAmount,
    onUpdateQty, onRemoveItem, onClearCart,
    isWalkIn, setIsWalkIn, selectedCustomer, setSelectedCustomer,
    guestName, setGuestName, guestPhone, setGuestPhone,
    appliedCoupon, setAppliedCoupon, setDiscountAmount,
    paymentMethod, setPaymentMethod, cashReceived, setCashReceived,
    onCheckout, onRequestCheckout, isCheckingOut, cartBounce,
    // Hold order props
    holdOrders = [], isSavingHold = false,
    onSaveHold,
    activeOrderId, activeHoldOrder,
}) => {
    const [waitMinutes, setWaitMinutes] = useState(0);

    // Calculate waiting time for active hold order
    useEffect(() => {
        if (!activeHoldOrder?.createdAt) { setWaitMinutes(0); return; }
        const calc = () => {
            const mins = Math.floor((Date.now() - new Date(activeHoldOrder.createdAt).getTime()) / 60000);
            setWaitMinutes(mins);
        };
        calc();
        const interval = setInterval(calc, 30000);
        return () => clearInterval(interval);
    }, [activeHoldOrder?.createdAt]);

    const handleClear = () => {
        if (cartItems.length === 0) return;
        if (window.confirm('Xóa toàn bộ đơn hàng?')) onClearCart();
    };

    return (
        <div className="pos-right-panel">
            {/* Header */}
            <div className="pos-cart-header">
                <div className="pos-cart-header-left">
                    <h2>
                        {activeOrderId
                            ? `Hóa đơn chờ — ${activeHoldOrder?.customerName || 'Khách lẻ'}`
                            : 'Đơn mới'}
                    </h2>
                    {activeOrderId && waitMinutes > 0 && (
                        <span className={`pos-wait-badge ${waitMinutes >= 10 ? 'danger' : waitMinutes >= 5 ? 'warning' : ''}`}>
                            <Clock size={12} />
                            Đã chờ {waitMinutes} phút
                        </span>
                    )}
                </div>
                <div className="pos-cart-header-btns">
                    <RecentOrdersDropdown />
                    <button
                        className="pos-icon-btn"
                        onClick={onSaveHold}
                        disabled={cartItems.length === 0 || isSavingHold || (holdOrders.length >= 10 && !activeOrderId)}
                        title="Lưu hóa đơn chờ (F3)"
                        aria-label="Lưu hóa đơn chờ"
                    >
                        {isSavingHold ? <span className="pos-hold-mini-spin" /> : <Save size={16} />}
                    </button>
                    <button
                        className="pos-icon-btn danger"
                        onClick={handleClear}
                        aria-label="Xóa đơn"
                        title="Xóa đơn"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

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

            {/* Scrollable cart items area */}
            <div className="pos-cart-items">
                {cartItems.length === 0 ? (
                    <div className="pos-cart-empty">
                        <ShoppingCart size={40} strokeWidth={1.5} />
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

            {/* Sticky footer: coupon + summary + payment + checkout button */}
            <div className="pos-checkout-footer">
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

                {/* Checkout button */}
                <button
                    className="pos-checkout-btn"
                    onClick={() => (onRequestCheckout ? onRequestCheckout() : onCheckout())}
                    disabled={cartItems.length === 0 || isCheckingOut}
                    title={cartItems.length === 0 ? 'Giỏ hàng trống' : 'Thanh toán (F8)'}
                >
                    {isCheckingOut ? (
                        <span className="pos-checkout-spinner" />
                    ) : (
                        <>
                            <CreditCard size={18} />
                            THANH TOÁN {cartItems.length > 0 ? `— ${formatVND(totalAmount)}` : ''}
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default OrderCart;
