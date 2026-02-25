import React from 'react';

const BulkActionBar = ({ selectedCount, onDeleteSelected, onSaveSelected, onDeselectAll }) => {
    if (selectedCount === 0) return null;

    return (
        <div className="cart-bulk-bar">
            <div className="cart-bulk-bar-left">
                Đã chọn <strong>{selectedCount}</strong> sản phẩm
            </div>
            <div className="cart-bulk-bar-actions">
                <button className="cart-bulk-btn delete" onClick={onDeleteSelected}>
                    Xóa đã chọn
                </button>
                <button className="cart-bulk-btn" onClick={onSaveSelected}>
                    Lưu đã chọn
                </button>
                <button className="cart-bulk-deselect" onClick={onDeselectAll}>
                    Bỏ chọn
                </button>
            </div>
        </div>
    );
};

export default BulkActionBar;
