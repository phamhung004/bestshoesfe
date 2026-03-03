import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useProvinces } from '../../../hooks/useProvinces';

const phoneRegex = /^(0|\+84)(3|5|7|8|9)\d{8}$/;

const AddEditAddressModal = ({ address, onClose, onSave }) => {
    const isEdit = !!address;

    const {
        provinces,
        districts,
        wards,
        fetchProvinces,
        fetchDistricts,
        fetchWards,
        loadingProvinces,
        loadingDistricts,
        loadingWards,
    } = useProvinces();

    const [form, setForm] = useState({
        recipientName: address?.recipientName || '',
        phone: address?.phone || '',
        // Display names (stored in DB as country/state/city)
        country: address?.country || '',
        state: address?.state || '',
        city: address?.city || '',
        line1: address?.line1 || '',
        line2: address?.line2 || '',
        isDefault: address?.isDefault || false,
        // GHN IDs (for fee calculation)
        ghnProvinceId: address?.ghnProvinceId || '',
        ghnDistrictId: address?.ghnDistrictId || '',
        ghnWardCode: address?.ghnWardCode || '',
    });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    // Fetch provinces on mount
    useEffect(() => {
        fetchProvinces();
    }, []);

    // If editing with existing GHN IDs, auto-fetch districts and wards
    useEffect(() => {
        if (form.ghnProvinceId) {
            fetchDistricts(form.ghnProvinceId);
        }
    }, [form.ghnProvinceId]);

    useEffect(() => {
        if (form.ghnDistrictId) {
            fetchWards(form.ghnDistrictId);
        }
    }, [form.ghnDistrictId]);

    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('keydown', onKey);
        };
    }, [onClose]);

    const set = (field, value) => {
        setForm(prev => {
            const next = { ...prev, [field]: value };
            // Reset cascading fields
            if (field === 'ghnProvinceId') {
                next.ghnDistrictId = '';
                next.ghnWardCode = '';
                next.state = '';
                next.city = '';
            }
            if (field === 'ghnDistrictId') {
                next.ghnWardCode = '';
                next.city = '';
            }
            return next;
        });
        setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const handleProvinceChange = (e) => {
        const code = e.target.value;
        const selected = provinces.find((p) => String(p.code) === code);
        set('ghnProvinceId', code);
        setForm(prev => ({
            ...prev,
            ghnProvinceId: code,
            country: selected ? selected.name : '',
            ghnDistrictId: '',
            state: '',
            ghnWardCode: '',
            city: '',
        }));
        setErrors(prev => ({ ...prev, country: '' }));
        if (code) fetchDistricts(code);
    };

    const handleDistrictChange = (e) => {
        const code = e.target.value;
        const selected = districts.find((d) => String(d.code) === code);
        setForm(prev => ({
            ...prev,
            ghnDistrictId: code,
            state: selected ? selected.name : '',
            ghnWardCode: '',
            city: '',
        }));
        setErrors(prev => ({ ...prev, state: '' }));
        if (code) fetchWards(code);
    };

    const handleWardChange = (e) => {
        const code = e.target.value;
        const selected = wards.find((w) => String(w.code) === code);
        setForm(prev => ({
            ...prev,
            ghnWardCode: code,
            city: selected ? selected.name : '',
        }));
        setErrors(prev => ({ ...prev, city: '' }));
    };

    const validate = () => {
        const errs = {};
        if (!form.recipientName.trim() || form.recipientName.trim().length < 2)
            errs.recipientName = 'Vui lòng nhập tên người nhận';
        const digits = form.phone.replace(/\s/g, '');
        if (!digits || !phoneRegex.test(digits))
            errs.phone = 'Số điện thoại không hợp lệ (VD: 0912345678)';
        if (!form.ghnProvinceId || !form.country) errs.country = 'Vui lòng chọn Tỉnh/Thành phố';
        if (!form.ghnDistrictId || !form.state) errs.state = 'Vui lòng chọn Quận/Huyện';
        if (!form.ghnWardCode || !form.city) errs.city = 'Vui lòng chọn Phường/Xã';
        if (!form.line1.trim() || form.line1.trim().length < 5)
            errs.line1 = 'Vui lòng nhập địa chỉ cụ thể (ít nhất 5 ký tự)';
        return errs;
    };

    const handleSave = async () => {
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        setSaving(true);
        try {
            await onSave({
                recipientName: form.recipientName,
                phone: form.phone,
                country: form.country,
                state: form.state,
                city: form.city,
                line1: form.line1,
                line2: form.line2,
                isDefault: form.isDefault,
                ghnProvinceId: form.ghnProvinceId ? Number(form.ghnProvinceId) : null,
                ghnDistrictId: form.ghnDistrictId ? Number(form.ghnDistrictId) : null,
                ghnWardCode: form.ghnWardCode || null,
                addressId: address?.addressId || null,
            });
        } catch (err) {
            // error handled by parent
        } finally {
            setSaving(false);
        }
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
                                className={`acc-form-input${errors.recipientName ? ' error' : ''}`}
                                value={form.recipientName}
                                onChange={e => set('recipientName', e.target.value)}
                                placeholder="Nguyễn Văn A"
                            />
                            {errors.recipientName && <p className="acc-form-error">{errors.recipientName}</p>}
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
                                value={form.ghnProvinceId}
                                onChange={handleProvinceChange}
                                disabled={loadingProvinces}
                            >
                                <option value="">
                                    {loadingProvinces ? 'Đang tải...' : 'Chọn tỉnh/thành'}
                                </option>
                                {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                            </select>
                            {errors.country && <p className="acc-form-error">{errors.country}</p>}
                        </div>
                        <div className="acc-form-group">
                            <label className="acc-form-label">Quận/Huyện <span className="acc-required">*</span></label>
                            <select
                                className={`acc-form-select${errors.state ? ' error' : ''}`}
                                value={form.ghnDistrictId}
                                onChange={handleDistrictChange}
                                disabled={!form.ghnProvinceId || loadingDistricts}
                            >
                                <option value="">
                                    {loadingDistricts ? 'Đang tải...' : 'Chọn quận/huyện'}
                                </option>
                                {districts.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
                            </select>
                            {errors.state && <p className="acc-form-error">{errors.state}</p>}
                        </div>
                        <div className="acc-form-group">
                            <label className="acc-form-label">Phường/Xã <span className="acc-required">*</span></label>
                            <select
                                className={`acc-form-select${errors.city ? ' error' : ''}`}
                                value={form.ghnWardCode}
                                onChange={handleWardChange}
                                disabled={!form.ghnDistrictId || loadingWards}
                            >
                                <option value="">
                                    {loadingWards ? 'Đang tải...' : 'Chọn phường/xã'}
                                </option>
                                {wards.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
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
                            checked={form.isDefault}
                            onChange={e => set('isDefault', e.target.checked)}
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
