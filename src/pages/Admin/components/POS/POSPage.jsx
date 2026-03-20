import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import ProductBrowser from './ProductBrowser';
import VariantPickerModal from './VariantPickerModal';
import OrderCart from './OrderCart';
import CheckoutSuccessModal from './CheckoutSuccessModal';
import HoldOrderTabBar from './HoldOrderTabBar';
import { POSProvider } from './POSContext';
import { posAPI } from '../../../../services/api';
import { useToast } from '../../../../context/ToastContext';
import { formatVND } from './posUtils';
import './POSPage.css';

/**
 * POSPage — root split-panel layout for "Bán hàng tại quầy".
 * Manages: cart, customer, coupon, payment, checkout flow, hold-order tabs.
 */
const POSPage = () => {
    const { showToast } = useToast();

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
    // ── Hold orders (Hóa đơn chờ) ────────────────────────────────
    const [holdOrders, setHoldOrders] = useState([]);
    const [isSavingHold, setIsSavingHold] = useState(false);
    const [activeOrderId, setActiveOrderId] = useState(null); // null = new order

    // Ref for search input (keyboard shortcut F1)
    const searchInputRef = useRef(null);

    // Fetch hold orders on mount
    useEffect(() => {
        posAPI.listHoldOrders()
            .then(res => setHoldOrders(res?.data ?? []))
            .catch(() => {});
    }, []);
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
                paymentMethod: paymentMethod.toUpperCase(), // CASH | CARD | BANK_TRANSFER | PENDING
                cashReceived: cashReceived || 0,
                items: cartItems.map(item => ({
                    variantId: item.variantId,
                    quantity: item.quantity,
                })),
            };

            const res = await posAPI.checkout(request);
            const order = res.data; // POSCheckoutResponse from ApiResponse.data

            // If checking out a hold order, delete it from backend
            if (activeOrderId) {
                try { await posAPI.deleteHoldOrder(activeOrderId); } catch { /* ignore */ }
                setActiveOrderId(null);
                refreshHoldOrders();
            }

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
                showToast(`Mã giảm giá không còn hợp lệ: ${msg}`, 'warning');
            } else {
                showToast(msg, 'error');
            }
        } finally {
            setIsCheckingOut(false);
        }
    }, [cartItems, isWalkIn, guestName, guestPhone, selectedCustomer, appliedCoupon, cashReceived]);

    // ── Hold order actions ──────────────────────────────────────
    const refreshHoldOrders = useCallback(() => {
        return posAPI.listHoldOrders()
            .then(res => { setHoldOrders(res?.data ?? []); return res?.data ?? []; })
            .catch(() => { return []; });
    }, []);

    const handleNewOrder = useCallback(() => {
        setSuccessOrder(null);
        clearCart();
        setPaymentMethod('cash');
        setActiveOrderId(null);
        refreshHoldOrders();
    }, [clearCart, refreshHoldOrders]);

    // Build the hold request payload from current state
    const buildHoldPayload = useCallback(() => {
        const customerName = isWalkIn
            ? (guestName || 'Khách lẻ')
            : (selectedCustomer?.fullName || 'Khách lẻ');
        const customerPhone = isWalkIn ? guestPhone : (selectedCustomer?.phone || '');
        return {
            customerId: selectedCustomer?.customerId || null,
            customerName,
            customerPhone,
            couponId: appliedCoupon?.couponId || null,
            items: cartItems.map(item => ({ variantId: item.variantId, quantity: item.quantity })),
        };
    }, [cartItems, isWalkIn, guestName, guestPhone, selectedCustomer, appliedCoupon]);

    const handleSaveHoldOrder = useCallback(async () => {
        if (cartItems.length === 0) return;
        if (holdOrders.length >= 10 && !activeOrderId) {
            showToast('Tối đa 10 hóa đơn chờ. Vui lòng hoàn tất hoặc xóa bớt.', 'warning');
            return;
        }
        setIsSavingHold(true);
        try {
            // If editing an existing hold, delete the old one first
            if (activeOrderId) {
                try { await posAPI.deleteHoldOrder(activeOrderId); } catch { /* ignore */ }
            }
            await posAPI.saveHoldOrder(buildHoldPayload());
            clearCart();
            setPaymentMethod('cash');
            setActiveOrderId(null);
            await refreshHoldOrders();
            showToast('Đã lưu hóa đơn chờ', 'success');
        } catch (err) {
            showToast(err?.response?.data?.message || 'Lưu thất bại. Vui lòng thử lại.', 'error');
        } finally {
            setIsSavingHold(false);
        }
    }, [cartItems, holdOrders.length, activeOrderId, buildHoldPayload, clearCart, refreshHoldOrders, showToast]);

    // Auto-save current cart, returning true if saved (or nothing to save)
    const autoSaveCurrentCart = useCallback(async () => {
        if (cartItems.length === 0) return true;
        setIsSavingHold(true);
        try {
            if (activeOrderId) {
                try { await posAPI.deleteHoldOrder(activeOrderId); } catch { /* ignore */ }
            }
            await posAPI.saveHoldOrder(buildHoldPayload());
            return true;
        } catch {
            showToast('Không thể lưu đơn hiện tại', 'error');
            return false;
        } finally {
            setIsSavingHold(false);
        }
    }, [cartItems, activeOrderId, buildHoldPayload, showToast]);

    // Restore a hold order's data into the cart
    const restoreHoldData = useCallback((holdOrder) => {
        const restoredItems = holdOrder.items.map(item => ({
            cartKey: String(item.variantId),
            variantId: item.variantId,
            productId: item.productId,
            productName: item.productName,
            imageUrl: item.imageUrl,
            sizeId: item.sizeId,
            colorId: item.colorId,
            unitPrice: item.unitPrice,
            originalPrice: item.originalPrice,
            promotionName: item.promotionName || null,
            discountPercentage: null,
            quantity: item.quantity,
        }));
        setCartItems(restoredItems);

        if (holdOrder.customerId) {
            setIsWalkIn(false);
            setSelectedCustomer({ customerId: holdOrder.customerId, fullName: holdOrder.customerName, phone: holdOrder.customerPhone });
            setGuestName(''); setGuestPhone('');
        } else {
            setIsWalkIn(true);
            setSelectedCustomer(null);
            setGuestName(holdOrder.customerName !== 'Khách lẻ' ? holdOrder.customerName : '');
            setGuestPhone(holdOrder.customerPhone || '');
        }

        setAppliedCoupon(null);
        setDiscountAmount(0);
        setPaymentMethod('cash');
        setCashReceived(0);
    }, []);

    // Tab switch: auto-save current → load target
    const handleSwitchTab = useCallback(async (holdOrderOrNull) => {
        if (isSavingHold) return;

        // Clicking the already-active tab does nothing
        if (holdOrderOrNull === null && activeOrderId === null) return;
        if (holdOrderOrNull && holdOrderOrNull.orderId === activeOrderId) return;

        // Auto-save current cart if it has items
        const saved = await autoSaveCurrentCart();
        if (!saved) return;

        if (holdOrderOrNull === null) {
            // Switch to fresh new order
            clearCart();
            setPaymentMethod('cash');
            setActiveOrderId(null);
        } else {
            // Switch to a hold order — load its data
            restoreHoldData(holdOrderOrNull);
            setActiveOrderId(holdOrderOrNull.orderId);
        }

        await refreshHoldOrders();
    }, [isSavingHold, activeOrderId, autoSaveCurrentCart, clearCart, restoreHoldData, refreshHoldOrders]);

    // "+" New Order button: auto-save current → clear for new
    const handleNewOrderTab = useCallback(async () => {
        if (isSavingHold) return;
        if (cartItems.length === 0 && activeOrderId === null) return; // Already on empty new order

        const saved = await autoSaveCurrentCart();
        if (!saved) return;

        clearCart();
        setPaymentMethod('cash');
        setActiveOrderId(null);
        await refreshHoldOrders();
    }, [isSavingHold, cartItems.length, activeOrderId, autoSaveCurrentCart, clearCart, refreshHoldOrders]);

    const handleDiscardHoldOrder = useCallback(async (orderId) => {
        if (!window.confirm('Xóa hóa đơn chờ này?')) return;
        try {
            await posAPI.deleteHoldOrder(orderId);
            // If we were editing this hold order, switch to new order
            if (activeOrderId === orderId) {
                clearCart();
                setPaymentMethod('cash');
                setActiveOrderId(null);
            }
            await refreshHoldOrders();
            showToast('Đã xóa hóa đơn chờ', 'info');
        } catch (err) {
            showToast(err?.response?.data?.message || 'Xóa thất bại.', 'error');
        }
    }, [refreshHoldOrders, activeOrderId, clearCart, showToast]);

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

    // ── Keyboard shortcuts ─────────────────────────────────────
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Don't trigger shortcuts when typing in inputs/textareas
            const tag = e.target.tagName;
            const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';

            if (e.key === 'Escape') {
                if (variantPickerProduct) { setVariantPickerProduct(null); e.preventDefault(); }
                return;
            }

            if (e.key === 'F1' || (e.key === '/' && !isInput)) {
                e.preventDefault();
                searchInputRef.current?.focus();
                return;
            }
            if (e.key === 'F2') {
                e.preventDefault();
                handleNewOrderTab();
                return;
            }
            if (e.key === 'F3') {
                e.preventDefault();
                handleSaveHoldOrder();
                return;
            }
            if (e.key === 'F8') {
                e.preventDefault();
                handleCheckout();
                return;
            }
            // Ctrl+1..9 — switch to hold order tab
            if (e.ctrlKey && e.key >= '1' && e.key <= '9') {
                e.preventDefault();
                const idx = parseInt(e.key) - 1;
                if (idx === 0 && activeOrderId !== null) {
                    // Ctrl+1 = switch to new order tab
                    handleSwitchTab(null);
                } else if (idx > 0 && holdOrders[idx - 1]) {
                    handleSwitchTab(holdOrders[idx - 1]);
                }
                return;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [variantPickerProduct, handleNewOrderTab, handleSaveHoldOrder, handleCheckout, handleSwitchTab, holdOrders, activeOrderId]);

    // Find active hold order info for the header
    const activeHoldOrder = activeOrderId ? holdOrders.find(h => h.orderId === activeOrderId) : null;

    return (
        <POSProvider>
        <div className="pos-page-root">
            {/* Tab bar — hold orders at the top */}
            <HoldOrderTabBar
                holdOrders={holdOrders}
                activeOrderId={activeOrderId}
                onSwitchTab={handleSwitchTab}
                onNewOrder={handleNewOrderTab}
                onDiscardHold={handleDiscardHoldOrder}
                cartItemCount={cartItems.length}
                isSavingHold={isSavingHold}
            />

            {/* Main split-panel layout */}
            <div className="pos-layout">
                {/* Left panel — product browser */}
                <ProductBrowser
                    onAddToCart={addToCart}
                    pulseProductId={pulseProductId}
                    onProductClick={handleProductClick}
                    searchInputRef={searchInputRef}
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
                    holdOrders={holdOrders}
                    isSavingHold={isSavingHold}
                    onSaveHold={handleSaveHoldOrder}
                    activeOrderId={activeOrderId}
                    activeHoldOrder={activeHoldOrder}
                />
            </div>

            {/* Keyboard shortcut hint bar */}
            <div className="pos-shortcut-bar">
                <span><kbd>F1</kbd> Tìm kiếm</span>
                <span><kbd>F2</kbd> Đơn mới</span>
                <span><kbd>F3</kbd> Lưu chờ</span>
                <span><kbd>F8</kbd> Thanh toán</span>
                <span><kbd>Ctrl+1-9</kbd> Chuyển tab</span>
                <span><kbd>Esc</kbd> Đóng</span>
            </div>

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
