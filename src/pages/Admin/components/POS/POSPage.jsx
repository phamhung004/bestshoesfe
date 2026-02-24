import React, { useState, useCallback, useMemo } from 'react';
import ProductBrowser from './ProductBrowser';
import VariantPickerModal from './VariantPickerModal';
import OrderCart from './OrderCart';
import CheckoutSuccessModal from './CheckoutSuccessModal';
import { generateOrderNumber, formatVND, getSizeName, getColor } from './mockPOSData';
import './POSPage.css';

/**
 * POSPage — root split-panel layout for "Bán hàng tại quầy".
 * Manages: cart, customer, coupon, payment, checkout flow.
 */
const POSPage = () => {
    // ── Order & cart state ──────────────────────────────────────
    const [orderNumber, setOrderNumber] = useState(() => generateOrderNumber());
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
        () => cartItems.reduce((sum, item) => sum + item.unit_price * item.quantity, 0),
        [cartItems]
    );
    const totalAmount = Math.max(0, subtotal - discountAmount);

    // ── Cart actions ────────────────────────────────────────────
    const addToCart = useCallback((product, variant, qty = 1) => {
        const cartKey = `${variant.variant_id}`;

        setCartItems(prev => {
            const existing = prev.find(i => i.cartKey === cartKey);
            if (existing) {
                return prev.map(i =>
                    i.cartKey === cartKey ? { ...i, quantity: i.quantity + qty } : i
                );
            }
            return [...prev, {
                cartKey,
                variant_id: variant.variant_id,
                product_id: product.product_id,
                productName: product.name,
                image_url: product.image_url,
                size_id: variant.size_id,
                color_id: variant.color_id,
                unit_price: variant.price,
                quantity: qty,
            }];
        });

        // Pulse animation on the product card
        setPulseProductId(product.product_id);
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
    const handleCheckout = useCallback(() => {
        if (cartItems.length === 0) return;
        setIsCheckingOut(true);

        // Simulate API call
        setTimeout(() => {
            const customerName = isWalkIn
                ? (guestName || 'Khách lẻ')
                : (selectedCustomer?.full_name || 'Khách lẻ');
            const customerPhone = isWalkIn
                ? guestPhone
                : (selectedCustomer?.phone || '');

            const order = {
                order_number: orderNumber,
                customer_name: customerName,
                customer_phone: customerPhone,
                customer_id: selectedCustomer?.customer_id || null,
                coupon_id: appliedCoupon?.coupon_id || null,
                order_type: 'In-store',
                subtotal,
                shipping_cost: 0,
                coupon_discount_amount: discountAmount,
                total_amount: totalAmount,
                status: 'Đã xác nhận',
                payment_status: 'Đã thanh toán',
                paymentMethod,
                cashReceived: paymentMethod === 'cash' ? cashReceived : 0,
                created_at: new Date().toISOString(),
                items: cartItems,
            };

            setSuccessOrder(order);
            setIsCheckingOut(false);
        }, 1200);
    }, [cartItems, isWalkIn, guestName, guestPhone, selectedCustomer, orderNumber, appliedCoupon, subtotal, discountAmount, totalAmount, paymentMethod, cashReceived]);

    const handleNewOrder = useCallback(() => {
        setSuccessOrder(null);
        clearCart();
        setOrderNumber(generateOrderNumber());
        setPaymentMethod('cash');
    }, [clearCart]);

    // ── Variant picker handler from ProductBrowser ──────────────
    const handleProductClick = useCallback((product) => {
        const inStockVariants = product.variants.filter(v => v.status === 1 && v.stock > 0);
        // If only 1 variant in stock, add directly
        if (inStockVariants.length === 1) {
            addToCart(product, inStockVariants[0]);
        } else {
            setVariantPickerProduct(product);
        }
    }, [addToCart]);

    return (
        <div className="pos-layout">
            {/* Left panel — product browser */}
            <ProductBrowser
                onAddToCart={addToCart}
                pulseProductId={pulseProductId}
                onProductClick={handleProductClick}
            />

            {/* Right panel — order cart */}
            <OrderCart
                orderNumber={orderNumber}
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
    );
};

export default POSPage;
