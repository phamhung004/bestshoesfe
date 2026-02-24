import React, { useState } from 'react';
import { REJECT_REASONS } from './mockReturns';

/**
 * RejectReasonModal — modal for selecting a rejection reason
 * and composing customer notification message.
 */
const RejectReasonModal = ({ returnItem, onConfirm, onCancel }) => {
    const [selectedReason, setSelectedReason] = useState('');
    const [customReason, setCustomReason] = useState('');
    const [customerMessage, setCustomerMessage] = useState(
        'Yêu cầu trả hàng của quý khách đã không được chấp nhận. Vui lòng liên hệ hotline để được hỗ trợ.'
    );

    if (!returnItem) return null;

    const handleConfirm = () => {
        const reason = selectedReason === 'Khác' ? customReason : selectedReason;
        if (!reason) return;
        onConfirm(returnItem, reason, customerMessage);
    };

    return (
        <div className="rm-modal-overlay" onClick={onCancel}>
            <div className="rm-modal" onClick={e => e.stopPropagation()}>
                <h3>Từ chối yêu cầu trả hàng</h3>
                <p className="rm-modal-subtitle">
                    Đơn hàng: <strong>{returnItem.order_number}</strong> — {returnItem.return_code}
                </p>

                <label className="rm-modal-label">Lý do từ chối:</label>
                <div className="rm-radio-group">
                    {REJECT_REASONS.map(reason => (
                        <label
                            key={reason}
                            className={`rm-radio-option ${selectedReason === reason ? 'selected' : ''}`}
                        >
                            <input
                                type="radio"
                                name="reject-reason"
                                value={reason}
                                checked={selectedReason === reason}
                                onChange={() => setSelectedReason(reason)}
                            />
                            {reason}
                        </label>
                    ))}
                </div>

                {selectedReason === 'Khác' && (
                    <div style={{ marginBottom: 16 }}>
                        <label className="rm-modal-label">Lý do cụ thể:</label>
                        <textarea
                            value={customReason}
                            onChange={e => setCustomReason(e.target.value)}
                            placeholder="Nhập lý do từ chối..."
                            style={{ minHeight: 60 }}
                        />
                    </div>
                )}

                <label className="rm-modal-label">Nội dung thông báo gửi khách hàng:</label>
                <textarea
                    value={customerMessage}
                    onChange={e => setCustomerMessage(e.target.value)}
                    placeholder="Nhập nội dung thông báo..."
                />

                <div className="rm-modal-actions">
                    <button className="rm-btn rm-btn-outline" onClick={onCancel}>
                        Hủy
                    </button>
                    <button
                        className="rm-btn rm-btn-danger"
                        onClick={handleConfirm}
                        disabled={!selectedReason || (selectedReason === 'Khác' && !customReason)}
                    >
                        Xác nhận từ chối
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RejectReasonModal;
