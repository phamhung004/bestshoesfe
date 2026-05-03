export const FIXED_PER_CUSTOMER_LIMIT = 1;

export const normalizeCouponCode = (value = '') => value.trim().toUpperCase();

const toNumber = (value) => (value === '' || value == null ? null : Number(value));

export const validateCouponForm = (formData) => {
    const newErrors = {};
    const normalizedCode = normalizeCouponCode(formData.code);

    if (!normalizedCode) {
        newErrors.code = 'Mã giảm giá là bắt buộc';
    } else if (!/^[A-Z0-9]+$/.test(normalizedCode)) {
        newErrors.code = 'Mã giảm giá chỉ được chứa chữ cái in hoa và số';
    } else if (normalizedCode.length < 3 || normalizedCode.length > 50) {
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

    const value = toNumber(formData.value);
    if (!value || value <= 0) {
        newErrors.value = 'Giá trị giảm giá phải lớn hơn 0';
    } else if (formData.type === 'Percentage' && value > 100) {
        newErrors.value = 'Phần trăm giảm giá không được vượt quá 100%';
    } else if (formData.type === 'Fixed Amount' && value > 10000000) {
        newErrors.value = 'Số tiền giảm giá tối đa là 10,000,000 VND';
    }

    const minimumAmount = toNumber(formData.minimumAmount);
    if (minimumAmount != null && minimumAmount < 0) {
        newErrors.minimumAmount = 'Đơn hàng tối thiểu không được âm';
    }

    const maximumDiscount = toNumber(formData.maximumDiscount);
    if (maximumDiscount != null && maximumDiscount < 0) {
        newErrors.maximumDiscount = 'Giảm giá tối đa không được âm';
    }

    const usageLimit = toNumber(formData.usageLimit);
    if (usageLimit != null && usageLimit < 0) {
        newErrors.usageLimit = 'Số lần sử dụng không được âm';
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

export const buildCouponPayload = (formData, createdBy) => ({
    code: normalizeCouponCode(formData.code),
    name: formData.name.trim(),
    description: formData.description.trim(),
    type: formData.type,
    value: parseFloat(formData.value),
    minimumAmount: formData.minimumAmount ? parseFloat(formData.minimumAmount) : null,
    maximumDiscount: formData.maximumDiscount ? parseFloat(formData.maximumDiscount) : null,
    usageLimit: formData.usageLimit ? parseInt(formData.usageLimit, 10) : null,
    perCustomerLimit: FIXED_PER_CUSTOMER_LIMIT,
    startDate: formData.startDate,
    endDate: formData.endDate,
    status: formData.status,
    createdBy,
});
