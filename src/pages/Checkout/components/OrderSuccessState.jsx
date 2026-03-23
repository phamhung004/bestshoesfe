import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import CheckoutStepIndicator from '../../Cart/components/CheckoutStepIndicator';
import {
    formatVND,
    getItemSubtotal,
} from '../checkoutConstants';
import { orderApi } from '../../../api/orderApi';

// ── SePay Bank Config ────────────────────────────────────
const SEPAY_BANK = {
    bankName: 'MB',
    bankFullName: 'MB Bank',
    accountNumber: '927092004333',
    accountName: 'PHAM TRONG HUNG',
};

/**
 * Generate SePay QR URL
 * @param {string} paymentRef - Mã thanh toán BS (ví dụ: BS00001)
 * @param {number} amount - Số tiền cần thanh toán
 */
const generateSepayQrUrl = (paymentRef, amount) => {
    const params = new URLSearchParams({
        acc: SEPAY_BANK.accountNumber,
        bank: SEPAY_BANK.bankName,
        amount: Math.round(amount).toString(),
        des: paymentRef,
        template: 'compact',
    });
    return `https://qr.sepay.vn/img?${params.toString()}`;
};

const POLL_INTERVAL_MS = 5000; // Poll every 5 seconds
const MAX_POLL_DURATION_MS = 30 * 60 * 1000; // Stop polling after 30 minutes

const OrderSuccessState = ({ orderData, items, total, isLoggedIn }) => {
    const [copied, setCopied] = useState(false);
    const [copiedField, setCopiedField] = useState('');
    const [isPaid, setIsPaid] = useState(false);

    const isBankTransfer = orderData?.paymentMethod === 'bank';

    // ── Payment status polling (bank transfer only) ────────
    const pollIntervalRef = useRef(null);
    const pollStartRef = useRef(Date.now());

    useEffect(() => {
        if (!isBankTransfer || isPaid || !orderData?.orderNumber) return;

        const checkPaymentStatus = async () => {
            // Stop polling after max duration
            if (Date.now() - pollStartRef.current > MAX_POLL_DURATION_MS) {
                clearInterval(pollIntervalRef.current);
                return;
            }
            try {
                // Use trackOrder — works for both logged-in users and guests (no auth needed)
                const res = await orderApi.trackOrder(
                    orderData.orderNumber,
                    orderData.customerPhone
                );
                const order = res?.data;
                const status = order?.paymentStatus;
                // Backend sets paymentStatus = "Đã thanh toán" when SePay confirms
                if (status === 'Đã thanh toán') {
                    setIsPaid(true);
                    clearInterval(pollIntervalRef.current);
                }
            } catch {
                // Ignore polling errors silently
            }
        };

        // Immediately check once, then poll
        checkPaymentStatus();
        pollIntervalRef.current = setInterval(checkPaymentStatus, POLL_INTERVAL_MS);

        return () => clearInterval(pollIntervalRef.current);
    }, [isBankTransfer, isPaid, orderData?.orderNumber]);

    // Show success screen when payment confirmed
    const showSuccessScreen = !isBankTransfer || isPaid;

    // Mã thanh toán SePay: BS + orderId (ví dụ: BS00001)
    // Fallback về orderNumber nếu backend chưa trả paymentReference
    const paymentRef = orderData?.paymentReference || orderData?.orderNumber;

    const handleCopy = useCallback((text, field = 'orderNumber') => {
        navigator.clipboard.writeText(text).catch(() => { });
        setCopiedField(field);
        setCopied(true);
        setTimeout(() => {
            setCopied(false);
            setCopiedField('');
        }, 2000);
    }, []);

    const paymentLabel = {
        cod: 'Thanh toán khi nhận hàng (COD)',
        bank: 'Chuyển khoản ngân hàng (SePay)',
        momo: 'Ví MoMo',
        card: 'Thẻ tín dụng / Ghi nợ',
    };

    const deliveryLabel = orderData.deliveryMethod === 'Online'
        ? 'Giao hàng tận nơi'
        : 'Nhận tại cửa hàng';

    const deliveryTimeLabel = {
        standard: '3–5 ngày làm việc',
        fast: '1–2 ngày làm việc',
        express: 'Trong ngày',
    };

    return (
        <div className="co-success-wrapper">
            <div className="checkout-container">
                <CheckoutStepIndicator activeStep={3} />

                <div className="co-success-card">

                    {/* ══════════════════════════════════════════════════════
                        BANK TRANSFER — Màn hình chờ thanh toán
                        ══════════════════════════════════════════════════════ */}
                    {!showSuccessScreen ? (
                        <>
                            {/* Pending icon — hourglass thay vì checkmark */}
                            <div className="co-success-icon-wrap co-pending-icon-wrap">
                                <div className="co-pending-clock">⏳</div>
                            </div>

                            <h1 className="co-success-heading co-pending-heading">
                                Đơn hàng đã tạo — Chờ thanh toán
                            </h1>

                            <p className="co-success-order-label">Mã đơn hàng của bạn:</p>
                            <div className="co-success-order-number">
                                {orderData.orderNumber}
                                <button
                                    className="co-success-copy-btn"
                                    onClick={() => handleCopy(orderData.orderNumber, 'orderNumber')}
                                >
                                    {copied && copiedField === 'orderNumber' ? '✓ Đã sao chép' : '📋 Sao chép'}
                                </button>
                            </div>

                            {/* SePay QR Section */}
                            <div className="co-sepay-section">
                                <div className="co-sepay-header">
                                    <span className="co-sepay-icon">🏦</span>
                                    <h2 className="co-sepay-title">Vui lòng thanh toán chuyển khoản</h2>
                                    <p className="co-sepay-subtitle">
                                        Quét mã QR bên dưới hoặc chuyển khoản thủ công
                                    </p>
                                </div>

                                {/* QR Code */}
                                <div className="co-sepay-qr-wrap">
                                    <img
                                        src={generateSepayQrUrl(paymentRef, total)}
                                        alt="QR Code thanh toán"
                                        className="co-sepay-qr-img"
                                        loading="eager"
                                    />
                                    <p className="co-sepay-qr-caption">
                                        Mở app ngân hàng → Quét mã QR → Xác nhận
                                    </p>
                                </div>

                                {/* Bank Info */}
                                <div className="co-sepay-bank-details">
                                    <div className="co-sepay-bank-row">
                                        <span className="co-sepay-label">Ngân hàng</span>
                                        <span className="co-sepay-value">{SEPAY_BANK.bankFullName}</span>
                                    </div>
                                    <div className="co-sepay-bank-row">
                                        <span className="co-sepay-label">Số tài khoản</span>
                                        <span className="co-sepay-value">
                                            {SEPAY_BANK.accountNumber}
                                            <button
                                                className="co-sepay-copy-btn"
                                                onClick={() => handleCopy(SEPAY_BANK.accountNumber, 'account')}
                                            >
                                                {copied && copiedField === 'account' ? '✓' : '📋'}
                                            </button>
                                        </span>
                                    </div>
                                    <div className="co-sepay-bank-row">
                                        <span className="co-sepay-label">Chủ tài khoản</span>
                                        <span className="co-sepay-value">{SEPAY_BANK.accountName}</span>
                                    </div>
                                    <div className="co-sepay-bank-row">
                                        <span className="co-sepay-label">Số tiền</span>
                                        <span className="co-sepay-value co-sepay-amount">
                                            {formatVND(total)}
                                            <button
                                                className="co-sepay-copy-btn"
                                                onClick={() => handleCopy(Math.round(total).toString(), 'amount')}
                                            >
                                                {copied && copiedField === 'amount' ? '✓' : '📋'}
                                            </button>
                                        </span>
                                    </div>
                                    <div className="co-sepay-bank-row co-sepay-content-row">
                                        <span className="co-sepay-label">Nội dung CK</span>
                                        <span className="co-sepay-value co-sepay-content-value">
                                            {paymentRef}
                                            <button
                                                className="co-sepay-copy-btn"
                                                onClick={() => handleCopy(paymentRef, 'content')}
                                            >
                                                {copied && copiedField === 'content' ? '✓' : '📋'}
                                            </button>
                                        </span>
                                    </div>
                                </div>

                                {/* Auto verification notice */}
                                <div className="co-sepay-notice">
                                    <div className="co-sepay-notice-icon">
                                        <span className="co-sepay-pulse" />
                                        ⚡
                                    </div>
                                    <div className="co-sepay-notice-text">
                                        <strong>Xác nhận tự động qua SePay</strong>
                                        <p>
                                            Sau khi chuyển khoản thành công, hệ thống sẽ tự động xác nhận trong{' '}
                                            <strong>1–5 phút</strong>.
                                            Nội dung chuyển khoản tự động điền khi quét QR.
                                        </p>
                                    </div>
                                </div>

                                {/* Warning */}
                                <div className="co-sepay-warning">
                                    ⚠️ <strong>Lưu ý:</strong> Nếu chuyển khoản thủ công (không quét QR),
                                    nội dung chuyển khoản phải ghi chính xác{' '}
                                    <strong>{paymentRef}</strong>.
                                    Sản phẩm chỉ được xác nhận sau khi nhận được thanh toán.
                                </div>
                            </div>

                            {/* Order summary */}
                            <div className="co-success-summary">
                                <div className="co-success-info-grid">
                                    <span className="co-success-info-label">Người nhận:</span>
                                    <span className="co-success-info-value">{orderData.customerName}</span>

                                    <span className="co-success-info-label">Điện thoại:</span>
                                    <span className="co-success-info-value">{orderData.customerPhone}</span>

                                    {orderData.address && (
                                        <>
                                            <span className="co-success-info-label">Địa chỉ:</span>
                                            <span className="co-success-info-value">{orderData.address}</span>
                                        </>
                                    )}

                                    <span className="co-success-info-label">Trạng thái TT:</span>
                                    <span className="co-success-info-value" style={{ color: '#B45309', fontWeight: 700 }}>
                                        ⏳ Chờ thanh toán
                                    </span>

                                    <span className="co-success-info-label">Dự kiến giao:</span>
                                    <span className="co-success-info-value">
                                        {deliveryTimeLabel[orderData.deliveryTime] || '3–5 ngày làm việc'}
                                    </span>
                                </div>

                                <div className="co-success-divider" />

                                <div className="co-success-items">
                                    {items.map((item) => {
                                        const subtotal = getItemSubtotal(item);
                                        return (
                                            <div key={item.cart_item_id} className="co-success-item">
                                                <img
                                                    src={item.image_url}
                                                    alt={item.product.name}
                                                    className="co-success-item-img"
                                                />
                                                <div className="co-success-item-info">
                                                    <p className="co-success-item-name">{item.product.name}</p>
                                                    <p className="co-success-item-meta">
                                                        Size {item.variant.size_name} · {item.variant.color_name} · ×{item.quantity}
                                                    </p>
                                                </div>
                                                <span className="co-success-item-price">
                                                    {formatVND(subtotal)}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="co-success-divider" />

                                <div className="co-success-total-row">
                                    <span className="co-success-total-label">TỔNG CỘNG:</span>
                                    <span className="co-success-total-value">{formatVND(total)}</span>
                                </div>
                            </div>

                            {/* Steps */}
                            <div className="co-success-steps">
                                <div className="co-success-step">
                                    <div className="co-success-step-icon">💳</div>
                                    <p className="co-success-step-title">Chuyển khoản</p>
                                    <p className="co-success-step-desc">Quét QR hoặc CK thủ công</p>
                                    <div className="co-success-step-line" />
                                </div>
                                <div className="co-success-step">
                                    <div className="co-success-step-icon">✅</div>
                                    <p className="co-success-step-title">Xác nhận tự động</p>
                                    <p className="co-success-step-desc">1–5 phút qua SePay</p>
                                    <div className="co-success-step-line" />
                                </div>
                                <div className="co-success-step">
                                    <div className="co-success-step-icon">🚚</div>
                                    <p className="co-success-step-title">Giao hàng</p>
                                    <p className="co-success-step-desc">3–5 ngày làm việc</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="co-success-actions">
                                {isLoggedIn ? (
                                    <>
                                        <Link to="/account" className="co-success-btn-primary">
                                            Xem đơn hàng
                                        </Link>
                                        <Link to="/catalog" className="co-success-btn-outline">
                                            Tiếp tục mua sắm
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <div className="co-success-guest-note">
                                            📋 Lưu mã đơn hàng: <strong>{orderData?.orderNumber}</strong>
                                        </div>
                                        <Link to="/tra-cuu-don-hang" className="co-success-btn-primary">
                                            🔍 Tra cứu đơn hàng
                                        </Link>
                                        <Link to="/catalog" className="co-success-btn-outline">
                                            Tiếp tục mua sắm
                                        </Link>
                                    </>
                                )}
                            </div>
                        </>
                    ) : (
                        /* ══════════════════════════════════════════════════════
                            COD / CARD / MOMO — Màn hình thành công thật sự
                            ══════════════════════════════════════════════════════ */
                        <>
                            {/* Banner xác nhận chuyển khoản thành công */}
                            {isPaid && (
                                <div className="co-payment-confirmed-banner">
                                    ✅ Thanh toán chuyển khoản đã được xác nhận!
                                </div>
                            )}

                            {/* Animated checkmark */}
                            <div className="co-success-icon-wrap">
                                <svg className="co-success-checkmark" viewBox="0 0 48 48">
                                    <path d="M12 24 L22 34 L36 16" />
                                </svg>
                                <div className="co-confetti-container">
                                    {[...Array(8)].map((_, i) => (
                                        <span key={i} className="co-confetti-dot" />
                                    ))}
                                </div>
                            </div>

                            <h1 className="co-success-heading">Đặt hàng thành công! 🎉</h1>

                            <p className="co-success-order-label">Mã đơn hàng của bạn:</p>
                            <div className="co-success-order-number">
                                {orderData.orderNumber}
                                <button
                                    className="co-success-copy-btn"
                                    onClick={() => handleCopy(orderData.orderNumber, 'orderNumber')}
                                >
                                    {copied && copiedField === 'orderNumber' ? '✓ Đã sao chép' : '📋 Sao chép'}
                                </button>
                            </div>

                            <p className="co-success-msg">Cảm ơn bạn đã mua hàng tại BestShoes!</p>
                            <p className="co-success-msg-sub">
                                Chúng tôi đã gửi email xác nhận đến{' '}
                                <span className="co-success-email">{orderData.email || 'email của bạn'}</span>.
                                <br />Đơn hàng sẽ được xử lý trong vòng 2 giờ.
                            </p>

                            {/* Order summary */}
                            <div className="co-success-summary">
                                <div className="co-success-info-grid">
                                    <span className="co-success-info-label">Người nhận:</span>
                                    <span className="co-success-info-value">{orderData.customerName}</span>

                                    <span className="co-success-info-label">Điện thoại:</span>
                                    <span className="co-success-info-value">{orderData.customerPhone}</span>

                                    {orderData.address && (
                                        <>
                                            <span className="co-success-info-label">Địa chỉ:</span>
                                            <span className="co-success-info-value">{orderData.address}</span>
                                        </>
                                    )}

                                    <span className="co-success-info-label">Hình thức:</span>
                                    <span className="co-success-info-value">{deliveryLabel}</span>

                                    <span className="co-success-info-label">Thanh toán:</span>
                                    <span className="co-success-info-value">
                                        {paymentLabel[orderData.paymentMethod] || 'COD'}
                                    </span>

                                    <span className="co-success-info-label">Dự kiến giao:</span>
                                    <span className="co-success-info-value">
                                        {deliveryTimeLabel[orderData.deliveryTime] || '3–5 ngày làm việc'}
                                    </span>
                                </div>

                                <div className="co-success-divider" />

                                <div className="co-success-items">
                                    {items.map((item) => {
                                        const subtotal = getItemSubtotal(item);
                                        return (
                                            <div key={item.cart_item_id} className="co-success-item">
                                                <img
                                                    src={item.image_url}
                                                    alt={item.product.name}
                                                    className="co-success-item-img"
                                                />
                                                <div className="co-success-item-info">
                                                    <p className="co-success-item-name">{item.product.name}</p>
                                                    <p className="co-success-item-meta">
                                                        Size {item.variant.size_name} · {item.variant.color_name} · ×{item.quantity}
                                                    </p>
                                                </div>
                                                <span className="co-success-item-price">
                                                    {formatVND(subtotal)}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="co-success-divider" />

                                <div className="co-success-total-row">
                                    <span className="co-success-total-label">TỔNG CỘNG:</span>
                                    <span className="co-success-total-value">{formatVND(total)}</span>
                                </div>
                            </div>

                            {/* What's next */}
                            <div className="co-success-steps">
                                <div className="co-success-step">
                                    <div className="co-success-step-icon">✉</div>
                                    <p className="co-success-step-title">Xác nhận email</p>
                                    <p className="co-success-step-desc">Kiểm tra hộp thư</p>
                                    <div className="co-success-step-line" />
                                </div>
                                <div className="co-success-step">
                                    <div className="co-success-step-icon">📦</div>
                                    <p className="co-success-step-title">Đóng gói</p>
                                    <p className="co-success-step-desc">Trong vòng 2–4 giờ</p>
                                    <div className="co-success-step-line" />
                                </div>
                                <div className="co-success-step">
                                    <div className="co-success-step-icon">🚚</div>
                                    <p className="co-success-step-title">Giao hàng</p>
                                    <p className="co-success-step-desc">3–5 ngày làm việc</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="co-success-actions">
                                {isLoggedIn ? (
                                    <>
                                        <Link to="/account" className="co-success-btn-primary">
                                            Theo dõi đơn hàng
                                        </Link>
                                        <Link to="/catalog" className="co-success-btn-outline">
                                            Tiếp tục mua sắm
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <div className="co-success-guest-note">
                                            📋 Lưu mã đơn hàng: <strong>{orderData?.orderNumber}</strong>
                                        </div>
                                        <p className="co-success-guest-register">
                                            <Link to="/register">Tạo tài khoản</Link> để theo dõi đơn hàng.
                                        </p>
                                        <Link to="/tra-cuu-don-hang" className="co-success-btn-primary">
                                            🔍 Tra cứu đơn hàng
                                        </Link>
                                        <Link to="/catalog" className="co-success-btn-outline">
                                            Tiếp tục mua sắm
                                        </Link>
                                    </>
                                )}
                            </div>

                            {/* Share */}
                            <div className="co-success-share">
                                <p className="co-success-share-text">Chia sẻ với bạn bè:</p>
                                <div className="co-success-share-btns">
                                    <button className="co-success-share-btn" title="Facebook">📘</button>
                                    <button className="co-success-share-btn" title="Zalo">💬</button>
                                    <button className="co-success-share-btn" title="Copy link">🔗</button>
                                </div>
                            </div>
                        </>
                    )}

                </div>
            </div>
        </div>
    );
};

export default OrderSuccessState;
