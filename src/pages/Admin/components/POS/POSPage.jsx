import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import ProductBrowser from './ProductBrowser';
import VariantPickerModal from './VariantPickerModal';
import OrderCart from './OrderCart';
import CheckoutSuccessModal from './CheckoutSuccessModal';
import { POSProvider } from './POSContext';
import { posAPI } from '../../../../services/api';
import { formatVND } from './posUtils';
import './POSPage.css';

/**
 * POSPage — root split-panel layout for "Bán hàng tại quầy".
 * Manages: cart, customer, coupon, payment, checkout flow.
 */
const POSPage = () => {
    // ── Order & cart state ──────────────────────────────────────
    const [cartItems, setCartItems] = useState([]);
    const [pulseProductId, setPulseProductId] = useState(null);
    const [cartBounce, setCartBounce] = useState(false);

    // ── Customer state ──────────────────────────────────────────
    const [isWalkIn, setIsWalkIn] = useState(true);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [guestName, setGuestName] = useState('');
    const [guestPhone, setGuestPhone] = useState('');

    // ── Coupon state ────────────────────────────────────────────
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [discountAmount, setDiscountAmount] = useState(0);

    // ── Payment state ───────────────────────────────────────────
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [cashReceived, setCashReceived] = useState(0);

    // ── Modal state ─────────────────────────────────────────────
    const [variantPickerProduct, setVariantPickerProduct] = useState(null);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [successOrder, setSuccessOrder] = useState(null);

    // ── Computed values ─────────────────────────────────────────
    const subtotal = useMemo(
        () => cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
        [cartItems]
    );
    const totalAmount = Math.max(0, subtotal - discountAmount);

    // ── Re-validate coupon when subtotal changes ────────────────
    const prevSubtotalRef = useRef(subtotal);
    useEffect(() => {
        if (!appliedCoupon) return;
        if (prevSubtotalRef.current === subtotal) return;
        prevSubtotalRef.current = subtotal;

        // If cart is now empty, auto-remove coupon
        if (cartItems.length === 0 || subtotal === 0) {
            setAppliedCoupon(null);
            setDiscountAmount(0);
            return;
        }

        // If subtotal < minimumAmount, auto-remove coupon
        if (appliedCoupon.minimumAmount && subtotal < appliedCoupon.minimumAmount) {
            setAppliedCoupon(null);
            setDiscountAmount(0);
            return;
        }

        // Re-validate to recalculate discount for new subtotal
        const revalidate = async () => {
            try {
                const res = await posAPI.validateCoupon(appliedCoupon.code, subtotal);
                const data = res.data;
                if (data.valid) {
                    setAppliedCoupon(data);
                    setDiscountAmount(data.discountAmount || 0);
                } else {
                    setAppliedCoupon(null);
                    setDiscountAmount(0);
                }
            } catch {
                // Keep current coupon on network error
            }
        };

        const timer = setTimeout(revalidate, 300);
        return () => clearTimeout(timer);
    }, [subtotal, appliedCoupon, cartItems.length, setAppliedCoupon, setDiscountAmount]);

    // ── Cart actions ────────────────────────────────────────────
    const addToCart = useCallback((product, variant, qty = 1) => {
        const cartKey = `${variant.variantId}`;

        setCartItems(prev => {
            const existing = prev.find(i => i.cartKey === cartKey);
            if (existing) {
                return prev.map(i =>
                    i.cartKey === cartKey ? { ...i, quantity: i.quantity + qty } : i
                );
            }
            return [...prev, {
                cartKey,
                variantId: variant.variantId,
                productId: product.productId,
                productName: product.name,
                imageUrl: product.imageUrl,
                sizeId: variant.sizeId,
                colorId: variant.colorId,
                unitPrice: variant.promotionPrice != null ? variant.promotionPrice : variant.price,
                originalPrice: variant.price,
                promotionName: variant.promotionName || null,
                discountPercentage: variant.discountPercentage || null,
                quantity: qty,
            }];
        });

        // Pulse animation on the product card
        setPulseProductId(product.productId);
        setTimeout(() => setPulseProductId(null), 600);

        // Cart badge bounce
        setCartBounce(true);
        setTimeout(() => setCartBounce(false), 400);
    }, []);

    const updateCartQty = useCallback((cartKey, newQty) => {
        if (newQty < 1) return;
        setCartItems(prev =>
            prev.map(i => (i.cartKey === cartKey ? { ...i, quantity: newQty } : i))
        );
    }, []);

    const removeCartItem = useCallback((cartKey) => {
        setCartItems(prev => prev.filter(i => i.cartKey !== cartKey));
    }, []);

    const clearCart = useCallback(() => {
        setCartItems([]);
        setAppliedCoupon(null);
        setDiscountAmount(0);
        setSelectedCustomer(null);
        setGuestName('');
        setGuestPhone('');
        setCashReceived(0);
    }, []);

    // ── Checkout ────────────────────────────────────────────────
    const handleCheckout = useCallback(async () => {
        if (cartItems.length === 0) return;
        setIsCheckingOut(true);

        try {
            const customerName = isWalkIn
                ? (guestName || 'Khách lẻ')
                : (selectedCustomer?.fullName || 'Khách lẻ');
            const customerPhone = isWalkIn
                ? guestPhone
                : (selectedCustomer?.phone || '');

            const request = {
                customerId: selectedCustomer?.customerId || null,
                customerName,
                customerPhone,
                couponId: appliedCoupon?.couponId || null,
                cashReceived: cashReceived || 0,
                items: cartItems.map(item => ({
                    variantId: item.variantId,
                    quantity: item.quantity,
                })),
            };

            const res = await posAPI.checkout(request);
            const order = res.data; // POSCheckoutResponse from ApiResponse.data
            setSuccessOrder(order);
        } catch (err) {
            console.error('Checkout failed:', err);
            const msg = err.response?.data?.message || 'Thanh toán thất bại. Vui lòng thử lại.';
            const msgLower = msg.toLowerCase();

            // Auto-remove coupon on coupon-specific errors
            if (appliedCoupon && (
                msgLower.includes('coupon') || msgLower.includes('phiếu giảm giá') ||
                msgLower.includes('mã giảm giá') || msgLower.includes('hết lượt') ||
                msgLower.includes('hết hạn') || msgLower.includes('expired')
            )) {
                setAppliedCoupon(null);
                setDiscountAmount(0);
                alert(`⚠ Mã giảm giá không còn hợp lệ: ${msg}\n\nMã đã được gỡ. Vui lòng thử lại.`);
            } else {
                alert(msg);
            }
        } finally {
            setIsCheckingOut(false);
        }
    }, [cartItems, isWalkIn, guestName, guestPhone, selectedCustomer, appliedCoupon, cashReceived]);

    const handleNewOrder = useCallback(() => {
        setSuccessOrder(null);
        clearCart();
        setPaymentMethod('cash');
    }, [clearCart]);

    // ── Variant picker handler from ProductBrowser ──────────────
    const handleProductClick = useCallback((product) => {
        const inStockVariants = product.variants.filter(v => v.status === 'ACTIVE' && v.stock > 0);
        // If only 1 variant in stock, add directly
        if (inStockVariants.length === 1) {
            addToCart(product, inStockVariants[0]);
        } else {
            setVariantPickerProduct(product);
        }
    }, [addToCart]);

    return (
        <POSProvider>
        <div className="pos-layout">
            {/* Left panel — product browser */}
            <ProductBrowser
                onAddToCart={addToCart}
                pulseProductId={pulseProductId}
                onProductClick={handleProductClick}
            />

            {/* Right panel — order cart */}
            <OrderCart
                cartItems={cartItems}
                subtotal={subtotal}
                discountAmount={discountAmount}
                totalAmount={totalAmount}
                onUpdateQty={updateCartQty}
                onRemoveItem={removeCartItem}
                onClearCart={clearCart}
                isWalkIn={isWalkIn}
                setIsWalkIn={setIsWalkIn}
                selectedCustomer={selectedCustomer}
                setSelectedCustomer={setSelectedCustomer}
                guestName={guestName}
                setGuestName={setGuestName}
                guestPhone={guestPhone}
                setGuestPhone={setGuestPhone}
                appliedCoupon={appliedCoupon}
                setAppliedCoupon={setAppliedCoupon}
                setDiscountAmount={setDiscountAmount}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                cashReceived={cashReceived}
                setCashReceived={setCashReceived}
                onCheckout={handleCheckout}
                isCheckingOut={isCheckingOut}
                cartBounce={cartBounce}
            />

            {/* Variant picker modal */}
            {variantPickerProduct && (
                <VariantPickerModal
                    product={variantPickerProduct}
                    onClose={() => setVariantPickerProduct(null)}
                    onAddToCart={(product, variant, qty) => {
                        addToCart(product, variant, qty);
                        setVariantPickerProduct(null);
                    }}
                />
            )}

            {/* Checkout success modal */}
            {successOrder && (
                <CheckoutSuccessModal
                    order={successOrder}
                    onNewOrder={handleNewOrder}
                    onClose={handleNewOrder}
                />
            )}
        </div>
        </POSProvider>
    );
};

export default POSPage;
