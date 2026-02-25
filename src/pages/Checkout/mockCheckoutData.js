// ─── Checkout Mock Data ────────────────────────────────
import {
    INITIAL_CART_ITEMS,
    getItemPrice,
    getItemSubtotal,
    formatVND,
    getSizeName,
    getColorInfo,
    getBrandName,
    COUPONS,
} from '../Cart/mockCartData';

export {
    INITIAL_CART_ITEMS,
    getItemPrice,
    getItemSubtotal,
    formatVND,
    getSizeName,
    getColorInfo,
    getBrandName,
};

// ─── MOCK LOGGED-IN CUSTOMER ───────────────────────────
export const MOCK_CUSTOMER = {
    customer_id: 1,
    full_name: 'Nguyễn Văn Minh',
    email: 'minh.nguyen@gmail.com',
    phone: '0912345678',
    gender: 'Nam',
    date_of_birth: '1995-06-15',
};

// ─── SAVED ADDRESSES ──────────────────────────────────
export const SAVED_ADDRESSES = [
    {
        address_id: 1,
        customer_id: 1,
        recipient_name: 'Nguyễn Văn Minh',
        phone: '0912345678',
        line1: '123 Đường Lê Lợi',
        line2: '',
        city: 'Phường Bến Nghé',
        state: 'Quận 1',
        postal_code: '700000',
        country: 'TP. Hồ Chí Minh',
        is_default: 1,
    },
    {
        address_id: 2,
        customer_id: 1,
        recipient_name: 'Nguyễn Thị Lan (Vợ)',
        phone: '0987654321',
        line1: '456 Đường Nguyễn Huệ',
        line2: '',
        city: 'Phường Bến Thành',
        state: 'Quận 1',
        postal_code: '700000',
        country: 'TP. Hồ Chí Minh',
        is_default: 0,
    },
];

// ─── VIETNAMESE PROVINCE → DISTRICT → WARD CASCADE ────
export const PROVINCES = [
    'Hà Nội',
    'TP. Hồ Chí Minh',
    'Đà Nẵng',
    'Cần Thơ',
    'Hải Phòng',
    'Bình Dương',
    'Đồng Nai',
];

export const DISTRICTS = {
    'TP. Hồ Chí Minh': [
        'Quận 1', 'Quận 3', 'Quận 7',
        'Quận Bình Thạnh', 'Quận Tân Bình',
        'Quận Gò Vấp', 'TP. Thủ Đức',
    ],
    'Hà Nội': [
        'Quận Ba Đình', 'Quận Hoàn Kiếm',
        'Quận Cầu Giấy', 'Quận Đống Đa',
        'Quận Hai Bà Trưng',
    ],
    'Đà Nẵng': [
        'Quận Hải Châu', 'Quận Thanh Khê',
        'Quận Sơn Trà', 'Quận Ngũ Hành Sơn',
    ],
    'Cần Thơ': [
        'Quận Ninh Kiều', 'Quận Bình Thủy', 'Quận Cái Răng',
    ],
    'Hải Phòng': [
        'Quận Hồng Bàng', 'Quận Ngô Quyền', 'Quận Lê Chân',
    ],
    'Bình Dương': [
        'TP. Thủ Dầu Một', 'TP. Dĩ An', 'TP. Thuận An',
    ],
    'Đồng Nai': [
        'TP. Biên Hòa', 'Huyện Long Thành', 'Huyện Nhơn Trạch',
    ],
};

export const WARDS = {
    'Quận 1': [
        'Phường Bến Nghé', 'Phường Bến Thành', 'Phường Cầu Kho',
        'Phường Cô Giang', 'Phường Đa Kao',
    ],
    'Quận 3': [
        'Phường Võ Thị Sáu', 'Phường 1', 'Phường 2',
    ],
    'Quận 7': [
        'Phường Tân Phú', 'Phường Tân Thuận Đông', 'Phường Phú Mỹ',
    ],
    'Quận Bình Thạnh': [
        'Phường 1', 'Phường 2', 'Phường 25',
    ],
    'Quận Tân Bình': [
        'Phường 1', 'Phường 2', 'Phường 4',
    ],
    'Quận Gò Vấp': [
        'Phường 1', 'Phường 3', 'Phường 5',
    ],
    'TP. Thủ Đức': [
        'Phường Linh Trung', 'Phường Hiệp Bình Chánh', 'Phường Tam Bình',
    ],
    'Quận Ba Đình': [
        'Phường Phúc Xá', 'Phường Trúc Bạch', 'Phường Cống Vị',
    ],
    'Quận Hoàn Kiếm': [
        'Phường Hàng Bạc', 'Phường Hàng Bồ', 'Phường Hàng Đào',
    ],
    'Quận Cầu Giấy': [
        'Phường Dịch Vọng Hậu', 'Phường Mai Dịch', 'Phường Nghĩa Đô',
    ],
    'Quận Đống Đa': [
        'Phường Ô Chợ Dừa', 'Phường Láng Hạ', 'Phường Trung Liệt',
    ],
    'Quận Hai Bà Trưng': [
        'Phường Bạch Đằng', 'Phường Thanh Nhàn', 'Phường Lê Đại Hành',
    ],
    'Quận Hải Châu': [
        'Phường Hải Châu 1', 'Phường Hải Châu 2', 'Phường Thanh Bình',
    ],
    'Quận Thanh Khê': [
        'Phường Thanh Khê Đông', 'Phường Thanh Khê Tây', 'Phường An Khê',
    ],
    'Quận Sơn Trà': [
        'Phường An Hải Bắc', 'Phường Phước Mỹ', 'Phường Mân Thái',
    ],
    'Quận Ngũ Hành Sơn': [
        'Phường Mỹ An', 'Phường Khuê Mỹ', 'Phường Hòa Hải',
    ],
    'Quận Ninh Kiều': [
        'Phường Cái Khế', 'Phường An Hòa', 'Phường Tân An',
    ],
    'Quận Bình Thủy': [
        'Phường Bình Thủy', 'Phường Trà An', 'Phường Trà Nóc',
    ],
    'Quận Cái Răng': [
        'Phường Lê Bình', 'Phường Hưng Phú', 'Phường Ba Láng',
    ],
    'Quận Hồng Bàng': [
        'Phường Quán Toan', 'Phường Hoàng Văn Thụ', 'Phường Phan Bội Châu',
    ],
    'Quận Ngô Quyền': [
        'Phường Máy Tơ', 'Phường Cầu Đất', 'Phường Đông Khê',
    ],
    'Quận Lê Chân': [
        'Phường An Biên', 'Phường An Dương', 'Phường Trại Cau',
    ],
    'TP. Thủ Dầu Một': [
        'Phường Phú Cường', 'Phường Hiệp Thành', 'Phường Chánh Nghĩa',
    ],
    'TP. Dĩ An': [
        'Phường Dĩ An', 'Phường Tân Bình', 'Phường Đông Hòa',
    ],
    'TP. Thuận An': [
        'Phường Lái Thiêu', 'Phường An Thạnh', 'Phường Bình Chuẩn',
    ],
    'TP. Biên Hòa': [
        'Phường Trảng Dài', 'Phường Tân Phong', 'Phường Tam Hiệp',
    ],
    'Huyện Long Thành': [
        'Thị trấn Long Thành', 'Xã An Phước', 'Xã Bình An',
    ],
    'Huyện Nhơn Trạch': [
        'Xã Phú Hội', 'Xã Phú Thạnh', 'Xã Đại Phước',
    ],
};

// ─── APPLIED COUPON (from cart state) ─────────────────
export const APPLIED_COUPON = {
    code: 'SALE10',
    name: 'Giảm 10%',
    type: 'Percentage',
    value: 10,
};

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
        desc: 'Chuyển khoản trực tiếp — xác nhận trong 30 phút',
    },
    {
        id: 'momo',
        icon: '📱',
        label: 'Ví MoMo',
        desc: 'Quét mã QR hoặc nhập số điện thoại MoMo',
    },
    {
        id: 'card',
        icon: '💳',
        label: 'Thẻ tín dụng / Ghi nợ',
        desc: 'Visa, Mastercard, JCB — Bảo mật SSL',
    },
];

// ─── HELPERS ──────────────────────────────────────────
export const generateOrderNumber = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const seq = String(Math.floor(Math.random() * 99999) + 1).padStart(5, '0');
    return `ORD-${y}${m}${d}-${seq}`;
};

export const formatAddress = (addr) => {
    return [addr.line1, addr.city, addr.state, addr.country]
        .filter(Boolean)
        .join(', ');
};
