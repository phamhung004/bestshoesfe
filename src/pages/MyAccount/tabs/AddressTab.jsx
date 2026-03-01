import React, { useState, useEffect } from 'react';
import { Plus, MapPin, Edit2, Trash2, Loader } from 'lucide-react';
import { getMyAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress } from '../../../api/accountApi';
import AddEditAddressModal from '../components/AddEditAddressModal';

const AddressTab = () => {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null); // null | { mode: 'add' } | { mode: 'edit', ...addr }
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchAddresses = async () => {
        try {
            const res = await getMyAddresses();
            setAddresses(res.data || []);
        } catch (err) {
            console.error('Failed to load addresses:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAddresses(); }, []);

    const handleSave = async (data) => {
        try {
            if (data.addressId) {
                await updateAddress(data.addressId, data);
            } else {
                await createAddress(data);
            }
            await fetchAddresses();
            showToast(data.addressId ? 'Đã cập nhật địa chỉ!' : 'Đã thêm địa chỉ mới!');
            setModal(null);
        } catch (err) {
            showToast(err.response?.data?.message || 'Lưu địa chỉ thất bại', 'error');
        }
    };

    const handleSetDefault = async (id) => {
        try {
            await setDefaultAddress(id);
            await fetchAddresses();
            showToast('Đã đặt làm địa chỉ mặc định!');
        } catch (err) {
            showToast(err.response?.data?.message || 'Thao tác thất bại', 'error');
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteAddress(id);
            await fetchAddresses();
            setDeleteTarget(null);
            showToast('Đã xóa địa chỉ!');
        } catch (err) {
            showToast(err.response?.data?.message || 'Xóa thất bại', 'error');
            setDeleteTarget(null);
        }
    };

    if (loading) {
        return (
            <div className="acc-tab-content" style={{ textAlign: 'center', padding: '60px 0' }}>
                <Loader size={24} className="acc-spinner" /> Đang tải...
            </div>
        );
    }

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
                        <div key={addr.addressId} className={`acc-address-card${addr.isDefault ? ' default' : ''}`}>
                            <div className="acc-address-card-top">
                                <div className="acc-address-card-title">
                                    <MapPin size={16} className="acc-address-pin" />
                                    <span className="acc-address-recipient">{addr.recipientName}</span>
                                </div>
                                {addr.isDefault && (
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
                                    className={`acc-btn-danger-sm${addr.isDefault ? ' disabled' : ''}`}
                                    onClick={() => addr.isDefault ? null : setDeleteTarget(addr)}
                                    title={addr.isDefault ? 'Không thể xóa địa chỉ mặc định' : 'Xóa địa chỉ'}
                                    disabled={!!addr.isDefault}
                                >
                                    <Trash2 size={14} /> Xóa
                                </button>
                                {!addr.isDefault && (
                                    <button
                                        className="acc-btn-ghost-sm"
                                        onClick={() => handleSetDefault(addr.addressId)}
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
                                <strong>{deleteTarget.recipientName}</strong> — {deleteTarget.line1}, {deleteTarget.city}
                            </div>
                        </div>
                        <div className="acc-modal-footer">
                            <button className="acc-btn-ghost" onClick={() => setDeleteTarget(null)}>Hủy</button>
                            <button className="acc-btn-danger" onClick={() => handleDelete(deleteTarget.addressId)}>Xóa</button>
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
