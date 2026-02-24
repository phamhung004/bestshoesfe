/**
 * Mock data for Return Management page.
 * 8 return requests covering all 5 return statuses,
 * Vietnamese names, shoe products, VND prices.
 */

// Helper: generate timestamps relative to "now" (2026-02-24)
const now = new Date('2026-02-24T10:00:00+07:00');
const today = (h, m) => {
    const d = new Date(now);
    d.setHours(h, m, 0, 0);
    return d.toISOString();
};
const daysAgo = (n, h = 10, m = 0) => {
    const d = new Date(now);
    d.setDate(d.getDate() - n);
    d.setHours(h, m, 0, 0);
    return d.toISOString();
};

// ── Products catalog ────────────────────────────────────────────
export const products = [
    { product_id: 1, name: 'Nike Air Max 270', image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=80&h=80&fit=crop' },
    { product_id: 2, name: 'Adidas Ultraboost 22', image_url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=80&h=80&fit=crop' },
    { product_id: 3, name: 'Puma RS-X3', image_url: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=80&h=80&fit=crop' },
    { product_id: 4, name: 'New Balance 574', image_url: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=80&h=80&fit=crop' },
    { product_id: 5, name: 'Converse Chuck 70', image_url: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=80&h=80&fit=crop' },
    { product_id: 6, name: 'Vans Old Skool', image_url: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=80&h=80&fit=crop' },
];

// ── Customers ───────────────────────────────────────────────────
export const customers = [
    { customer_id: 1, full_name: 'Nguyễn Văn An', email: 'an.nguyen@gmail.com', phone: '0912345678', gender: 'Nam', date_of_birth: '1995-03-15' },
    { customer_id: 2, full_name: 'Trần Thị Bình', email: 'binh.tran@gmail.com', phone: '0987654321', gender: 'Nữ', date_of_birth: '1998-07-22' },
    { customer_id: 3, full_name: 'Lê Hoàng Cường', email: 'cuong.le@yahoo.com', phone: '0901122334', gender: 'Nam', date_of_birth: '1990-11-08' },
    { customer_id: 4, full_name: 'Phạm Minh Dung', email: 'dung.pham@outlook.com', phone: '0938765432', gender: 'Nam', date_of_birth: '1992-01-30' },
    { customer_id: 5, full_name: 'Hoàng Thị Em', email: 'em.hoang@gmail.com', phone: '0976543210', gender: 'Nữ', date_of_birth: '2000-05-12' },
    { customer_id: 6, full_name: 'Võ Thanh Phong', email: 'phong.vo@gmail.com', phone: '0918877665', gender: 'Nam', date_of_birth: '1988-09-05' },
    { customer_id: 7, full_name: 'Đặng Ngọc Hà', email: 'ha.dang@gmail.com', phone: '0945566778', gender: 'Nữ', date_of_birth: '1997-12-18' },
    { customer_id: 8, full_name: 'Bùi Quốc Khánh', email: 'khanh.bui@gmail.com', phone: '0923344556', gender: 'Nam', date_of_birth: '1993-06-25' },
];

// ── Colors & Sizes ──────────────────────────────────────────────
const colors = [
    { color_id: 1, color_name: 'Đen', color_code: '#000000' },
    { color_id: 2, color_name: 'Trắng', color_code: '#FFFFFF' },
    { color_id: 3, color_name: 'Đỏ', color_code: '#EF4444' },
    { color_id: 4, color_name: 'Nâu', color_code: '#92400E' },
    { color_id: 5, color_name: 'Xanh Navy', color_code: '#1E3A5F' },
];

const sizes = [
    { size_id: 1, size_name: '39' },
    { size_id: 2, size_name: '40' },
    { size_id: 3, size_name: '41' },
    { size_id: 4, size_name: '42' },
    { size_id: 5, size_name: '43' },
];

// ── Return Status config ────────────────────────────────────────
export const RETURN_STATUS_CONFIG = {
    'Chờ duyệt': { color: '#EAB308', bg: '#FEF9C3', label: 'Chờ duyệt' },
    'Đã duyệt': { color: '#3B82F6', bg: '#DBEAFE', label: 'Đã duyệt' },
    'Đã nhận hàng': { color: '#8B5CF6', bg: '#EDE9FE', label: 'Đã nhận hàng' },
    'Hoàn tiền': { color: '#22C55E', bg: '#DCFCE7', label: 'Hoàn tiền' },
    'Từ chối': { color: '#EF4444', bg: '#FEE2E2', label: 'Từ chối' },
};

export const ALL_RETURN_STATUSES = [
    'Tất cả', 'Chờ duyệt', 'Đã duyệt', 'Đã nhận hàng', 'Hoàn tiền', 'Từ chối',
];

// ── Reason config (with color themes) ──────────────────────────
export const REASON_CONFIG = {
    'Sản phẩm lỗi': { color: '#EF4444', bg: '#FEE2E2', icon: '🔴' },
    'Sai size': { color: '#F97316', bg: '#FFF7ED', icon: '🟠' },
    'Sai màu': { color: '#EAB308', bg: '#FEF9C3', icon: '🟡' },
    'Không như mô tả': { color: '#8B5CF6', bg: '#EDE9FE', icon: '🟣' },
    'Đổi ý': { color: '#6B7280', bg: '#F3F4F6', icon: '⚪' },
    'Giao thiếu hàng': { color: '#3B82F6', bg: '#DBEAFE', icon: '🔵' },
    'Khác': { color: '#6B7280', bg: '#F3F4F6', icon: '⚪' },
};

export const ALL_REASONS = Object.keys(REASON_CONFIG);

// ── Refund methods ──────────────────────────────────────────────
export const REFUND_METHODS = [
    { value: 'Tiền mặt', icon: '💵', label: 'Tiền mặt' },
    { value: 'Chuyển khoản', icon: '🏦', label: 'Chuyển khoản' },
    { value: 'Ví điện tử', icon: '📱', label: 'Ví điện tử' },
    { value: 'Hoàn vào thẻ', icon: '💳', label: 'Hoàn vào thẻ' },
];

// ── Helper to build order items ─────────────────────────────────
let itemId = 100;
const makeItem = (orderId, productIdx, sizeIdx, colorIdx, qty, unitPrice) => ({
    order_item_id: itemId++,
    order_id: orderId,
    variant_id: productIdx * 10 + sizeIdx,
    product: products[productIdx],
    size: sizes[sizeIdx],
    color: colors[colorIdx],
    quantity: qty,
    unit_price: unitPrice,
    total_price: qty * unitPrice,
});

// ── Timeline builder ────────────────────────────────────────────
const buildTimeline = (status, dates) => {
    const steps = [
        { label: 'Yêu cầu trả hàng', key: 'requested' },
        { label: 'Duyệt yêu cầu', key: 'approved' },
        { label: 'Nhận hàng về kho', key: 'received' },
        { label: 'Kiểm tra hàng hóa', key: 'inspected' },
        { label: 'Hoàn tiền', key: 'refunded' },
    ];
    const statusOrder = { 'Chờ duyệt': 0, 'Đã duyệt': 1, 'Đã nhận hàng': 2, 'Hoàn tiền': 4, 'Từ chối': -1 };
    const currentIdx = statusOrder[status] ?? 0;

    return steps.map((step, i) => ({
        ...step,
        completed: i <= currentIdx && status !== 'Từ chối',
        current: i === currentIdx + 1 && status !== 'Từ chối' && status !== 'Hoàn tiền',
        timestamp: dates[step.key] || null,
    }));
};

// ── Mock deliverable orders (for create return modal) ───────────
export const mockDeliverableOrders = [
    {
        order_id: 4, order_number: 'ORD-2026-00040',
        customer_name: 'Phạm Minh Dung', customer_phone: '0938765432',
        total_amount: 1250000, created_at: daysAgo(1, 14, 20), status: 'Đã giao',
        customer_id: 4,
        items: [makeItem(4, 3, 3, 4, 1, 1250000)],
    },
    {
        order_id: 7, order_number: 'ORD-2026-00037',
        customer_name: 'Đặng Ngọc Hà', customer_phone: '0945566778',
        total_amount: 3600000, created_at: daysAgo(3, 11, 30), status: 'Đã giao',
        customer_id: 7,
        items: [
            makeItem(7, 0, 4, 0, 2, 1500000),
            makeItem(7, 2, 1, 3, 1, 950000),
            makeItem(7, 4, 2, 1, 1, 850000),
        ],
    },
    {
        order_id: 10, order_number: 'ORD-2026-00030',
        customer_name: 'Nguyễn Văn An', customer_phone: '0912345678',
        total_amount: 1670000, created_at: daysAgo(7, 15, 0), status: 'Đã giao',
        customer_id: 1,
        items: [
            makeItem(10, 1, 2, 2, 1, 1100000),
            makeItem(10, 5, 0, 0, 1, 600000),
        ],
    },
];

// ── 8 Mock Return Requests ──────────────────────────────────────
export const mockReturns = [
    // 1 — Chờ duyệt (submitted today)
    {
        return_id: 1,
        return_code: 'RTN-20260224-00001',
        order_id: 101,
        order_number: 'ORD-2026-00035',
        customer_id: 1,
        customer_name: 'Nguyễn Văn An',
        customer_phone: '0912345678',
        order_type: 'Online',
        total_amount: 1500000,
        original_total: 1500000,
        return_status: 'Chờ duyệt',
        return_reason: 'Sản phẩm lỗi',
        refund_method: 'Chuyển khoản',
        description: 'Giày bị bong keo ở phần đế sau khi sử dụng được 2 ngày. Cần trả lại để hoàn tiền.',
        shipping_cost_refund: 30000,
        deduction: 0,
        reject_reason: null,
        notes: '',
        is_partial: false,
        created_at: today(8, 30),
        updated_at: today(8, 30),
        order_created_at: daysAgo(5, 10, 0),
        items: [
            makeItem(101, 0, 2, 0, 1, 1500000),
        ],
        timeline: buildTimeline('Chờ duyệt', { requested: today(8, 30) }),
    },

    // 2 — Chờ duyệt (submitted yesterday)
    {
        return_id: 2,
        return_code: 'RTN-20260223-00002',
        order_id: 102,
        order_number: 'ORD-2026-00033',
        customer_id: 2,
        customer_name: 'Trần Thị Bình',
        customer_phone: '0987654321',
        order_type: 'Online',
        total_amount: 2050000,
        original_total: 2050000,
        return_status: 'Chờ duyệt',
        return_reason: 'Sai size',
        refund_method: 'Ví điện tử',
        description: 'Đặt size 40 nhưng giày chật, cần đổi sang size 41 hoặc hoàn tiền.',
        shipping_cost_refund: 25000,
        deduction: 0,
        reject_reason: null,
        notes: '',
        is_partial: false,
        created_at: daysAgo(1, 15, 20),
        updated_at: daysAgo(1, 15, 20),
        order_created_at: daysAgo(7, 9, 0),
        items: [
            makeItem(102, 1, 1, 2, 1, 1100000),
            makeItem(102, 2, 1, 3, 1, 950000),
        ],
        timeline: buildTimeline('Chờ duyệt', { requested: daysAgo(1, 15, 20) }),
    },

    // 3 — Đã duyệt (approved 2 days ago)
    {
        return_id: 3,
        return_code: 'RTN-20260222-00003',
        order_id: 103,
        order_number: 'ORD-2026-00031',
        customer_id: 3,
        customer_name: 'Lê Hoàng Cường',
        customer_phone: '0901122334',
        order_type: 'Online',
        total_amount: 950000,
        original_total: 950000,
        return_status: 'Đã duyệt',
        return_reason: 'Sai màu',
        refund_method: 'Tiền mặt',
        description: 'Đặt màu đen nhưng giao màu nâu. Không đúng mô tả trên website.',
        shipping_cost_refund: 30000,
        deduction: 0,
        reject_reason: null,
        notes: 'Đã liên hệ khách hàng, khách sẽ gửi hàng về kho trong 2 ngày.',
        is_partial: false,
        created_at: daysAgo(3, 10, 0),
        updated_at: daysAgo(2, 14, 0),
        order_created_at: daysAgo(10, 8, 0),
        items: [
            makeItem(103, 2, 2, 3, 1, 950000),
        ],
        timeline: buildTimeline('Đã duyệt', {
            requested: daysAgo(3, 10, 0),
            approved: daysAgo(2, 14, 0),
        }),
    },

    // 4 — Đã duyệt (approved 3 days ago)
    {
        return_id: 4,
        return_code: 'RTN-20260221-00004',
        order_id: 104,
        order_number: 'ORD-2026-00029',
        customer_id: 5,
        customer_name: 'Hoàng Thị Em',
        customer_phone: '0976543210',
        order_type: 'In-store',
        total_amount: 850000,
        original_total: 850000,
        return_status: 'Đã duyệt',
        return_reason: 'Đổi ý',
        refund_method: 'Tiền mặt',
        description: 'Mua xong về nhà thấy không phù hợp với trang phục, muốn đổi hoặc trả.',
        shipping_cost_refund: 0,
        deduction: 0,
        reject_reason: null,
        notes: '',
        is_partial: false,
        created_at: daysAgo(4, 16, 0),
        updated_at: daysAgo(3, 9, 30),
        order_created_at: daysAgo(6, 14, 0),
        items: [
            makeItem(104, 4, 2, 1, 1, 850000),
        ],
        timeline: buildTimeline('Đã duyệt', {
            requested: daysAgo(4, 16, 0),
            approved: daysAgo(3, 9, 30),
        }),
    },

    // 5 — Đã nhận hàng
    {
        return_id: 5,
        return_code: 'RTN-20260220-00005',
        order_id: 105,
        order_number: 'ORD-2026-00027',
        customer_id: 4,
        customer_name: 'Phạm Minh Dung',
        customer_phone: '0938765432',
        order_type: 'Online',
        total_amount: 2500000,
        original_total: 3200000,
        return_status: 'Đã nhận hàng',
        return_reason: 'Không như mô tả',
        refund_method: 'Chuyển khoản',
        description: 'Chất liệu giày khác hoàn toàn so với mô tả. Da nhân tạo nhưng quảng cáo da thật.',
        shipping_cost_refund: 35000,
        deduction: 50000,
        reject_reason: null,
        notes: 'Hàng đã nhận, đang kiểm tra chất lượng trước khi hoàn tiền.',
        is_partial: true,
        created_at: daysAgo(5, 9, 0),
        updated_at: daysAgo(1, 11, 0),
        order_created_at: daysAgo(12, 10, 0),
        items: [
            makeItem(105, 0, 4, 0, 1, 1500000),
            makeItem(105, 3, 3, 4, 1, 1000000),
        ],
        timeline: buildTimeline('Đã nhận hàng', {
            requested: daysAgo(5, 9, 0),
            approved: daysAgo(4, 10, 0),
            received: daysAgo(1, 11, 0),
        }),
    },

    // 6 — Hoàn tiền (completed, bank transfer)
    {
        return_id: 6,
        return_code: 'RTN-20260218-00006',
        order_id: 106,
        order_number: 'ORD-2026-00025',
        customer_id: 6,
        customer_name: 'Võ Thanh Phong',
        customer_phone: '0918877665',
        order_type: 'Online',
        total_amount: 1250000,
        original_total: 1250000,
        return_status: 'Hoàn tiền',
        return_reason: 'Giao thiếu hàng',
        refund_method: 'Chuyển khoản',
        description: 'Đặt 2 đôi nhưng chỉ nhận được 1. Cần hoàn tiền đôi còn thiếu.',
        shipping_cost_refund: 0,
        deduction: 0,
        reject_reason: null,
        notes: 'Đã hoàn tiền qua tài khoản Vietcombank ****5678',
        is_partial: false,
        created_at: daysAgo(7, 10, 0),
        updated_at: daysAgo(2, 16, 0),
        order_created_at: daysAgo(14, 8, 0),
        items: [
            makeItem(106, 3, 3, 4, 1, 1250000),
        ],
        timeline: buildTimeline('Hoàn tiền', {
            requested: daysAgo(7, 10, 0),
            approved: daysAgo(6, 9, 0),
            received: daysAgo(4, 14, 0),
            inspected: daysAgo(3, 10, 0),
            refunded: daysAgo(2, 16, 0),
        }),
    },

    // 7 — Hoàn tiền (completed, e-wallet)
    {
        return_id: 7,
        return_code: 'RTN-20260217-00007',
        order_id: 107,
        order_number: 'ORD-2026-00023',
        customer_id: 7,
        customer_name: 'Đặng Ngọc Hà',
        customer_phone: '0945566778',
        order_type: 'Online',
        total_amount: 1800000,
        original_total: 1800000,
        return_status: 'Hoàn tiền',
        return_reason: 'Sản phẩm lỗi',
        refund_method: 'Ví điện tử',
        description: 'Giày bị rách phần lót bên trong, chưa sử dụng lần nào. Lỗi sản xuất.',
        shipping_cost_refund: 30000,
        deduction: 0,
        reject_reason: null,
        notes: 'Đã hoàn tiền qua MoMo',
        is_partial: false,
        created_at: daysAgo(8, 11, 0),
        updated_at: daysAgo(3, 15, 0),
        order_created_at: daysAgo(15, 16, 0),
        items: [
            makeItem(107, 5, 0, 0, 1, 1050000),
            makeItem(107, 4, 2, 1, 1, 750000),
        ],
        timeline: buildTimeline('Hoàn tiền', {
            requested: daysAgo(8, 11, 0),
            approved: daysAgo(7, 9, 30),
            received: daysAgo(5, 10, 0),
            inspected: daysAgo(4, 14, 0),
            refunded: daysAgo(3, 15, 0),
        }),
    },

    // 8 — Từ chối (with rejection reason)
    {
        return_id: 8,
        return_code: 'RTN-20260219-00008',
        order_id: 108,
        order_number: 'ORD-2026-00026',
        customer_id: 8,
        customer_name: 'Bùi Quốc Khánh',
        customer_phone: '0923344556',
        order_type: 'In-store',
        total_amount: 750000,
        original_total: 750000,
        return_status: 'Từ chối',
        return_reason: 'Khác',
        refund_method: 'Hoàn vào thẻ',
        description: 'Muốn trả vì tìm được giá rẻ hơn ở nơi khác.',
        shipping_cost_refund: 0,
        deduction: 0,
        reject_reason: 'Lý do không hợp lệ',
        reject_note: 'Yêu cầu trả hàng không thuộc diện được chấp nhận theo chính sách đổi trả. Khách hàng đã được thông báo.',
        notes: 'Khách đã nhận lại hàng.',
        is_partial: false,
        created_at: daysAgo(6, 14, 0),
        updated_at: daysAgo(5, 10, 0),
        order_created_at: daysAgo(10, 11, 0),
        items: [
            makeItem(108, 5, 2, 1, 1, 750000),
        ],
        timeline: buildTimeline('Từ chối', {
            requested: daysAgo(6, 14, 0),
        }),
    },
];

// ── Reject reason options ───────────────────────────────────────
export const REJECT_REASONS = [
    'Sản phẩm đã qua sử dụng quá mức',
    'Hết thời hạn đổi trả (7 ngày)',
    'Sản phẩm không thuộc diện đổi trả',
    'Lý do không hợp lệ',
    'Khác',
];

// ── Helper: format VND currency ─────────────────────────────────
export const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
};

// ── Helper: format date dd/mm/yyyy ──────────────────────────────
export const formatDate = (isoStr) => {
    if (!isoStr) return '—';
    const d = new Date(isoStr);
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};

export const formatDateTime = (isoStr) => {
    if (!isoStr) return '—';
    const d = new Date(isoStr);
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// ── Helper: relative time string (Vietnamese) ──────────────────
export const relativeTime = (isoStr) => {
    if (!isoStr) return '';
    const diff = now - new Date(isoStr);
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Vừa xong';
    if (mins < 60) return `${mins} phút trước`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} giờ trước`;
    const days = Math.floor(hrs / 24);
    if (days === 1) return 'Hôm qua';
    return `${days} ngày trước`;
};

// ── Helper: get initials for avatar ─────────────────────────────
export const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// ── Helper: lookup customer by id ───────────────────────────────
export const getCustomerById = (id) => customers.find((c) => c.customer_id === id) || null;
