import React from 'react';
import { CheckCircle, Printer, Plus } from 'lucide-react';
import { formatVND, formatDateTime } from './posUtils';

/**
 * CheckoutSuccessModal — shown after successful checkout.
 * Receives POSCheckoutResponse from backend with nested OrderItemResponse items.
 * Includes print receipt trigger + new order button.
 */
const CheckoutSuccessModal = ({ order, onNewOrder, onClose }) => {
    const handlePrint = () => {
        window.print();
    };
    const paymentMethodLabel = order.paymentMethod || 'Tiền mặt';

    return (
        <>
            <div className="pos-modal-overlay" onClick={onClose}>
                <div className="pos-modal" onClick={e => e.stopPropagation()} style={{ width: 420 }}>
                    <div className="pos-success-modal">
                        <div className="pos-success-check"><CheckCircle size={36} /></div>
                        <h2>Đặt hàng thành công!</h2>

                        <div className="pos-success-details">
                            <div className="pos-success-row">
                                <span>Mã đơn:</span>
                                <strong style={{ fontFamily: "'Courier New', monospace" }}>{order.orderNumber}</strong>
                            </div>
                            {order.customerName && (
                                <div className="pos-success-row">
                                    <span>Khách hàng:</span>
                                    <strong>{order.customerName}</strong>
                                </div>
                            )}
                            <div className="pos-success-row">
                                <span>Thanh toán:</span>
                                <strong>{paymentMethodLabel}</strong>
                            </div>
                            <div className="pos-success-row">
                                <span>Thời gian:</span>
                                <strong>{formatDateTime(order.createdAt)}</strong>
                            </div>
                            {order.cashReceived > 0 && (
                                <>
                                    <div className="pos-success-row">
                                        <span>Khách đưa:</span>
                                        <strong>{formatVND(order.cashReceived)}</strong>
                                    </div>
                                    <div className="pos-success-row">
                                        <span>Tiền thừa:</span>
                                        <strong>{formatVND(order.changeAmount || 0)}</strong>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="pos-success-total">{formatVND(order.totalAmount)}</div>

                        <div className="pos-success-actions">
                            <button className="pos-success-print-btn" onClick={handlePrint}>
                                <Printer size={14} /> In hóa đơn
                            </button>
                            <button className="pos-success-new-btn" onClick={onNewOrder}>
                                <Plus size={14} /> Đơn hàng mới
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
                    <div>{order.orderNumber}</div>
                    <div>{formatDateTime(order.createdAt)}</div>
                </div>
                <hr className="pos-receipt-hr" />
                {order.customerName && (
                    <>
                        <div className="pos-receipt-row"><span>Khách:</span><span>{order.customerName}</span></div>
                        {order.customerPhone && <div className="pos-receipt-row"><span>SĐT:</span><span>{order.customerPhone}</span></div>}
                        <hr className="pos-receipt-hr" />
                    </>
                )}
                {order.items && order.items.map((item, i) => (
                    <div key={i}>
                        <div className="pos-receipt-item-name">
                            {item.product?.name || 'Sản phẩm'} - Size {item.size?.sizeName || '?'} / {item.color?.colorName || '?'}
                        </div>
                        <div className="pos-receipt-item-detail">
                            <span>{item.quantity} × {formatVND(item.unitPrice)}</span>
                            <span>{formatVND(item.totalPrice || item.unitPrice * item.quantity)}</span>
                        </div>
                    </div>
                ))}
                <hr className="pos-receipt-hr" />
                <div className="pos-receipt-row"><span>Tạm tính:</span><span>{formatVND(order.subtotal)}</span></div>
                {order.couponDiscountAmount > 0 && (
                    <div className="pos-receipt-row"><span>Giảm giá:</span><span>−{formatVND(order.couponDiscountAmount)}</span></div>
                )}
                <div className="pos-receipt-row pos-receipt-total"><span>TỔNG CỘNG:</span><span>{formatVND(order.totalAmount)}</span></div>
                <div className="pos-receipt-row"><span>Thanh toán:</span><span>{paymentMethodLabel}</span></div>
                {order.cashReceived > 0 && (
                    <div className="pos-receipt-row"><span>Tiền thừa:</span><span>{formatVND(order.changeAmount || 0)}</span></div>
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
