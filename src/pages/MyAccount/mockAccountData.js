// ─── My Account Mock Data ────────────────────────────────

// ─── HELPERS ──────────────────────────────────────────
export const formatVND = (amount) => {
    if (amount === null || amount === undefined) return '0 ₫';
    return amount.toLocaleString('vi-VN') + ' ₫';
};

export const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

export const formatDateShort = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export const formatMemberSince = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `Thành viên từ tháng ${d.getMonth() + 1}/${d.getFullYear()}`;
};

// ─── MOCK CUSTOMER ────────────────────────────────────
export const MOCK_CUSTOMER = {
    customer_id: 1,
    full_name: 'Nguyễn Văn Minh',
    email: 'minh.nguyen@gmail.com',
    password: '***hidden***',
    phone: '0912 345 678',
    date_of_birth: '1995-08-15',
    gender: 'Nam',
    status: 1,
    created_at: '2024-03-15',
};

// ─── ADDRESSES ────────────────────────────────────────
export const MOCK_ADDRESSES_INIT = [
    {
        address_id: 1,
        customer_id: 1,
        recipient_name: 'Nguyễn Văn Minh',
        phone: '0912 345 678',
        line1: '123 Đường Lê Lợi',
        line2: '',
        city: 'Phường Bến Nghé',
        state: 'Quận 1',
        postal_code: '700000',
        country: 'TP. Hồ Chí Minh',
        is_default: 1,
        status: 1,
        created_at: '2024-03-15',
        updated_at: '2024-03-15',
    },
    {
        address_id: 2,
        customer_id: 1,
        recipient_name: 'Nguyễn Thị Lan (Mẹ)',
        phone: '0987 654 321',
        line1: '45 Ngõ 12 Đường Láng',
        line2: '',
        city: 'Phường Láng Thượng',
        state: 'Quận Đống Đa',
        postal_code: '100000',
        country: 'Hà Nội',
        is_default: 0,
        status: 1,
        created_at: '2024-06-20',
        updated_at: '2024-06-20',
    },
];

// ─── PRODUCT THUMBNAILS (placeholder colors) ──────────
const THUMB_COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#F97316', '#22C55E', '#0EA5E9', '#EAB308'];

// ─── ORDERS ───────────────────────────────────────────
export const MOCK_ORDERS = [
    {
        order_id: 1,
        order_number: 'ORD-20260220-00042',
        customer_id: 1,
        customer_name: 'Nguyễn Văn Minh',
        customer_phone: '0912 345 678',
        shipping_province: 'TP. Hồ Chí Minh',
        shipping_district: 'Quận 1',
        shipping_ward: 'Phường Bến Nghé',
        shipping_address: '123 Đường Lê Lợi',
        order_type: 'Online',
        subtotal: 4050000,
        shipping_cost: 0,
        coupon_discount_amount: 250000,
        total_amount: 3800000,
        status: 'Đang giao',
        payment_status: 'Đã thanh toán',
        created_at: '2026-02-20T09:15:00',
        updated_at: '2026-02-21T14:30:00',
        items: [
            {
                order_item_id: 1,
                product_name: 'Nike Air Max 270',
                variant: 'Size 42 · Đen',
                quantity: 1,
                unit_price: 2750000,
                total_price: 2750000,
                thumb_color: THUMB_COLORS[0],
                thumb_emoji: '👟',
            },
            {
                order_item_id: 2,
                product_name: 'Adidas Stan Smith',
                variant: 'Size 41 · Trắng',
                quantity: 1,
                unit_price: 1300000,
                total_price: 1300000,
                thumb_color: THUMB_COLORS[1],
                thumb_emoji: '👟',
            },
        ],
    },
    {
        order_id: 2,
        order_number: 'ORD-20260218-00038',
        customer_id: 1,
        customer_name: 'Nguyễn Văn Minh',
        customer_phone: '0912 345 678',
        shipping_province: 'TP. Hồ Chí Minh',
        shipping_district: 'Quận 1',
        shipping_ward: 'Phường Bến Nghé',
        shipping_address: '123 Đường Lê Lợi',
        order_type: 'Online',
        subtotal: 5700000,
        shipping_cost: 35000,
        coupon_discount_amount: 35000,
        total_amount: 5700000,
        status: 'Đã giao',
        payment_status: 'Đã thanh toán',
        created_at: '2026-02-18T14:20:00',
        updated_at: '2026-02-22T10:00:00',
        items: [
            {
                order_item_id: 3,
                product_name: 'Converse Chuck Taylor All Star',
                variant: 'Size 40 · Trắng',
                quantity: 1,
                unit_price: 1890000,
                total_price: 1890000,
                thumb_color: THUMB_COLORS[2],
                thumb_emoji: '👟',
            },
            {
                order_item_id: 4,
                product_name: 'Adidas Ultraboost 22',
                variant: 'Size 42 · Xám',
                quantity: 1,
                unit_price: 3810000,
                total_price: 3810000,
                thumb_color: THUMB_COLORS[3],
                thumb_emoji: '👟',
            },
        ],
    },
    {
        order_id: 3,
        order_number: 'ORD-20260215-00031',
        customer_id: 1,
        customer_name: 'Nguyễn Văn Minh',
        customer_phone: '0912 345 678',
        shipping_province: 'Hà Nội',
        shipping_district: 'Quận Đống Đa',
        shipping_ward: 'Phường Láng Thượng',
        shipping_address: '45 Ngõ 12 Đường Láng',
        order_type: 'Online',
        subtotal: 2000000,
        shipping_cost: 0,
        coupon_discount_amount: 0,
        total_amount: 2000000,
        status: 'Đã giao',
        payment_status: 'Đã thanh toán',
        created_at: '2026-02-15T08:30:00',
        updated_at: '2026-02-19T16:45:00',
        items: [
            {
                order_item_id: 5,
                product_name: 'Vans Old Skool',
                variant: 'Size 39 · Đen/Trắng',
                quantity: 1,
                unit_price: 2000000,
                total_price: 2000000,
                thumb_color: THUMB_COLORS[4],
                thumb_emoji: '👟',
            },
        ],
    },
    {
        order_id: 4,
        order_number: 'ORD-20260210-00025',
        customer_id: 1,
        customer_name: 'Nguyễn Văn Minh',
        customer_phone: '0912 345 678',
        shipping_province: 'TP. Hồ Chí Minh',
        shipping_district: 'Quận 1',
        shipping_ward: 'Phường Bến Nghé',
        shipping_address: '123 Đường Lê Lợi',
        order_type: 'Online',
        subtotal: 8370000,
        shipping_cost: 75000,
        coupon_discount_amount: 75000,
        total_amount: 8370000,
        status: 'Đang giao',
        payment_status: 'Đã thanh toán',
        created_at: '2026-02-10T11:00:00',
        updated_at: '2026-02-12T09:00:00',
        items: [
            {
                order_item_id: 6,
                product_name: 'Nike Pegasus 40',
                variant: 'Size 43 · Xanh',
                quantity: 1,
                unit_price: 3200000,
                total_price: 3200000,
                thumb_color: THUMB_COLORS[5],
                thumb_emoji: '👟',
            },
            {
                order_item_id: 7,
                product_name: 'New Balance 574',
                variant: 'Size 42 · Nâu',
                quantity: 1,
                unit_price: 2850000,
                total_price: 2850000,
                thumb_color: THUMB_COLORS[6],
                thumb_emoji: '👟',
            },
            {
                order_item_id: 8,
                product_name: 'Puma RS-X',
                variant: 'Size 41 · Trắng',
                quantity: 1,
                unit_price: 2320000,
                total_price: 2320000,
                thumb_color: THUMB_COLORS[0],
                thumb_emoji: '👟',
            },
        ],
    },
    {
        order_id: 5,
        order_number: 'ORD-20260205-00019',
        customer_id: 1,
        customer_name: 'Nguyễn Văn Minh',
        customer_phone: '0912 345 678',
        shipping_province: 'TP. Hồ Chí Minh',
        shipping_district: 'Quận 1',
        shipping_ward: 'Phường Bến Nghé',
        shipping_address: '123 Đường Lê Lợi',
        order_type: 'Online',
        subtotal: 1850000,
        shipping_cost: 35000,
        coupon_discount_amount: 35000,
        total_amount: 1850000,
        status: 'Đã xác nhận',
        payment_status: 'Chưa thanh toán',
        created_at: '2026-02-05T16:40:00',
        updated_at: '2026-02-06T08:00:00',
        items: [
            {
                order_item_id: 9,
                product_name: 'Biti\'s Hunter Street',
                variant: 'Size 40 · Đỏ',
                quantity: 1,
                unit_price: 1850000,
                total_price: 1850000,
                thumb_color: THUMB_COLORS[1],
                thumb_emoji: '👟',
            },
        ],
    },
    {
        order_id: 6,
        order_number: 'ORD-20260201-00012',
        customer_id: 1,
        customer_name: 'Nguyễn Văn Minh',
        customer_phone: '0912 345 678',
        shipping_province: 'TP. Hồ Chí Minh',
        shipping_district: 'Quận Tân Bình',
        shipping_ward: 'Phường 1',
        shipping_address: '78 Đường Cộng Hòa',
        order_type: 'In-store',
        subtotal: 3200000,
        shipping_cost: 0,
        coupon_discount_amount: 0,
        total_amount: 3200000,
        status: 'Chờ xác nhận',
        payment_status: 'Chưa thanh toán',
        created_at: '2026-02-01T10:15:00',
        updated_at: '2026-02-01T10:15:00',
        items: [
            {
                order_item_id: 10,
                product_name: 'Reebok Classic Leather',
                variant: 'Size 41 · Trắng',
                quantity: 1,
                unit_price: 3200000,
                total_price: 3200000,
                thumb_color: THUMB_COLORS[2],
                thumb_emoji: '👟',
            },
        ],
    },
    {
        order_id: 7,
        order_number: 'ORD-20260125-00008',
        customer_id: 1,
        customer_name: 'Nguyễn Văn Minh',
        customer_phone: '0912 345 678',
        shipping_province: 'TP. Hồ Chí Minh',
        shipping_district: 'Quận 1',
        shipping_ward: 'Phường Bến Nghé',
        shipping_address: '123 Đường Lê Lợi',
        order_type: 'Online',
        subtotal: 2560000,
        shipping_cost: 35000,
        coupon_discount_amount: 35000,
        total_amount: 2560000,
        status: 'Trả hàng/Hoàn tiền',
        payment_status: 'Đã thanh toán',
        created_at: '2026-01-25T13:00:00',
        updated_at: '2026-02-01T09:00:00',
        items: [
            {
                order_item_id: 11,
                product_name: 'Nike Air Force 1',
                variant: 'Size 43 · Trắng',
                quantity: 1,
                unit_price: 2560000,
                total_price: 2560000,
                thumb_color: THUMB_COLORS[3],
                thumb_emoji: '👟',
            },
        ],
    },
    {
        order_id: 8,
        order_number: 'ORD-20260120-00003',
        customer_id: 1,
        customer_name: 'Nguyễn Văn Minh',
        customer_phone: '0912 345 678',
        shipping_province: 'TP. Hồ Chí Minh',
        shipping_district: 'Quận 7',
        shipping_ward: 'Phường Tân Phú',
        shipping_address: '12 Đường Nguyễn Thị Thập',
        order_type: 'Online',
        subtotal: 1450000,
        shipping_cost: 35000,
        coupon_discount_amount: 35000,
        total_amount: 1450000,
        status: 'Đã hủy',
        payment_status: 'Chưa thanh toán',
        created_at: '2026-01-20T18:00:00',
        updated_at: '2026-01-21T08:00:00',
        items: [
            {
                order_item_id: 12,
                product_name: 'Skechers Go Walk',
                variant: 'Size 40 · Xám',
                quantity: 1,
                unit_price: 1450000,
                total_price: 1450000,
                thumb_color: THUMB_COLORS[4],
                thumb_emoji: '👟',
            },
        ],
    },
];

// ─── REVIEWS ──────────────────────────────────────────
export const MOCK_REVIEWS_WRITTEN = [
    {
        review_id: 1,
        product_name: 'Nike Pegasus 40',
        variant: 'Size 43 · Xanh',
        rating: 5,
        title: 'Giày chạy xuất sắc!',
        content: 'Giày chạy rất êm chân, đệm tốt và phù hợp cho cả chạy bộ lẫn đi dạo. Đúng size, màu sắc y chang hình. Giao hàng nhanh, đóng gói cẩn thận. Sẽ mua thêm.',
        created_at: '2026-02-15T10:00:00',
        thumb_color: THUMB_COLORS[5],
        shop_reply: null,
    },
    {
        review_id: 2,
        product_name: 'Adidas Stan Smith',
        variant: 'Size 41 · Trắng',
        rating: 4,
        title: 'Đẹp nhưng hơi cứng lúc đầu',
        content: 'Đẹp nhưng hơi cứng lúc đầu, cần mang vài tuần mới mềm. Chất lượng da rất tốt, kiểu dáng classic không bao giờ lỗi mốt. Tổng thể hài lòng với sản phẩm này.',
        created_at: '2026-01-10T14:00:00',
        thumb_color: THUMB_COLORS[1],
        shop_reply: 'Cảm ơn bạn đã chia sẻ! Giày da thật cần thời gian break-in, bạn có thể dùng shoe stretcher để giúp giày mềm hơn. Chúc bạn mang giày thoải mái! 💙',
    },
    {
        review_id: 3,
        product_name: 'Vans Old Skool',
        variant: 'Size 39 · Đen/Trắng',
        rating: 5,
        title: 'Classic không bao giờ lỗi thời',
        content: 'Classic không bao giờ lỗi thời, chất lượng đúng với thương hiệu Vans. Mua cho đứa em gái, bé rất thích. Đế bền, vải canvas dày dặn. Xứng đáng 5 sao.',
        created_at: '2026-01-25T09:00:00',
        thumb_color: THUMB_COLORS[4],
        shop_reply: null,
    },
    {
        review_id: 4,
        product_name: 'New Balance 574',
        variant: 'Size 42 · Nâu',
        rating: 3,
        title: 'Size hơi lớn',
        content: 'Size hơi lớn hơn bình thường, nên xuống 1 size khi mua. Chất lượng giày ổn, đế khá dày và êm. Màu nâu đẹp hơn tôi tưởng. Trừ vấn đề size thì khá tốt.',
        created_at: '2025-12-20T16:00:00',
        thumb_color: THUMB_COLORS[6],
        shop_reply: 'Cảm ơn bạn đã phản hồi về size. Chúng tôi sẽ cập nhật hướng dẫn chọn size chi tiết hơn cho sản phẩm này. Nếu cần hỗ trợ đổi size, bạn inbox cho chúng tôi nhé!',
    },
    {
        review_id: 5,
        product_name: 'Biti\'s Hunter Street',
        variant: 'Size 40 · Đỏ',
        rating: 5,
        title: 'Tự hào hàng Việt!',
        content: 'Tự hào hàng Việt, chất lượng tốt không thua hàng ngoại mà giá lại phải chăng hơn. Thiết kế trẻ trung năng động. Đế chống trơn tốt. Mua lần 3 rồi vẫn không thất vọng.',
        created_at: '2025-11-15T11:00:00',
        thumb_color: THUMB_COLORS[1],
        shop_reply: null,
    },
];

export const MOCK_REVIEWS_PENDING = [
    {
        pending_id: 1,
        product_name: 'Converse Chuck Taylor All Star',
        variant: 'Size 40 · Trắng',
        order_number: 'ORD-20260218-00038',
        thumb_color: THUMB_COLORS[2],
    },
    {
        pending_id: 2,
        product_name: 'Adidas Ultraboost 22',
        variant: 'Size 42 · Xám',
        order_number: 'ORD-20260218-00038',
        thumb_color: THUMB_COLORS[3],
    },
];

// ─── MEMBERSHIP TIERS ─────────────────────────────────
export const MEMBERSHIP_TIERS = [
    { id: 'bronze', label: 'Đồng', threshold: 0, color: '#CD7F32' },
    { id: 'silver', label: 'Bạc', threshold: 5000000, color: '#A8A9AD' },
    { id: 'gold', label: 'Vàng', threshold: 15000000, color: '#FFD700' },
    { id: 'platinum', label: 'Bạch Kim', threshold: 50000000, color: '#E5E4E2' },
];

export const getTierFromSpend = (totalSpend) => {
    let tier = MEMBERSHIP_TIERS[0];
    for (const t of MEMBERSHIP_TIERS) {
        if (totalSpend >= t.threshold) tier = t;
    }
    return tier;
};

export const getTierEmoji = (tierId) => {
    const map = { bronze: '🥉', silver: '🥈', gold: '⭐', platinum: '💎' };
    return map[tierId] || '⭐';
};

// ─── COMPUTED STATS ──────────────────────────────────
export const ACCOUNT_STATS = {
    totalOrders: MOCK_ORDERS.length,
    totalSpend: MOCK_ORDERS
        .filter(o => o.payment_status === 'Đã thanh toán')
        .reduce((sum, o) => sum + o.total_amount, 0),
    reviewCount: MOCK_REVIEWS_WRITTEN.length,
    addressCount: MOCK_ADDRESSES_INIT.length,
    pendingReviews: MOCK_REVIEWS_PENDING.length,
    activeOrders: MOCK_ORDERS.filter(o => ['Đang giao', 'Chờ xác nhận', 'Đã xác nhận'].includes(o.status)).length,
    loyaltyPoints: 2435,
};

// ─── PROVINCES / DISTRICTS / WARDS (reused from checkout) ─
export const PROVINCES = [
    'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Cần Thơ',
    'Hải Phòng', 'Bình Dương', 'Đồng Nai',
];

export const DISTRICTS = {
    'TP. Hồ Chí Minh': ['Quận 1', 'Quận 3', 'Quận 7', 'Quận Bình Thạnh', 'Quận Tân Bình', 'Quận Gò Vấp', 'TP. Thủ Đức'],
    'Hà Nội': ['Quận Ba Đình', 'Quận Hoàn Kiếm', 'Quận Cầu Giấy', 'Quận Đống Đa', 'Quận Hai Bà Trưng'],
    'Đà Nẵng': ['Quận Hải Châu', 'Quận Thanh Khê', 'Quận Sơn Trà', 'Quận Ngũ Hành Sơn'],
    'Cần Thơ': ['Quận Ninh Kiều', 'Quận Bình Thủy', 'Quận Cái Răng'],
    'Hải Phòng': ['Quận Hồng Bàng', 'Quận Ngô Quyền', 'Quận Lê Chân'],
    'Bình Dương': ['TP. Thủ Dầu Một', 'TP. Dĩ An', 'TP. Thuận An'],
    'Đồng Nai': ['TP. Biên Hòa', 'Huyện Long Thành', 'Huyện Nhơn Trạch'],
};

export const WARDS = {
    'Quận 1': ['Phường Bến Nghé', 'Phường Bến Thành', 'Phường Cầu Kho', 'Phường Cô Giang', 'Phường Đa Kao'],
    'Quận 3': ['Phường Võ Thị Sáu', 'Phường 1', 'Phường 2'],
    'Quận 7': ['Phường Tân Phú', 'Phường Tân Thuận Đông', 'Phường Phú Mỹ'],
    'Quận Bình Thạnh': ['Phường 1', 'Phường 2', 'Phường 25'],
    'Quận Tân Bình': ['Phường 1', 'Phường 2', 'Phường 4'],
    'Quận Gò Vấp': ['Phường 1', 'Phường 3', 'Phường 5'],
    'TP. Thủ Đức': ['Phường Linh Trung', 'Phường Hiệp Bình Chánh', 'Phường Tam Bình'],
    'Quận Ba Đình': ['Phường Phúc Xá', 'Phường Trúc Bạch', 'Phường Cống Vị'],
    'Quận Hoàn Kiếm': ['Phường Hàng Bạc', 'Phường Hàng Bồ', 'Phường Hàng Đào'],
    'Quận Cầu Giấy': ['Phường Dịch Vọng Hậu', 'Phường Mai Dịch', 'Phường Nghĩa Đô'],
    'Quận Đống Đa': ['Phường Ô Chợ Dừa', 'Phường Láng Hạ', 'Phường Láng Thượng', 'Phường Trung Liệt'],
    'Quận Hai Bà Trưng': ['Phường Bạch Đằng', 'Phường Thanh Nhàn', 'Phường Lê Đại Hành'],
    'Quận Hải Châu': ['Phường Hải Châu 1', 'Phường Hải Châu 2', 'Phường Thanh Bình'],
    'Quận Thanh Khê': ['Phường Thanh Khê Đông', 'Phường Thanh Khê Tây', 'Phường An Khê'],
    'Quận Sơn Trà': ['Phường An Hải Bắc', 'Phường Phước Mỹ', 'Phường Mân Thái'],
    'Quận Ngũ Hành Sơn': ['Phường Mỹ An', 'Phường Khuê Mỹ', 'Phường Hòa Hải'],
    'Quận Ninh Kiều': ['Phường Cái Khế', 'Phường An Hòa', 'Phường Tân An'],
    'Quận Bình Thủy': ['Phường Bình Thủy', 'Phường Trà An', 'Phường Trà Nóc'],
    'Quận Cái Răng': ['Phường Lê Bình', 'Phường Hưng Phú', 'Phường Ba Láng'],
    'Quận Hồng Bàng': ['Phường Quán Toan', 'Phường Hoàng Văn Thụ', 'Phường Phan Bội Châu'],
    'Quận Ngô Quyền': ['Phường Máy Tơ', 'Phường Cầu Đất', 'Phường Đông Khê'],
    'Quận Lê Chân': ['Phường An Biên', 'Phường An Dương', 'Phường Trại Cau'],
    'TP. Thủ Dầu Một': ['Phường Phú Cường', 'Phường Hiệp Thành', 'Phường Chánh Nghĩa'],
    'TP. Dĩ An': ['Phường Dĩ An', 'Phường Tân Bình', 'Phường Đông Hòa'],
    'TP. Thuận An': ['Phường Lái Thiêu', 'Phường An Thạnh', 'Phường Bình Chuẩn'],
    'TP. Biên Hòa': ['Phường Trảng Dài', 'Phường Tân Phong', 'Phường Tam Hiệp'],
    'Huyện Long Thành': ['Thị trấn Long Thành', 'Xã An Phước', 'Xã Bình An'],
    'Huyện Nhơn Trạch': ['Xã Phú Hội', 'Xã Phú Thạnh', 'Xã Đại Phước'],
};
