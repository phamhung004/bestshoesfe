import React, { useState, useEffect } from 'react';
import { X, Check, Zap, Snowflake, Tag, Star } from 'lucide-react';
import { promotionAPI } from '../../../../services/api';
import {
    getInitialPromotionFormData,
    validatePromotionForm,
    buildPromotionPayload,
} from './promotionFormUtils';

const PromotionForm = ({ promotion, onSave, onCancel, onConflict, onManageVariants, isEditing = false }) => {
    const [formData, setFormData] = useState(getInitialPromotionFormData());
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [conflicts, setConflicts] = useState([]);

    useEffect(() => {
        setFormData(getInitialPromotionFormData(promotion));
        setErrors({});
        setConflicts([]);
    }, [promotion]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;
        setFormData((prev) => ({ ...prev, [name]: newValue }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    };

    const validateForm = () => {
        const newErrors = validatePromotionForm(formData);
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true);
        try {
            setConflicts([]);
            const promotionData = buildPromotionPayload(formData);
            let result;
            if (isEditing && promotion) {
                result = await promotionAPI.update(promotion.promotionId, promotionData);
            } else {
                result = await promotionAPI.create(promotionData);
            }
            onSave(result);
        } catch (error) {
            console.error('Error saving promotion:', error);
            const data = error.response?.data;
            if (error.response?.status === 409 && data?.errorCode === 'PROMOTION_VARIANT_CONFLICT') {
                setConflicts(data.conflicts || []);
                onConflict?.(data.conflicts || []);
                return;
            }
            if (error.response?.data?.error) alert(error.response.data.error);
            else alert('Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const getTypeDescription = (type) => {
        switch (type) {
            case 'flash_sale': return 'Giảm giá trong thời gian ngắn, thường từ vài giờ đến 1 ngày';
            case 'seasonal': return 'Giảm giá theo mùa như mùa hè, mùa đông, lễ hội...';
            case 'clearance': return 'Giảm giá để thanh lý hàng tồn kho';
            case 'special': return 'Giảm giá đặc biệt cho dịp đặc biệt';
            default: return '';
        }
    };

    return (
        <div className="pm-form-overlay" onClick={onCancel}>
            <div className="pm-form-container" onClick={(e) => e.stopPropagation()}>
                {/* header */}
                <div className="pm-form-header">
                    <span className="pm-form-title">
                        {isEditing ? 'Chỉnh sửa đợt giảm giá' : 'Thêm đợt giảm giá mới'}
                    </span>
                    <button className="pm-form-close" onClick={onCancel} aria-label="Đóng">
                        <X size={18} />
                    </button>
                </div>

                {/* body */}
                <form onSubmit={handleSubmit}>
                    <div className="pm-form-body">
                        {conflicts.length > 0 && (
                            <div className="pm-conflict-banner">
                                <strong>Không thể lưu khuyến mãi.</strong> {conflicts.length} biến thể đang thuộc chương trình khác trong cùng thời gian.
                                {isEditing && onManageVariants && (
                                    <button type="button" className="pm-link-button" onClick={onManageVariants}>
                                        Quản lý sản phẩm
                                    </button>
                                )}
                            </div>
                        )}
                        <div className="pm-form-grid">
                            {/* name */}
                            <div className="pm-form-group full-width">
                                <label className="pm-form-label" htmlFor="pm-name">
                                    Tên đợt giảm giá <span className="required">*</span>
                                </label>
                                <input
                                    id="pm-name"
                                    className={`pm-form-input ${errors.name ? 'error' : ''}`}
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Ví dụ: Giảm giá mùa hè 2024"
                                    maxLength="255"
                                />
                                {errors.name && <span className="pm-form-error">{errors.name}</span>}
                            </div>

                            {/* description */}
                            <div className="pm-form-group full-width">
                                <label className="pm-form-label" htmlFor="pm-desc">Mô tả</label>
                                <textarea
                                    id="pm-desc"
                                    className="pm-form-textarea"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Mô tả chi tiết về đợt giảm giá..."
                                    rows="3"
                                />
                            </div>

                            {/* type */}
                            <div className="pm-form-group">
                                <label className="pm-form-label" htmlFor="pm-type">Loại đợt giảm giá</label>
                                <select
                                    id="pm-type"
                                    className="pm-form-select"
                                    name="type"
                                    value={formData.type}
                                    onChange={handleInputChange}
                                >
                                    <option value="flash_sale">Flash Sale</option>
                                    <option value="seasonal">Theo mùa</option>
                                    <option value="clearance">Thanh lý</option>
                                    <option value="special">Đặc biệt</option>
                                </select>
                                <span className="pm-form-hint">{getTypeDescription(formData.type)}</span>
                            </div>

                            {/* discount percentage */}
                            <div className="pm-form-group">
                                <label className="pm-form-label" htmlFor="pm-pct">
                                    Phần trăm giảm (%) <span className="required">*</span>
                                </label>
                                <input
                                    id="pm-pct"
                                    className={`pm-form-input ${errors.discountPercentage ? 'error' : ''}`}
                                    type="number"
                                    name="discountPercentage"
                                    value={formData.discountPercentage}
                                    onChange={handleInputChange}
                                    placeholder="Ví dụ: 20"
                                    min="0" max="100" step="0.01"
                                />
                                {errors.discountPercentage && <span className="pm-form-error">{errors.discountPercentage}</span>}
                                <span className="pm-form-hint">Đợt giảm giá chỉ áp dụng giảm theo phần trăm</span>
                            </div>

                            {/* start date */}
                            <div className="pm-form-group">
                                <label className="pm-form-label" htmlFor="pm-start">
                                    Ngày bắt đầu <span className="required">*</span>
                                </label>
                                <input
                                    id="pm-start"
                                    className={`pm-form-input ${errors.startDate ? 'error' : ''}`}
                                    type="datetime-local"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleInputChange}
                                />
                                {errors.startDate && <span className="pm-form-error">{errors.startDate}</span>}
                            </div>

                            {/* end date */}
                            <div className="pm-form-group">
                                <label className="pm-form-label" htmlFor="pm-end">
                                    Ngày kết thúc <span className="required">*</span>
                                </label>
                                <input
                                    id="pm-end"
                                    className={`pm-form-input ${errors.endDate ? 'error' : ''}`}
                                    type="datetime-local"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleInputChange}
                                />
                                {errors.endDate && <span className="pm-form-error">{errors.endDate}</span>}
                            </div>

                            {/* isActive checkbox */}
                            <div className="pm-form-group full-width">
                                <label className="pm-form-checkbox">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={handleInputChange}
                                    />
                                    <span>Kích hoạt đợt giảm giá</span>
                                </label>
                            </div>
                        </div>

                        {/* form actions */}
                        <div className="pm-form-actions">
                            <button type="button" className="pm-btn pm-btn-outline" onClick={onCancel}>
                                <X size={14} /> Hủy
                            </button>
                            <button type="submit" className="pm-btn pm-btn-primary" disabled={loading}>
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

export default PromotionForm;
