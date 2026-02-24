/**
 * Mock data for POS (Bán hàng tại quầy) page.
 */

// ── Categories ──────────────────────────────────────────────────
export const categories = [
    { category_id: 1, name: 'Giày chạy bộ' },
    { category_id: 2, name: 'Giày da công sở' },
    { category_id: 3, name: 'Sneaker' },
    { category_id: 4, name: 'Giày thể thao' },
    { category_id: 5, name: 'Dép da' },
    { category_id: 6, name: 'Giày boot' },
];

export const brands = [
    { brand_id: 1, name: 'Nike' },
    { brand_id: 2, name: 'Adidas' },
    { brand_id: 3, name: 'New Balance' },
    { brand_id: 4, name: "Biti's Hunter" },
    { brand_id: 5, name: 'Converse' },
];

export const sizes = [
    { size_id: 1, size_name: '38' },
    { size_id: 2, size_name: '39' },
    { size_id: 3, size_name: '40' },
    { size_id: 4, size_name: '41' },
    { size_id: 5, size_name: '42' },
    { size_id: 6, size_name: '43' },
    { size_id: 7, size_name: '44' },
];

export const colors = [
    { color_id: 1, color_name: 'Đen', color_code: '#1a1a1a' },
    { color_id: 2, color_name: 'Trắng', color_code: '#F5F5F5' },
    { color_id: 3, color_name: 'Đỏ', color_code: '#EF4444' },
    { color_id: 4, color_name: 'Nâu', color_code: '#92400E' },
    { color_id: 5, color_name: 'Xanh Navy', color_code: '#1E3A5F' },
    { color_id: 6, color_name: 'Xám', color_code: '#6B7280' },
];

// ── Products with variants ───────────────────────────────────────
let variantId = 1;
const mkV = (pid, sid, cid, price, cost, stock) => ({
    variant_id: variantId++, product_id: pid,
    size_id: sid, color_id: cid, price, cost_price: cost, stock, status: 1,
});

export const products = [
    {
        product_id: 1, name: 'Nike Air Max 270 React', description: 'Giày chạy bộ cao cấp', category_id: 1, brand_id: 1, status: 1,
        image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop',
        variants: [mkV(1, 2, 1, 2890000, 1800000, 12), mkV(1, 3, 1, 2890000, 1800000, 8), mkV(1, 4, 1, 2890000, 1800000, 5), mkV(1, 3, 2, 2990000, 1850000, 3), mkV(1, 4, 3, 3090000, 1900000, 6)]
    },
    {
        product_id: 2, name: 'Adidas Ultraboost 22', description: 'Sneaker công nghệ Boost', category_id: 4, brand_id: 2, status: 1,
        image_url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=300&h=300&fit=crop',
        variants: [mkV(2, 2, 1, 3200000, 2000000, 10), mkV(2, 3, 1, 3200000, 2000000, 7), mkV(2, 4, 5, 3350000, 2100000, 4), mkV(2, 5, 2, 3200000, 2000000, 9)]
    },
    {
        product_id: 3, name: 'New Balance 574 Classic', description: 'Retro sneaker', category_id: 3, brand_id: 3, status: 1,
        image_url: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=300&h=300&fit=crop',
        variants: [mkV(3, 2, 6, 2150000, 1300000, 15), mkV(3, 3, 6, 2150000, 1300000, 11), mkV(3, 4, 1, 2150000, 1300000, 6), mkV(3, 5, 4, 2250000, 1350000, 3), mkV(3, 3, 5, 2250000, 1350000, 8), mkV(3, 6, 1, 2150000, 1300000, 0)]
    },
    {
        product_id: 4, name: "Biti's Hunter X Festive", description: 'Giày thể thao Việt Nam', category_id: 4, brand_id: 4, status: 1,
        image_url: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300&h=300&fit=crop',
        variants: [mkV(4, 2, 1, 850000, 450000, 20), mkV(4, 3, 1, 850000, 450000, 18), mkV(4, 4, 2, 850000, 450000, 14), mkV(4, 5, 3, 890000, 470000, 9)]
    },
    {
        product_id: 5, name: 'Converse Chuck Taylor 70', description: 'Canvas cổ điển cao cấp', category_id: 3, brand_id: 5, status: 1,
        image_url: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=300&h=300&fit=crop',
        variants: [mkV(5, 2, 1, 1650000, 950000, 12), mkV(5, 3, 1, 1650000, 950000, 10), mkV(5, 4, 2, 1650000, 950000, 7), mkV(5, 3, 3, 1750000, 1000000, 5), mkV(5, 5, 5, 1750000, 1000000, 3)]
    },
    {
        product_id: 6, name: 'Nike Court Vision Low', description: 'Giày sneaker công sở', category_id: 2, brand_id: 1, status: 1,
        image_url: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=300&h=300&fit=crop',
        variants: [mkV(6, 3, 2, 1990000, 1200000, 8), mkV(6, 4, 2, 1990000, 1200000, 6), mkV(6, 5, 1, 1990000, 1200000, 11)]
    },
    {
        product_id: 7, name: 'Adidas Samba OG', description: 'Sneaker retro cổ điển', category_id: 3, brand_id: 2, status: 1,
        image_url: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=300&h=300&fit=crop',
        variants: [mkV(7, 2, 1, 2650000, 1600000, 9), mkV(7, 3, 1, 2650000, 1600000, 7), mkV(7, 4, 2, 2650000, 1600000, 4), mkV(7, 5, 4, 2750000, 1650000, 2)]
    },
    {
        product_id: 8, name: 'Dép Da Cao Cấp Handmade', description: 'Dép da bò may thủ công', category_id: 5, brand_id: 4, status: 1,
        image_url: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=300&h=300&fit=crop',
        variants: [mkV(8, 3, 4, 450000, 200000, 25), mkV(8, 4, 4, 450000, 200000, 20), mkV(8, 5, 1, 450000, 200000, 18), mkV(8, 6, 1, 450000, 200000, 15)]
    },
    {
        product_id: 9, name: 'Giày Boot Dr. Martens Style', description: 'Boot da cổ cao', category_id: 6, brand_id: 3, status: 1,
        image_url: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=300&h=300&fit=crop',
        variants: [mkV(9, 3, 1, 3450000, 2100000, 5), mkV(9, 4, 1, 3450000, 2100000, 3), mkV(9, 5, 4, 3550000, 2200000, 4)]
    },
    {
        product_id: 10, name: "Biti's Hunter Street Neon", description: 'Chạy bộ phối neon', category_id: 1, brand_id: 4, status: 1,
        image_url: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=300&h=300&fit=crop',
        variants: [mkV(10, 2, 1, 750000, 380000, 22), mkV(10, 3, 1, 750000, 380000, 19), mkV(10, 4, 3, 790000, 400000, 14), mkV(10, 5, 5, 790000, 400000, 10), mkV(10, 3, 6, 750000, 380000, 8)]
    },
];

// ── Customers ────────────────────────────────────────────────────
export const customers = [
    { customer_id: 1, full_name: 'Nguyễn Văn An', phone: '0912345678', email: 'an.nguyen@gmail.com', gender: 'Nam', status: 1 },
    { customer_id: 2, full_name: 'Trần Thị Bình', phone: '0987654321', email: 'binh.tran@gmail.com', gender: 'Nữ', status: 1 },
    { customer_id: 3, full_name: 'Lê Hoàng Cường', phone: '0901122334', email: 'cuong.le@gmail.com', gender: 'Nam', status: 1 },
    { customer_id: 4, full_name: 'Phạm Minh Dung', phone: '0938765432', email: 'dung.pham@gmail.com', gender: 'Nam', status: 1 },
    { customer_id: 5, full_name: 'Hoàng Thị Em', phone: '0976543210', email: 'em.hoang@gmail.com', gender: 'Nữ', status: 1 },
];

// ── Coupons ──────────────────────────────────────────────────────
export const coupons = [
    { coupon_id: 1, code: 'SALE10', name: 'Giảm 10% đơn hàng', type: 'Percentage', value: 10, minimum_amount: 500000, maximum_discount: 200000, start_date: '2026-01-01T00:00:00', end_date: '2026-12-31T23:59:59', status: 1 },
    { coupon_id: 2, code: 'GIAM50K', name: 'Giảm 50K', type: 'Fixed Amount', value: 50000, minimum_amount: 300000, maximum_discount: 50000, start_date: '2026-01-01T00:00:00', end_date: '2026-12-31T23:59:59', status: 1 },
    { coupon_id: 3, code: 'VIP20', name: 'VIP giảm 20%', type: 'Percentage', value: 20, minimum_amount: 1000000, maximum_discount: 500000, start_date: '2026-01-01T00:00:00', end_date: '2026-12-31T23:59:59', status: 1 },
];

// ── Recent POS orders ────────────────────────────────────────────
export const recentOrders = [
    { order_id: 101, order_number: 'POS-20260224-00039', customer_name: 'Nguyễn Văn An', total_amount: 2890000, created_at: '2026-02-24T09:15:00+07:00', status: 'Đã xác nhận', payment_status: 'Đã thanh toán' },
    { order_id: 102, order_number: 'POS-20260224-00038', customer_name: 'Khách lẻ', total_amount: 1650000, created_at: '2026-02-24T08:42:00+07:00', status: 'Đã xác nhận', payment_status: 'Đã thanh toán' },
    { order_id: 103, order_number: 'POS-20260224-00037', customer_name: 'Trần Thị Bình', total_amount: 4300000, created_at: '2026-02-24T08:05:00+07:00', status: 'Đã xác nhận', payment_status: 'Đã thanh toán' },
];

// ── Helpers ──────────────────────────────────────────────────────
export const formatVND = (amount) => new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';

let orderSeq = 40;
export const generateOrderNumber = () => {
    const d = new Date();
    const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    return `POS-${ymd}-${String(++orderSeq).padStart(5, '0')}`;
};

export const getSizeName = (sizeId) => sizes.find(s => s.size_id === sizeId)?.size_name || '?';
export const getColor = (colorId) => colors.find(c => c.color_id === colorId) || { color_name: '?', color_code: '#ccc' };
export const getBrandName = (brandId) => brands.find(b => b.brand_id === brandId)?.name || '';
export const getCategoryName = (catId) => categories.find(c => c.category_id === catId)?.name || '';

export const getPriceRange = (variants) => {
    const prices = variants.filter(v => v.status === 1).map(v => v.price);
    if (!prices.length) return '—';
    const min = Math.min(...prices), max = Math.max(...prices);
    return min === max ? formatVND(min) : `${formatVND(min)} – ${formatVND(max)}`;
};

export const getInitials = (name) => {
    if (!name) return '?';
    const p = name.trim().split(/\s+/);
    return p.length === 1 ? p[0][0].toUpperCase() : (p[0][0] + p[p.length - 1][0]).toUpperCase();
};

export const formatDateTime = (isoStr) => {
    const d = new Date(isoStr);
    const pad = n => String(n).padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
