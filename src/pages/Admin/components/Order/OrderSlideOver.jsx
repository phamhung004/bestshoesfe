import React, { useState, useEffect, useRef } from 'react';
import { formatVND } from '../../../../utils/formatPrice';
import {
    formatDate, getInitials,
} from './orderHelpers';
import { STATUS_CONFIG, PAYMENT_CONFIG, ALL_STATUSES } from './orderConstants';

/**
 * OrderSlideOver: right drawer showing full order details
 * Props:
 *  - order: normalized order object from API (null = hidden)
 *  - onClose: () => void
 *  - onStatusChange: (orderId, newStatus) => void
 *  - onCopyOrderNum: (orderNumber) => void
 *  - onCancelOrder: (order) => void
 *  - onPrintOrder: (order) => void
 */
const OrderSlideOver = ({
    order,
    onClose,
    onStatusChange,
    onCopyOrderNum,
    onCancelOrder,
    onPrintOrder,
}) => {
    const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
    const [notes, setNotes] = useState('');
    const [saved, setSaved] = useState(false);
    const saveTimeout = useRef(null);

    // Auto-save notes with debounce
    useEffect(() => {
        if (!notes) return;
        setSaved(false);
        clearTimeout(saveTimeout.current);
        saveTimeout.current = setTimeout(() => setSaved(true), 1200);
        return () => clearTimeout(saveTimeout.current);
    }, [notes]);

    if (!order) return null;

    const statusCfg = STATUS_CONFIG[order.status] || {};
    const paymentCfg = PAYMENT_CONFIG[order.payment_status] || {};

    // Build full address
    const fullAddress = [
        order.shipping_address,
        order.shipping_ward,
        order.shipping_district,
        order.shipping_province,
    ].filter(Boolean).join(', ');

    // Timeline steps and progress
    const timelineSteps = [
        'Đặt hàng',
        'Xác nhận',
        'Đóng gói',
        'Bàn giao ĐVVC',
        'Đang giao',
        'Đã giao',
    ];

    // Map order status to timeline progress index
    const statusProgress = {
        'Chờ xác nhận': 0,
        'Đã xác nhận': 1,
        'Đang giao': 4,
        'Đã giao': 5,
        'Trả hàng/Hoàn tiền': 5,
        'Đã hủy': -1,
    };
    const currentStepIdx = statusProgress[order.status] ?? 0;

    return (
        <>
            {/* Backdrop overlay */}
            <div className="om-overlay" onClick={onClose} />

            {/* Slide-over panel */}
            <div className="om-slideover" role="dialog" aria-label="Chi tiết đơn hàng">
                {/* ── HEADER ── */}
                <div className="om-so-header">
                    <div className="om-so-header-left">
                        <span className="om-so-order-num">#{order.order_number}</span>
                        <button
                            className="om-so-copy-btn"
                            onClick={() => onCopyOrderNum(order.order_number)}
                            aria-label="Sao chép mã đơn"
                            title="Sao chép"
                        >
                            📋
                        </button>

                        {/* Editable status badge */}
                        <div className="om-status-dropdown-wrap">
                            <span
                                className="om-badge"
                                style={{ background: statusCfg.bg, color: statusCfg.color, cursor: 'pointer' }}
                                onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                                title="Click để cập nhật trạng thái"
                            >
                                <span className="om-badge-dot" style={{ background: statusCfg.color }} />
                                {order.status}
                                <span style={{ marginLeft: 4, fontSize: 10 }}>▼</span>
                            </span>

                            {statusDropdownOpen && (
                                <div className="om-status-dropdown">
                                    {ALL_STATUSES.filter((s) => s !== 'Tất cả').map((s) => {
                                        const cfg = STATUS_CONFIG[s] || {};
                                        return (
                                            <button
                                                key={s}
                                                onClick={() => {
                                                    onStatusChange(order.order_id, s);
                                                    setStatusDropdownOpen(false);
                                                }}
                                            >
                                                <span
                                                    className="om-badge-dot"
                                                    style={{ background: cfg.color, width: 8, height: 8, borderRadius: '50%', display: 'inline-block' }}
                                                />
                                                {s}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    <button className="om-so-close" onClick={onClose} aria-label="Đóng">
                        ✕
                    </button>
                </div>

                {/* ── BODY ── */}
                <div className="om-so-body">
                    {/* Customer info card */}
                    <div className="om-so-card">
                        <h3>Thông tin khách hàng</h3>
                        <div className="om-so-customer">
                            <div className="om-avatar">{getInitials(order.customer_name)}</div>
                            <div className="om-so-customer-details">
                                <strong>{order.customer_name}</strong>
                                <span>📱 {order.customer_phone}</span>
                            </div>
                        </div>
                    </div>

                    {/* Delivery address */}
                    <div className="om-so-card">
                        <h3>Địa chỉ giao hàng</h3>
                        <div className="om-so-address">
                            <p style={{ marginBottom: 8 }}>{fullAddress}</p>
                            <span className={`om-type-chip ${order.order_type === 'Online' ? 'online' : 'instore'}`}>
                                {order.order_type}
                            </span>
                        </div>
                    </div>

                    {/* Order items */}
                    <div className="om-so-card">
                        <h3>Sản phẩm ({order.items?.length || 0})</h3>
                        {order.items?.map((item) => (
                            <div key={item.order_item_id} className="om-so-item">
                                <img
                                    className="om-so-item-thumb"
                                    src={item.product?.image_url}
                                    alt={item.product?.name}
                                    loading="lazy"
                                />
                                <div className="om-so-item-info">
                                    <span className="om-so-item-name">{item.product?.name}</span>
                                    <span className="om-so-item-variant">
                                        Size: {item.size?.size_name} / Màu: {item.color?.color_name}
                                    </span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div className="om-so-item-qty">
                                        {item.quantity} × {formatVND(item.unit_price)}
                                    </div>
                                    <div className="om-so-item-total">{formatVND(item.total_price)}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pricing breakdown */}
                    <div className="om-so-card">
                        <h3>Chi tiết giá</h3>
                        <div className="om-so-pricing-row">
                            <span>Tạm tính</span>
                            <span>{formatVND(order.subtotal)}</span>
                        </div>
                        <div className="om-so-pricing-row">
                            <span>Phí vận chuyển</span>
                            <span>{formatVND(order.shipping_cost)}</span>
                        </div>
                        {order.coupon_discount_amount > 0 && (
                            <div className="om-so-pricing-row discount">
                                <span>Giảm giá (Mã giảm giá)</span>
                                <span>−{formatVND(order.coupon_discount_amount)}</span>
                            </div>
                        )}
                        <div className="om-so-pricing-total">
                            <span>TỔNG CỘNG</span>
                            <span>{formatVND(order.total_amount)}</span>
                        </div>
                    </div>

                    {/* Payment info */}
                    <div className="om-so-card">
                        <h3>Thanh toán</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                            <span>Trạng thái TT:</span>
                            <span
                                className="om-badge"
                                style={{ background: paymentCfg.bg, color: paymentCfg.color }}
                            >
                                <span className="om-badge-dot" style={{ background: paymentCfg.color }} />
                                {order.payment_status}
                            </span>
                        </div>
                    </div>

                    {/* Order timeline */}
                    <div className="om-so-card">
                        <h3>Tiến trình đơn hàng</h3>
                        {order.status === 'Đã hủy' ? (
                            <div style={{ fontSize: 13, color: 'var(--danger-500)', fontWeight: 600 }}>
                                ❌ Đơn hàng đã bị hủy
                            </div>
                        ) : (
                            <div className="om-timeline">
                                {timelineSteps.map((step, idx) => {
                                    let stepClass = 'future';
                                    if (idx < currentStepIdx) stepClass = 'completed';
                                    else if (idx === currentStepIdx) stepClass = 'current completed';
                                    return (
                                        <div key={step} className={`om-timeline-step ${stepClass}`}>
                                            <span className="step-label">{step}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Internal notes */}
                    <div className="om-so-card om-so-notes">
                        <h3>Ghi chú nội bộ (chỉ nhân viên thấy)</h3>
                        <textarea
                            placeholder="Nhập ghi chú..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                        {saved && (
                            <div className="om-so-saved-indicator">
                                ✅ Đã lưu
                            </div>
                        )}
                    </div>
                </div>

                {/* ── FOOTER ── */}
                <div className="om-so-footer">
                    <button
                        className="om-btn om-btn-primary"
                        onClick={() => {
                            /* In a real app, this would call the API */
                            onClose();
                        }}
                    >
                        Cập nhật trạng thái
                    </button>
                    <button
                        className="om-btn om-btn-outline"
                        onClick={() => onPrintOrder(order)}
                    >
                        🖨️ In hóa đơn
                    </button>
                    <button
                        className="om-btn om-btn-danger-outline"
                        onClick={() => onCancelOrder(order)}
                    >
                        Hủy đơn
                    </button>
                </div>
            </div>
        </>
    );
};

export default OrderSlideOver;
