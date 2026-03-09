import React, { useState, useEffect } from 'react';
import { X, MapPin, Edit3, Check } from 'lucide-react';
import { useProvinces } from '../../../hooks/useProvinces';
import { getMyAddresses, updateShippingAddress } from '../../../api/accountApi';

const phoneRegex = /^(0|\+84)(3|5|7|8|9)\d{8}$/;

const ChangeAddressModal = ({ order, onClose, onSuccess }) => {
    const [tab, setTab] = useState('saved'); // 'saved' | 'new'
    const [addresses, setAddresses] = useState([]);
    const [loadingAddresses, setLoadingAddresses] = useState(true);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [apiError, setApiError] = useState('');

    // New address form
    const {
        provinces, districts, wards,
        fetchProvinces, fetchDistricts, fetchWards,
        loadingProvinces, loadingDistricts, loadingWards,
    } = useProvinces();

    const [form, setForm] = useState({
        customerName: order.customerName || '',
        customerPhone: order.customerPhone || '',
        ghnProvinceId: '',
        ghnDistrictId: '',
        ghnWardCode: '',
        shippingProvince: '',
        shippingDistrict: '',
        shippingWard: '',
        shippingAddress: '',
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [onClose]);

    useEffect(() => {
        fetchProvinces();
        getMyAddresses()
            .then(res => {
                const list = res.data?.data || res.data || [];
                setAddresses(list);
            })
            .catch(() => setAddresses([]))
            .finally(() => setLoadingAddresses(false));
    }, []);

    const set = (field, value) => {
        setForm(prev => {
            const next = { ...prev, [field]: value };
            if (field === 'ghnProvinceId') {
                next.ghnDistrictId = '';
                next.ghnWardCode = '';
                next.shippingDistrict = '';
                next.shippingWard = '';
            }
            if (field === 'ghnDistrictId') {
                next.ghnWardCode = '';
                next.shippingWard = '';
            }
            return next;
        });
        setErrors(prev => ({ ...prev, [field]: '' }));
        setApiError('');
    };

    const handleProvinceChange = (e) => {
        const code = e.target.value;
        const selected = provinces.find(p => String(p.code) === code);
        setForm(prev => ({
            ...prev,
            ghnProvinceId: code,
            shippingProvince: selected ? selected.name : '',
            ghnDistrictId: '', shippingDistrict: '',
            ghnWardCode: '', shippingWard: '',
        }));
        setErrors(prev => ({ ...prev, shippingProvince: '' }));
        if (code) fetchDistricts(code);
    };

    const handleDistrictChange = (e) => {
        const code = e.target.value;
        const selected = districts.find(d => String(d.code) === code);
        setForm(prev => ({
            ...prev,
            ghnDistrictId: code,
            shippingDistrict: selected ? selected.name : '',
            ghnWardCode: '', shippingWard: '',
        }));
        setErrors(prev => ({ ...prev, shippingDistrict: '' }));
        if (code) fetchWards(code);
    };

    const handleWardChange = (e) => {
        const code = e.target.value;
        const selected = wards.find(w => String(w.code) === code);
        setForm(prev => ({
            ...prev,
            ghnWardCode: code,
            shippingWard: selected ? selected.name : '',
        }));
        setErrors(prev => ({ ...prev, shippingWard: '' }));
    };

    const validate = () => {
        const errs = {};
        if (!form.customerName.trim()) errs.customerName = 'Vui lòng nhập tên người nhận';
        if (!form.customerPhone || !phoneRegex.test(form.customerPhone.replace(/\s/g, '')))
            errs.customerPhone = 'Số điện thoại không hợp lệ';
        if (!form.ghnProvinceId) errs.shippingProvince = 'Vui lòng chọn Tỉnh/Thành phố';
        if (!form.ghnDistrictId) errs.shippingDistrict = 'Vui lòng chọn Quận/Huyện';
        if (!form.ghnWardCode) errs.shippingWard = 'Vui lòng chọn Phường/Xã';
        if (!form.shippingAddress.trim() || form.shippingAddress.trim().length < 5)
            errs.shippingAddress = 'Vui lòng nhập địa chỉ cụ thể (ít nhất 5 ký tự)';
        return errs;
    };

    const handleSubmitSaved = async () => {
        if (!selectedAddressId) return;
        setSubmitting(true);
        setApiError('');
        try {
            const res = await updateShippingAddress(order.orderNumber, {
                addressId: selectedAddressId,
            });
            const updated = res.data?.data || res.data;
            onSuccess(updated);
        } catch (err) {
            setApiError(err.response?.data?.message || 'Không thể cập nhật địa chỉ');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmitNew = async () => {
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        setSubmitting(true);
        setApiError('');
        try {
            const res = await updateShippingAddress(order.orderNumber, {
                customerName: form.customerName,
                customerPhone: form.customerPhone,
                shippingProvince: form.shippingProvince,
                shippingDistrict: form.shippingDistrict,
                shippingWard: form.shippingWard,
                shippingAddress: form.shippingAddress,
                ghnDistrictId: form.ghnDistrictId ? Number(form.ghnDistrictId) : null,
                ghnWardCode: form.ghnWardCode || null,
            });
            const updated = res.data?.data || res.data;
            onSuccess(updated);
        } catch (err) {
            setApiError(err.response?.data?.message || 'Không thể cập nhật địa chỉ');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="acc-modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="acc-modal-card acc-modal-md">
                {/* Header */}
                <div className="acc-modal-header">
                    <h3 className="acc-modal-title">
                        <MapPin size={18} style={{ marginRight: 6 }} />
                        Thay đổi địa chỉ giao hàng
                    </h3>
                    <button className="acc-modal-close" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="acc-modal-body">
                    {/* Tab switcher */}
                    <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                        <button
                            className={`acc-status-pill${tab === 'saved' ? ' active' : ''}`}
                            onClick={() => { setTab('saved'); setApiError(''); }}
                        >
                            <MapPin size={14} /> Địa chỉ đã lưu
                        </button>
                        <button
                            className={`acc-status-pill${tab === 'new' ? ' active' : ''}`}
                            onClick={() => { setTab('new'); setApiError(''); }}
                        >
                            <Edit3 size={14} /> Nhập địa chỉ mới
                        </button>
                    </div>

                    {apiError && (
                        <div style={{
                            background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
                            padding: '10px 14px', borderRadius: 8, marginBottom: 14, fontSize: 13
                        }}>
                            {apiError}
                        </div>
                    )}

                    {/* Tab: Saved Addresses */}
                    {tab === 'saved' && (
                        <div>
                            {loadingAddresses ? (
                                <div style={{ textAlign: 'center', padding: 24, color: '#9ca3af' }}>Đang tải...</div>
                            ) : addresses.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: 24, color: '#9ca3af' }}>
                                    Bạn chưa có địa chỉ nào được lưu.
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 320, overflowY: 'auto' }}>
                                    {addresses.map(addr => (
                                        <div
                                            key={addr.addressId}
                                            onClick={() => setSelectedAddressId(addr.addressId)}
                                            style={{
                                                border: selectedAddressId === addr.addressId
                                                    ? '2px solid #6366f1' : '1px solid #e5e7eb',
                                                borderRadius: 10, padding: '12px 14px', cursor: 'pointer',
                                                background: selectedAddressId === addr.addressId ? '#eef2ff' : '#fff',
                                                transition: 'all 0.15s',
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <strong style={{ fontSize: 14 }}>
                                                    {addr.recipientName} · {addr.phone}
                                                </strong>
                                                {selectedAddressId === addr.addressId && (
                                                    <Check size={16} style={{ color: '#6366f1' }} />
                                                )}
                                            </div>
                                            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
                                                {addr.line1}, {addr.city}, {addr.state}, {addr.country}
                                            </div>
                                            {addr.isDefault && (
                                                <span style={{
                                                    display: 'inline-block', marginTop: 4, fontSize: 11,
                                                    color: '#6366f1', background: '#eef2ff',
                                                    padding: '2px 8px', borderRadius: 4, fontWeight: 600
                                                }}>
                                                    Mặc định
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab: New Address */}
                    {tab === 'new' && (
                        <div>
                            <div className="acc-form-grid-2">
                                <div className="acc-form-group">
                                    <label className="acc-form-label">Tên người nhận <span className="acc-required">*</span></label>
                                    <input
                                        className={`acc-form-input${errors.customerName ? ' error' : ''}`}
                                        value={form.customerName}
                                        onChange={e => set('customerName', e.target.value)}
                                        placeholder="Nguyễn Văn A"
                                    />
                                    {errors.customerName && <p className="acc-form-error">{errors.customerName}</p>}
                                </div>
                                <div className="acc-form-group">
                                    <label className="acc-form-label">Số điện thoại <span className="acc-required">*</span></label>
                                    <input
                                        className={`acc-form-input${errors.customerPhone ? ' error' : ''}`}
                                        value={form.customerPhone}
                                        onChange={e => set('customerPhone', e.target.value)}
                                        placeholder="0912 345 678"
                                    />
                                    {errors.customerPhone && <p className="acc-form-error">{errors.customerPhone}</p>}
                                </div>
                            </div>

                            <div className="acc-form-grid-3">
                                <div className="acc-form-group">
                                    <label className="acc-form-label">Tỉnh/Thành phố <span className="acc-required">*</span></label>
                                    <select
                                        className={`acc-form-select${errors.shippingProvince ? ' error' : ''}`}
                                        value={form.ghnProvinceId}
                                        onChange={handleProvinceChange}
                                        disabled={loadingProvinces}
                                    >
                                        <option value="">{loadingProvinces ? 'Đang tải...' : 'Chọn tỉnh/thành'}</option>
                                        {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                                    </select>
                                    {errors.shippingProvince && <p className="acc-form-error">{errors.shippingProvince}</p>}
                                </div>
                                <div className="acc-form-group">
                                    <label className="acc-form-label">Quận/Huyện <span className="acc-required">*</span></label>
                                    <select
                                        className={`acc-form-select${errors.shippingDistrict ? ' error' : ''}`}
                                        value={form.ghnDistrictId}
                                        onChange={handleDistrictChange}
                                        disabled={!form.ghnProvinceId || loadingDistricts}
                                    >
                                        <option value="">{loadingDistricts ? 'Đang tải...' : 'Chọn quận/huyện'}</option>
                                        {districts.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
                                    </select>
                                    {errors.shippingDistrict && <p className="acc-form-error">{errors.shippingDistrict}</p>}
                                </div>
                                <div className="acc-form-group">
                                    <label className="acc-form-label">Phường/Xã <span className="acc-required">*</span></label>
                                    <select
                                        className={`acc-form-select${errors.shippingWard ? ' error' : ''}`}
                                        value={form.ghnWardCode}
                                        onChange={handleWardChange}
                                        disabled={!form.ghnDistrictId || loadingWards}
                                    >
                                        <option value="">{loadingWards ? 'Đang tải...' : 'Chọn phường/xã'}</option>
                                        {wards.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
                                    </select>
                                    {errors.shippingWard && <p className="acc-form-error">{errors.shippingWard}</p>}
                                </div>
                            </div>

                            <div className="acc-form-group">
                                <label className="acc-form-label">Số nhà, tên đường <span className="acc-required">*</span></label>
                                <input
                                    className={`acc-form-input${errors.shippingAddress ? ' error' : ''}`}
                                    value={form.shippingAddress}
                                    onChange={e => set('shippingAddress', e.target.value)}
                                    placeholder="123 Đường Lê Lợi"
                                />
                                {errors.shippingAddress && <p className="acc-form-error">{errors.shippingAddress}</p>}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="acc-modal-footer" style={{ justifyContent: 'flex-end', gap: 10 }}>
                    <button className="acc-btn-outline-sm" onClick={onClose} disabled={submitting}>
                        Hủy
                    </button>
                    {tab === 'saved' ? (
                        <button
                            className="acc-btn-primary"
                            onClick={handleSubmitSaved}
                            disabled={submitting || !selectedAddressId}
                        >
                            {submitting ? 'Đang cập nhật...' : 'Dùng địa chỉ này'}
                        </button>
                    ) : (
                        <button
                            className="acc-btn-primary"
                            onClick={handleSubmitNew}
                            disabled={submitting}
                        >
                            {submitting ? 'Đang cập nhật...' : 'Xác nhận thay đổi'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChangeAddressModal;
