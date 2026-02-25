import React, { useState } from 'react';
import { Plus, MapPin, Edit2, Trash2 } from 'lucide-react';
import { MOCK_ADDRESSES_INIT } from '../mockAccountData';
import AddEditAddressModal from '../components/AddEditAddressModal';

const AddressTab = () => {
    const [addresses, setAddresses] = useState(MOCK_ADDRESSES_INIT);
    const [modal, setModal] = useState(null); // null | 'add' | address object
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSave = (data) => {
        setAddresses(prev => {
            const isEdit = prev.some(a => a.address_id === data.address_id);
            let updated = isEdit
                ? prev.map(a => a.address_id === data.address_id ? { ...a, ...data } : a)
                : [...prev, { ...data, customer_id: 1, status: 1, updated_at: new Date().toISOString() }];
            // Handle is_default
            if (data.is_default === 1) {
                updated = updated.map(a => ({ ...a, is_default: a.address_id === data.address_id ? 1 : 0 }));
            }
            return updated;
        });
        showToast(modal?.address_id ? 'Đã cập nhật địa chỉ!' : 'Đã thêm địa chỉ mới!');
    };

    const handleSetDefault = (id) => {
        setAddresses(prev => prev.map(a => ({ ...a, is_default: a.address_id === id ? 1 : 0 })));
        showToast('Đã đặt làm địa chỉ mặc định!');
    };

    const handleDelete = (id) => {
        const addr = addresses.find(a => a.address_id === id);
        if (addr?.is_default) return;
        setAddresses(prev => prev.filter(a => a.address_id !== id));
        setDeleteTarget(null);
        showToast('Đã xóa địa chỉ!');
    };

    return (
        <div className="acc-tab-content">
            <div className="acc-tab-header">
                <div>
                    <h2 className="acc-tab-title">Địa chỉ của tôi</h2>
                    <p className="acc-tab-sub">Quản lý địa chỉ giao hàng</p>
                </div>
                <button className="acc-btn-primary" onClick={() => setModal({ mode: 'add' })}>
                    <Plus size={16} /> Thêm địa chỉ mới
                </button>
            </div>

            {addresses.length === 0 ? (
                <div className="acc-empty-state">
                    <MapPin size={48} className="acc-empty-icon" />
                    <h3>Chưa có địa chỉ nào</h3>
                    <p>Thêm địa chỉ để giao hàng nhanh hơn!</p>
                    <button className="acc-btn-primary" onClick={() => setModal({ mode: 'add' })}>Thêm địa chỉ đầu tiên</button>
                </div>
            ) : (
                <div className="acc-address-grid">
                    {addresses.map(addr => (
                        <div key={addr.address_id} className={`acc-address-card${addr.is_default ? ' default' : ''}`}>
                            <div className="acc-address-card-top">
                                <div className="acc-address-card-title">
                                    <MapPin size={16} className="acc-address-pin" />
                                    <span className="acc-address-recipient">{addr.recipient_name}</span>
                                </div>
                                {addr.is_default === 1 && (
                                    <span className="acc-default-badge">Mặc định</span>
                                )}
                            </div>
                            <div className="acc-address-phone">{addr.phone}</div>
                            <div className="acc-address-block">
                                <div>{addr.line1}{addr.line2 && `, ${addr.line2}`}</div>
                                <div>{addr.city}, {addr.state}, {addr.country}</div>
                            </div>
                            <div className="acc-address-card-divider" />
                            <div className="acc-address-card-actions">
                                <button
                                    className="acc-btn-outline-sm"
                                    onClick={() => setModal({ mode: 'edit', ...addr })}
                                >
                                    <Edit2 size={14} /> Chỉnh sửa
                                </button>
                                <button
                                    className={`acc-btn-danger-sm${addr.is_default ? ' disabled' : ''}`}
                                    onClick={() => addr.is_default ? null : setDeleteTarget(addr)}
                                    title={addr.is_default ? 'Không thể xóa địa chỉ mặc định' : 'Xóa địa chỉ'}
                                    disabled={addr.is_default === 1}
                                >
                                    <Trash2 size={14} /> Xóa
                                </button>
                                {addr.is_default !== 1 && (
                                    <button
                                        className="acc-btn-ghost-sm"
                                        onClick={() => handleSetDefault(addr.address_id)}
                                    >
                                        Đặt làm mặc định
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {modal && (
                <AddEditAddressModal
                    address={modal.mode === 'edit' ? modal : null}
                    onClose={() => setModal(null)}
                    onSave={handleSave}
                />
            )}

            {/* Delete Confirm */}
            {deleteTarget && (
                <div className="acc-modal-backdrop" onClick={(e) => e.target === e.currentTarget && setDeleteTarget(null)}>
                    <div className="acc-modal-card acc-modal-sm">
                        <div className="acc-modal-header">
                            <h3 className="acc-modal-title">Xóa địa chỉ</h3>
                        </div>
                        <div className="acc-modal-body">
                            <p className="acc-logout-msg">Bạn có chắc muốn xóa địa chỉ này?</p>
                            <div className="acc-delete-preview">
                                <strong>{deleteTarget.recipient_name}</strong> — {deleteTarget.line1}, {deleteTarget.city}
                            </div>
                        </div>
                        <div className="acc-modal-footer">
                            <button className="acc-btn-ghost" onClick={() => setDeleteTarget(null)}>Hủy</button>
                            <button className="acc-btn-danger" onClick={() => handleDelete(deleteTarget.address_id)}>Xóa</button>
                        </div>
                    </div>
                </div>
            )}

            {toast && (
                <div className={`acc-toast${toast.type === 'success' ? ' acc-toast-success' : ' acc-toast-info'}`}>{toast.msg}</div>
            )}
        </div>
    );
};

export default AddressTab;
