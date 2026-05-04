export const getInitialPromotionFormData = (promotion = null) => {
    const discountPercentage = promotion?.discountPercentage ?? '';

    return {
        name: promotion?.name || '',
        description: promotion?.description || '',
        type: promotion?.type || 'seasonal',
        discountPercentage,
        discountAmount: '',
        startDate: promotion?.startDate ? promotion.startDate.slice(0, 16) : '',
        endDate: promotion?.endDate ? promotion.endDate.slice(0, 16) : '',
        isActive: promotion?.isActive !== undefined ? promotion.isActive : true,
    };
};

const toNumber = (value) => (value === '' || value == null ? null : Number(value));

export const validatePromotionForm = (formData) => {
    const newErrors = {};

    if (!formData.name.trim()) {
        newErrors.name = 'Tên đợt giảm giá là bắt buộc';
    }

    const percentage = toNumber(formData.discountPercentage);
    if (percentage == null) {
        newErrors.discountPercentage = 'Vui lòng nhập phần trăm giảm giá';
    } else if (percentage <= 0) {
        newErrors.discountPercentage = 'Phần trăm giảm giá phải lớn hơn 0';
    } else if (percentage > 100) {
        newErrors.discountPercentage = 'Phần trăm giảm giá không được vượt quá 100%';
    }

    if (!formData.startDate) newErrors.startDate = 'Ngày bắt đầu là bắt buộc';
    if (!formData.endDate) newErrors.endDate = 'Ngày kết thúc là bắt buộc';

    if (formData.startDate && formData.endDate) {
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        if (start >= end) newErrors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
    }

    return newErrors;
};

export const buildPromotionPayload = (formData) => ({
    ...formData,
    name: formData.name.trim(),
    description: formData.description.trim(),
    discountPercentage: parseFloat(formData.discountPercentage),
    discountAmount: null,
    startDate: formData.startDate,
    endDate: formData.endDate,
});
