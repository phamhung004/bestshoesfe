import React, { useReducer, useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
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
    MOCK_CUSTOMER,
    SAVED_ADDRESSES,
    INITIAL_CART_ITEMS,
    APPLIED_COUPON,
    DELIVERY_OPTIONS,
    getItemSubtotal,
    generateOrderNumber,
    formatAddress,
} from './mockCheckoutData';
import './CheckoutPage.css';

// ─── INITIAL STATE ─────────────────────────────────────
const initialState = {
    // Delivery
    deliveryMethod: 'Online',
    deliveryTime: 'standard',

    // Saved addresses
    selectedAddressId: SAVED_ADDRESSES.find((a) => a.is_default)?.address_id || null,
    showManualForm: false,

    // Recipient form
    formData: {
        customerName: MOCK_CUSTOMER.full_name,
        customerPhone: MOCK_CUSTOMER.phone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3'),
        email: MOCK_CUSTOMER.email,
        province: '',
        district: '',
        ward: '',
        street: '',
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

    // Toast
    toast: null,
};

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
    const [state, dispatch] = useReducer(checkoutReducer, initialState);
    const formRef = useRef(null);
    const [shakeField, setShakeField] = useState(null);

    const cartItems = INITIAL_CART_ITEMS;
    const coupon = APPLIED_COUPON;
    const isLoggedIn = !!MOCK_CUSTOMER.customer_id;

    // ── Calculations ────────────────────────────────────
    const subtotal = cartItems.reduce((sum, item) => sum + getItemSubtotal(item), 0);
    const deliveryOption = DELIVERY_OPTIONS.find((o) => o.id === state.deliveryTime);
    const shippingCost = state.deliveryMethod === 'In-store' ? 0 : (deliveryOption?.cost || 0);
    const discountAmount = coupon
        ? (coupon.type === 'Percentage' ? Math.round(subtotal * coupon.value / 100) : coupon.value)
        : 0;
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

    // ── Get selected address ────────────────────────────
    const selectedAddress = SAVED_ADDRESSES.find(
        (a) => a.address_id === state.selectedAddressId
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
    const handleSubmit = useCallback(() => {
        const errors = validateAll();
        const errorFields = Object.keys(errors).filter((f) => errors[f]);

        if (errorFields.length > 0) {
            // Scroll to first error and shake it
            setShakeField(errorFields[0]);
            setTimeout(() => setShakeField(null), 300);

            const firstEl = document.querySelector(`.co-form-input.error, .co-form-select.error`);
            if (firstEl) {
                firstEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        // Start submitting
        dispatch({ type: 'SET_SUBMITTING', payload: true });

        // Build address string
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

        // Fake processing
        setTimeout(() => {
            dispatch({
                type: 'SET_ORDER_SUCCESS',
                payload: {
                    orderNumber: generateOrderNumber(),
                    customerName: state.formData.customerName,
                    customerPhone: state.formData.customerPhone,
                    email: state.formData.email,
                    address: addressStr,
                    deliveryMethod: state.deliveryMethod,
                    deliveryTime: state.deliveryTime,
                    paymentMethod: state.paymentMethod,
                },
            });
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 1500);
    }, [state, selectedAddress]);

    // ── RENDER SUCCESS STATE ────────────────────────────
    if (state.orderSuccess) {
        return (
            <div className="checkout-page-wrapper">
                <OrderSuccessState
                    orderData={state.orderData}
                    items={cartItems}
                    total={total}
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
                                addresses={SAVED_ADDRESSES}
                                selectedAddressId={state.selectedAddressId}
                                onSelectAddress={(id) => dispatch({ type: 'SET_SELECTED_ADDRESS', payload: id })}
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
                            coupon={coupon}
                            subtotal={subtotal}
                            shippingCost={shippingCost}
                            discountAmount={discountAmount}
                            total={total}
                            isSubmitting={state.isSubmitting}
                            onSubmit={handleSubmit}
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
