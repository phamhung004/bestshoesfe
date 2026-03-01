import React from 'react';
import { formatAddress } from '../checkoutConstants';

const SavedAddressSelector = ({
    addresses,
    selectedAddressId,
    onSelectAddress,
    onUseOther,
    showManualForm,
}) => {
    if (!addresses || addresses.length === 0) return null;
    if (showManualForm) return null;

    return (
        <div className="co-card co-stagger-2">
            <div className="co-saved-header">
                <h3 className="co-card-title">Địa chỉ đã lưu</h3>
                <button className="co-saved-add-link">+ Thêm địa chỉ mới</button>
            </div>

            <div className="co-saved-grid">
                {addresses.map((addr) => (
                    <div
                        key={addr.addressId}
                        className={`co-saved-card ${selectedAddressId === addr.addressId ? 'selected' : ''}`}
                        onClick={() => onSelectAddress(addr.addressId)}
                    >
                        <div className="co-saved-card-top">
                            <span className="co-saved-card-name">{addr.recipientName}</span>
                            {addr.isDefault && (
                                <span className="co-saved-default-badge">Mặc định</span>
                            )}
                            <button className="co-saved-edit-link" onClick={(e) => e.stopPropagation()}>
                                Chỉnh sửa
                            </button>
                        </div>
                        <p className="co-saved-phone">{addr.phone}</p>
                        <p className="co-saved-address">{formatAddress(addr)}</p>
                    </div>
                ))}
            </div>

            <button className="co-saved-alt-btn" onClick={onUseOther}>
                Dùng địa chỉ khác
            </button>
        </div>
    );
};

export default SavedAddressSelector;
