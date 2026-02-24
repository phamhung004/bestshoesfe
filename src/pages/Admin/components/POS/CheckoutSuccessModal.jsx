import React from 'react';
import { formatVND, formatDateTime, getSizeName, getColor } from './mockPOSData';

/**
 * CheckoutSuccessModal — shown after successful checkout.
 * Includes print receipt trigger + new order button.
 */
const CheckoutSuccessModal = ({ order, onNewOrder, onClose }) => {
    const handlePrint = () => {
        window.print();
    };

    const paymentLabel = { cash: 'Tiền mặt', card: 'Thẻ/Chuyển khoản', ewallet: 'Ví điện tử' };

    return (
        <>
            <div className="pos-modal-overlay" onClick={onClose}>
                <div className="pos-modal" onClick={e => e.stopPropagation()} style={{ width: 420 }}>
                    <div className="pos-success-modal">
                        <div className="pos-success-check">✓</div>
                        <h2>Đặt hàng thành công!</h2>

                        <div className="pos-success-details">
                            <div className="pos-success-row">
                                <span>Mã đơn:</span>
                                <strong style={{ fontFamily: "'Courier New', monospace" }}>{order.order_number}</strong>
                            </div>
                            {order.customer_name && (
                                <div className="pos-success-row">
                                    <span>Khách hàng:</span>
                                    <strong>{order.customer_name}</strong>
                                </div>
                            )}
                            <div className="pos-success-row">
                                <span>Thanh toán:</span>
                                <strong>{paymentLabel[order.paymentMethod] || order.paymentMethod}</strong>
                            </div>
                            <div className="pos-success-row">
                                <span>Thời gian:</span>
                                <strong>{formatDateTime(order.created_at)}</strong>
                            </div>
                            {order.cashReceived > 0 && order.paymentMethod === 'cash' && (
                                <>
                                    <div className="pos-success-row">
                                        <span>Khách đưa:</span>
                                        <strong>{formatVND(order.cashReceived)}</strong>
                                    </div>
                                    <div className="pos-success-row">
                                        <span>Tiền thừa:</span>
                                        <strong>{formatVND(order.cashReceived - order.total_amount)}</strong>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="pos-success-total">{formatVND(order.total_amount)}</div>

                        <div className="pos-success-actions">
                            <button className="pos-success-print-btn" onClick={handlePrint}>
                                🖨️ In hóa đơn
                            </button>
                            <button className="pos-success-new-btn" onClick={onNewOrder}>
                                Đơn hàng mới
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden receipt for printing */}
            <div className="pos-receipt">
                <div className="pos-receipt-center">
                    <h2>THE BEST SHOES</h2>
                    <h3>Bán hàng tại quầy</h3>
                    <div>{order.order_number}</div>
                    <div>{formatDateTime(order.created_at)}</div>
                </div>
                <hr className="pos-receipt-hr" />
                {order.customer_name && (
                    <>
                        <div className="pos-receipt-row"><span>Khách:</span><span>{order.customer_name}</span></div>
                        {order.customer_phone && <div className="pos-receipt-row"><span>SĐT:</span><span>{order.customer_phone}</span></div>}
                        <hr className="pos-receipt-hr" />
                    </>
                )}
                {order.items.map((item, i) => (
                    <div key={i}>
                        <div className="pos-receipt-item-name">
                            {item.productName} - Size {getSizeName(item.size_id)} / {getColor(item.color_id).color_name}
                        </div>
                        <div className="pos-receipt-item-detail">
                            <span>{item.quantity} × {formatVND(item.unit_price)}</span>
                            <span>{formatVND(item.unit_price * item.quantity)}</span>
                        </div>
                    </div>
                ))}
                <hr className="pos-receipt-hr" />
                <div className="pos-receipt-row"><span>Tạm tính:</span><span>{formatVND(order.subtotal)}</span></div>
                {order.coupon_discount_amount > 0 && (
                    <div className="pos-receipt-row"><span>Giảm giá:</span><span>−{formatVND(order.coupon_discount_amount)}</span></div>
                )}
                <div className="pos-receipt-row pos-receipt-total"><span>TỔNG CỘNG:</span><span>{formatVND(order.total_amount)}</span></div>
                <div className="pos-receipt-row"><span>Thanh toán:</span><span>{paymentLabel[order.paymentMethod] || order.paymentMethod}</span></div>
                {order.cashReceived > 0 && order.paymentMethod === 'cash' && (
                    <div className="pos-receipt-row"><span>Tiền thừa:</span><span>{formatVND(order.cashReceived - order.total_amount)}</span></div>
                )}
                <hr className="pos-receipt-hr" />
                <div className="pos-receipt-footer">
                    <div>Cảm ơn quý khách!</div>
                    <div>Hẹn gặp lại lần sau</div>
                </div>
            </div>
        </>
    );
};

export default CheckoutSuccessModal;
