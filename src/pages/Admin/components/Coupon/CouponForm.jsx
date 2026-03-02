import React, { useState, useEffect } from 'react';
import { X, Check, Copy, Ticket } from 'lucide-react';
import { couponAPI } from '../../../../services/api';

const CouponForm = ({ coupon, onSave, onCancel, isEditing = false }) => {
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        description: '',
        type: 'Percentage',
        value: '',
        minimumAmount: '',
        maximumDiscount: '',
        usageLimit: '',
        startDate: '',
        endDate: '',
        status: true,
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (coupon) {
            setFormData({
                code: coupon.code || '',
                name: coupon.name || '',
                description: coupon.description || '',
                type: coupon.type || 'Percentage',
                value: coupon.value || '',
                minimumAmount: coupon.minimumAmount || '',
                maximumDiscount: coupon.maximumDiscount || '',
                usageLimit: coupon.usageLimit || '',
                startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().slice(0, 16) : '',
                endDate: coupon.endDate ? new Date(coupon.endDate).toISOString().slice(0, 16) : '',
                status: coupon.status !== undefined ? coupon.status : true,
            });
        } else {
            setFormData({
                code: '', name: '', description: '', type: 'Percentage',
                value: '', minimumAmount: '', maximumDiscount: '',
                usageLimit: '', startDate: '', endDate: '', status: true,
            });
        }
        setErrors({});
    }, [coupon]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;
        setFormData((prev) => ({ ...prev, [name]: newValue }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));

        // Auto-generate code from name if not editing
        if (name === 'name' && !isEditing && !formData.code) {
            const generatedCode = value
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, '')
                .substring(0, 10);
            setFormData((prev) => ({ ...prev, code: generatedCode }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.code.trim()) {
            newErrors.code = 'Mã giảm giá là bắt buộc';
        } else if (!/^[A-Z0-9]+$/.test(formData.code)) {
            newErrors.code = 'Mã giảm giá chỉ được chứa chữ cái in hoa và số';
        } else if (formData.code.length < 3 || formData.code.length > 50) {
            newErrors.code = 'Mã giảm giá phải có độ dài từ 3 đến 50 ký tự';
        }

        if (!formData.name.trim()) {
            newErrors.name = 'Tên mã giảm giá là bắt buộc';
        } else if (formData.name.length > 255) {
            newErrors.name = 'Tên mã giảm giá không được vượt quá 255 ký tự';
        }

        if (formData.description && formData.description.length > 1000) {
            newErrors.description = 'Mô tả không được vượt quá 1000 ký tự';
        }

        if (!formData.value || formData.value <= 0) {
            newErrors.value = 'Giá trị giảm giá phải lớn hơn 0';
        } else if (formData.type === 'Percentage' && formData.value > 100) {
            newErrors.value = 'Phần trăm giảm giá không được vượt quá 100%';
        } else if (formData.type === 'Fixed Amount' && formData.value > 10000000) {
            newErrors.value = 'Số tiền giảm giá tối đa là 10,000,000 VND';
        }

        if (formData.minimumAmount && formData.minimumAmount < 0) {
            newErrors.minimumAmount = 'Đơn hàng tối thiểu không được âm';
        }

        if (formData.maximumDiscount && formData.maximumDiscount < 0) {
            newErrors.maximumDiscount = 'Giảm giá tối đa không được âm';
        }

        if (formData.usageLimit && formData.usageLimit < 0) {
            newErrors.usageLimit = 'Số lần sử dụng không được âm';
        }

        if (!formData.startDate) newErrors.startDate = 'Ngày bắt đầu là bắt buộc';
        if (!formData.endDate) newErrors.endDate = 'Ngày kết thúc là bắt buộc';

        if (formData.startDate && formData.endDate) {
            const start = new Date(formData.startDate);
            const end = new Date(formData.endDate);
            if (start >= end) newErrors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
            const createdBy = user.userId || user.id || 1;

            const couponData = {
                code: formData.code.trim().toUpperCase(),
                name: formData.name.trim(),
                description: formData.description.trim(),
                type: formData.type,
                value: parseFloat(formData.value),
                minimumAmount: formData.minimumAmount ? parseFloat(formData.minimumAmount) : null,
                maximumDiscount: formData.maximumDiscount ? parseFloat(formData.maximumDiscount) : null,
                usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
                startDate: new Date(formData.startDate).toISOString(),
                endDate: new Date(formData.endDate).toISOString(),
                status: formData.status,
                createdBy: createdBy,
            };

            let result;
            if (isEditing && coupon) {
                result = await couponAPI.update(coupon.couponId, couponData);
            } else {
                result = await couponAPI.create(couponData);
            }
            onSave(result);
        } catch (error) {
            console.error('Error saving coupon:', error);
            let errorMessage = 'Có lỗi xảy ra. Vui lòng thử lại.';
            if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error.message) {
                errorMessage = error.message;
            }

            if (errorMessage.includes('đã tồn tại')) {
                setErrors({ code: 'Mã giảm giá đã tồn tại. Vui lòng chọn mã khác.' });
            } else if (errorMessage.includes('quá khứ')) {
                setErrors({ startDate: 'Ngày bắt đầu không được là ngày trong quá khứ' });
            } else if (errorMessage.includes('phải lớn hơn 0')) {
                setErrors({ value: 'Giá trị giảm giá phải lớn hơn 0' });
            }
        } finally {
            setLoading(false);
        }
    };

    const getValueHint = () => {
        return formData.type === 'Percentage'
            ? 'Nhập phần trăm giảm (1-100%)'
            : 'Nhập số tiền giảm (VND)';
    };

    return (
        <div className="cm-form-overlay" onClick={onCancel}>
            <div className="cm-form-container" onClick={(e) => e.stopPropagation()}>
                {/* header */}
                <div className="cm-form-header">
                    <span className="cm-form-title">
                        {isEditing ? 'Chỉnh sửa mã giảm giá' : 'Thêm mã giảm giá mới'}
                    </span>
                    <button className="cm-form-close" onClick={onCancel} aria-label="Đóng">
                        <X size={18} />
                    </button>
                </div>

                {/* body */}
                <form onSubmit={handleSubmit}>
                    <div className="cm-form-body">
                        {/* Preview card */}
                        <div className="cm-form-preview">
                            <div className="cm-preview-card">
                                <div className="cm-preview-icon">
                                    <Ticket size={24} />
                                </div>
                                <div className="cm-preview-info">
                                    <span className="cm-preview-code">
                                        {formData.code || 'MAGIAMGIA'}
                                    </span>
                                    <span className="cm-preview-name">
                                        {formData.name || 'Tên mã giảm giá'}
                                    </span>
                                </div>
                                <div className="cm-preview-value">
                                    {formData.value
                                        ? (formData.type === 'Percentage'
                                            ? `${formData.value}%`
                                            : `${Number(formData.value).toLocaleString('vi-VN')}₫`)
                                        : '—'
                                    }
                                </div>
                            </div>
                        </div>

                        <div className="cm-form-grid">
                            {/* code */}
                            <div className="cm-form-group">
                                <label className="cm-form-label" htmlFor="cm-code">
                                    Mã giảm giá <span className="required">*</span>
                                </label>
                                <input
                                    id="cm-code"
                                    className={`cm-form-input ${errors.code ? 'error' : ''}`}
                                    type="text"
                                    name="code"
                                    value={formData.code}
                                    onChange={handleInputChange}
                                    placeholder="SUMMER2024"
                                    maxLength="50"
                                    disabled={isEditing}
                                    style={{ textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: 600 }}
                                />
                                {errors.code && <span className="cm-form-error">{errors.code}</span>}
                                <span className="cm-form-hint">Chỉ chứa chữ in hoa và số. Khách hàng sẽ nhập mã này.</span>
                            </div>

                            {/* name */}
                            <div className="cm-form-group">
                                <label className="cm-form-label" htmlFor="cm-name">
                                    Tên mã giảm giá <span className="required">*</span>
                                </label>
                                <input
                                    id="cm-name"
                                    className={`cm-form-input ${errors.name ? 'error' : ''}`}
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Giảm giá mùa hè"
                                    maxLength="255"
                                />
                                {errors.name && <span className="cm-form-error">{errors.name}</span>}
                            </div>

                            {/* description */}
                            <div className="cm-form-group full-width">
                                <label className="cm-form-label" htmlFor="cm-desc">Mô tả</label>
                                <textarea
                                    id="cm-desc"
                                    className="cm-form-textarea"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Mô tả chi tiết về mã giảm giá..."
                                    rows="3"
                                />
                            </div>

                            {/* type */}
                            <div className="cm-form-group">
                                <label className="cm-form-label" htmlFor="cm-type">
                                    Loại giảm giá <span className="required">*</span>
                                </label>
                                <select
                                    id="cm-type"
                                    className="cm-form-select"
                                    name="type"
                                    value={formData.type}
                                    onChange={handleInputChange}
                                >
                                    <option value="Percentage">Phần trăm (%)</option>
                                    <option value="Fixed Amount">Số tiền cố định (VND)</option>
                                </select>
                            </div>

                            {/* value */}
                            <div className="cm-form-group">
                                <label className="cm-form-label" htmlFor="cm-value">
                                    {formData.type === 'Percentage' ? 'Phần trăm giảm (%)' : 'Số tiền giảm (VND)'}
                                    <span className="required">*</span>
                                </label>
                                <input
                                    id="cm-value"
                                    className={`cm-form-input ${errors.value ? 'error' : ''}`}
                                    type="number"
                                    name="value"
                                    value={formData.value}
                                    onChange={handleInputChange}
                                    placeholder={formData.type === 'Percentage' ? '10' : '50000'}
                                    min="0"
                                    step={formData.type === 'Percentage' ? '1' : '1000'}
                                />
                                {errors.value && <span className="cm-form-error">{errors.value}</span>}
                                <span className="cm-form-hint">{getValueHint()}</span>
                            </div>

                            {/* minimum amount */}
                            <div className="cm-form-group">
                                <label className="cm-form-label" htmlFor="cm-min">
                                    Đơn hàng tối thiểu (VND)
                                </label>
                                <input
                                    id="cm-min"
                                    className={`cm-form-input ${errors.minimumAmount ? 'error' : ''}`}
                                    type="number"
                                    name="minimumAmount"
                                    value={formData.minimumAmount}
                                    onChange={handleInputChange}
                                    placeholder="500000"
                                    min="0"
                                    step="1000"
                                />
                                {errors.minimumAmount && <span className="cm-form-error">{errors.minimumAmount}</span>}
                                <span className="cm-form-hint">Để trống nếu không giới hạn</span>
                            </div>

                            {/* maximum discount */}
                            <div className="cm-form-group">
                                <label className="cm-form-label" htmlFor="cm-max">
                                    Giảm tối đa (VND)
                                </label>
                                <input
                                    id="cm-max"
                                    className={`cm-form-input ${errors.maximumDiscount ? 'error' : ''}`}
                                    type="number"
                                    name="maximumDiscount"
                                    value={formData.maximumDiscount}
                                    onChange={handleInputChange}
                                    placeholder="100000"
                                    min="0"
                                    step="1000"
                                />
                                {errors.maximumDiscount && <span className="cm-form-error">{errors.maximumDiscount}</span>}
                                <span className="cm-form-hint">Áp dụng cho giảm phần trăm. Để trống nếu không giới hạn</span>
                            </div>

                            {/* usage limit */}
                            <div className="cm-form-group">
                                <label className="cm-form-label" htmlFor="cm-usage">
                                    Số lần sử dụng tối đa
                                </label>
                                <input
                                    id="cm-usage"
                                    className={`cm-form-input ${errors.usageLimit ? 'error' : ''}`}
                                    type="number"
                                    name="usageLimit"
                                    value={formData.usageLimit}
                                    onChange={handleInputChange}
                                    placeholder="100"
                                    min="0"
                                />
                                {errors.usageLimit && <span className="cm-form-error">{errors.usageLimit}</span>}
                                <span className="cm-form-hint">Để trống nếu không giới hạn số lần sử dụng</span>
                            </div>

                            {/* start date */}
                            <div className="cm-form-group">
                                <label className="cm-form-label" htmlFor="cm-start">
                                    Ngày bắt đầu <span className="required">*</span>
                                </label>
                                <input
                                    id="cm-start"
                                    className={`cm-form-input ${errors.startDate ? 'error' : ''}`}
                                    type="datetime-local"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleInputChange}
                                />
                                {errors.startDate && <span className="cm-form-error">{errors.startDate}</span>}
                            </div>

                            {/* end date */}
                            <div className="cm-form-group">
                                <label className="cm-form-label" htmlFor="cm-end">
                                    Ngày kết thúc <span className="required">*</span>
                                </label>
                                <input
                                    id="cm-end"
                                    className={`cm-form-input ${errors.endDate ? 'error' : ''}`}
                                    type="datetime-local"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleInputChange}
                                />
                                {errors.endDate && <span className="cm-form-error">{errors.endDate}</span>}
                            </div>

                            {/* isActive checkbox */}
                            <div className="cm-form-group full-width">
                                <label className="cm-form-checkbox">
                                    <input
                                        type="checkbox"
                                        name="status"
                                        checked={formData.status}
                                        onChange={handleInputChange}
                                    />
                                    <span>Kích hoạt mã giảm giá</span>
                                </label>
                            </div>
                        </div>

                        {/* form actions */}
                        <div className="cm-form-actions">
                            <button type="button" className="cm-btn cm-btn-outline" onClick={onCancel}>
                                <X size={14} /> Hủy
                            </button>
                            <button type="submit" className="cm-btn cm-btn-primary" disabled={loading}>
                                <Check size={14} />
                                {loading ? 'Đang lưu...' : isEditing ? 'Cập nhật' : 'Thêm mới'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CouponForm;
