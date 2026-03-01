import React, { useState, useEffect } from 'react';
import { formatDate, getTierFromSpend, getTierEmoji } from '../mockAccountData';
import { updateProfile } from '../../../api/accountApi';

const phoneRegex = /^(0|\+84)(3|5|7|8|9)\d{8}$/;

// Gender mapping: frontend Vietnamese ↔ backend enum
const genderToBackend = { 'Nam': 'Male', 'Nữ': 'Female', 'Khác': 'Other' };
const genderToFrontend = { 'MALE': 'Nam', 'FEMALE': 'Nữ', 'OTHER': 'Khác', 'Male': 'Nam', 'Female': 'Nữ', 'Other': 'Khác' };

const ProfileTab = ({ customer, stats, onNameChange, onProfileUpdate }) => {
    const [form, setForm] = useState({
        fullName: '',
        gender: 'Nam',
        phone: '',
        dateOfBirth: '',
        email: '',
    });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (customer) {
            setForm({
                fullName: customer.fullName || '',
                gender: genderToFrontend[customer.gender] || 'Khác',
                phone: customer.phone || '',
                dateOfBirth: customer.dateOfBirth || '',
                email: customer.email || '',
            });
        }
    }, [customer]);

    const set = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const validate = () => {
        const errs = {};
        if (!form.fullName.trim() || form.fullName.trim().length < 2)
            errs.fullName = 'Vui lòng nhập họ và tên (ít nhất 2 ký tự)';
        if (/\d/.test(form.fullName)) errs.fullName = 'Họ tên không được chứa số';
        const digits = form.phone.replace(/\s/g, '');
        if (digits && !phoneRegex.test(digits)) errs.phone = 'Số điện thoại không hợp lệ';
        return errs;
    };

    const handleSave = async () => {
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        setSaving(true);
        try {
            await updateProfile({
                fullName: form.fullName.trim(),
                phone: form.phone.trim() || null,
                gender: genderToBackend[form.gender] || 'Other',
                dateOfBirth: form.dateOfBirth || null,
            });
            onNameChange && onNameChange(form.fullName);
            onProfileUpdate && onProfileUpdate();
            setToast('✓ Cập nhật thành công!');
            setTimeout(() => setToast(null), 3000);
        } catch (err) {
            setToast('✗ ' + (err.response?.data?.message || 'Cập nhật thất bại'));
            setTimeout(() => setToast(null), 3000);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (customer) {
            setForm({
                fullName: customer.fullName || '',
                gender: genderToFrontend[customer.gender] || 'Khác',
                phone: customer.phone || '',
                dateOfBirth: customer.dateOfBirth || '',
                email: customer.email || '',
            });
        }
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
                        <span className="acc-avatar-initial-lg">{(form.fullName || '?').charAt(0).toUpperCase()}</span>
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
                            className={`acc-form-input${errors.fullName ? ' error' : ''}`}
                            value={form.fullName}
                            onChange={e => set('fullName', e.target.value)}
                        />
                        {errors.fullName && <p className="acc-form-error">{errors.fullName}</p>}
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
                            value={form.dateOfBirth}
                            onChange={e => set('dateOfBirth', e.target.value)}
                        />
                    </div>
                </div>

                <div className="acc-form-group">
                    <label className="acc-form-label">Email</label>
                    <input
                        className="acc-form-input"
                        value={form.email}
                        disabled
                    />
                    <p className="acc-form-helper">🔒 Email dùng để đăng nhập — không thể thay đổi</p>
                </div>

                {/* Account Info (read-only) */}
                <div className="acc-account-info">
                    <h4 className="acc-account-info-title">Thông tin tài khoản</h4>
                    <div className="acc-form-grid-2">
                        <div className="acc-info-row">
                            <span className="acc-info-label">Mã khách hàng</span>
                            <span className="acc-info-val acc-mono">#{customer?.customerId ? String(customer.customerId).padStart(6, '0') : '---'}</span>
                        </div>
                        <div className="acc-info-row">
                            <span className="acc-info-label">Hạng thành viên</span>
                            <span className="acc-info-val">{stats?.memberTier ? `${getTierEmoji(stats.memberTier)} ${stats.memberTier === 'bronze' ? 'Đồng' : stats.memberTier === 'silver' ? 'Bạc' : stats.memberTier === 'gold' ? 'Vàng' : 'Kim cương'}` : '--'}</span>
                        </div>
                        <div className="acc-info-row">
                            <span className="acc-info-label">Ngày tham gia</span>
                            <span className="acc-info-val">{customer?.createdAt ? formatDate(customer.createdAt) : '--'}</span>
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
