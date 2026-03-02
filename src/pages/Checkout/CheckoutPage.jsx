import React, { useReducer, useCallback, useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { orderApi } from '../../api/orderApi';
import { addressApi } from '../../api/addressApi';
import { couponApi } from '../../api/couponApi';
import CheckoutStepIndicator from '../Cart/components/CheckoutStepIndicator';
import DeliveryMethodSelector from './components/DeliveryMethodSelector';
import SavedAddressSelector from './components/SavedAddressSelector';
import RecipientForm from './components/RecipientForm';
import AddressForm from './components/AddressForm';
import DeliveryTimeSelector from './components/DeliveryTimeSelector';
import PaymentMethodSelector from './components/PaymentMethodSelector';
import OrderNoteInput from './components/OrderNoteInput';
import OrderReviewPanel from './components/OrderReviewPanel';
import OrderSuccessState from './components/OrderSuccessState';
import {
    DELIVERY_OPTIONS,
    getItemSubtotal,
    formatAddress,
} from './checkoutConstants';
import './CheckoutPage.css';

// ─── INITIAL STATE ─────────────────────────────────────
const createInitialState = (user) => ({
    // Delivery
    deliveryMethod: 'Online',
    deliveryTime: 'standard',

    // Saved addresses (will be loaded from API)
    selectedAddressId: null,
    showManualForm: false,

    // Recipient form — pre-fill from auth context
    formData: {
        customerName: user?.fullName || '',
        customerPhone: '',
        email: user?.email || '',
        province: '',
        district: '',
        ward: '',
        street: '',
        // Store province/district codes for cascading lookups
        provinceCode: '',
        districtCode: '',
    },
    errors: {},
    touched: {},

    // Payment
    paymentMethod: 'cod',
    cardForm: {
        cardNumber: '',
        cardExpiry: '',
        cardCvv: '',
        cardName: '',
    },

    // Order
    orderNote: '',
    isSubmitting: false,
    orderSuccess: false,
    orderData: null,

    // Coupon
    couponCode: '',
    couponState: null, // { code, name, type, value, discountAmount, endDate, description, minimumAmount, maximumDiscount }
    couponLoading: false,
    couponError: '',

    // Toast
    toast: null,
});

// ─── REDUCER ───────────────────────────────────────────
function checkoutReducer(state, action) {
    switch (action.type) {
        case 'SET_DELIVERY_METHOD':
            return {
                ...state,
                deliveryMethod: action.payload,
                deliveryTime: action.payload === 'In-store' ? 'standard' : state.deliveryTime,
            };
        case 'SET_DELIVERY_TIME':
            return { ...state, deliveryTime: action.payload };
        case 'SET_SELECTED_ADDRESS':
            return { ...state, selectedAddressId: action.payload, showManualForm: false };
        case 'SET_SHOW_MANUAL_FORM':
            return { ...state, showManualForm: action.payload, selectedAddressId: null };
        case 'SET_FORM_FIELD':
            return {
                ...state,
                formData: { ...state.formData, [action.field]: action.value },
            };
        case 'SET_ERROR':
            return {
                ...state,
                errors: { ...state.errors, [action.field]: action.value },
            };
        case 'SET_ERRORS':
            return { ...state, errors: { ...state.errors, ...action.payload } };
        case 'SET_TOUCHED':
            return {
                ...state,
                touched: { ...state.touched, [action.field]: true },
            };
        case 'SET_PAYMENT_METHOD':
            return { ...state, paymentMethod: action.payload };
        case 'SET_CARD_FIELD':
            return {
                ...state,
                cardForm: { ...state.cardForm, [action.field]: action.value },
            };
        case 'SET_ORDER_NOTE':
            return { ...state, orderNote: action.payload };
        case 'SET_SUBMITTING':
            return { ...state, isSubmitting: action.payload };
        case 'SET_ORDER_SUCCESS':
            return { ...state, orderSuccess: true, orderData: action.payload };
        case 'SET_TOAST':
            return { ...state, toast: action.payload };
        case 'SET_COUPON_CODE':
            return { ...state, couponCode: action.payload };
        case 'SET_COUPON_LOADING':
            return { ...state, couponLoading: action.payload };
        case 'SET_COUPON_STATE':
            return { ...state, couponState: action.payload, couponError: '' };
        case 'SET_COUPON_ERROR':
            return { ...state, couponError: action.payload, couponState: null };
        case 'CLEAR_COUPON':
            return { ...state, couponCode: '', couponState: null, couponError: '' };
        case 'SET_SELECTED_ADDRESS_FROM_LIST':
            return { ...state, selectedAddressId: action.payload, showManualForm: false };
        default:
            return state;
    }
}

// ─── VALIDATION ────────────────────────────────────────
const phoneRegex = /^(0|\+84)(3|5|7|8|9)\d{8}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateField(field, value, state) {
    switch (field) {
        case 'customerName':
            if (!value || value.trim().length < 2)
                return 'Vui lòng nhập họ và tên (ít nhất 2 ký tự)';
            if (/\d/.test(value)) return 'Họ tên không được chứa số';
            return '';
        case 'customerPhone': {
            const digits = value.replace(/\s/g, '');
            if (!digits) return 'Vui lòng nhập số điện thoại';
            if (!phoneRegex.test(digits)) return 'Số điện thoại không hợp lệ (VD: 0912345678)';
            return '';
        }
        case 'email':
            if (value && !emailRegex.test(value)) return 'Email không đúng định dạng';
            return '';
        case 'province':
            if (!value) return 'Vui lòng chọn Tỉnh/Thành phố';
            return '';
        case 'district':
            if (!value) return 'Vui lòng chọn Quận/Huyện';
            return '';
        case 'ward':
            if (!value) return 'Vui lòng chọn Phường/Xã';
            return '';
        case 'street':
            if (!value || value.trim().length < 5) return 'Vui lòng nhập địa chỉ cụ thể';
            return '';
        case 'cardNumber': {
            const digits = value.replace(/\s/g, '');
            if (!digits || digits.length !== 16) return 'Số thẻ không hợp lệ';
            return '';
        }
        case 'cardExpiry': {
            if (!value || value.length !== 5) return 'Thẻ đã hết hạn';
            const [mm, yy] = value.split('/');
            const month = parseInt(mm, 10);
            const year = parseInt('20' + yy, 10);
            if (month < 1 || month > 12) return 'Thẻ đã hết hạn';
            const now = new Date();
            const exp = new Date(year, month);
            if (exp < now) return 'Thẻ đã hết hạn';
            return '';
        }
        case 'cardCvv':
            if (!value || value.length < 3) return 'CVV không hợp lệ';
            return '';
        case 'cardName':
            if (!value || value.trim().length < 2) return 'Vui lòng nhập tên chủ thẻ';
            return '';
        default:
            return '';
    }
}

// ─── COMPONENT ─────────────────────────────────────────
const CheckoutPage = () => {
    const { cartItems, clearCart } = useCart();
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [state, dispatch] = useReducer(checkoutReducer, user, createInitialState);
    const formRef = useRef(null);
    const [savedAddresses, setSavedAddresses] = useState([]);

    // Redirect to cart if empty (and not in success state)
    useEffect(() => {
        if (!state.orderSuccess && cartItems.length === 0) {
            navigate('/cart');
        }
    }, [cartItems, state.orderSuccess, navigate]);

    // Fetch saved addresses on mount
    useEffect(() => {
        if (!isAuthenticated) return;
        addressApi.getMyAddresses()
            .then((res) => {
                const list = res.data || [];
                setSavedAddresses(list);
                // Auto-select default address
                const defaultAddr = list.find((a) => a.isDefault);
                if (defaultAddr) {
                    dispatch({ type: 'SET_SELECTED_ADDRESS', payload: defaultAddr.addressId });
                    // Pre-fill recipient info from saved address
                    if (defaultAddr.phone) {
                        dispatch({ type: 'SET_FORM_FIELD', field: 'customerPhone', value: defaultAddr.phone });
                        dispatch({ type: 'SET_ERROR', field: 'customerPhone', value: '' });
                    }
                    if (defaultAddr.recipientName) {
                        dispatch({ type: 'SET_FORM_FIELD', field: 'customerName', value: defaultAddr.recipientName });
                        dispatch({ type: 'SET_ERROR', field: 'customerName', value: '' });
                    }
                }
            })
            .catch(() => { /* ignore — user can enter manually */ });
    }, [isAuthenticated]);

    const isLoggedIn = isAuthenticated;

    // ── Calculations ────────────────────────────────────
    const subtotal = cartItems.reduce((sum, item) => sum + getItemSubtotal(item), 0);
    const deliveryOption = DELIVERY_OPTIONS.find((o) => o.id === state.deliveryTime);
    const shippingCost = state.deliveryMethod === 'In-store' ? 0 : (deliveryOption?.cost || 0);
    const discountAmount = state.couponState?.discountAmount || 0;
    const total = subtotal + shippingCost - discountAmount;

    // ── Handlers ────────────────────────────────────────
    const handleFormChange = useCallback((field, value) => {
        dispatch({ type: 'SET_FORM_FIELD', field, value });
        // Clear error on change
        const error = validateField(field, value, state);
        dispatch({ type: 'SET_ERROR', field, value: error });
    }, [state]);

    const handleFormBlur = useCallback((field) => {
        dispatch({ type: 'SET_TOUCHED', field });
        const value = state.formData[field];
        const error = validateField(field, value, state);
        dispatch({ type: 'SET_ERROR', field, value: error });
    }, [state.formData]);

    const handleCardChange = useCallback((field, value) => {
        dispatch({ type: 'SET_CARD_FIELD', field, value });
        const error = validateField(field, value, state);
        dispatch({ type: 'SET_ERROR', field, value: error });
    }, [state]);

    const handleCardBlur = useCallback((field) => {
        dispatch({ type: 'SET_TOUCHED', field });
        const value = state.cardForm[field];
        const error = validateField(field, value, state);
        dispatch({ type: 'SET_ERROR', field, value: error });
    }, [state.cardForm]);

    const handleCopyBankAccount = useCallback((text) => {
        navigator.clipboard.writeText(text).catch(() => { });
        dispatch({ type: 'SET_TOAST', payload: 'Đã sao chép số tài khoản!' });
        setTimeout(() => dispatch({ type: 'SET_TOAST', payload: null }), 2000);
    }, []);

    // ── Coupon handlers ─────────────────────────────────
    const handleApplyCoupon = useCallback(async (code) => {
        if (!code || !code.trim()) return;
        dispatch({ type: 'SET_COUPON_LOADING', payload: true });
        dispatch({ type: 'SET_COUPON_ERROR', payload: '' });
        try {
            const res = await couponApi.validate(code.trim(), subtotal);
            const data = res.data;
            if (data.valid) {
                dispatch({
                    type: 'SET_COUPON_STATE',
                    payload: {
                        code: data.code,
                        name: data.name,
                        type: data.type,
                        value: data.value,
                        discountAmount: data.discountAmount || 0,
                        endDate: data.coupon?.endDate || data.endDate || null,
                        description: data.coupon?.description || data.description || '',
                        minimumAmount: data.coupon?.minimumAmount || data.minimumAmount || 0,
                        maximumDiscount: data.coupon?.maximumDiscount || data.maximumDiscount || null,
                    },
                });
            } else {
                dispatch({ type: 'SET_COUPON_ERROR', payload: data.message || 'Mã giảm giá không hợp lệ hoặc đã hết hạn' });
            }
        } catch (err) {
            dispatch({ type: 'SET_COUPON_ERROR', payload: err.message || 'Không thể áp dụng mã giảm giá' });
        } finally {
            dispatch({ type: 'SET_COUPON_LOADING', payload: false });
        }
    }, [subtotal]);

    const handleRemoveCoupon = useCallback(() => {
        dispatch({ type: 'CLEAR_COUPON' });
    }, []);

    // ── Re-validate coupon when subtotal changes ────────
    const prevSubtotalRef = useRef(subtotal);
    useEffect(() => {
        if (!state.couponState) return;
        if (prevSubtotalRef.current === subtotal) return;
        prevSubtotalRef.current = subtotal;

        // If cart is empty, auto-remove
        if (cartItems.length === 0 || subtotal === 0) {
            dispatch({ type: 'CLEAR_COUPON' });
            return;
        }

        // If subtotal < minimumAmount, auto-remove
        if (state.couponState.minimumAmount && subtotal < state.couponState.minimumAmount) {
            dispatch({ type: 'CLEAR_COUPON' });
            dispatch({ type: 'SET_TOAST', payload: 'Mã giảm giá đã bị gỡ do đơn hàng không đủ giá trị tối thiểu' });
            setTimeout(() => dispatch({ type: 'SET_TOAST', payload: null }), 4000);
            return;
        }

        // Re-validate to recalculate discount for new subtotal
        const revalidate = async () => {
            try {
                const res = await couponApi.validate(state.couponState.code, subtotal);
                const data = res.data;
                if (data.valid) {
                    dispatch({
                        type: 'SET_COUPON_STATE',
                        payload: {
                            ...state.couponState,
                            discountAmount: data.discountAmount || 0,
                        },
                    });
                } else {
                    dispatch({ type: 'CLEAR_COUPON' });
                }
            } catch {
                // Keep current coupon on network error
            }
        };

        const timer = setTimeout(revalidate, 300);
        return () => clearTimeout(timer);
    }, [subtotal, state.couponState, cartItems.length]);

    // ── Get selected address ────────────────────────────
    const selectedAddress = savedAddresses.find(
        (a) => a.addressId === state.selectedAddressId
    );

    // ── Full validation ─────────────────────────────────
    const validateAll = () => {
        const newErrors = {};
        const touched = {};

        // Recipient fields — always required
        ['customerName', 'customerPhone', 'email'].forEach((f) => {
            const err = validateField(f, state.formData[f], state);
            if (err) newErrors[f] = err;
            touched[f] = true;
        });

        // Address fields — only if delivery + manual form
        if (state.deliveryMethod === 'Online' && !selectedAddress) {
            ['province', 'district', 'ward', 'street'].forEach((f) => {
                const err = validateField(f, state.formData[f], state);
                if (err) newErrors[f] = err;
                touched[f] = true;
            });
        }

        // Card fields — only if card payment
        if (state.paymentMethod === 'card') {
            ['cardNumber', 'cardExpiry', 'cardCvv', 'cardName'].forEach((f) => {
                const err = validateField(f, state.cardForm[f], state);
                if (err) newErrors[f] = err;
                touched[f] = true;
            });
        }

        // Set all touched + errors
        Object.keys(touched).forEach((f) => {
            dispatch({ type: 'SET_TOUCHED', field: f });
        });
        dispatch({ type: 'SET_ERRORS', payload: newErrors });

        return newErrors;
    };

    // ── Submit ──────────────────────────────────────────
    const handleSubmit = useCallback(async () => {
        const errors = validateAll();
        const errorFields = Object.keys(errors).filter((f) => errors[f]);

        if (errorFields.length > 0) {
            // Scroll to first error
            const firstEl = document.querySelector(`.co-form-input.error, .co-form-select.error`);
            if (firstEl) {
                firstEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        // Start submitting
        dispatch({ type: 'SET_SUBMITTING', payload: true });

        try {
            // Build checkout request
            const checkoutData = {
                customerName: state.formData.customerName,
                customerPhone: state.formData.customerPhone.replace(/\s/g, ''),
                email: state.formData.email,
                orderType: state.deliveryMethod,
                shippingMethod: state.deliveryTime,
                paymentMethod: state.paymentMethod,
                orderNote: state.orderNote || null,
                couponCode: state.couponState?.code || null,
            };

            // Address: either saved or manual
            if (selectedAddress) {
                checkoutData.addressId = selectedAddress.addressId;
            } else if (state.deliveryMethod === 'Online') {
                checkoutData.shippingProvince = state.formData.province;
                checkoutData.shippingDistrict = state.formData.district;
                checkoutData.shippingWard = state.formData.ward;
                checkoutData.shippingAddress = state.formData.street;
            }

            // Call real API
            const res = await orderApi.checkout(checkoutData);
            const orderResult = res.data;

            // Build address display string for success page
            let addressStr = '';
            if (selectedAddress) {
                addressStr = formatAddress(selectedAddress);
            } else if (state.deliveryMethod === 'Online') {
                addressStr = [
                    state.formData.street,
                    state.formData.ward,
                    state.formData.district,
                    state.formData.province,
                ].filter(Boolean).join(', ');
            }

            // Save cart items before clearing (for success page display)
            const savedItems = [...cartItems];

            // Cart is cleared by backend — refresh frontend state
            await clearCart();

            dispatch({
                type: 'SET_ORDER_SUCCESS',
                payload: {
                    orderNumber: orderResult.orderNumber,
                    customerName: state.formData.customerName,
                    customerPhone: state.formData.customerPhone,
                    email: state.formData.email,
                    address: addressStr,
                    deliveryMethod: state.deliveryMethod,
                    deliveryTime: state.deliveryTime,
                    paymentMethod: state.paymentMethod,
                    subtotal: orderResult.subtotal,
                    shippingCost: orderResult.shippingCost,
                    couponDiscountAmount: orderResult.couponDiscountAmount,
                    totalAmount: orderResult.totalAmount,
                    items: savedItems,
                },
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (err) {
            const msg = err.message || 'Đặt hàng thất bại. Vui lòng thử lại.';
            const msgLower = msg.toLowerCase();

            // Auto-remove coupon on coupon-specific errors
            if (state.couponState && (
                msgLower.includes('coupon') || msgLower.includes('phiếu giảm giá') ||
                msgLower.includes('mã giảm giá') || msgLower.includes('hết lượt') ||
                msgLower.includes('hết hạn') || msgLower.includes('expired')
            )) {
                dispatch({ type: 'CLEAR_COUPON' });
                dispatch({ type: 'SET_TOAST', payload: `⚠ Mã giảm giá không còn hợp lệ: ${msg}` });
            } else {
                dispatch({ type: 'SET_TOAST', payload: msg });
            }
            setTimeout(() => dispatch({ type: 'SET_TOAST', payload: null }), 4000);
        } finally {
            dispatch({ type: 'SET_SUBMITTING', payload: false });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state, selectedAddress, clearCart, cartItems]);

    // ── RENDER SUCCESS STATE ────────────────────────────
    if (state.orderSuccess) {
        return (
            <div className="checkout-page-wrapper">
                <OrderSuccessState
                    orderData={state.orderData}
                    items={state.orderData?.items || []}
                    total={state.orderData?.totalAmount || total}
                />
            </div>
        );
    }

    // ── RENDER CHECKOUT FORM ────────────────────────────
    return (
        <div className="checkout-page-wrapper">
            {/* Breadcrumb */}
            <div className="checkout-breadcrumb-bar">
                <div className="checkout-container">
                    <div className="checkout-breadcrumb">
                        <Link to="/">Trang chủ</Link>
                        <span className="checkout-breadcrumb-sep">/</span>
                        <Link to="/cart">Giỏ hàng</Link>
                        <span className="checkout-breadcrumb-sep">/</span>
                        <span className="checkout-breadcrumb-current">Thanh toán</span>
                    </div>
                    <div className="checkout-page-header">
                        <h1 className="checkout-page-title">Thanh toán</h1>
                    </div>
                </div>
            </div>

            {/* Step Indicator */}
            <div className="checkout-container">
                <CheckoutStepIndicator activeStep={2} />
            </div>

            {/* Main Content */}
            <div className="checkout-container">
                <div className="checkout-layout" ref={formRef}>
                    {/* ── LEFT PANEL ── */}
                    <div className="checkout-left-panel">
                        {/* A: Delivery method */}
                        <DeliveryMethodSelector
                            deliveryMethod={state.deliveryMethod}
                            onSelect={(m) => dispatch({ type: 'SET_DELIVERY_METHOD', payload: m })}
                        />

                        {/* B: Saved addresses (logged in + delivery) */}
                        {isLoggedIn && state.deliveryMethod === 'Online' && (
                            <SavedAddressSelector
                                addresses={savedAddresses}
                                selectedAddressId={state.selectedAddressId}
                                onSelectAddress={(id) => {
                                dispatch({ type: 'SET_SELECTED_ADDRESS', payload: id });
                                const addr = savedAddresses.find((a) => a.addressId === id);
                                if (addr) {
                                    if (addr.phone) {
                                        dispatch({ type: 'SET_FORM_FIELD', field: 'customerPhone', value: addr.phone });
                                        dispatch({ type: 'SET_ERROR', field: 'customerPhone', value: '' });
                                    }
                                    if (addr.recipientName) {
                                        dispatch({ type: 'SET_FORM_FIELD', field: 'customerName', value: addr.recipientName });
                                        dispatch({ type: 'SET_ERROR', field: 'customerName', value: '' });
                                    }
                                }
                            }}
                                onUseOther={() => dispatch({ type: 'SET_SHOW_MANUAL_FORM', payload: true })}
                                showManualForm={state.showManualForm}
                            />
                        )}

                        {/* C: Recipient info */}
                        <RecipientForm
                            formData={state.formData}
                            errors={state.errors}
                            touched={state.touched}
                            onChange={handleFormChange}
                            onBlur={handleFormBlur}
                        />

                        {/* D: Address form (delivery + manual) */}
                        {state.deliveryMethod === 'Online' && (
                            !isLoggedIn || state.showManualForm || !state.selectedAddressId
                        ) && (
                                <AddressForm
                                    formData={state.formData}
                                    errors={state.errors}
                                    touched={state.touched}
                                    onChange={handleFormChange}
                                    onBlur={handleFormBlur}
                                />
                            )}

                        {/* E: Delivery time (delivery only) */}
                        {state.deliveryMethod === 'Online' && (
                            <DeliveryTimeSelector
                                selectedTime={state.deliveryTime}
                                onSelect={(t) => dispatch({ type: 'SET_DELIVERY_TIME', payload: t })}
                            />
                        )}

                        {/* F: Payment method */}
                        <PaymentMethodSelector
                            selectedMethod={state.paymentMethod}
                            onSelect={(m) => dispatch({ type: 'SET_PAYMENT_METHOD', payload: m })}
                            cardForm={state.cardForm}
                            onCardChange={handleCardChange}
                            errors={state.errors}
                            touched={state.touched}
                            onBlur={handleCardBlur}
                            onCopyBankAccount={handleCopyBankAccount}
                        />

                        {/* G: Order note */}
                        <OrderNoteInput
                            value={state.orderNote}
                            onChange={(v) => dispatch({ type: 'SET_ORDER_NOTE', payload: v })}
                        />

                        {/* H: Submit */}
                        <div className="co-submit-section">
                            <button
                                className="co-submit-btn"
                                disabled={state.isSubmitting}
                                onClick={handleSubmit}
                            >
                                {state.isSubmitting ? (
                                    <>
                                        <span className="co-submit-spinner" />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    'Đặt hàng ngay →'
                                )}
                            </button>
                            <div className="co-submit-footer">
                                <p>🔒 Thông tin của bạn được bảo mật tuyệt đối</p>
                                <p>
                                    Bằng cách đặt hàng, bạn đồng ý với{' '}
                                    <a href="#">Điều khoản sử dụng</a> và{' '}
                                    <a href="#">Chính sách bảo mật</a> của BestShoes.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT PANEL ── */}
                    <div className="checkout-right-panel">
                        <OrderReviewPanel
                            items={cartItems}
                            coupon={state.couponState}
                            subtotal={subtotal}
                            shippingCost={shippingCost}
                            discountAmount={discountAmount}
                            total={total}
                            isSubmitting={state.isSubmitting}
                            onSubmit={handleSubmit}
                            couponCode={state.couponCode}
                            couponLoading={state.couponLoading}
                            couponError={state.couponError}
                            onCouponCodeChange={(code) => dispatch({ type: 'SET_COUPON_CODE', payload: code })}
                            onApplyCoupon={handleApplyCoupon}
                            onRemoveCoupon={handleRemoveCoupon}
                        />
                    </div>
                </div>
            </div>

            {/* Toast */}
            {state.toast && (
                <div className="co-toast">{state.toast}</div>
            )}
        </div>
    );
};

export default CheckoutPage;
