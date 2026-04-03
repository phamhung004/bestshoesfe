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
import ConfirmDialog from '../../../../components/common/ConfirmDialog';
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
    const [duplicateVariantWarning, setDuplicateVariantWarning] = useState(null);

    // Ref for search input (keyboard shortcut F1)
    const searchInputRef = useRef(null);

    // Ref-based lock to prevent concurrent tab switches
    const switchingRef = useRef(false);
    // Always-current activeOrderId (avoids stale closures in async handlers)
    const activeOrderIdRef = useRef(activeOrderId);
    activeOrderIdRef.current = activeOrderId;

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
    const performAddToCart = useCallback((product, variant, qty = 1) => {
        const cartKey = `${variant.variantId}`;
        const requestedQty = Number(qty) || 1;

        let didAdd = false;
        let blockedByStock = false;

        setCartItems(prev => {
            const existing = prev.find(i => i.cartKey === cartKey);
            const currentQty = existing ? existing.quantity : 0;
            const safeStock = Number(variant.stock || 0);
            const allowedToAdd = Math.max(0, safeStock - currentQty);
            const finalAddQty = Math.min(requestedQty, allowedToAdd);

            if (finalAddQty <= 0) {
                blockedByStock = true;
                return prev;
            }

            didAdd = true;

            if (existing) {
                return prev.map(i =>
                    i.cartKey === cartKey ? { ...i, quantity: i.quantity + finalAddQty, stock: safeStock } : i
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
                stock: safeStock,
                quantity: finalAddQty,
            }];
        });

        if (blockedByStock) {
            showToast(`Không thể thêm quá tồn kho. Tồn hiện tại: ${variant.stock}.`, 'warning');
            return false;
        }

        if (!didAdd) return false;

        setPulseProductId(product.productId);
        setTimeout(() => setPulseProductId(null), 600);

        setCartBounce(true);
        setTimeout(() => setCartBounce(false), 400);
        return true;
    }, [showToast]);

    const addToCart = useCallback((product, variant, qty = 1) => {
        const duplicateInHold = holdOrders
            .filter(h => h.orderId !== activeOrderId)
            .find(h => Array.isArray(h.items) && h.items.some(it => Number(it.variantId) === Number(variant.variantId)));

        if (duplicateInHold) {
            const duplicatedItem = duplicateInHold.items.find(it => Number(it.variantId) === Number(variant.variantId));
            setDuplicateVariantWarning({
                orderLabel: duplicateInHold.customerName || duplicateInHold.orderNumber || duplicateInHold.orderId,
                quantity: duplicatedItem?.quantity || 0,
                pendingAdd: { product, variant, qty },
            });
            return;
        }

        performAddToCart(product, variant, qty);
    }, [holdOrders, activeOrderId, performAddToCart]);

    const updateCartQty = useCallback((cartKey, newQty) => {
        const parsedQty = Number(newQty);
        if (!Number.isFinite(parsedQty) || parsedQty < 1) return;

        setCartItems(prev =>
            prev.map(i => {
                if (i.cartKey !== cartKey) return i;
                const maxStock = Number.isFinite(Number(i.stock)) ? Number(i.stock) : null;
                if (maxStock != null) {
                    if (parsedQty > maxStock) {
                        showToast(`Không thể vượt tồn kho (${maxStock}).`, 'warning');
                        return { ...i, quantity: maxStock };
                    }
                }
                return { ...i, quantity: parsedQty };
            })
        );
    }, [showToast]);

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
            stock: item.stock ?? null,
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
    // Uses ref-based lock to prevent concurrent switches and stale closure issues.
    const handleSwitchTab = useCallback(async (holdOrderOrNull) => {
        if (switchingRef.current) return;

        const currentActiveId = activeOrderIdRef.current;

        // Clicking the already-active tab does nothing
        if (holdOrderOrNull === null && currentActiveId === null) return;
        if (holdOrderOrNull && holdOrderOrNull.orderId === currentActiveId) return;

        switchingRef.current = true;
        setIsSavingHold(true);

        try {
            // Auto-save current cart if it has items
            if (cartItems.length > 0) {
                if (currentActiveId) {
                    try { await posAPI.deleteHoldOrder(currentActiveId); } catch { /* ignore */ }
                }
                await posAPI.saveHoldOrder(buildHoldPayload());
            }

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
        } catch {
            showToast('Chuyển đơn thất bại. Vui lòng thử lại.', 'error');
        } finally {
            setIsSavingHold(false);
            switchingRef.current = false;
        }
    }, [cartItems, buildHoldPayload, clearCart, restoreHoldData, refreshHoldOrders, showToast]);

    // "+" New Order button: auto-save current → clear for new
    const handleNewOrderTab = useCallback(async () => {
        if (switchingRef.current) return;

        const currentActiveId = activeOrderIdRef.current;
        if (cartItems.length === 0 && currentActiveId === null) return; // Already on empty new order

        switchingRef.current = true;
        setIsSavingHold(true);

        try {
            if (cartItems.length > 0) {
                if (currentActiveId) {
                    try { await posAPI.deleteHoldOrder(currentActiveId); } catch { /* ignore */ }
                }
                await posAPI.saveHoldOrder(buildHoldPayload());
            }

            clearCart();
            setPaymentMethod('cash');
            setActiveOrderId(null);
            await refreshHoldOrders();
        } catch {
            showToast('Không thể tạo đơn mới. Vui lòng thử lại.', 'error');
        } finally {
            setIsSavingHold(false);
            switchingRef.current = false;
        }
    }, [cartItems, buildHoldPayload, clearCart, refreshHoldOrders, showToast]);

    const handleDiscardHoldOrder = useCallback(async (orderId) => {
        if (switchingRef.current) return;
        if (!window.confirm('Xóa hóa đơn chờ này?')) return;
        try {
            await posAPI.deleteHoldOrder(orderId);
            // If we were editing this hold order, switch to new order
            if (activeOrderIdRef.current === orderId) {
                clearCart();
                setPaymentMethod('cash');
                setActiveOrderId(null);
            }
            await refreshHoldOrders();
            showToast('Đã xóa hóa đơn chờ', 'info');
        } catch (err) {
            showToast(err?.response?.data?.message || 'Xóa thất bại.', 'error');
        }
    }, [refreshHoldOrders, clearCart, showToast]);

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

            <ConfirmDialog
                open={!!duplicateVariantWarning}
                title="Sản phẩm đã có ở hóa đơn chờ khác"
                message={duplicateVariantWarning
                    ? `Sản phẩm này đã tồn tại ở hóa đơn chờ "${duplicateVariantWarning.orderLabel}" với số lượng ${duplicateVariantWarning.quantity}. Bạn muốn vẫn thêm vào đơn hiện tại hay hủy?`
                    : ''}
                confirmText="Vẫn thêm"
                cancelText="Cancel"
                variant="primary"
                onConfirm={() => {
                    const pending = duplicateVariantWarning?.pendingAdd;
                    setDuplicateVariantWarning(null);
                    if (pending) {
                        performAddToCart(pending.product, pending.variant, pending.qty);
                    }
                }}
                onCancel={() => setDuplicateVariantWarning(null)}
            />
        </div>
        </POSProvider>
    );
};

export default POSPage;
