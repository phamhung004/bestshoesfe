import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { orderApi } from '../../api/orderApi';
import './OrderTrackingPage.css';

/* ───── Status helpers ───── */
// Fixed 6-step normal flow — matches admin OrderSlideOver
const MAIN_STEPS = ['Đặt hàng', 'Xác nhận', 'Đang đóng gói', 'Bàn giao ĐVVC', 'Đang giao', 'Đã giao'];

// Map status → which step index is "current" (same mapping as admin)
const STATUS_PROGRESS = {
    'Chờ xác nhận':       0,
    'Đã xác nhận':        1,
    'Đang đóng gói':      2,
    'Bàn giao ĐVVC':      3,
    'Đang giao':          4,
    'Đã giao':            5,
    'Trả hàng/Hoàn tiền': 5,
    'Đã hủy':             -1,
};

const formatVND = (v) => {
    const n = Number(v);
    return isNaN(n) ? '0 ₫' : n.toLocaleString('vi-VN') + ' ₫';
};

const formatDate = (d) => {
    if (!d) return '—';
    const dt = new Date(d);
    return dt.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const paymentLabel = {
    cod: 'Thanh toán khi nhận hàng (COD)',
    bank: 'Chuyển khoản ngân hàng',
    momo: 'Ví MoMo',
    card: 'Thẻ tín dụng / Ghi nợ',
    COD: 'Thanh toán khi nhận hàng (COD)',
};

/* ───── Main Component ───── */
const OrderTrackingPage = () => {
    const [orderNumber, setOrderNumber] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [order, setOrder] = useState(null);
    const resultRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setOrder(null);

        const trimmedOrder = orderNumber.trim();
        const trimmedPhone = phone.replace(/\s/g, '');

        if (!trimmedOrder) {
            setError('Vui lòng nhập mã đơn hàng');
            return;
        }
        if (!trimmedPhone || trimmedPhone.length < 9) {
            setError('Vui lòng nhập số điện thoại hợp lệ');
            return;
        }

        setLoading(true);
        try {
            const res = await orderApi.trackOrder(trimmedOrder, trimmedPhone);
            setOrder(res.data);
            // Scroll to result
            setTimeout(() => {
                resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Không tìm thấy đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const isCancelled = order?.status === 'Đã hủy';
    const isReturned = order?.status === 'Trả hàng/Hoàn tiền';

    // Choose the step list to show
    const statusSteps = isCancelled
        ? ['Đặt hàng', 'Đã hủy']
        : isReturned
            ? ['Đặt hàng', 'Xác nhận', 'Đã giao', 'Trả hàng/Hoàn tiền']
            : MAIN_STEPS;

    const activeStepIdx = isCancelled
        ? 1
        : isReturned
            ? 3
            : (STATUS_PROGRESS[order?.status] ?? 0);

    return (
        <div className="ot-page">
            <div className="ot-container">
                {/* Breadcrumb */}
                <nav className="ot-breadcrumb">
                    <Link to="/">Trang chủ</Link>
                    <span className="ot-breadcrumb-sep">›</span>
                    <span className="ot-breadcrumb-current">Tra cứu đơn hàng</span>
                </nav>

                <h1 className="ot-title">Tra cứu đơn hàng</h1>
                <p className="ot-subtitle">Nhập mã đơn hàng và số điện thoại để kiểm tra trạng thái đơn hàng của bạn</p>

                {/* Search Form */}
                <div className="ot-search-card">
                    <form onSubmit={handleSubmit} className="ot-search-form">
                        <div className="ot-form-group">
                            <label className="ot-label">
                                Mã đơn hàng <span className="ot-required">*</span>
                            </label>
                            <input
                                type="text"
                                className="ot-input"
                                placeholder="VD: ORD-2026-00001"
                                value={orderNumber}
                                onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                                autoComplete="off"
                            />
                        </div>
                        <div className="ot-form-group">
                            <label className="ot-label">
                                Số điện thoại đặt hàng <span className="ot-required">*</span>
                            </label>
                            <input
                                type="tel"
                                className="ot-input"
                                placeholder="VD: 0912345678"
                                value={phone}
                                onChange={(e) => {
                                    let val = e.target.value.replace(/\D/g, '');
                                    if (val.length > 10) val = val.slice(0, 10);
                                    setPhone(val);
                                }}
                                autoComplete="off"
                            />
                        </div>
                        <button type="submit" className="ot-submit-btn" disabled={loading}>
                            {loading ? (
                                <><span className="ot-spinner" /> Đang tra cứu...</>
                            ) : (
                                <>🔍 Tra cứu đơn hàng</>
                            )}
                        </button>
                    </form>

                    {error && (
                        <div className="ot-error-box">
                            <span className="ot-error-icon">⚠</span>
                            <div>
                                <p className="ot-error-text">{error}</p>
                                <p className="ot-error-hint">Kiểm tra lại mã đơn hàng và số điện thoại bạn đã dùng khi đặt hàng.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Result */}
                {order && (
                    <div className="ot-result" ref={resultRef}>
                        {/* Order header */}
                        <div className="ot-result-header">
                            <div>
                                <h2 className="ot-result-order-number">{order.orderNumber}</h2>
                                <p className="ot-result-date">Đặt lúc: {formatDate(order.createdAt)}</p>
                            </div>
                            <span className={`ot-status-badge ot-status-${isCancelled ? 'cancelled' : 'active'}`}>
                                {order.status}
                            </span>
                        </div>

                        {/* Status timeline */}
                        <div className="ot-timeline-card">
                            <h3 className="ot-section-title">Trạng thái đơn hàng</h3>
                            <div className="ot-timeline">
                                {statusSteps.map((step, i) => {
                                    const isCompleted = i < activeStepIdx;
                                    const isCurrent = i === activeStepIdx;
                                    const stepClass = [
                                        'ot-timeline-step',
                                        isCompleted ? 'active' : '',
                                        isCurrent ? 'active current' : '',
                                        isCancelled && isCurrent ? 'cancelled' : '',
                                        isReturned && isCurrent ? 'returned' : '',
                                    ].filter(Boolean).join(' ');
                                    return (
                                        <div key={i} className={stepClass}>
                                            <div className="ot-timeline-dot">
                                                {isCompleted ? '✓' : isCurrent ? '●' : (i + 1)}
                                            </div>
                                            {i < statusSteps.length - 1 && <div className="ot-timeline-line" />}
                                            <span className="ot-timeline-label">{step}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Order info */}
                        <div className="ot-info-card">
                            <h3 className="ot-section-title">Thông tin đơn hàng</h3>
                            <div className="ot-info-grid">
                                <div className="ot-info-item">
                                    <span className="ot-info-label">Người nhận</span>
                                    <span className="ot-info-value">{order.customerName}</span>
                                </div>
                                <div className="ot-info-item">
                                    <span className="ot-info-label">Điện thoại</span>
                                    <span className="ot-info-value">{order.customerPhone}</span>
                                </div>
                                {order.email && (
                                    <div className="ot-info-item">
                                        <span className="ot-info-label">Email</span>
                                        <span className="ot-info-value">{order.email}</span>
                                    </div>
                                )}
                                <div className="ot-info-item">
                                    <span className="ot-info-label">Hình thức nhận</span>
                                    <span className="ot-info-value">
                                        {order.orderType === 'Online' ? '🚚 Giao hàng tận nơi' : '🏬 Nhận tại cửa hàng'}
                                    </span>
                                </div>
                                {order.shippingAddress && (
                                    <div className="ot-info-item ot-info-full">
                                        <span className="ot-info-label">Địa chỉ giao hàng</span>
                                        <span className="ot-info-value">
                                            {[order.shippingAddress, order.shippingWard, order.shippingDistrict, order.shippingProvince]
                                                .filter(Boolean).join(', ')}
                                        </span>
                                    </div>
                                )}
                                <div className="ot-info-item">
                                    <span className="ot-info-label">Thanh toán</span>
                                    <span className="ot-info-value">
                                        {paymentLabel[order.paymentMethod] || order.paymentMethod}
                                    </span>
                                </div>
                                <div className="ot-info-item">
                                    <span className="ot-info-label">Trạng thái thanh toán</span>
                                    <span className="ot-info-value">{order.paymentStatus}</span>
                                </div>
                            </div>
                        </div>

                        {/* Order items */}
                        {order.items && order.items.length > 0 && (
                            <div className="ot-items-card">
                                <h3 className="ot-section-title">Sản phẩm ({order.items.length})</h3>
                                <div className="ot-items-list">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="ot-item">
                                            <img
                                                src={item.product?.imageUrl || '/placeholder.png'}
                                                alt={item.product?.name}
                                                className="ot-item-img"
                                            />
                                            <div className="ot-item-info">
                                                <p className="ot-item-name">{item.product?.name}</p>
                                                <p className="ot-item-meta">
                                                    {item.size?.sizeName && `Size ${item.size.sizeName}`}
                                                    {item.color?.colorName && ` · ${item.color.colorName}`}
                                                    {` · x${item.quantity}`}
                                                </p>
                                            </div>
                                            <span className="ot-item-price">{formatVND(item.totalPrice)}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Totals */}
                                <div className="ot-totals">
                                    <div className="ot-total-row">
                                        <span>Tạm tính</span>
                                        <span>{formatVND(order.subtotal)}</span>
                                    </div>
                                    <div className="ot-total-row">
                                        <span>Phí vận chuyển</span>
                                        <span>{order.shippingCost > 0 ? formatVND(order.shippingCost) : 'Miễn phí'}</span>
                                    </div>
                                    {order.couponDiscountAmount > 0 && (
                                        <div className="ot-total-row ot-discount">
                                            <span>Giảm giá {order.couponCode && `(${order.couponCode})`}</span>
                                            <span>-{formatVND(order.couponDiscountAmount)}</span>
                                        </div>
                                    )}
                                    <div className="ot-total-row ot-grand-total">
                                        <span>TỔNG CỘNG</span>
                                        <span>{formatVND(order.totalAmount)}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="ot-result-actions">
                            <Link to="/catalog" className="ot-btn-outline">Tiếp tục mua sắm</Link>
                            <button className="ot-btn-secondary" onClick={() => { setOrder(null); setOrderNumber(''); setPhone(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                                Tra cứu đơn khác
                            </button>
                        </div>
                    </div>
                )}

                {/* Empty state — show when no search yet */}
                {!order && !error && !loading && (
                    <div className="ot-empty-state">
                        <div className="ot-empty-icon">📦</div>
                        <h3 className="ot-empty-title">Tra cứu nhanh đơn hàng</h3>
                        <p className="ot-empty-desc">
                            Nhập mã đơn hàng (nhận được sau khi đặt hàng) cùng số điện thoại để kiểm tra trạng thái giao hàng.
                        </p>
                        <div className="ot-empty-tips">
                            <div className="ot-tip">
                                <span className="ot-tip-icon">📋</span>
                                <span>Mã đơn hàng có dạng: <strong>ORD-2026-XXXXX</strong></span>
                            </div>
                            <div className="ot-tip">
                                <span className="ot-tip-icon">📱</span>
                                <span>Sử dụng SĐT bạn đã dùng khi đặt hàng</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderTrackingPage;
