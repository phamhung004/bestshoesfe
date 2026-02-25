import React, { useState } from 'react';
import { MOCK_CUSTOMER, formatDate } from '../mockAccountData';

const phoneRegex = /^(0|\+84)(3|5|7|8|9)\d{8}$/;

const ProfileTab = ({ onNameChange }) => {
    const [form, setForm] = useState({
        full_name: MOCK_CUSTOMER.full_name,
        gender: MOCK_CUSTOMER.gender,
        phone: MOCK_CUSTOMER.phone,
        date_of_birth: MOCK_CUSTOMER.date_of_birth,
        email: MOCK_CUSTOMER.email,
    });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    const set = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const validate = () => {
        const errs = {};
        if (!form.full_name.trim() || form.full_name.trim().length < 2)
            errs.full_name = 'Vui lòng nhập họ và tên (ít nhất 2 ký tự)';
        if (/\d/.test(form.full_name)) errs.full_name = 'Họ tên không được chứa số';
        const digits = form.phone.replace(/\s/g, '');
        if (!digits || !phoneRegex.test(digits)) errs.phone = 'Số điện thoại không hợp lệ';
        if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
            errs.email = 'Email không đúng định dạng';
        return errs;
    };

    const handleSave = () => {
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        setSaving(true);
        setTimeout(() => {
            setSaving(false);
            onNameChange && onNameChange(form.full_name);
            setToast('✓ Cập nhật thành công!');
            setTimeout(() => setToast(null), 3000);
        }, 1200);
    };

    const handleCancel = () => {
        setForm({
            full_name: MOCK_CUSTOMER.full_name,
            gender: MOCK_CUSTOMER.gender,
            phone: MOCK_CUSTOMER.phone,
            date_of_birth: MOCK_CUSTOMER.date_of_birth,
            email: MOCK_CUSTOMER.email,
        });
        setErrors({});
    };

    return (
        <div className="acc-tab-content">
            <div className="acc-profile-form-card">
                <div className="acc-tab-header">
                    <div>
                        <h2 className="acc-tab-title">Thông tin cá nhân</h2>
                        <p className="acc-tab-sub">Cập nhật thông tin hồ sơ của bạn</p>
                    </div>
                </div>

                {/* Avatar Section */}
                <div className="acc-form-avatar-section">
                    <div className="acc-form-avatar">
                        <span className="acc-avatar-initial-lg">{form.full_name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                        <button className="acc-avatar-change-btn">Thay đổi ảnh đại diện</button>
                        <p className="acc-avatar-hint">Tải ảnh lên (JPG, PNG, tối đa 2MB)</p>
                    </div>
                </div>

                {/* Form */}
                <div className="acc-form-grid-2">
                    <div className="acc-form-group">
                        <label className="acc-form-label">Họ và tên <span className="acc-required">*</span></label>
                        <input
                            className={`acc-form-input${errors.full_name ? ' error' : ''}`}
                            value={form.full_name}
                            onChange={e => set('full_name', e.target.value)}
                        />
                        {errors.full_name && <p className="acc-form-error">{errors.full_name}</p>}
                    </div>
                    <div className="acc-form-group">
                        <label className="acc-form-label">Giới tính</label>
                        <div className="acc-gender-toggle">
                            {['Nam', 'Nữ', 'Khác'].map(g => (
                                <button
                                    key={g}
                                    type="button"
                                    className={`acc-gender-btn${form.gender === g ? ' selected' : ''}`}
                                    onClick={() => set('gender', g)}
                                >
                                    {g}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="acc-form-grid-2">
                    <div className="acc-form-group">
                        <label className="acc-form-label">Số điện thoại <span className="acc-required">*</span></label>
                        <input
                            className={`acc-form-input${errors.phone ? ' error' : ''}`}
                            value={form.phone}
                            onChange={e => set('phone', e.target.value)}
                        />
                        {errors.phone && <p className="acc-form-error">{errors.phone}</p>}
                    </div>
                    <div className="acc-form-group">
                        <label className="acc-form-label">Ngày sinh</label>
                        <input
                            type="date"
                            className="acc-form-input acc-date-input"
                            value={form.date_of_birth}
                            onChange={e => set('date_of_birth', e.target.value)}
                        />
                    </div>
                </div>

                <div className="acc-form-group">
                    <label className="acc-form-label">Email <span className="acc-required">*</span></label>
                    <input
                        className={`acc-form-input${errors.email ? ' error' : ''}`}
                        value={form.email}
                        onChange={e => set('email', e.target.value)}
                    />
                    {errors.email && <p className="acc-form-error">{errors.email}</p>}
                    <p className="acc-form-helper">🔒 Email dùng để đăng nhập — thay đổi cẩn thận</p>
                </div>

                {/* Account Info (read-only) */}
                <div className="acc-account-info">
                    <h4 className="acc-account-info-title">Thông tin tài khoản</h4>
                    <div className="acc-form-grid-2">
                        <div className="acc-info-row">
                            <span className="acc-info-label">Mã khách hàng</span>
                            <span className="acc-info-val acc-mono">#KH000001</span>
                        </div>
                        <div className="acc-info-row">
                            <span className="acc-info-label">Hạng thành viên</span>
                            <span className="acc-info-val">⭐ Vàng</span>
                        </div>
                        <div className="acc-info-row">
                            <span className="acc-info-label">Ngày tham gia</span>
                            <span className="acc-info-val">{formatDate(MOCK_CUSTOMER.created_at)}</span>
                        </div>
                        <div className="acc-info-row">
                            <span className="acc-info-label">Trạng thái</span>
                            <span className="acc-info-val acc-verified">✓ Đã xác minh</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="acc-form-actions">
                    <button className="acc-btn-ghost" onClick={handleCancel}>Hủy</button>
                    <button className="acc-btn-primary" onClick={handleSave} disabled={saving}>
                        {saving ? <><span className="acc-spinner" /> Đang lưu...</> : 'Lưu thay đổi'}
                    </button>
                </div>
            </div>

            {toast && <div className="acc-toast acc-toast-success">{toast}</div>}
        </div>
    );
};

export default ProfileTab;
