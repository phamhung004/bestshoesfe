import React, { useState } from 'react';
import { Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
import PasswordStrengthMeter, { RULES } from '../components/PasswordStrengthMeter';
import { changePassword } from '../../../api/accountApi';

const PasswordTab = () => {
    const [current, setCurrent] = useState('');
    const [newPw, setNewPw] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [newFocused, setNewFocused] = useState(false);
    const [saving, setSaving] = useState(false);
    const [banner, setBanner] = useState(null); // null | {type, msg}
    const [tipsOpen, setTipsOpen] = useState(false);

    const score = RULES.filter(r => r.test(newPw)).length;
    const passwordsMatch = newPw && confirm && newPw === confirm;
    const mismatch = confirm && newPw !== confirm;
    const canSubmit = current && newPw && confirm && passwordsMatch && score >= 2;

    const handleSubmit = async () => {
        if (!canSubmit) return;
        setSaving(true);
        setBanner(null);
        try {
            await changePassword({
                currentPassword: current,
                newPassword: newPw,
                confirmPassword: confirm,
            });
            setBanner({ type: 'success', msg: '✓ Mật khẩu đã được cập nhật thành công! Bạn sẽ được yêu cầu đăng nhập lại tại các thiết bị khác.' });
            setCurrent(''); setNewPw(''); setConfirm('');
        } catch (err) {
            const msg = err.response?.data?.message || 'Cập nhật mật khẩu thất bại';
            setBanner({ type: 'error', msg: `✗ ${msg}` });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="acc-tab-content">
            <div className="acc-password-card">
                <div className="acc-tab-header">
                    <div>
                        <h2 className="acc-tab-title">Đổi mật khẩu</h2>
                        <p className="acc-tab-sub">Mật khẩu mạnh giúp bảo vệ tài khoản của bạn</p>
                    </div>
                </div>

                {/* Security Alert */}
                <div className="acc-security-alert">
                    ⚠ Bạn chưa đổi mật khẩu trong 90 ngày. Hãy cập nhật để bảo vệ tài khoản.
                </div>

                {/* Banner */}
                {banner && (
                    <div className={`acc-pw-banner${banner.type === 'success' ? ' success' : ' error'}`}>
                        {banner.msg}
                    </div>
                )}

                {/* Current Password */}
                <div className="acc-form-group">
                    <label className="acc-form-label">Mật khẩu hiện tại <span className="acc-required">*</span></label>
                    <div className="acc-pw-input-wrap">
                        <input
                            type={showCurrent ? 'text' : 'password'}
                            className="acc-form-input"
                            value={current}
                            onChange={e => setCurrent(e.target.value)}
                            placeholder="Nhập mật khẩu hiện tại"
                        />
                        <button className="acc-pw-toggle" type="button" onClick={() => setShowCurrent(v => !v)}>
                            {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    <a href="#" className="acc-forgot-link">Quên mật khẩu?</a>
                </div>

                {/* New Password */}
                <div className="acc-form-group">
                    <label className="acc-form-label">Mật khẩu mới <span className="acc-required">*</span></label>
                    <div className="acc-pw-input-wrap">
                        <input
                            type={showNew ? 'text' : 'password'}
                            className="acc-form-input"
                            value={newPw}
                            onChange={e => setNewPw(e.target.value)}
                            onFocus={() => setNewFocused(true)}
                            placeholder="Ít nhất 8 ký tự"
                        />
                        <button className="acc-pw-toggle" type="button" onClick={() => setShowNew(v => !v)}>
                            {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    <PasswordStrengthMeter password={newPw} visible={newFocused || !!newPw} />
                </div>

                {/* Confirm Password */}
                <div className="acc-form-group">
                    <label className="acc-form-label">Xác nhận mật khẩu mới <span className="acc-required">*</span></label>
                    <div className="acc-pw-input-wrap">
                        <input
                            type={showConfirm ? 'text' : 'password'}
                            className={`acc-form-input${mismatch ? ' error' : passwordsMatch ? ' valid' : ''}`}
                            value={confirm}
                            onChange={e => setConfirm(e.target.value)}
                            placeholder="Nhập lại mật khẩu mới"
                        />
                        <button className="acc-pw-toggle" type="button" onClick={() => setShowConfirm(v => !v)}>
                            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        {confirm && (
                            <span className={`acc-match-indicator${passwordsMatch ? ' match' : ' mismatch'}`}>
                                {passwordsMatch ? '✓' : '✗'}
                            </span>
                        )}
                    </div>
                    {confirm && (
                        <p className={`acc-match-text${passwordsMatch ? ' match' : ' mismatch'}`}>
                            {passwordsMatch ? 'Mật khẩu khớp' : 'Mật khẩu không khớp'}
                        </p>
                    )}
                </div>

                {/* Submit */}
                <button
                    className={`acc-btn-primary acc-btn-fullwidth${!canSubmit ? ' disabled' : ''}`}
                    onClick={handleSubmit}
                    disabled={!canSubmit || saving}
                >
                    {saving ? <><span className="acc-spinner" /> Đang cập nhật...</> : 'Cập nhật mật khẩu'}
                </button>

                {/* Security Tips */}
                <div className="acc-tips-accordion">
                    <button className="acc-tips-toggle" onClick={() => setTipsOpen(v => !v)}>
                        💡 Mẹo tạo mật khẩu mạnh
                        {tipsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {tipsOpen && (
                        <ul className="acc-tips-list">
                            <li>Dùng ít nhất 12 ký tự cho bảo mật tối đa</li>
                            <li>Kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt</li>
                            <li>Tránh dùng tên, ngày sinh hoặc thông tin cá nhân</li>
                            <li>Không dùng cùng mật khẩu cho nhiều tài khoản</li>
                            <li>Cân nhắc dùng trình quản lý mật khẩu (password manager)</li>
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PasswordTab;
