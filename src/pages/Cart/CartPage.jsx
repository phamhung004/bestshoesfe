import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import CheckoutStepIndicator from './components/CheckoutStepIndicator';
import FreeShippingBar from './components/FreeShippingBar';
import CartItemCard from './components/CartItemCard';
import BulkActionBar from './components/BulkActionBar';
import SavedForLater from './components/SavedForLater';
import OrderSummary from './components/OrderSummary';
import EmptyCartState from './components/EmptyCartState';
import UpsellSection from './components/UpsellSection';
import {
    INITIAL_CART_ITEMS,
    INITIAL_SAVED_ITEMS,
    getItemSubtotal,
    formatVND,
} from './mockCartData';
import './CartPage.css';

const CartPage = () => {
    const [cartItems, setCartItems] = useState(INITIAL_CART_ITEMS);
    const [savedItems, setSavedItems] = useState(INITIAL_SAVED_ITEMS);
    const [selectedItems, setSelectedItems] = useState([]);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [couponState, setCouponState] = useState(null);
    const [undoItem, setUndoItem] = useState(null);
    const [undoTimeout, setUndoTimeout] = useState(null);

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => sum + getItemSubtotal(item), 0);
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    // Quantity change
    const handleQtyChange = useCallback((cartItemId, newQty) => {
        if (newQty < 1) return;
        setCartItems(prev =>
            prev.map(item =>
                item.cart_item_id === cartItemId
                    ? { ...item, quantity: Math.min(newQty, item.variant.stock) }
                    : item
            )
        );
    }, []);

    // Remove item
    const handleRemoveItem = useCallback((cartItemId) => {
        const itemToRemove = cartItems.find(i => i.cart_item_id === cartItemId);
        if (!itemToRemove) return;

        setCartItems(prev => prev.filter(i => i.cart_item_id !== cartItemId));
        setSelectedItems(prev => prev.filter(id => id !== cartItemId));
        setConfirmDeleteId(null);

        // Show undo toast
        if (undoTimeout) clearTimeout(undoTimeout);
        setUndoItem(itemToRemove);
        const timeout = setTimeout(() => setUndoItem(null), 5000);
        setUndoTimeout(timeout);
    }, [cartItems, undoTimeout]);

    // Undo remove
    const handleUndo = useCallback(() => {
        if (undoItem) {
            setCartItems(prev => [...prev, undoItem]);
            setUndoItem(null);
            if (undoTimeout) clearTimeout(undoTimeout);
        }
    }, [undoItem, undoTimeout]);

    // Save item for later
    const handleSaveItem = useCallback((cartItemId) => {
        const item = cartItems.find(i => i.cart_item_id === cartItemId);
        if (!item) return;

        const savedItem = {
            saved_item_id: Date.now(),
            variant_id: item.variant_id,
            product: item.product,
            variant: item.variant,
            image_url: item.image_url,
        };

        setSavedItems(prev => [...prev, savedItem]);
        setCartItems(prev => prev.filter(i => i.cart_item_id !== cartItemId));
        setSelectedItems(prev => prev.filter(id => id !== cartItemId));
    }, [cartItems]);

    // Move saved item to cart
    const handleMoveToCart = useCallback((savedItem) => {
        const cartItem = {
            cart_item_id: Date.now(),
            variant_id: savedItem.variant_id,
            quantity: 1,
            product: savedItem.product,
            variant: savedItem.variant,
            gender: 'Unisex',
            promotion: null,
            image_url: savedItem.image_url,
        };

        setCartItems(prev => [...prev, cartItem]);
        setSavedItems(prev => prev.filter(i => i.saved_item_id !== savedItem.saved_item_id));
    }, []);

    // Remove saved item
    const handleRemoveSaved = useCallback((savedItemId) => {
        setSavedItems(prev => prev.filter(i => i.saved_item_id !== savedItemId));
    }, []);

    // Toggle select
    const handleToggleSelect = useCallback((cartItemId) => {
        setSelectedItems(prev =>
            prev.includes(cartItemId)
                ? prev.filter(id => id !== cartItemId)
                : [...prev, cartItemId]
        );
    }, []);

    // Bulk delete
    const handleDeleteSelected = useCallback(() => {
        setCartItems(prev => prev.filter(i => !selectedItems.includes(i.cart_item_id)));
        setSelectedItems([]);
    }, [selectedItems]);

    // Bulk save
    const handleSaveSelected = useCallback(() => {
        selectedItems.forEach(id => handleSaveItem(id));
        setSelectedItems([]);
    }, [selectedItems, handleSaveItem]);

    // Deselect all
    const handleDeselectAll = useCallback(() => {
        setSelectedItems([]);
    }, []);

    // Confirm delete
    const handleConfirmDelete = useCallback((cartItemId) => {
        setConfirmDeleteId(cartItemId);
    }, []);

    const handleCancelDelete = useCallback(() => {
        setConfirmDeleteId(null);
    }, []);

    // Coupon
    const handleApplyCoupon = useCallback((coupon) => {
        setCouponState(coupon);
    }, []);

    const handleRemoveCoupon = useCallback(() => {
        setCouponState(null);
    }, []);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (undoTimeout) clearTimeout(undoTimeout);
        };
    }, [undoTimeout]);

    const isEmpty = cartItems.length === 0;

    return (
        <div className="cart-page-wrapper">
            {/* Breadcrumb */}
            <div className="cart-breadcrumb-bar">
                <div className="cart-container">
                    <div className="cart-breadcrumb">
                        <Link to="/">Trang chủ</Link>
                        <span className="cart-breadcrumb-sep">/</span>
                        <Link to="/catalog">Sản phẩm</Link>
                        <span className="cart-breadcrumb-sep">/</span>
                        <span className="cart-breadcrumb-current">Giỏ hàng</span>
                    </div>

                    {/* Page Header */}
                    <div className="cart-page-header">
                        <div className="cart-page-header-left">
                            <h1 className="cart-page-title">Giỏ hàng</h1>
                            {!isEmpty && (
                                <span className="cart-item-count-badge">
                                    {itemCount} sản phẩm
                                </span>
                            )}
                        </div>
                        <Link to="/catalog" className="cart-continue-link">
                            ← Tiếp tục mua sắm
                        </Link>
                    </div>
                </div>
            </div>

            {/* Step Indicator */}
            <div className="cart-container">
                <CheckoutStepIndicator activeStep={1} />
            </div>

            {/* Main Content */}
            {isEmpty ? (
                <div className="cart-container">
                    <EmptyCartState />
                </div>
            ) : (
                <div className="cart-container">
                    <div className="cart-layout">
                        {/* Left Panel — Cart Items */}
                        <div className="cart-left-panel">
                            <FreeShippingBar totalAmount={subtotal} />

                            <BulkActionBar
                                selectedCount={selectedItems.length}
                                onDeleteSelected={handleDeleteSelected}
                                onSaveSelected={handleSaveSelected}
                                onDeselectAll={handleDeselectAll}
                            />

                            {cartItems.map((item, idx) => (
                                <CartItemCard
                                    key={item.cart_item_id}
                                    item={item}
                                    isSelected={selectedItems.includes(item.cart_item_id)}
                                    onToggleSelect={handleToggleSelect}
                                    onQtyChange={handleQtyChange}
                                    onRemove={handleRemoveItem}
                                    onSave={handleSaveItem}
                                    confirmDeleteId={confirmDeleteId}
                                    onConfirmDelete={handleConfirmDelete}
                                    onCancelDelete={handleCancelDelete}
                                    animationDelay={idx * 100}
                                />
                            ))}

                            <SavedForLater
                                savedItems={savedItems}
                                onMoveToCart={handleMoveToCart}
                                onRemoveSaved={handleRemoveSaved}
                            />
                        </div>

                        {/* Right Panel — Order Summary */}
                        <div className="cart-right-panel">
                            <OrderSummary
                                subtotal={subtotal}
                                itemCount={itemCount}
                                couponState={couponState}
                                onApplyCoupon={handleApplyCoupon}
                                onRemoveCoupon={handleRemoveCoupon}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Upsell Section */}
            <UpsellSection />

            {/* Undo Toast */}
            {undoItem && (
                <div className="cart-undo-toast">
                    <span>Đã xóa.</span>
                    <button className="cart-undo-btn" onClick={handleUndo}>Hoàn tác?</button>
                    <div className="cart-undo-timer">
                        <div className="cart-undo-timer-bar" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;
