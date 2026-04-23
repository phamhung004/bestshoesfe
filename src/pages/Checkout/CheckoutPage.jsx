import React, { useReducer, useCallback, useRef, useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { orderApi } from '../../api/orderApi';
import { addressApi } from '../../api/addressApi';
import { couponApi } from '../../api/couponApi';
import { shippingApi } from '../../api/shippingApi';
import CheckoutStepIndicator from '../Cart/components/CheckoutStepIndicator';
import DeliveryMethodSelector from './components/DeliveryMethodSelector';
import SavedAddressSelector from './components/SavedAddressSelector';
import RecipientForm from './components/RecipientForm';
import AddressForm from './components/AddressForm';
import PaymentMethodSelector from './components/PaymentMethodSelector';
import OrderNoteInput from './components/OrderNoteInput';
import OrderReviewPanel from './components/OrderReviewPanel';
import OrderSuccessState from './components/OrderSuccessState';
import PriceChangeModal from './components/PriceChangeModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import {
    getItemPrice,
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
        // Store GHN province/district/ward codes for cascading lookups & fee calc
        provinceCode: '',
        districtCode: '',
        wardCode: '',
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

    // Shipping fee (calculated via GHN API)
    shippingFee: null,        // { total, serviceFee, insuranceFee }
    shippingFeeLoading: false,
    shippingFeeError: '',

    // Price updates from 409 response: { [variantId]: newPrice }
    priceUpdates: {},
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
        case 'SET_SHIPPING_FEE':
            return { ...state, shippingFee: action.payload, shippingFeeError: '' };
        case 'SET_SHIPPING_FEE_LOADING':
            return { ...state, shippingFeeLoading: action.payload };
        case 'SET_SHIPPING_FEE_ERROR':
            return { ...state, shippingFeeError: action.payload, shippingFee: null };
        case 'UPDATE_PRICES':
            return { ...state, priceUpdates: { ...state.priceUpdates, ...action.payload } };
        default:
            return state;
    }
}

// ─── VALIDATION ────────────────────────────────────────
const phoneRegex = /^(0|\+84)(3|5|7|8|9)\d{8}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateField(field, value) {
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
    const { cartItems, fetchCart } = useCart();
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const selectedCartItemIds = useMemo(
        () => Array.isArray(location.state?.selectedCartItemIds)
            ? location.state.selectedCartItemIds
            : null,
        [location.state]
    );

    const checkoutItems = useMemo(() => {
        if (!selectedCartItemIds || selectedCartItemIds.length === 0) return cartItems;
        return cartItems.filter(item => selectedCartItemIds.includes(item.cart_item_id));
    }, [cartItems, selectedCartItemIds]);

    const [state, dispatch] = useReducer(checkoutReducer, user, createInitialState);
    const formRef = useRef(null);
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [showConfirmOrder, setShowConfirmOrder] = useState(false);
    const [showPriceChangeModal, setShowPriceChangeModal] = useState(false);
    const [priceChangedItems, setPriceChangedItems] = useState([]);

    // Redirect to cart if empty (and not in success state)
    useEffect(() => {
        if (!state.orderSuccess && checkoutItems.length === 0) {
            navigate('/cart');
        }
    }, [checkoutItems, state.orderSuccess, navigate]);

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

    // ── Helper: get effective price considering server-side price updates ──
    const getEffectivePrice = useCallback((item) => {
        const variantId = item.variant?.variant_id;
        if (variantId && state.priceUpdates[variantId] !== undefined) {
            return state.priceUpdates[variantId];
        }
        return getItemPrice(item);
    }, [state.priceUpdates]);

    // ── Effective items with price overrides applied ────
    const effectiveCheckoutItems = useMemo(() => {
        if (Object.keys(state.priceUpdates).length === 0) return checkoutItems;
        return checkoutItems.map(item => {
            const vid = item.variant?.variant_id;
            if (vid && state.priceUpdates[vid] !== undefined) {
                return {
                    ...item,
                    variant: { ...item.variant, price: state.priceUpdates[vid] },
                    promotion: null,
                };
            }
            return item;
        });
    }, [checkoutItems, state.priceUpdates]);

    // ── Calculations ────────────────────────────────────
    const subtotal = checkoutItems.reduce((sum, item) => sum + getEffectivePrice(item) * item.quantity, 0);
    const shippingCost = state.deliveryMethod === 'In-store' ? 0 : (state.shippingFee?.total || 0);
    const discountAmount = state.couponState?.discountAmount || 0;
    const total = subtotal + shippingCost - discountAmount;

    // ── Handlers ────────────────────────────────────────
    const handleFormChange = useCallback((field, value) => {
        dispatch({ type: 'SET_FORM_FIELD', field, value });
        // Clear error on change
        const error = validateField(field, value);
        dispatch({ type: 'SET_ERROR', field, value: error });
    }, [state]);

    const handleFormBlur = useCallback((field) => {
        dispatch({ type: 'SET_TOUCHED', field });
        const value = state.formData[field];
        let error = validateField(field, value, state);
        // Email is required for guest checkout
        if (field === 'email' && !isLoggedIn && (!value || !value.trim())) {
            error = 'Vui lòng nhập email để nhận thông tin đơn hàng';
        }
        dispatch({ type: 'SET_ERROR', field, value: error });
    }, [state.formData, isLoggedIn]);

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
            // axiosClient interceptor already unwraps response.data,
            // so `res` = ApiResponse { status, message, data: { valid, code, ... } }
            // The actual coupon payload is at res.data
            const res = await couponApi.validate(code.trim(), subtotal);
            const payload = res?.data ?? res; // res.data = { valid, code, discountAmount, ... }
            console.log('[Coupon] validate response:', res, 'payload:', payload);
            if (payload?.valid) {
                dispatch({
                    type: 'SET_COUPON_STATE',
                    payload: {
                        code: payload.code,
                        name: payload.name,
                        type: payload.type,
                        value: payload.value,
                        discountAmount: payload.discountAmount || 0,
                        endDate: payload.endDate || null,
                        description: payload.description || '',
                        minimumAmount: payload.minimumAmount || 0,
                        maximumDiscount: payload.maximumDiscount || null,
                        perCustomerLimit: payload.perCustomerLimit ?? null,
                        customerRemainingUses: payload.customerRemainingUses ?? null,
                    },
                });
            } else {
                dispatch({ type: 'SET_COUPON_ERROR', payload: payload?.reason || res?.message || payload?.message || 'Mã giảm giá không hợp lệ hoặc đã hết hạn' });
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
        if (checkoutItems.length === 0 || subtotal === 0) {
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
                // axiosClient unwraps response.data → res = ApiResponse, res.data = payload
                const payload = res?.data ?? res;
                if (payload?.valid) {
                    dispatch({
                        type: 'SET_COUPON_STATE',
                        payload: {
                            ...state.couponState,
                            discountAmount: payload.discountAmount || 0,
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
    }, [subtotal, state.couponState, checkoutItems.length]);

    // ── Get selected address ────────────────────────────
    const selectedAddress = savedAddresses.find(
        (a) => a.addressId === state.selectedAddressId
    );
    // ── Real-time shipping fee calculation via GHN ──────
    useEffect(() => {
        // Don't calculate for in-store pickup
        if (state.deliveryMethod !== 'Online') {
            dispatch({ type: 'SET_SHIPPING_FEE', payload: null });
            return;
        }

        // Determine GHN district/ward from either selected address or manual form
        let districtId = null;
        let wardCode = null;

        if (selectedAddress) {
            districtId = selectedAddress.ghnDistrictId;
            wardCode = selectedAddress.ghnWardCode;
        } else if (state.formData.districtCode && state.formData.wardCode) {
            districtId = Number(state.formData.districtCode);
            wardCode = String(state.formData.wardCode);
        }

        if (!districtId || !wardCode) {
            // If addressId is selected but GHN IDs are missing, surface a clear error
            if (selectedAddress) {
                dispatch({
                    type: 'SET_SHIPPING_FEE_ERROR',
                    payload: 'Địa chỉ này chưa có thông tin quận/huyện GHN. Vui lòng chọn "Dùng địa chỉ khác" để nhập địa chỉ mới có đầy đủ thông tin.',
                });
            } else {
                dispatch({ type: 'SET_SHIPPING_FEE', payload: null });
            }
            return;
        }

        // Calculate total weight from cart items (grams)
        const totalWeight = checkoutItems.reduce((sum, item) => {
            const w = item.variant?.weight || 500; // default 500g per pair
            return sum + w * item.quantity;
        }, 0);

        dispatch({ type: 'SET_SHIPPING_FEE_LOADING', payload: true });

        const timer = setTimeout(async () => {
            try {
                const res = await shippingApi.calculateFee({
                    toDistrictId: districtId,
                    toWardCode: wardCode,
                    weight: totalWeight > 0 ? totalWeight : 500,
                });
                const feeData = res.data?.data || res.data;
                dispatch({ type: 'SET_SHIPPING_FEE', payload: feeData });
            } catch (err) {
                console.error('Failed to calculate shipping fee:', err);
                dispatch({ type: 'SET_SHIPPING_FEE_ERROR', payload: 'Không thể tính phí vận chuyển' });
            } finally {
                dispatch({ type: 'SET_SHIPPING_FEE_LOADING', payload: false });
            }
        }, 400); // debounce

        return () => clearTimeout(timer);
    }, [
        state.deliveryMethod,
        state.selectedAddressId,
        selectedAddress?.ghnDistrictId,
        selectedAddress?.ghnWardCode,
        state.formData.districtCode,
        state.formData.wardCode,
        checkoutItems,
    ]);
    // ── Full validation ─────────────────────────────────
    const validateAll = () => {
        const newErrors = {};
        const touched = {};

        // Recipient fields — always required
        ['customerName', 'customerPhone'].forEach((f) => {
            const err = validateField(f, state.formData[f]);
            if (err) newErrors[f] = err;
            touched[f] = true;
        });

        // Email — required for guest, optional for logged-in (validate format if filled)
        if (!isLoggedIn) {
            const emailErr = validateField('email', state.formData.email);
            if (!state.formData.email || !state.formData.email.trim()) {
                newErrors['email'] = 'Vui lòng nhập email để nhận thông tin đơn hàng';
            } else if (emailErr) {
                newErrors['email'] = emailErr;
            }
            touched['email'] = true;
        } else if (state.formData.email) {
            const emailErr = validateField('email', state.formData.email);
            if (emailErr) newErrors['email'] = emailErr;
            touched['email'] = true;
        }

        // Address fields — required if Online delivery AND (guest OR manual form OR no saved address)
        if (state.deliveryMethod === 'Online' && (!isLoggedIn || state.showManualForm || !state.selectedAddressId)) {
            ['province', 'district', 'ward', 'street'].forEach((f) => {
                const err = validateField(f, state.formData[f]);
                if (err) newErrors[f] = err;
                touched[f] = true;
            });
        }

        // Card fields — only if card payment
        if (state.paymentMethod === 'card') {
            ['cardNumber', 'cardExpiry', 'cardCvv', 'cardName'].forEach((f) => {
                const err = validateField(f, state.cardForm[f]);
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
            const firstEl = document.querySelector(`.co-form-input.error, .co-form-select.error`);
            if (firstEl) {
                firstEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        setShowConfirmOrder(true);
    }, [state]);

    const submitOrder = useCallback(async () => {
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
                cartItemIds: checkoutItems.map(item => item.cart_item_id),
            };

            // Include client-side prices for price verification
            checkoutData.clientPrices = checkoutItems.map(item => ({
                variantId: item.variant?.variant_id,
                price: getEffectivePrice(item),
            }));

            // Address: either saved or manual
            if (selectedAddress) {
                checkoutData.addressId = selectedAddress.addressId;
            } else if (state.deliveryMethod === 'Online') {
                checkoutData.shippingProvince = state.formData.province;
                checkoutData.shippingDistrict = state.formData.district;
                checkoutData.shippingWard = state.formData.ward;
                checkoutData.shippingAddress = state.formData.street;
                // Include GHN IDs for shipping fee calculation on backend
                checkoutData.ghnDistrictId = state.formData.districtCode ? Number(state.formData.districtCode) : null;
                checkoutData.ghnWardCode = state.formData.wardCode || null;
            }

            // Call real API — pass sessionId for guest users
            const sessionId = !isAuthenticated ? localStorage.getItem('cart_session_id') : null;
            const res = await orderApi.checkout(checkoutData, sessionId);
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

            // Save checkout items before cart mutations (for success page display)
            const savedItems = [...checkoutItems];

            // Backend removes only the checked-out rows, so refresh cart state from source of truth.
            await fetchCart();

            dispatch({
                type: 'SET_ORDER_SUCCESS',
                payload: {
                    ...orderResult,
                    orderNumber: orderResult.orderNumber,
                    paymentReference: orderResult.paymentReference,
                    customerName: orderResult.customerName || state.formData.customerName,
                    customerPhone: orderResult.customerPhone || state.formData.customerPhone,
                    email: orderResult.email || state.formData.email,
                    address: orderResult.shippingAddress
                        ? [
                            orderResult.shippingAddress,
                            orderResult.shippingWard,
                            orderResult.shippingDistrict,
                            orderResult.shippingProvince,
                        ].filter(Boolean).join(', ')
                        : addressStr,
                    deliveryMethod: orderResult.orderType || state.deliveryMethod,
                    deliveryTime: state.deliveryTime,
                    paymentMethod: orderResult.paymentMethod || state.paymentMethod,
                    subtotal: orderResult.subtotal,
                    netProductAmount: orderResult.netProductAmount,
                    shippingCost: orderResult.shippingCost,
                    couponDiscountAmount: orderResult.couponDiscountAmount,
                    totalAmount: orderResult.totalAmount,
                    items: Array.isArray(orderResult.items) && orderResult.items.length > 0
                        ? orderResult.items
                        : savedItems,
                },
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (err) {
            // Handle price conflict (409)
            if (err.status === 409 && Array.isArray(err.data) && err.data.length > 0) {
                setPriceChangedItems(err.data);
                setShowPriceChangeModal(true);

                // Immediately update displayed prices
                const updates = {};
                err.data.forEach(item => {
                    updates[item.variantId] = item.newPrice;
                });
                dispatch({ type: 'UPDATE_PRICES', payload: updates });
                return;
            }

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
    }, [state, selectedAddress, checkoutItems, fetchCart, getEffectivePrice]);

    // ── Price change modal handlers ─────────────────────
    const handlePriceChangeCancel = useCallback(() => {
        setShowPriceChangeModal(false);
        // priceUpdates already applied — order summary shows new prices
    }, []);

    const handlePriceChangeConfirm = useCallback(async () => {
        setShowPriceChangeModal(false);
        // priceUpdates already applied by the 409 handler, so the next
        // submitOrder call will send the updated clientPrices automatically
        await submitOrder();
    }, [submitOrder]);

    // ── RENDER SUCCESS STATE ────────────────────────────
    if (state.orderSuccess) {
        return (
            <div className="checkout-page-wrapper">
                <OrderSuccessState
                    orderData={state.orderData}
                    items={state.orderData?.items || []}
                    total={state.orderData?.totalAmount || total}
                    isLoggedIn={isLoggedIn}
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
                        {/* Guest banner */}
                        {!isLoggedIn && (
                            <div className="co-guest-banner">
                                <div className="co-guest-banner-icon">💡</div>
                                <div className="co-guest-banner-content">
                                    <p className="co-guest-banner-title">Bạn đang mua với tư cách khách vãng lai</p>
                                    <p className="co-guest-banner-desc">
                                        <Link to="/login" state={{ from: '/checkout' }}>Đăng nhập</Link> hoặc{' '}
                                        <Link to="/register">Đăng ký</Link> để theo dõi đơn hàng và nhận ưu đãi dành riêng.
                                    </p>
                                </div>
                            </div>
                        )}

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
                            isGuest={!isLoggedIn}
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

                        {/* E: Shipping fee info (delivery only — calculated via GHN) */}
                        {state.deliveryMethod === 'Online' && state.shippingFee && (
                            <div className="co-card co-stagger-5">
                                <h3 className="co-card-title">Phí vận chuyển (GHN)</h3>
                                <div className="co-shipping-pill">
                                    🚚 Phí vận chuyển: {new Intl.NumberFormat('vi-VN').format(state.shippingFee.total)} ₫
                                </div>
                            </div>
                        )}

                        {/* E2: Shipping fee error (missing GHN IDs on saved address, etc.) */}
                        {state.deliveryMethod === 'Online' && !state.shippingFee && state.shippingFeeError && (
                            <div className="co-card co-stagger-5">
                                <div className="co-fee-error-box">
                                    ⚠ {state.shippingFeeError}
                                </div>
                            </div>
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
                            items={effectiveCheckoutItems}
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
                            shippingFeeLoading={state.shippingFeeLoading}
                            shippingFeeError={state.shippingFeeError}
                        />
                    </div>
                </div>
            </div>

            {/* Toast */}
            {state.toast && (
                <div className="co-toast">{state.toast}</div>
            )}

            <ConfirmDialog
                open={showConfirmOrder}
                title="Xác nhận đặt hàng"
                message="Bạn có chắc chắn muốn đặt đơn hàng này không?"
                confirmText="Đặt hàng"
                cancelText="Hủy"
                variant="primary"
                loading={state.isSubmitting}
                onCancel={() => setShowConfirmOrder(false)}
                onConfirm={async () => {
                    setShowConfirmOrder(false);
                    await submitOrder();
                }}
            />

            <PriceChangeModal
                open={showPriceChangeModal}
                changedItems={priceChangedItems}
                loading={state.isSubmitting}
                onCancel={handlePriceChangeCancel}
                onConfirm={handlePriceChangeConfirm}
            />
        </div>
    );
};

export default CheckoutPage;
