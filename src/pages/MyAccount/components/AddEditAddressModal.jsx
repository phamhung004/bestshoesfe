import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { PROVINCES, DISTRICTS, WARDS } from '../mockAccountData';

const phoneRegex = /^(0|\+84)(3|5|7|8|9)\d{8}$/;

const AddEditAddressModal = ({ address, onClose, onSave }) => {
    const isEdit = !!address;
    const [form, setForm] = useState({
        recipient_name: address?.recipient_name || '',
        phone: address?.phone || '',
        country: address?.country || '',
        state: address?.state || '',
        city: address?.city || '',
        line1: address?.line1 || '',
        line2: address?.line2 || '',
        is_default: address?.is_default === 1 || false,
    });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [onClose]);

    const districts = form.country ? DISTRICTS[form.country] || [] : [];
    const wards = form.state ? WARDS[form.state] || [] : [];

    const set = (field, value) => {
        setForm(prev => {
            const next = { ...prev, [field]: value };
            if (field === 'country') { next.state = ''; next.city = ''; }
            if (field === 'state') { next.city = ''; }
            return next;
        });
        setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const validate = () => {
        const errs = {};
        if (!form.recipient_name.trim() || form.recipient_name.trim().length < 2)
            errs.recipient_name = 'Vui lòng nhập tên người nhận';
        const digits = form.phone.replace(/\s/g, '');
        if (!digits || !phoneRegex.test(digits))
            errs.phone = 'Số điện thoại không hợp lệ (VD: 0912345678)';
        if (!form.country) errs.country = 'Vui lòng chọn Tỉnh/Thành phố';
        if (!form.state) errs.state = 'Vui lòng chọn Quận/Huyện';
        if (!form.city) errs.city = 'Vui lòng chọn Phường/Xã';
        if (!form.line1.trim() || form.line1.trim().length < 5)
            errs.line1 = 'Vui lòng nhập địa chỉ cụ thể (ít nhất 5 ký tự)';
        return errs;
    };

    const handleSave = () => {
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        setSaving(true);
        setTimeout(() => {
            onSave({
                ...form,
                is_default: form.is_default ? 1 : 0,
                address_id: address?.address_id || Date.now(),
            });
            setSaving(false);
            onClose();
        }, 800);
    };

    return (
        <div className="acc-modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="acc-modal-card acc-modal-md">
                <div className="acc-modal-header">
                    <h3 className="acc-modal-title">{isEdit ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}</h3>
                    <button className="acc-modal-close" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="acc-modal-body">
                    <div className="acc-form-grid-2">
                        <div className="acc-form-group">
                            <label className="acc-form-label">Tên người nhận <span className="acc-required">*</span></label>
                            <input
                                className={`acc-form-input${errors.recipient_name ? ' error' : ''}`}
                                value={form.recipient_name}
                                onChange={e => set('recipient_name', e.target.value)}
                                placeholder="Nguyễn Văn A"
                            />
                            {errors.recipient_name && <p className="acc-form-error">{errors.recipient_name}</p>}
                        </div>
                        <div className="acc-form-group">
                            <label className="acc-form-label">Số điện thoại <span className="acc-required">*</span></label>
                            <input
                                className={`acc-form-input${errors.phone ? ' error' : ''}`}
                                value={form.phone}
                                onChange={e => set('phone', e.target.value)}
                                placeholder="0912 345 678"
                            />
                            {errors.phone && <p className="acc-form-error">{errors.phone}</p>}
                        </div>
                    </div>

                    <div className="acc-form-grid-3">
                        <div className="acc-form-group">
                            <label className="acc-form-label">Tỉnh/Thành phố <span className="acc-required">*</span></label>
                            <select
                                className={`acc-form-select${errors.country ? ' error' : ''}`}
                                value={form.country}
                                onChange={e => set('country', e.target.value)}
                            >
                                <option value="">Chọn tỉnh/thành</option>
                                {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                            {errors.country && <p className="acc-form-error">{errors.country}</p>}
                        </div>
                        <div className="acc-form-group">
                            <label className="acc-form-label">Quận/Huyện <span className="acc-required">*</span></label>
                            <select
                                className={`acc-form-select${errors.state ? ' error' : ''}`}
                                value={form.state}
                                onChange={e => set('state', e.target.value)}
                                disabled={!form.country}
                            >
                                <option value="">Chọn quận/huyện</option>
                                {districts.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                            {errors.state && <p className="acc-form-error">{errors.state}</p>}
                        </div>
                        <div className="acc-form-group">
                            <label className="acc-form-label">Phường/Xã <span className="acc-required">*</span></label>
                            <select
                                className={`acc-form-select${errors.city ? ' error' : ''}`}
                                value={form.city}
                                onChange={e => set('city', e.target.value)}
                                disabled={!form.state}
                            >
                                <option value="">Chọn phường/xã</option>
                                {wards.map(w => <option key={w} value={w}>{w}</option>)}
                            </select>
                            {errors.city && <p className="acc-form-error">{errors.city}</p>}
                        </div>
                    </div>

                    <div className="acc-form-group">
                        <label className="acc-form-label">Số nhà, tên đường <span className="acc-required">*</span></label>
                        <input
                            className={`acc-form-input${errors.line1 ? ' error' : ''}`}
                            value={form.line1}
                            onChange={e => set('line1', e.target.value)}
                            placeholder="123 Đường Lê Lợi"
                        />
                        {errors.line1 && <p className="acc-form-error">{errors.line1}</p>}
                    </div>

                    <div className="acc-form-group">
                        <label className="acc-form-label">Địa chỉ bổ sung</label>
                        <input
                            className="acc-form-input"
                            value={form.line2}
                            onChange={e => set('line2', e.target.value)}
                            placeholder="Tầng, căn hộ, tòa nhà... (không bắt buộc)"
                        />
                    </div>

                    <label className="acc-checkbox-row">
                        <input
                            type="checkbox"
                            checked={form.is_default}
                            onChange={e => set('is_default', e.target.checked)}
                            className="acc-checkbox"
                        />
                        <span>Đặt làm địa chỉ mặc định</span>
                    </label>
                </div>

                <div className="acc-modal-footer">
                    <button className="acc-btn-primary acc-btn-fullwidth" onClick={handleSave} disabled={saving}>
                        {saving ? <><span className="acc-spinner" /> Đang lưu...</> : 'Lưu địa chỉ'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddEditAddressModal;
