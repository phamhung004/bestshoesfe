export const DISCOUNT_MODES = {
    PERCENTAGE: 'percentage',
    AMOUNT: 'amount',
};

export const getInitialPromotionFormData = (promotion = null) => {
    const discountPercentage = promotion?.discountPercentage ?? '';
    const discountAmount = promotion?.discountAmount ?? '';
    const hasAmountOnly = discountAmount !== '' && discountAmount != null
        && (discountPercentage === '' || discountPercentage == null);

    return {
        name: promotion?.name || '',
        description: promotion?.description || '',
        type: promotion?.type || 'seasonal',
        discountMode: hasAmountOnly ? DISCOUNT_MODES.AMOUNT : DISCOUNT_MODES.PERCENTAGE,
        discountPercentage,
        discountAmount,
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

    if (formData.discountMode === DISCOUNT_MODES.PERCENTAGE) {
        const percentage = toNumber(formData.discountPercentage);
        if (percentage == null) {
            newErrors.discountPercentage = 'Vui lòng nhập phần trăm giảm giá';
        } else if (percentage <= 0) {
            newErrors.discountPercentage = 'Phần trăm giảm giá phải lớn hơn 0';
        } else if (percentage > 100) {
            newErrors.discountPercentage = 'Phần trăm giảm giá không được vượt quá 100%';
        }
    }

    if (formData.discountMode === DISCOUNT_MODES.AMOUNT) {
        const amount = toNumber(formData.discountAmount);
        if (amount == null) {
            newErrors.discountAmount = 'Vui lòng nhập số tiền giảm';
        } else if (amount <= 0) {
            newErrors.discountAmount = 'Số tiền giảm phải lớn hơn 0';
        }
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
    discountPercentage: formData.discountMode === DISCOUNT_MODES.PERCENTAGE
        ? parseFloat(formData.discountPercentage)
        : null,
    discountAmount: formData.discountMode === DISCOUNT_MODES.AMOUNT
        ? parseFloat(formData.discountAmount)
        : null,
    startDate: formData.startDate,
    endDate: formData.endDate,
});
