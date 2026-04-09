import React, { useState, useCallback } from 'react';

/**
 * CancelOrderDialog – Modal xác nhận hủy đơn hàng
 * 
 * Props:
 *  - order: the order object to cancel (null = hidden)
 *  - onConfirm: (cancelReason: string) => void
 *  - onCancel: () => void
 */
const CancelOrderDialog = ({ order, onConfirm, onCancel }) => {
    const [cancelReason, setCancelReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isConfirmed = order?.status === 'Đã xác nhận';
    const isPending = order?.status === 'Chờ xác nhận';

    const handleConfirm = useCallback(async () => {
        if (!cancelReason.trim() || isSubmitting) return;
        setIsSubmitting(true);
        try {
            await onConfirm(cancelReason.trim());
        } finally {
            setIsSubmitting(false);
            setCancelReason('');
        }
    }, [cancelReason, isSubmitting, onConfirm]);

    const handleClose = useCallback(() => {
        if (isSubmitting) return;
        setCancelReason('');
        onCancel();
    }, [isSubmitting, onCancel]);

    if (!order) return null;

    return (
        <div className="om-confirm-overlay" onClick={handleClose}>
            <div
                className="om-confirm-dialog"
                onClick={(e) => e.stopPropagation()}
                style={{ textAlign: 'left', width: 440 }}
            >
                <h3 style={{ textAlign: 'center' }}>
                    Hủy đơn hàng #{order.order_number}?
                </h3>

                {isConfirmed && (
                    <div style={{
                        background: '#FFF7ED',
                        border: '1px solid #FDBA74',
                        borderRadius: 8,
                        padding: '12px 14px',
                        marginBottom: 16,
                        fontSize: 13,
                        color: '#9A3412',
                        lineHeight: 1.5,
                    }}>
                        ⚠️ Đơn hàng này đã được xác nhận và đã trừ stock.
                        Hủy đơn sẽ hoàn lại stock và voucher (nếu có).
                        Hành động này không thể hoàn tác.
                    </div>
                )}

                {isPending && (
                    <p style={{ textAlign: 'center', marginBottom: 16 }}>
                        Bạn có chắc chắn muốn hủy đơn hàng này? Thao tác này không thể hoàn tác.
                    </p>
                )}

                <label style={{
                    display: 'block',
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: 6,
                }}>
                    Lý do hủy <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Nhập lý do hủy đơn hàng..."
                    rows={3}
                    style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #D1D5DB',
                        borderRadius: 8,
                        fontSize: 13,
                        resize: 'vertical',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box',
                    }}
                    disabled={isSubmitting}
                    autoFocus
                />

                <div className="om-confirm-actions" style={{ marginTop: 18 }}>
                    <button
                        className="om-btn om-btn-outline"
                        onClick={handleClose}
                        disabled={isSubmitting}
                    >
                        Hủy bỏ
                    </button>
                    <button
                        className={`om-btn ${isConfirmed ? 'om-btn-warning' : 'om-btn-danger-outline'}`}
                        onClick={handleConfirm}
                        disabled={!cancelReason.trim() || isSubmitting}
                        style={{
                            backgroundColor: isConfirmed ? '#F97316' : undefined,
                            borderColor: isConfirmed ? '#F97316' : undefined,
                            color: isConfirmed ? '#fff' : undefined,
                            opacity: (!cancelReason.trim() || isSubmitting) ? 0.5 : 1,
                            cursor: (!cancelReason.trim() || isSubmitting) ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {isSubmitting ? 'Đang xử lý...' : 'Xác nhận hủy'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CancelOrderDialog;
