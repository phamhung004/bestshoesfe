import React from 'react';

const BulkActionBar = ({ selectedCount, totalCount, allSelected, onToggleSelectAll, onDeleteSelected, onSaveSelected, onDeselectAll }) => {
    return (
        <div className="cart-bulk-bar">
            <div className="cart-bulk-bar-left">
                <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={onToggleSelectAll}
                    style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#4f46e5' }}
                    aria-label="Chọn tất cả"
                />
                {selectedCount > 0
                    ? <>Đã chọn <strong>{selectedCount}</strong> sản phẩm</>
                    : <>Chọn tất cả <strong>{totalCount}</strong> sản phẩm</>}
            </div>
            {selectedCount > 0 && (
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
            )}
        </div>
    );
};

export default BulkActionBar;
