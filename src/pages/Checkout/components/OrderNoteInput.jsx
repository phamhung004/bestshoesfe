import React from 'react';

const OrderNoteInput = ({ value, onChange }) => {
    const maxLength = 200;

    return (
        <div className="co-card co-stagger-7">
            <div className="co-note-label-row">
                <h3 className="co-card-title">Ghi chú đơn hàng</h3>
                <span className="co-note-optional">Không bắt buộc</span>
            </div>
            <textarea
                className="co-form-textarea"
                placeholder="VD: Giao giờ hành chính, gọi trước khi giao, để hàng tại bảo vệ..."
                rows={4}
                value={value}
                onChange={(e) => {
                    if (e.target.value.length <= maxLength) {
                        onChange(e.target.value);
                    }
                }}
                maxLength={maxLength}
            />
            <p className="co-note-counter">{value.length}/{maxLength}</p>
        </div>
    );
};

export default OrderNoteInput;
