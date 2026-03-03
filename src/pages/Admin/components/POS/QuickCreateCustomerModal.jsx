import React, { useState } from 'react';
import { posAPI } from '../../../../services/api';

/**
 * QuickCreateCustomerModal — modal form to quickly create a new customer from POS.
 * Fields: fullName (required), phone (required), email (optional), gender (optional).
 */
const QuickCreateCustomerModal = ({ onClose, onCreated, initialName = '', initialPhone = '' }) => {
    const [fullName, setFullName] = useState(initialName);
    const [phone, setPhone] = useState(initialPhone);
    const [email, setEmail] = useState('');
    const [gender, setGender] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // ── Validation ──────────────────────────────────────────────
    const phoneRegex = /^0\d{9}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const validate = () => {
        if (!fullName.trim()) return 'Họ tên không được để trống';
        if (!phone.trim()) return 'Số điện thoại không được để trống';
        if (!phoneRegex.test(phone.trim())) return 'Số điện thoại phải có 10 chữ số và bắt đầu bằng 0';
        if (email.trim() && !emailRegex.test(email.trim())) return 'Email không hợp lệ';
        return null;
    };

    // ── Submit ──────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        setError('');

        try {
            const payload = {
                fullName: fullName.trim(),
                phone: phone.trim(),
            };
            if (email.trim()) payload.email = email.trim();
            if (gender) payload.gender = gender;

            const res = await posAPI.quickCreateCustomer(payload);
            const customer = res.data; // POSCustomerResponse
            onCreated(customer);
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Tạo khách hàng thất bại';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    // ── Backdrop click to close ─────────────────────────────────
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div className="pos-modal-overlay" onClick={handleBackdropClick}>
            <div className="pos-quick-create-modal">
                {/* Header */}
                <div className="pos-qc-header">
                    <h3>Tạo khách hàng mới</h3>
                    <button className="pos-qc-close" onClick={onClose} aria-label="Đóng">×</button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="pos-qc-form">
                    {error && <div className="pos-qc-error">{error}</div>}

                    <div className="pos-qc-field">
                        <label>Họ tên <span className="required">*</span></label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={e => setFullName(e.target.value)}
                            placeholder="Nguyễn Văn A"
                            autoFocus
                            maxLength={255}
                        />
                    </div>

                    <div className="pos-qc-field">
                        <label>Số điện thoại <span className="required">*</span></label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                            placeholder="0912345678"
                            maxLength={10}
                        />
                    </div>

                    <div className="pos-qc-field">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="email@example.com"
                            maxLength={100}
                        />
                    </div>

                    <div className="pos-qc-field">
                        <label>Giới tính</label>
                        <div className="pos-qc-gender-group">
                            {[{ value: '', label: 'Không chọn' }, { value: 'Male', label: 'Nam' }, { value: 'Female', label: 'Nữ' }, { value: 'Other', label: 'Khác' }].map(opt => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    className={`pos-qc-gender-btn${gender === opt.value ? ' active' : ''}`}
                                    onClick={() => setGender(opt.value)}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pos-qc-actions">
                        <button type="button" className="pos-qc-cancel" onClick={onClose} disabled={loading}>
                            Hủy
                        </button>
                        <button type="submit" className="pos-qc-submit" disabled={loading}>
                            {loading ? <span className="pos-checkout-spinner" /> : 'Tạo khách hàng'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default QuickCreateCustomerModal;
