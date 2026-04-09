import React, { useEffect, useState } from 'react';
import { X, MapPin, Package, CreditCard, Printer, ShoppingBag, RotateCcw, ChevronRight, Edit3, Ban } from 'lucide-react';
import { formatVND, formatDate } from '../mockAccountData';
import ChangeAddressModal from './ChangeAddressModal';

const STATUS_STEPS = {
    'Chờ xác nhận': ['Đặt hàng', 'Xác nhận', 'Đóng gói', 'Bàn giao ĐVVC', 'Đang giao', 'Đã giao'],
    'Đã xác nhận': ['Đặt hàng', 'Xác nhận', 'Đóng gói', 'Bàn giao ĐVVC', 'Đang giao', 'Đã giao'],
    'Đang đóng gói': ['Đặt hàng', 'Xác nhận', 'Đóng gói', 'Bàn giao ĐVVC', 'Đang giao', 'Đã giao'],
    'Bàn giao ĐVVC': ['Đặt hàng', 'Xác nhận', 'Đóng gói', 'Bàn giao ĐVVC', 'Đang giao', 'Đã giao'],
    'Đang giao': ['Đặt hàng', 'Xác nhận', 'Đóng gói', 'Bàn giao ĐVVC', 'Đang giao', 'Đã giao'],
    'Đã giao': ['Đặt hàng', 'Xác nhận', 'Đóng gói', 'Bàn giao ĐVVC', 'Đang giao', 'Đã giao'],
    'Trả hàng/Hoàn tiền': ['Đặt hàng', 'Xác nhận', 'Đã giao', 'Trả hàng'],
    'Đã hủy': ['Đặt hàng', 'Đã hủy'],
};

const getStepIndex = (status) => {
    const map = {
        'Chờ xác nhận': 0, 'Đã xác nhận': 1, 'Đang đóng gói': 2,
        'Bàn giao ĐVVC': 3, 'Đang giao': 4,
        'Đã giao': 5, 'Trả hàng/Hoàn tiền': 3, 'Đã hủy': 1,
    };
    return map[status] ?? 0;
};

const StatusBadge = ({ status }) => {
    const map = {
        'Chờ xác nhận': 'acc-badge-yellow',
        'Đã xác nhận': 'acc-badge-blue',
        'Đang đóng gói': 'acc-badge-orange',
        'Bàn giao ĐVVC': 'acc-badge-cyan',
        'Đang giao': 'acc-badge-purple',
        'Đã giao': 'acc-badge-green',
        'Trả hàng/Hoàn tiền': 'acc-badge-orange',
        'Đã hủy': 'acc-badge-red',
    };
    return <span className={`acc-status-badge ${map[status] || ''}`}>{status}</span>;
};

const OrderDetailModal = ({ order: initialOrder, onClose, onOrderUpdated, onCancel }) => {
    const [order, setOrder] = useState(initialOrder);
    const [showChangeAddress, setShowChangeAddress] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('keydown', onKey);
        };
    }, [onClose]);

    if (!order) return null;

    const steps = STATUS_STEPS[order.status] || STATUS_STEPS['Đang giao'];
    const activeStep = getStepIndex(order.status);
    const isDelivered = order.status === 'Đã giao';
    const daysSinceDelivery = isDelivered
        ? Math.floor((Date.now() - new Date(order.updatedAt)) / 86400000)
        : 999;

    return (
        <div className="acc-modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="acc-modal-card acc-modal-lg">
                {/* Header */}
                <div className="acc-modal-header">
                    <div>
                        <div className="acc-modal-title-row">
                            <span className="acc-order-num">{order.orderNumber}</span>
                            <StatusBadge status={order.status} />
                        </div>
                        <p className="acc-modal-sub">{formatDate(order.createdAt)}</p>
                    </div>
                    <button className="acc-modal-close" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="acc-modal-body">
                    {/* Shipping Timeline */}
                    <div className="acc-timeline-section">
                        <h4 className="acc-section-label">Trạng thái đơn hàng</h4>
                        <div className="acc-timeline">
                            {steps.map((step, i) => {
                                const isCompleted = i < activeStep;
                                const isCurrent = i === activeStep;
                                const isPending = i > activeStep;
                                return (
                                    <div key={step} className="acc-timeline-item">
                                        <div className="acc-timeline-left">
                                            <div className={`acc-timeline-dot${isCompleted ? ' completed' : isCurrent ? ' active' : ' pending'}`}>
                                                {isCompleted ? '✓' : isCurrent ? '' : ''}
                                                {isCurrent && <span className="acc-timeline-pulse" />}
                                            </div>
                                            {i < steps.length - 1 && (
                                                <div className={`acc-timeline-line${isCompleted ? ' completed' : ''}`} />
                                            )}
                                        </div>
                                        <div className="acc-timeline-content">
                                            <span className={`acc-timeline-label${isCurrent ? ' active' : isPending ? ' pending' : ''}`}>{step}</span>
                                            {!isPending && (
                                                <span className="acc-timeline-time">
                                                    {i === 0 ? formatDate(order.createdAt)
                                                        : i === 1 ? formatDate(order.updatedAt)
                                                            : isCurrent ? 'Đang cập nhật...' : formatDate(order.updatedAt)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="acc-detail-section">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h4 className="acc-section-label"><MapPin size={14} /> Địa chỉ giao hàng</h4>
                            {order.status === 'Chờ xác nhận' && (
                                <button
                                    className="acc-btn-outline-sm"
                                    style={{ fontSize: 12, padding: '4px 10px' }}
                                    onClick={() => setShowChangeAddress(true)}
                                >
                                    <Edit3 size={13} /> Thay đổi
                                </button>
                            )}
                        </div>
                        <div className="acc-address-card-detail">
                            <div className="acc-address-name">{order.customerName} · {order.customerPhone}</div>
                            <div className="acc-address-line">
                                {order.shippingAddress}, {order.shippingWard}, {order.shippingDistrict}, {order.shippingProvince}
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="acc-detail-section">
                        <h4 className="acc-section-label"><Package size={14} /> Sản phẩm</h4>
                        <div className="acc-items-table">
                            {order.items.map((item, idx) => (
                                <div key={item.orderItemId} className={`acc-item-row${idx % 2 === 1 ? ' alt' : ''}`}>
                                    {item.imageUrl ? (
                                        <img
                                            className="acc-item-thumb"
                                            src={item.imageUrl}
                                            alt={item.productName}
                                            loading="lazy"
                                            style={{ objectFit: 'cover', borderRadius: 8 }}
                                        />
                                    ) : (
                                        <div className="acc-item-thumb" style={{ background: item.thumbColor }}>
                                            <span className="acc-item-emoji">{item.thumbEmoji}</span>
                                        </div>
                                    )}
                                    <div className="acc-item-info">
                                        <div className="acc-item-name">{item.productName}</div>
                                        <div className="acc-item-variant">{item.variant}</div>
                                        {item.promotionName && (
                                            <div style={{ fontSize: 11, color: '#ef4444', marginTop: 2 }}>🏷️ {item.promotionName}</div>
                                        )}
                                    </div>
                                    <div className="acc-item-qty">x{item.quantity}</div>
                                    <div className="acc-item-price">
                                        {item.originalPrice && (
                                            <div style={{ textDecoration: 'line-through', color: '#9ca3af', fontSize: 12 }}>
                                                {formatVND(item.originalPrice)}
                                            </div>
                                        )}
                                        <div style={{ color: item.originalPrice ? '#ef4444' : 'inherit' }}>
                                            {formatVND(item.totalPrice)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pricing Breakdown */}
                    <div className="acc-detail-section">
                        <h4 className="acc-section-label">Chi tiết thanh toán</h4>
                        <div className="acc-pricing">
                            <div className="acc-pricing-row">
                                <span>Tạm tính</span>
                                <span>{formatVND(order.subtotal)}</span>
                            </div>
                            <div className="acc-pricing-row">
                                <span>Phí vận chuyển</span>
                                <span className={Number(order.shippingCost) === 0 ? 'acc-free' : ''}>
                                    {Number(order.shippingCost) === 0 ? 'Miễn phí' : formatVND(order.shippingCost)}
                                </span>
                            </div>
                            {Number(order.couponDiscountAmount) > 0 && (
                                <div className="acc-pricing-row acc-discount">
                                    <span>
                                        Giảm giá
                                        {order.couponCode && (
                                            <span style={{ marginLeft: 6, fontWeight: 600, color: '#f97316' }}>
                                                [{order.couponCode}]
                                            </span>
                                        )}
                                        {order.couponName && (
                                            <span style={{ marginLeft: 4, fontWeight: 400, color: '#6b7280', fontSize: '0.85em' }}>
                                                – {order.couponName}
                                            </span>
                                        )}
                                    </span>
                                    <span>-{formatVND(order.couponDiscountAmount)}</span>
                                </div>
                            )}
                            <div className="acc-pricing-row acc-total-row">
                                <span>Tổng cộng</span>
                                <span className="acc-total-val">{formatVND(order.totalAmount)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="acc-detail-section">
                        <h4 className="acc-section-label"><CreditCard size={14} /> Thanh toán</h4>
                        <div className="acc-payment-info">
                            <span>Phương thức: <strong>{order.orderType === 'In-store' ? 'Tại quầy' : (order.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản ngân hàng' : 'Thanh toán khi nhận hàng (COD)')}</strong></span>
                            <span className={`acc-pay-badge${order.paymentStatus === 'Đã thanh toán' ? ' acc-pay-paid' : ' acc-pay-unpaid'}`}>
                                {order.paymentStatus}
                            </span>
                        </div>
                    </div>

                    {/* Cancel Info */}
                    {order.status === 'Đã hủy' && order.cancelReason && (
                        <div className="acc-detail-section">
                            <h4 className="acc-section-label" style={{ color: '#dc2626' }}><Ban size={14} /> Thông tin hủy đơn</h4>
                            <div style={{
                                padding: '12px 16px',
                                background: '#fef2f2',
                                borderRadius: 10,
                                border: '1px solid #fecaca',
                                fontSize: 13,
                                color: '#991b1b',
                            }}>
                                <div>Lý do: <strong>{order.cancelReason}</strong></div>
                                {order.cancelledAt && (
                                    <div style={{ marginTop: 4, fontSize: 12, color: '#b91c1c' }}>
                                        Thời gian: {formatDate(order.cancelledAt)}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sticky Footer */}
                <div className="acc-modal-footer">
                    <button className="acc-btn-outline-sm">
                        <Printer size={15} /> In hóa đơn
                    </button>
                    <button className="acc-btn-outline-sm">
                        <ShoppingBag size={15} /> Mua lại tất cả
                    </button>
                    {isDelivered && daysSinceDelivery <= 7 && (
                        <button className="acc-btn-orange-sm">
                            <RotateCcw size={15} /> Yêu cầu trả hàng
                        </button>
                    )}
                    {order.status === 'Chờ xác nhận' && onCancel && (
                        order.paymentStatus !== 'Đã thanh toán'
                            ? (
                                <button
                                    className="acc-btn-danger-sm"
                                    disabled={cancelling}
                                    onClick={async () => {
                                        if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;
                                        setCancelling(true);
                                        try {
                                            await onCancel(order.orderNumber);
                                            setOrder(prev => ({
                                                ...prev,
                                                status: 'Đã hủy',
                                                cancelReason: 'Khách hàng tự hủy đơn',
                                                cancelledAt: new Date().toISOString(),
                                            }));
                                        } finally {
                                            setCancelling(false);
                                        }
                                    }}
                                >
                                    <Ban size={15} /> {cancelling ? 'Đang hủy...' : 'Hủy đơn hàng'}
                                </button>
                            )
                            : (
                                <span style={{ fontSize: 12, color: '#b45309', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '6px 12px', lineHeight: 1.4 }}>
                                    Đơn hàng đã được thanh toán. Vui lòng liên hệ shop để được hỗ trợ.
                                </span>
                            )
                    )}
                </div>
            </div>

            {/* Change Address Modal */}
            {showChangeAddress && (
                <ChangeAddressModal
                    order={order}
                    onClose={() => setShowChangeAddress(false)}
                    onSuccess={(updatedOrder) => {
                        setShowChangeAddress(false);
                        if (updatedOrder) {
                            setOrder(prev => ({
                                ...prev,
                                customerName: updatedOrder.customerName ?? prev.customerName,
                                customerPhone: updatedOrder.customerPhone ?? prev.customerPhone,
                                shippingProvince: updatedOrder.shippingProvince ?? prev.shippingProvince,
                                shippingDistrict: updatedOrder.shippingDistrict ?? prev.shippingDistrict,
                                shippingWard: updatedOrder.shippingWard ?? prev.shippingWard,
                                shippingAddress: updatedOrder.shippingAddress ?? prev.shippingAddress,
                                shippingCost: updatedOrder.shippingCost ?? prev.shippingCost,
                                totalAmount: updatedOrder.totalAmount ?? prev.totalAmount,
                            }));
                            onOrderUpdated?.(updatedOrder);
                        }
                    }}
                />
            )}
        </div>
    );
};

export default OrderDetailModal;
