/**
 * Mock data for Order Management page.
 * 10 orders covering every status × payment_status combination,
 * Vietnamese names/phones, shoe products, coupons, and varied dates.
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

// ── Products catalog (joined data) ──────────────────────────────
export const products = [
    { product_id: 1, name: 'Nike Air Max 270', image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=80&h=80&fit=crop' },
    { product_id: 2, name: 'Adidas Ultraboost 22', image_url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=80&h=80&fit=crop' },
    { product_id: 3, name: 'Puma RS-X3', image_url: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=80&h=80&fit=crop' },
    { product_id: 4, name: 'New Balance 574', image_url: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=80&h=80&fit=crop' },
    { product_id: 5, name: 'Converse Chuck 70', image_url: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=80&h=80&fit=crop' },
    { product_id: 6, name: 'Vans Old Skool', image_url: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=80&h=80&fit=crop' },
];

// ── Coupons ─────────────────────────────────────────────────────
export const coupons = [
    { coupon_id: 1, code: 'SALE20', name: 'Giảm 20% toàn bộ', type: 'Percentage', value: 20 },
    { coupon_id: 2, code: 'FREESHIP', name: 'Miễn phí vận chuyển', type: 'Fixed Amount', value: 30000 },
    { coupon_id: 3, code: 'VIP50K', name: 'Giảm 50K cho VIP', type: 'Fixed Amount', value: 50000 },
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

// ── Colors & Sizes (for variants) ───────────────────────────────
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

// ── Helper to build order items ─────────────────────────────────
let itemId = 1;
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

// ── 10 Mock Orders ──────────────────────────────────────────────
export const mockOrders = [
    // 1 — Today, pending confirmation, unpaid, online, with coupon
    {
        order_id: 1,
        order_number: 'ORD-2026-00041',
        customer_id: 1,
        coupon_id: 1,
        customer_name: 'Nguyễn Văn An',
        customer_phone: '0912345678',
        shipping_province: 'TP. Hồ Chí Minh',
        shipping_district: 'Quận 1',
        shipping_ward: 'Phường Bến Nghé',
        shipping_address: '123 Nguyễn Huệ',
        order_type: 'Online',
        subtotal: 2500000,
        shipping_cost: 30000,
        coupon_discount_amount: 500000,
        total_amount: 2030000,
        status: 'Chờ xác nhận',
        payment_status: 'Chưa thanh toán',
        created_at: today(8, 15),
        updated_at: today(8, 15),
        items: [
            makeItem(1, 0, 2, 0, 1, 1500000),
            makeItem(1, 1, 3, 2, 1, 1000000),
        ],
    },

    // 2 — Today, confirmed, paid, online
    {
        order_id: 2,
        order_number: 'ORD-2026-00042',
        customer_id: 2,
        coupon_id: null,
        customer_name: 'Trần Thị Bình',
        customer_phone: '0987654321',
        shipping_province: 'Hà Nội',
        shipping_district: 'Quận Hoàn Kiếm',
        shipping_ward: 'Phường Hàng Bạc',
        shipping_address: '45 Hàng Bạc',
        order_type: 'Online',
        subtotal: 850000,
        shipping_cost: 25000,
        coupon_discount_amount: 0,
        total_amount: 875000,
        status: 'Đã xác nhận',
        payment_status: 'Đã thanh toán',
        created_at: today(9, 30),
        updated_at: today(9, 45),
        items: [
            makeItem(2, 4, 1, 1, 1, 850000),
        ],
    },

    // 3 — Today, shipping, paid, online, with coupon
    {
        order_id: 3,
        order_number: 'ORD-2026-00043',
        customer_id: 3,
        coupon_id: 2,
        customer_name: 'Lê Hoàng Cường',
        customer_phone: '0901122334',
        shipping_province: 'Đà Nẵng',
        shipping_district: 'Quận Hải Châu',
        shipping_ward: 'Phường Thanh Bình',
        shipping_address: '78 Trần Phú',
        order_type: 'Online',
        subtotal: 3200000,
        shipping_cost: 35000,
        coupon_discount_amount: 30000,
        total_amount: 3205000,
        status: 'Đang giao',
        payment_status: 'Đã thanh toán',
        created_at: today(7, 0),
        updated_at: today(9, 0),
        items: [
            makeItem(3, 0, 4, 0, 1, 1500000),
            makeItem(3, 2, 2, 3, 1, 950000),
            makeItem(3, 5, 0, 4, 1, 750000),
        ],
    },

    // 4 — Yesterday, delivered, paid, in-store
    {
        order_id: 4,
        order_number: 'ORD-2026-00040',
        customer_id: 4,
        coupon_id: null,
        customer_name: 'Phạm Minh Dung',
        customer_phone: '0938765432',
        shipping_province: 'TP. Hồ Chí Minh',
        shipping_district: 'Quận 7',
        shipping_ward: 'Phường Tân Phú',
        shipping_address: '200 Nguyễn Thị Thập',
        order_type: 'In-store',
        subtotal: 1250000,
        shipping_cost: 0,
        coupon_discount_amount: 0,
        total_amount: 1250000,
        status: 'Đã giao',
        payment_status: 'Đã thanh toán',
        created_at: daysAgo(1, 14, 20),
        updated_at: daysAgo(1, 14, 30),
        items: [
            makeItem(4, 3, 3, 4, 1, 1250000),
        ],
    },

    // 5 — Yesterday, returned, paid then refund, online
    {
        order_id: 5,
        order_number: 'ORD-2026-00039',
        customer_id: 5,
        coupon_id: 3,
        customer_name: 'Hoàng Thị Em',
        customer_phone: '0976543210',
        shipping_province: 'TP. Hồ Chí Minh',
        shipping_district: 'Quận Bình Thạnh',
        shipping_ward: 'Phường 25',
        shipping_address: '55 Điện Biên Phủ',
        order_type: 'Online',
        subtotal: 2100000,
        shipping_cost: 30000,
        coupon_discount_amount: 50000,
        total_amount: 2080000,
        status: 'Trả hàng/Hoàn tiền',
        payment_status: 'Đã thanh toán',
        created_at: daysAgo(1, 10, 0),
        updated_at: daysAgo(0, 8, 0),
        items: [
            makeItem(5, 1, 1, 2, 1, 1100000),
            makeItem(5, 5, 0, 0, 1, 1000000),
        ],
    },

    // 6 — 2 days ago, cancelled, unpaid, online
    {
        order_id: 6,
        order_number: 'ORD-2026-00038',
        customer_id: 6,
        coupon_id: null,
        customer_name: 'Võ Thanh Phong',
        customer_phone: '0918877665',
        shipping_province: 'Cần Thơ',
        shipping_district: 'Quận Ninh Kiều',
        shipping_ward: 'Phường An Hội',
        shipping_address: '12 Đường 30/4',
        order_type: 'Online',
        subtotal: 750000,
        shipping_cost: 40000,
        coupon_discount_amount: 0,
        total_amount: 790000,
        status: 'Đã hủy',
        payment_status: 'Chưa thanh toán',
        created_at: daysAgo(2, 16, 45),
        updated_at: daysAgo(2, 17, 0),
        items: [
            makeItem(6, 5, 2, 1, 1, 750000),
        ],
    },

    // 7 — 3 days ago, delivered, paid, in-store, with coupon
    {
        order_id: 7,
        order_number: 'ORD-2026-00037',
        customer_id: 7,
        coupon_id: 1,
        customer_name: 'Đặng Ngọc Hà',
        customer_phone: '0945566778',
        shipping_province: 'TP. Hồ Chí Minh',
        shipping_district: 'Quận 3',
        shipping_ward: 'Phường 6',
        shipping_address: '88 Võ Văn Tần',
        order_type: 'In-store',
        subtotal: 4500000,
        shipping_cost: 0,
        coupon_discount_amount: 900000,
        total_amount: 3600000,
        status: 'Đã giao',
        payment_status: 'Đã thanh toán',
        created_at: daysAgo(3, 11, 30),
        updated_at: daysAgo(3, 12, 0),
        items: [
            makeItem(7, 0, 4, 0, 2, 1500000),
            makeItem(7, 2, 1, 3, 1, 950000),
            makeItem(7, 4, 2, 1, 1, 850000),
        ],
    },

    // 8 — 5 days ago, cancelled, paid (refund pending), online
    {
        order_id: 8,
        order_number: 'ORD-2026-00035',
        customer_id: 8,
        coupon_id: null,
        customer_name: 'Bùi Quốc Khánh',
        customer_phone: '0923344556',
        shipping_province: 'Hải Phòng',
        shipping_district: 'Quận Ngô Quyền',
        shipping_ward: 'Phường Máy Chai',
        shipping_address: '34 Lạch Tray',
        order_type: 'Online',
        subtotal: 1800000,
        shipping_cost: 35000,
        coupon_discount_amount: 0,
        total_amount: 1835000,
        status: 'Đã hủy',
        payment_status: 'Đã thanh toán',
        created_at: daysAgo(5, 9, 15),
        updated_at: daysAgo(4, 10, 0),
        items: [
            makeItem(8, 3, 0, 4, 1, 1250000),
            makeItem(8, 4, 3, 0, 1, 550000),
        ],
    },

    // 9 — Today, pending, paid (prepaid), online
    {
        order_id: 9,
        order_number: 'ORD-2026-00044',
        customer_id: 2,
        coupon_id: null,
        customer_name: 'Trần Thị Bình',
        customer_phone: '0987654321',
        shipping_province: 'Hà Nội',
        shipping_district: 'Quận Cầu Giấy',
        shipping_ward: 'Phường Dịch Vọng',
        shipping_address: '15 Xuân Thủy',
        order_type: 'Online',
        subtotal: 950000,
        shipping_cost: 20000,
        coupon_discount_amount: 0,
        total_amount: 970000,
        status: 'Chờ xác nhận',
        payment_status: 'Đã thanh toán',
        created_at: today(9, 50),
        updated_at: today(9, 50),
        items: [
            makeItem(9, 2, 1, 3, 1, 950000),
        ],
    },

    // 10 — 7 days ago, delivered, paid, in-store
    {
        order_id: 10,
        order_number: 'ORD-2026-00030',
        customer_id: 1,
        coupon_id: 2,
        customer_name: 'Nguyễn Văn An',
        customer_phone: '0912345678',
        shipping_province: 'TP. Hồ Chí Minh',
        shipping_district: 'Quận 1',
        shipping_ward: 'Phường Bến Thành',
        shipping_address: '10 Lê Lợi',
        order_type: 'In-store',
        subtotal: 1700000,
        shipping_cost: 0,
        coupon_discount_amount: 30000,
        total_amount: 1670000,
        status: 'Đã giao',
        payment_status: 'Đã thanh toán',
        created_at: daysAgo(7, 15, 0),
        updated_at: daysAgo(7, 15, 10),
        items: [
            makeItem(10, 1, 2, 2, 1, 1100000),
            makeItem(10, 5, 0, 0, 1, 600000),
        ],
    },
];

// ── Status color map (used by components) ───────────────────────
export const STATUS_CONFIG = {
    'Chờ xác nhận': { color: '#EAB308', bg: '#FEF9C3', label: 'Chờ xác nhận' },
    'Đã xác nhận': { color: '#3B82F6', bg: '#DBEAFE', label: 'Đã xác nhận' },
    'Đang giao': { color: '#8B5CF6', bg: '#EDE9FE', label: 'Đang giao' },
    'Đã giao': { color: '#22C55E', bg: '#DCFCE7', label: 'Đã giao' },
    'Trả hàng/Hoàn tiền': { color: '#F97316', bg: '#FFF7ED', label: 'Trả hàng/Hoàn tiền' },
    'Đã hủy': { color: '#EF4444', bg: '#FEE2E2', label: 'Đã hủy' },
};

export const PAYMENT_CONFIG = {
    'Đã thanh toán': { color: '#16A34A', bg: '#DCFCE7' },
    'Chưa thanh toán': { color: '#EA580C', bg: '#FFF7ED' },
};

// ── All possible statuses (for tabs) ────────────────────────────
export const ALL_STATUSES = [
    'Tất cả',
    'Chờ xác nhận',
    'Đã xác nhận',
    'Đang giao',
    'Đã giao',
    'Trả hàng/Hoàn tiền',
    'Đã hủy',
];

// ── Helper: format VND currency ─────────────────────────────────
export const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
};

// ── Helper: format date dd/mm/yyyy HH:mm ────────────────────────
export const formatDate = (isoStr) => {
    const d = new Date(isoStr);
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// ── Helper: relative time string (Vietnamese) ───────────────────
export const relativeTime = (isoStr) => {
    if (!isoStr) return '';
    const diff = Date.now() - new Date(isoStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Vừa xong';
    if (mins < 60) return `${mins} phút trước`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} giờ trước`;
    const days = Math.floor(hrs / 24);
    if (days === 1) return 'Hôm qua';
    return `${days} ngày trước`;
};

// ── Helper: get customer initials for avatar ────────────────────
export const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// ── Helper: lookup coupon by id ─────────────────────────────────
export const getCouponById = (id) => coupons.find((c) => c.coupon_id === id) || null;

// ── Helper: lookup customer by id ───────────────────────────────
export const getCustomerById = (id) => customers.find((c) => c.customer_id === id) || null;

// ═══════════════════════════════════════════════════════════════
// Normalize backend (camelCase) → frontend (snake_case) format
// ═══════════════════════════════════════════════════════════════

/**
 * Normalize an order item from backend DTO to frontend format.
 */
export const normalizeOrderItem = (item) => {
    if (!item) return item;
    return {
        order_item_id: item.orderItemId ?? item.order_item_id,
        variant_id: item.variantId ?? item.variant_id,
        quantity: item.quantity,
        unit_price: item.unitPrice ?? item.unit_price,
        total_price: item.totalPrice ?? item.total_price,
        product: item.product ? {
            product_id: item.product.productId ?? item.product.product_id,
            name: item.product.name,
            image_url: item.product.imageUrl ?? item.product.image_url,
        } : null,
        size: item.size ? {
            size_id: item.size.sizeId ?? item.size.size_id,
            size_name: item.size.sizeName ?? item.size.size_name,
        } : null,
        color: item.color ? {
            color_id: item.color.colorId ?? item.color.color_id,
            color_name: item.color.colorName ?? item.color.color_name,
            color_code: item.color.colorCode ?? item.color.color_code,
        } : null,
    };
};

/**
 * Normalize an order from backend DTO to the frontend format
 * used by OrderTable, OrderSlideOver, etc.
 */
export const normalizeOrder = (o) => {
    if (!o) return o;
    return {
        order_id: o.orderId ?? o.order_id,
        order_number: o.orderNumber ?? o.order_number,
        customer_id: o.customerId ?? o.customer_id,
        coupon_id: o.couponId ?? o.coupon_id,
        customer_name: o.customerName ?? o.customer_name,
        customer_phone: o.customerPhone ?? o.customer_phone,
        shipping_province: o.shippingProvince ?? o.shipping_province,
        shipping_district: o.shippingDistrict ?? o.shipping_district,
        shipping_ward: o.shippingWard ?? o.shipping_ward,
        shipping_address: o.shippingAddress ?? o.shipping_address,
        order_type: o.orderType ?? o.order_type,
        subtotal: o.subtotal,
        shipping_cost: o.shippingCost ?? o.shipping_cost,
        coupon_discount_amount: o.couponDiscountAmount ?? o.coupon_discount_amount,
        total_amount: o.totalAmount ?? o.total_amount,
        status: o.status,
        payment_status: o.paymentStatus ?? o.payment_status,
        created_at: o.createdAt ?? o.created_at,
        updated_at: o.updatedAt ?? o.updated_at,
        // itemCount is from OrderSummaryResponse (list view)
        item_count: o.itemCount ?? o.item_count,
        // items is from OrderResponse (detail view)
        items: o.items ? o.items.map(normalizeOrderItem) : undefined,
    };
};
