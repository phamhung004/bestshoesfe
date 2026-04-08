// ─── Checkout Constants & Utilities ────────────────────
// Static data that doesn't need to come from the backend

// ─── DELIVERY TIME OPTIONS ────────────────────────────
export const DELIVERY_OPTIONS = [
    {
        id: 'standard',
        label: 'Giao hàng tiêu chuẩn',
        desc: '3–5 ngày làm việc',
        cost: 0,
        costLabel: 'Miễn phí',
    },
    {
        id: 'fast',
        label: 'Giao hàng nhanh',
        desc: '1–2 ngày làm việc',
        cost: 35000,
        costLabel: '+35.000 ₫',
    },
    {
        id: 'express',
        label: 'Giao hàng hỏa tốc',
        desc: 'Trong ngày (đặt trước 14:00)',
        cost: 75000,
        costLabel: '+75.000 ₫',
    },
];

// ─── PAYMENT METHODS ──────────────────────────────────
export const PAYMENT_METHODS = [
    {
        id: 'cod',
        icon: '💵',
        label: 'Thanh toán khi nhận hàng (COD)',
        desc: 'Thanh toán bằng tiền mặt khi nhận hàng',
    },
    {
        id: 'bank',
        icon: '🏦',
        label: 'Chuyển khoản ngân hàng',
        desc: 'Chuyển khoản trực tiếp — xác nhận tự động qua SePay',
    },
];

// ─── FORMAT HELPERS ───────────────────────────────────

/**
 * Format a number as Vietnamese currency (VNĐ)
 */
export const formatVND = (amount) => {
    if (amount == null) return '0 ₫';
    return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
};

/**
 * Calculate item subtotal from real cart item (considers promotion)
 */
export const getItemSubtotal = (item) => {
    const price = getItemPrice(item);
    return price * item.quantity;
};

/**
 * Get effective price of a cart item (with promotion discount if any)
 */
export const getItemPrice = (item) => {
    const basePrice = item.variant?.price || 0;
    if (item.promotion && item.promotion.promotion_price != null) {
        return item.promotion.promotion_price;
    }
    if (item.promotion && item.promotion.discount_percentage) {
        return Math.round(basePrice * (1 - item.promotion.discount_percentage / 100));
    }
    return basePrice;
};

/**
 * Format a saved address (generic fields) for display
 * Address entity: line1=street, city=ward, state=district, country=province
 */
export const formatAddress = (addr) => {
    return [addr.line1, addr.city, addr.state, addr.country]
        .filter(Boolean)
        .join(', ');
};
