import React, { useState, useEffect, useCallback } from 'react';
import { X, User, Mail, Phone, Lock, Eye, EyeOff, AlertTriangle } from 'lucide-react';

/* ── Password strength helper ─────────────────────────────── */
function getPasswordStrength(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0-4
}

/* ══════════════════════════════════════════════════════════ */
/* ── AccountFormSlideOver ─────────────────────────────────── */
/* ══════════════════════════════════════════════════════════ */
const AccountFormSlideOver = ({ mode, activeTab, account, onClose, onSave }) => {
  const isEdit = mode === 'edit';
  const isCustomer = activeTab === 'customers';

  const [closing, setClosing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState(null);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    gender: 'Nam',
    dateOfBirth: '',
    password: '',
    status: 1,
    roleName: 'STAFF',
  });

  const [errors, setErrors] = useState({});

  // populate form on open
  useEffect(() => {
    if (isEdit && account) {
      setForm({
        fullName: account.fullName || '',
        email: account.email || '',
        phone: account.phone || '',
        gender: account.gender || 'Nam',
        dateOfBirth: account.dateOfBirth || '',
        password: '',
        status: account.status ?? 1,
        roleName: account.roleName || 'STAFF',
      });
    } else {
      setForm({
        fullName: '',
        email: '',
        phone: '',
        gender: 'Nam',
        dateOfBirth: '',
        password: '',
        status: 1,
        roleName: 'STAFF',
      });
    }
    setErrors({});
    setApiError(null);
  }, [mode, account, isEdit]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(onClose, 250);
  };

  const handleChange = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim() || form.fullName.trim().length < 2) errs.fullName = 'Họ và tên phải có ít nhất 2 ký tự';
    if (!form.email.trim()) errs.email = 'Email là bắt buộc';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Email không hợp lệ';
    if (form.phone && !/^(0[1-9][0-9]{8})$/.test(form.phone)) errs.phone = 'Số điện thoại không hợp lệ';
    if (!isEdit && form.password && form.password.length < 8) errs.password = 'Mật khẩu phải có ít nhất 8 ký tự';
    if (!isCustomer && !form.roleName) errs.roleName = 'Vui lòng chọn vai trò';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSaving(true);
    setApiError(null);
    try {
      await onSave(form);
      // parent handles close & toast on success
    } catch (err) {
      setApiError(err?.message || 'Đã xảy ra lỗi, vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const pwStrength = getPasswordStrength(form.password);
  const strengthLabel = ['', 'Yếu', 'Trung bình', 'Mạnh', 'Rất mạnh'][pwStrength] || '';

  const title = isEdit
    ? `Chỉnh sửa: ${account?.fullName || ''}`
    : isCustomer
      ? 'Thêm khách hàng'
      : 'Thêm nhân viên';

  return (
    <>
      <div className="am-slideover-backdrop" onClick={handleClose} />
      <div className={`am-slideover ${closing ? 'closing' : ''}`} style={{ width: 520 }}>
        {/* Header */}
        <div className="am-slideover-header">
          <div>
            <h2 className="am-slideover-name" style={{ fontSize: 18 }}>{title}</h2>
          </div>
          <button className="am-slideover-close" onClick={handleClose}><X size={18} /></button>
        </div>

        {/* API error banner */}
        {apiError && (
          <div className="am-form-banner">
            <AlertTriangle size={16} /> {apiError}
          </div>
        )}

        {/* Form */}
        <form className="am-slideover-content" onSubmit={handleSubmit}>
          {/* Họ và tên */}
          <div className="am-form-group">
            <label className="am-form-label">Họ và tên <span className="required">*</span></label>
            <div className="am-form-input-wrap">
              <User size={16} />
              <input
                className={`am-form-input ${errors.fullName ? 'error' : ''}`}
                type="text"
                placeholder="Nhập họ và tên"
                value={form.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
              />
            </div>
            {errors.fullName && <div className="am-form-error">{errors.fullName}</div>}
          </div>

          {/* Email */}
          <div className="am-form-group">
            <label className="am-form-label">Email <span className="required">*</span></label>
            <div className="am-form-input-wrap">
              <Mail size={16} />
              <input
                className={`am-form-input ${errors.email ? 'error' : ''} ${isEdit ? 'readonly' : ''}`}
                type="email"
                placeholder="Nhập email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                readOnly={isEdit}
              />
            </div>
            {isEdit && <div className="am-form-helper">Email không thể thay đổi sau khi đăng ký</div>}
            {errors.email && <div className="am-form-error">{errors.email}</div>}
          </div>

          {/* Số điện thoại */}
          <div className="am-form-group">
            <label className="am-form-label">Số điện thoại</label>
            <div className="am-form-input-wrap">
              <Phone size={16} />
              <input
                className={`am-form-input ${errors.phone ? 'error' : ''}`}
                type="text"
                placeholder="Nhập số điện thoại"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </div>
            {errors.phone && <div className="am-form-error">{errors.phone}</div>}
          </div>

          {/* Customer-only fields */}
          {isCustomer && (
            <>
              {/* Giới tính */}
              <div className="am-form-group">
                <label className="am-form-label">Giới tính</label>
                <div className="am-gender-group">
                  {['Nam', 'Nữ', 'Khác'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      className={`am-gender-btn ${form.gender === g ? 'active' : ''}`}
                      onClick={() => handleChange('gender', g)}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ngày sinh */}
              <div className="am-form-group">
                <label className="am-form-label">Ngày sinh</label>
                <input
                  className="am-form-input no-icon"
                  type="date"
                  value={form.dateOfBirth}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                />
              </div>
            </>
          )}

          {/* Employee-only: Role */}
          {!isCustomer && (
            <div className="am-form-group">
              <label className="am-form-label">Vai trò <span className="required">*</span></label>
              <div className="am-role-cards">
                {[
                  { key: 'STAFF', icon: '👤', label: 'Nhân viên', desc: 'Xem và xử lý đơn hàng' },
                  { key: 'MANAGER', icon: '🔧', label: 'Quản lý', desc: 'Quản lý sản phẩm, đơn hàng' },
                  { key: 'ADMIN', icon: '👑', label: 'Quản trị viên', desc: 'Toàn quyền hệ thống' },
                ].map((r) => (
                  <div
                    key={r.key}
                    className={`am-role-card ${form.roleName === r.key ? 'active' : ''}`}
                    onClick={() => handleChange('roleName', r.key)}
                  >
                    <div className="am-role-card-icon">{r.icon}</div>
                    <div className="am-role-card-name">{r.label}</div>
                    <div className="am-role-card-desc">{r.desc}</div>
                  </div>
                ))}
              </div>
              {errors.roleName && <div className="am-form-error">{errors.roleName}</div>}
            </div>
          )}

          {/* Password (add mode only) */}
          {!isEdit && (
            <div className="am-form-group">
              <label className="am-form-label">Mật khẩu</label>
              <div className="am-form-input-wrap">
                <Lock size={16} />
                <input
                  className={`am-form-input ${errors.password ? 'error' : ''}`}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu"
                  value={form.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0,
                    pointerEvents: 'auto',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.password && (
                <div className="am-pw-strength">
                  {[1, 2, 3, 4].map((lvl) => (
                    <div
                      key={lvl}
                      className={`am-pw-bar ${pwStrength >= lvl ? (pwStrength <= 1 ? 'weak' : pwStrength <= 2 ? 'medium' : 'strong') : ''}`}
                    />
                  ))}
                </div>
              )}
              {form.password && <div className="am-form-helper">{strengthLabel}</div>}
              {!form.password && (
                <div className="am-form-helper">Để trống để gửi email đặt mật khẩu cho {isCustomer ? 'khách hàng' : 'nhân viên'}</div>
              )}
              {errors.password && <div className="am-form-error">{errors.password}</div>}
            </div>
          )}

          {/* Trạng thái */}
          <div className="am-form-group">
            <label className="am-form-label">Trạng thái</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                type="button"
                className={`am-toggle ${form.status === 1 ? 'on' : 'off'}`}
                onClick={() => handleChange('status', form.status === 1 ? 0 : 1)}
              />
              <span style={{ fontSize: 14, color: form.status === 1 ? '#16a34a' : '#ef4444', fontWeight: 500 }}>
                {form.status === 1 ? 'Hoạt động' : 'Bị khóa'}
              </span>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="am-slideover-footer">
          <div />
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="am-btn am-btn-outline" onClick={handleClose}>Hủy</button>
            <button
              className="am-btn am-btn-primary"
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="am-spinner" />
                  Đang lưu...
                </>
              ) : (
                'Lưu'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AccountFormSlideOver;
