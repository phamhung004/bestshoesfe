// ─── Cart Mock Data ────────────────────────────────────
// All data structures match the DB schema described in the spec.

import { formatVND, BRANDS, COLORS, SIZES } from '../Catalog2/mockCatalogData';
export { formatVND };

// ─── FREESHIP THRESHOLD ────────────────────────────────
export const FREESHIP_THRESHOLD = 500000;

// ─── CART ITEMS ────────────────────────────────────────
export const INITIAL_CART_ITEMS = [
    {
        cart_item_id: 1,
        variant_id: 101,
        quantity: 1,
        product: {
            product_id: 4,
            name: 'Nike Pegasus 40',
            brand_id: 1,
            description: 'Phiên bản thứ 40 của dòng Pegasus huyền thoại.',
        },
        variant: {
            variant_id: 101,
            size_id: 6,   // Size 40
            color_id: 2,  // Trắng
            price: 3800000,
            stock: 8,
        },
        gender: 'Nam',
        promotion: null,
        image_url: 'https://placehold.co/400x400/FAFAFA/111111?text=Pegasus+40',
    },
    {
        cart_item_id: 2,
        variant_id: 102,
        quantity: 1,
        product: {
            product_id: 6,
            name: 'Adidas Stan Smith',
            brand_id: 2,
            description: 'Biểu tượng thời trang kinh điển.',
        },
        variant: {
            variant_id: 102,
            size_id: 8,   // Size 42
            color_id: 4,  // Nâu
            price: 2000000,
            stock: 3,
        },
        gender: 'Nam',
        promotion: {
            discount_percentage: 10,
            name: 'SALE MÙA HÈ',
        },
        image_url: 'https://placehold.co/400x400/92400E/FFFFFF?text=Stan+Smith',
    },
    {
        cart_item_id: 3,
        variant_id: 103,
        quantity: 2,
        product: {
            product_id: 15,
            name: 'Vans Old Skool',
            brand_id: 6,
            description: 'Giày skate huyền thoại với sọc jazz stripe đặc trưng.',
        },
        variant: {
            variant_id: 103,
            size_id: 7,   // Size 41
            color_id: 1,  // Đen
            price: 1850000,
            stock: 12,
        },
        gender: 'Unisex',
        promotion: null,
        image_url: 'https://placehold.co/400x400/1a1a1a/FFFFFF?text=Old+Skool',
    },
];

// ─── SAVED FOR LATER ───────────────────────────────────
export const INITIAL_SAVED_ITEMS = [
    {
        saved_item_id: 1,
        variant_id: 201,
        product: {
            product_id: 13,
            name: 'Converse Chuck Taylor',
            brand_id: 5,
        },
        variant: {
            variant_id: 201,
            size_id: 5,  // Size 39
            color_id: 1, // Đen
            price: 1450000,
            stock: 22,
        },
        image_url: 'https://placehold.co/400x400/1a1a1a/FFFFFF?text=Chuck+Taylor',
    },
];

// ─── COUPONS ───────────────────────────────────────────
export const COUPONS = [
    {
        code: 'SALE10',
        name: 'Giảm 10%',
        type: 'Percentage',
        value: 10,
        minimum_amount: 500000,
        maximum_discount: 500000,
        status: 1,
    },
    {
        code: 'GIAM50K',
        name: 'Giảm 50.000₫',
        type: 'Fixed Amount',
        value: 50000,
        minimum_amount: 300000,
        maximum_discount: 50000,
        status: 1,
    },
    {
        code: 'VIP20',
        name: 'Giảm 20% VIP',
        type: 'Percentage',
        value: 20,
        minimum_amount: 1000000,
        maximum_discount: 500000,
        status: 1,
    },
];

// ─── UPSELL PRODUCTS (CatalogProductCard compatible) ───
const daysAgo = (n) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString();
};

export const UPSELL_PRODUCTS = [
    {
        product_id: 100,
        name: 'Nike Air Force 1',
        description: 'Biểu tượng sneaker kinh điển với đệm Air êm ái.',
        category_id: 2,
        brand_id: 1,
        material_id: 2,
        status: 1,
        rating: 4.6,
        review_count: 512,
        isNew: false,
        isBestseller: true,
        created_at: daysAgo(60),
        variants: [
            { variant_id: 301, size_id: 6, color_id: 2, price: 1850000, stock: 15, status: 1 },
            { variant_id: 302, size_id: 7, color_id: 1, price: 1850000, stock: 10, status: 1 },
            { variant_id: 303, size_id: 8, color_id: 2, price: 1850000, stock: 8, status: 1 },
        ],
        images: [
            { image_url: 'https://placehold.co/400x400/FAFAFA/111111?text=Air+Force+1', is_primary: 1, variant_id: 301, sort_order: 1 },
            { image_url: 'https://placehold.co/400x400/1a1a1a/FFFFFF?text=AF1+Black', is_primary: 1, variant_id: 302, sort_order: 1 },
        ],
    },
    {
        product_id: 101,
        name: 'Adidas NMD R1',
        description: 'Sneaker thời trang lấy cảm hứng từ chạy bộ.',
        category_id: 2,
        brand_id: 2,
        material_id: 4,
        status: 1,
        rating: 4.4,
        review_count: 287,
        isNew: true,
        isBestseller: false,
        created_at: daysAgo(10),
        variants: [
            { variant_id: 304, size_id: 6, color_id: 1, price: 2200000, stock: 12, status: 1 },
            { variant_id: 305, size_id: 7, color_id: 5, price: 2200000, stock: 9, status: 1 },
        ],
        images: [
            { image_url: 'https://placehold.co/400x400/111111/FFFFFF?text=NMD+R1', is_primary: 1, variant_id: 304, sort_order: 1 },
            { image_url: 'https://placehold.co/400x400/3B82F6/FFFFFF?text=NMD+Blue', is_primary: 1, variant_id: 305, sort_order: 1 },
        ],
    },
    {
        product_id: 102,
        name: "Biti's Hunter Street",
        description: 'Giày thời trang đường phố thiết kế năng động.',
        category_id: 2,
        brand_id: 4,
        material_id: 3,
        status: 1,
        rating: 4.0,
        review_count: 189,
        isNew: false,
        isBestseller: false,
        created_at: daysAgo(30),
        variants: [
            { variant_id: 306, size_id: 5, color_id: 1, price: 890000, stock: 25, status: 1 },
            { variant_id: 307, size_id: 6, color_id: 2, price: 890000, stock: 18, status: 1 },
        ],
        images: [
            { image_url: 'https://placehold.co/400x400/1a1a1a/FFFFFF?text=Hunter+Street', is_primary: 1, variant_id: 306, sort_order: 1 },
            { image_url: 'https://placehold.co/400x400/F5F5F5/1a1a1a?text=Hunter+St+Wh', is_primary: 1, variant_id: 307, sort_order: 1 },
        ],
    },
    {
        product_id: 103,
        name: 'New Balance 327',
        description: 'Phong cách retro hiện đại, đế xẻ rãnh độc đáo.',
        category_id: 2,
        brand_id: 3,
        material_id: 6,
        status: 1,
        rating: 4.5,
        review_count: 203,
        isNew: false,
        isBestseller: true,
        created_at: daysAgo(45),
        variants: [
            { variant_id: 308, size_id: 6, color_id: 7, price: 2100000, stock: 7, status: 1 },
            { variant_id: 309, size_id: 7, color_id: 6, price: 2100000, stock: 11, status: 1 },
        ],
        images: [
            { image_url: 'https://placehold.co/400x400/FEF3C7/92400E?text=NB+327+Cream', is_primary: 1, variant_id: 308, sort_order: 1 },
            { image_url: 'https://placehold.co/400x400/9CA3AF/FFFFFF?text=NB+327+Grey', is_primary: 1, variant_id: 309, sort_order: 1 },
        ],
    },
    {
        product_id: 104,
        name: 'Vans Authentic',
        description: 'Giày canvas cổ điển, đơn giản, dễ phối đồ.',
        category_id: 2,
        brand_id: 6,
        material_id: 3,
        status: 1,
        rating: 4.2,
        review_count: 356,
        isNew: false,
        isBestseller: false,
        created_at: daysAgo(90),
        variants: [
            { variant_id: 310, size_id: 5, color_id: 1, price: 1200000, stock: 20, status: 1 },
            { variant_id: 311, size_id: 6, color_id: 3, price: 1200000, stock: 14, status: 1 },
        ],
        images: [
            { image_url: 'https://placehold.co/400x400/1a1a1a/FFFFFF?text=Vans+Authentic', is_primary: 1, variant_id: 310, sort_order: 1 },
            { image_url: 'https://placehold.co/400x400/EF4444/FFFFFF?text=Vans+Auth+Red', is_primary: 1, variant_id: 311, sort_order: 1 },
        ],
    },
];

// ─── HELPERS ───────────────────────────────────────────
export const getBrandName = (brandId) => {
    const brand = BRANDS.find(b => b.brand_id === brandId);
    return brand ? brand.name : '';
};

export const getColorInfo = (colorId) => {
    const color = COLORS.find(c => c.color_id === colorId);
    return color || { color_name: '', color_code: '#ccc' };
};

export const getSizeName = (sizeId) => {
    const size = SIZES.find(s => s.size_id === sizeId);
    return size ? size.size_name : '';
};

export const getItemPrice = (item) => {
    if (item.promotion && item.promotion.promotion_price != null) {
        return item.promotion.promotion_price;
    }
    if (item.promotion && item.promotion.discount_percentage) {
        return item.variant.price * (1 - item.promotion.discount_percentage / 100);
    }
    return item.variant.price;
};

export const getItemSubtotal = (item) => {
    return getItemPrice(item) * item.quantity;
};
