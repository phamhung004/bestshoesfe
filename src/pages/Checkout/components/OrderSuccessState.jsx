import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import CheckoutStepIndicator from '../../Cart/components/CheckoutStepIndicator';
import {
    formatVND,
    getItemSubtotal,
} from '../checkoutConstants';

const OrderSuccessState = ({ orderData, items, total, isLoggedIn }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(orderData.orderNumber).catch(() => { });
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const paymentLabel = {
        cod: 'Thanh toán khi nhận hàng (COD)',
        bank: 'Chuyển khoản ngân hàng',
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
                {/* Step indicator — all complete */}
                <CheckoutStepIndicator activeStep={3} />

                <div className="co-success-card">
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

                    {/* Heading */}
                    <h1 className="co-success-heading">Đặt hàng thành công! 🎉</h1>

                    {/* Order number */}
                    <p className="co-success-order-label">Mã đơn hàng của bạn:</p>
                    <div className="co-success-order-number">
                        {orderData.orderNumber}
                        <button className="co-success-copy-btn" onClick={handleCopy}>
                            {copied ? '✓ Đã sao chép' : '📋 Sao chép'}
                        </button>
                    </div>

                    {/* Confirmation message */}
                    <p className="co-success-msg">
                        Cảm ơn bạn đã mua hàng tại BestShoes!
                    </p>
                    <p className="co-success-msg-sub">
                        Chúng tôi đã gửi email xác nhận đến{' '}
                        <span className="co-success-email">{orderData.email || 'email của bạn'}</span>.
                        <br />Đơn hàng sẽ được xử lý trong vòng 2 giờ.
                    </p>

                    {/* Order summary mini card */}
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

                        {/* Items */}
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

                    {/* What's next steps */}
                    <div className="co-success-steps">
                        <div className="co-success-step">
                            <div className="co-success-step-icon">✉</div>
                            <p className="co-success-step-title">Xác nhận email</p>
                            <p className="co-success-step-desc">Kiểm tra hộp thư của bạn</p>
                            <div className="co-success-step-line" />
                        </div>
                        <div className="co-success-step">
                            <div className="co-success-step-icon">📦</div>
                            <p className="co-success-step-title">Đóng gói đơn hàng</p>
                            <p className="co-success-step-desc">Trong vòng 2–4 giờ</p>
                            <div className="co-success-step-line" />
                        </div>
                        <div className="co-success-step">
                            <div className="co-success-step-icon">🚚</div>
                            <p className="co-success-step-title">Giao hàng</p>
                            <p className="co-success-step-desc">3–5 ngày làm việc</p>
                        </div>
                    </div>

                    {/* Action buttons */}
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
                                    📋 Lưu mã đơn hàng của bạn: <strong>{orderData?.orderNumber}</strong>
                                </div>
                                <p className="co-success-guest-register">
                                    <Link to="/register">Tạo tài khoản</Link> để theo dõi đơn hàng và nhận ưu đãi exclusive.
                                </p>
                                <Link to={`/tra-cuu-don-hang`} className="co-success-btn-primary">
                                    🔍 Tra cứu đơn hàng
                                </Link>
                                <Link to="/catalog" className="co-success-btn-outline">
                                    Tiếp tục mua sắm
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Share section */}
                    <div className="co-success-share">
                        <p className="co-success-share-text">Bạn có thể chia sẻ với bạn bè:</p>
                        <div className="co-success-share-btns">
                            <button className="co-success-share-btn" title="Facebook">📘</button>
                            <button className="co-success-share-btn" title="Zalo">💬</button>
                            <button className="co-success-share-btn" title="Copy link">🔗</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccessState;
