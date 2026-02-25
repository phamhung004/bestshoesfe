// ─── VIEW MODE CONSTANT ────────────────────────────────
// Set to 'pagination' for page numbers or 'loadmore' for "Xem thêm" button
export const VIEW_MODE = 'pagination';
export const PRODUCTS_PER_PAGE = 8;

// ─── CATEGORIES (nested tree) ──────────────────────────
export const CATEGORIES = [
    { category_id: 1, parent_id: null, name: 'Giày chạy bộ', status: 1 },
    { category_id: 2, parent_id: null, name: 'Sneaker', status: 1 },
    { category_id: 3, parent_id: null, name: 'Giày da', status: 1 },
    { category_id: 4, parent_id: 3, name: 'Giày da nam', status: 1 },
    { category_id: 5, parent_id: 3, name: 'Giày da nữ', status: 1 },
    { category_id: 6, parent_id: null, name: 'Dép', status: 1 },
];

// ─── BRANDS ────────────────────────────────────────────
export const BRANDS = [
    { brand_id: 1, name: 'Nike', logo: '🏃', origin_country: 'USA' },
    { brand_id: 2, name: 'Adidas', logo: '⚽', origin_country: 'Germany' },
    { brand_id: 3, name: 'New Balance', logo: '🏅', origin_country: 'USA' },
    { brand_id: 4, name: "Biti's Hunter", logo: '🇻🇳', origin_country: 'Vietnam' },
    { brand_id: 5, name: 'Converse', logo: '⭐', origin_country: 'USA' },
    { brand_id: 6, name: 'Vans', logo: '🛹', origin_country: 'USA' },
    { brand_id: 7, name: 'Puma', logo: '🐆', origin_country: 'Germany' },
    { brand_id: 8, name: 'Skechers', logo: '👟', origin_country: 'USA' },
];

// ─── MATERIALS ─────────────────────────────────────────
export const MATERIALS = [
    { material_id: 1, material_name: 'Da thật' },
    { material_id: 2, material_name: 'Da tổng hợp' },
    { material_id: 3, material_name: 'Vải canvas' },
    { material_id: 4, material_name: 'Lưới thoáng khí' },
    { material_id: 5, material_name: 'Cao su' },
    { material_id: 6, material_name: 'Da lộn' },
];

// ─── SIZES ─────────────────────────────────────────────
export const SIZES = [
    { size_id: 1, size_name: '35' },
    { size_id: 2, size_name: '36' },
    { size_id: 3, size_name: '37' },
    { size_id: 4, size_name: '38' },
    { size_id: 5, size_name: '39' },
    { size_id: 6, size_name: '40' },
    { size_id: 7, size_name: '41' },
    { size_id: 8, size_name: '42' },
    { size_id: 9, size_name: '43' },
    { size_id: 10, size_name: '44' },
    { size_id: 11, size_name: '45' },
];

// ─── COLORS ────────────────────────────────────────────
export const COLORS = [
    { color_id: 1, color_name: 'Đen', color_code: '#000000' },
    { color_id: 2, color_name: 'Trắng', color_code: '#FFFFFF' },
    { color_id: 3, color_name: 'Đỏ', color_code: '#EF4444' },
    { color_id: 4, color_name: 'Nâu', color_code: '#92400E' },
    { color_id: 5, color_name: 'Xanh dương', color_code: '#3B82F6' },
    { color_id: 6, color_name: 'Xám', color_code: '#9CA3AF' },
    { color_id: 7, color_name: 'Kem', color_code: '#FEF3C7' },
    { color_id: 8, color_name: 'Navy', color_code: '#1E3A5F' },
];

// ─── PROMOTIONS ────────────────────────────────────────
export const PROMOTIONS = [
    {
        promotion_id: 1,
        name: 'SALE MÙA HÈ',
        discount_percentage: 20,
        fixed_price: null,
        is_active: 1,
        start_date: '2026-01-01',
        end_date: '2026-06-30',
        // applies to product_ids: [1, 2]
        product_variant_ids: [1, 2, 3, 4, 5, 6, 7, 8],
    },
    {
        promotion_id: 2,
        name: 'CLEARANCE',
        discount_percentage: null,
        fixed_price: 200000,
        is_active: 1,
        start_date: '2026-01-15',
        end_date: '2026-04-30',
        // applies to product_ids: [5, 6]
        product_variant_ids: [17, 18, 19, 20, 21, 22, 23, 24],
    },
    {
        promotion_id: 3,
        name: 'NEW ARRIVAL',
        discount_percentage: 10,
        fixed_price: null,
        is_active: 1,
        start_date: '2026-02-01',
        end_date: '2026-05-31',
        // applies to product_ids: [10, 11]
        product_variant_ids: [37, 38, 39, 40, 41, 42, 43, 44],
    },
];

// ─── helper: generate a date within last N days ────────
const daysAgo = (n) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString();
};

// ─── PRODUCTS ──────────────────────────────────────────
export const PRODUCTS = [
    // ── Nike (4) ──────────────────────────────────────────
    {
        product_id: 1,
        name: 'Nike Air Max 270',
        description: 'Giày chạy bộ Nike Air Max 270 với đệm Air Max mang lại cảm giác êm ái suốt cả ngày. Thiết kế thể thao hiện đại, phù hợp cho chạy bộ và mặc hàng ngày.',
        category_id: 1,
        brand_id: 1,
        material_id: 4,
        status: 1,
        rating: 4.5,
        review_count: 342,
        isNew: false,
        isBestseller: true,
        created_at: daysAgo(60),
        variants: [
            { variant_id: 1, size_id: 6, color_id: 1, price: 3200000, stock: 12, status: 1 },
            { variant_id: 2, size_id: 7, color_id: 1, price: 3200000, stock: 8, status: 1 },
            { variant_id: 3, size_id: 8, color_id: 2, price: 3200000, stock: 3, status: 1 },
            { variant_id: 4, size_id: 9, color_id: 5, price: 3400000, stock: 0, status: 1 },
        ],
        images: [
            { image_url: 'https://placehold.co/400x400/1a1a1a/FFFFFF?text=Air+Max+270', is_primary: 1, variant_id: 1, sort_order: 1 },
            { image_url: 'https://placehold.co/400x400/333333/FFFFFF?text=Air+Max+Side', is_primary: 0, variant_id: 1, sort_order: 2 },
            { image_url: 'https://placehold.co/400x400/FFFFFF/1a1a1a?text=Air+Max+White', is_primary: 1, variant_id: 3, sort_order: 1 },
        ],
    },
    {
        product_id: 2,
        name: 'Nike Revolution 6',
        description: 'Giày chạy bộ nhẹ nhàng với đế cao su bền bỉ. Lưới thoáng khí giúp bàn chân luôn mát mẻ. Phù hợp tập luyện và chạy bộ hàng ngày.',
        category_id: 1,
        brand_id: 1,
        material_id: 4,
        status: 1,
        rating: 4.2,
        review_count: 189,
        isNew: false,
        isBestseller: false,
        created_at: daysAgo(90),
        variants: [
            { variant_id: 5, size_id: 5, color_id: 1, price: 1890000, stock: 15, status: 1 },
            { variant_id: 6, size_id: 6, color_id: 3, price: 1890000, stock: 10, status: 1 },
            { variant_id: 7, size_id: 7, color_id: 6, price: 1890000, stock: 7, status: 1 },
            { variant_id: 8, size_id: 8, color_id: 1, price: 1890000, stock: 5, status: 1 },
        ],
        images: [
            { image_url: 'https://placehold.co/400x400/111111/FFFFFF?text=Revolution+6', is_primary: 1, variant_id: 5, sort_order: 1 },
            { image_url: 'https://placehold.co/400x400/EF4444/FFFFFF?text=Revolution+Red', is_primary: 1, variant_id: 6, sort_order: 1 },
        ],
    },
    {
        product_id: 3,
        name: 'Nike Court Vision Low',
        description: 'Sneaker cổ thấp lấy cảm hứng từ giày bóng rổ cổ điển. Thiết kế tối giản, dễ phối đồ, da tổng hợp bền bỉ.',
        category_id: 2,
        brand_id: 1,
        material_id: 2,
        status: 1,
        rating: 4.0,
        review_count: 97,
        isNew: true,
        isBestseller: false,
        created_at: daysAgo(10),
        variants: [
            { variant_id: 9, size_id: 6, color_id: 2, price: 2100000, stock: 20, status: 1 },
            { variant_id: 10, size_id: 7, color_id: 2, price: 2100000, stock: 14, status: 1 },
            { variant_id: 11, size_id: 8, color_id: 1, price: 2100000, stock: 6, status: 1 },
        ],
        images: [
            { image_url: 'https://placehold.co/400x400/FAFAFA/111111?text=Court+Vision', is_primary: 1, variant_id: 9, sort_order: 1 },
            { image_url: 'https://placehold.co/400x400/EEEEEE/111111?text=Court+Side', is_primary: 0, variant_id: 9, sort_order: 2 },
        ],
    },
    {
        product_id: 4,
        name: 'Nike Pegasus 40',
        description: 'Phiên bản thứ 40 của dòng Pegasus huyền thoại. Đệm React cho cảm giác nảy, êm mỗi bước chạy. Phom giày rộng rãi, thoải mái.',
        category_id: 1,
        brand_id: 1,
        material_id: 4,
        status: 1,
        rating: 4.8,
        review_count: 856,
        isNew: false,
        isBestseller: true,
        created_at: daysAgo(120),
        variants: [
            { variant_id: 12, size_id: 7, color_id: 1, price: 3800000, stock: 9, status: 1 },
            { variant_id: 13, size_id: 8, color_id: 5, price: 3800000, stock: 4, status: 1 },
            { variant_id: 14, size_id: 9, color_id: 8, price: 3800000, stock: 11, status: 1 },
        ],
        images: [
            { image_url: 'https://placehold.co/400x400/1E3A5F/FFFFFF?text=Pegasus+40', is_primary: 1, variant_id: 12, sort_order: 1 },
            { image_url: 'https://placehold.co/400x400/3B82F6/FFFFFF?text=Pegasus+Blue', is_primary: 1, variant_id: 13, sort_order: 1 },
        ],
    },

    // ── Adidas (3) ────────────────────────────────────────
    {
        product_id: 5,
        name: 'Adidas Ultraboost Light',
        description: 'Ultraboost phiên bản nhẹ nhất từ trước đến nay. Boost midsole cho năng lượng trả lại tối đa. Primeknit ôm chân hoàn hảo.',
        category_id: 1,
        brand_id: 2,
        material_id: 4,
        status: 1,
        rating: 4.6,
        review_count: 523,
        isNew: false,
        isBestseller: true,
        created_at: daysAgo(45),
        variants: [
            { variant_id: 17, size_id: 6, color_id: 1, price: 3500000, stock: 7, status: 1 },
            { variant_id: 18, size_id: 7, color_id: 2, price: 3500000, stock: 12, status: 1 },
            { variant_id: 19, size_id: 8, color_id: 6, price: 3500000, stock: 3, status: 1 },
            { variant_id: 20, size_id: 9, color_id: 1, price: 3500000, stock: 0, status: 1 },
        ],
        images: [
            { image_url: 'https://placehold.co/400x400/000000/FFFFFF?text=Ultraboost', is_primary: 1, variant_id: 17, sort_order: 1 },
            { image_url: 'https://placehold.co/400x400/F5F5F5/000000?text=Ultraboost+W', is_primary: 1, variant_id: 18, sort_order: 1 },
        ],
    },
    {
        product_id: 6,
        name: 'Adidas Stan Smith',
        description: 'Biểu tượng thời trang kinh điển. Thiết kế tối giản với chất liệu da tổng hợp cao cấp. Đế cao su phẳng êm ái.',
        category_id: 2,
        brand_id: 2,
        material_id: 2,
        status: 1,
        rating: 4.3,
        review_count: 412,
        isNew: false,
        isBestseller: false,
        created_at: daysAgo(180),
        variants: [
            { variant_id: 21, size_id: 5, color_id: 2, price: 2200000, stock: 18, status: 1 },
            { variant_id: 22, size_id: 6, color_id: 2, price: 2200000, stock: 10, status: 1 },
            { variant_id: 23, size_id: 7, color_id: 7, price: 2200000, stock: 5, status: 1 },
            { variant_id: 24, size_id: 8, color_id: 2, price: 2400000, stock: 2, status: 1 },
        ],
        images: [
            { image_url: 'https://placehold.co/400x400/FFFFFF/22C55E?text=Stan+Smith', is_primary: 1, variant_id: 21, sort_order: 1 },
            { image_url: 'https://placehold.co/400x400/FEF3C7/92400E?text=Stan+Cream', is_primary: 1, variant_id: 23, sort_order: 1 },
        ],
    },
    {
        product_id: 7,
        name: 'Adidas Adilette Comfort',
        description: 'Dép quai ngang Adidas êm ái với công nghệ Cloudfoam. Thiết kế thể thao, phù hợp đi biển và mặc hàng ngày.',
        category_id: 6,
        brand_id: 2,
        material_id: 5,
        status: 1,
        rating: 4.1,
        review_count: 67,
        isNew: false,
        isBestseller: false,
        created_at: daysAgo(100),
        variants: [
            { variant_id: 25, size_id: 6, color_id: 1, price: 750000, stock: 25, status: 1 },
            { variant_id: 26, size_id: 7, color_id: 1, price: 750000, stock: 20, status: 1 },
            { variant_id: 27, size_id: 8, color_id: 8, price: 750000, stock: 15, status: 1 },
        ],
        images: [
            { image_url: 'https://placehold.co/400x400/1a1a1a/FFFFFF?text=Adilette', is_primary: 1, variant_id: 25, sort_order: 1 },
            { image_url: 'https://placehold.co/400x400/1E3A5F/FFFFFF?text=Adilette+Navy', is_primary: 1, variant_id: 27, sort_order: 1 },
        ],
    },

    // ── New Balance (2) ───────────────────────────────────
    {
        product_id: 8,
        name: 'New Balance 574',
        description: 'Giày lifestyle cổ điển với đế ENCAP êm ái, chất liệu da lộn và lưới thoáng khí. Biểu tượng phong cách retro.',
        category_id: 2,
        brand_id: 3,
        material_id: 6,
        status: 1,
        rating: 4.4,
        review_count: 278,
        isNew: false,
        isBestseller: false,
        created_at: daysAgo(75),
        variants: [
            { variant_id: 28, size_id: 6, color_id: 6, price: 2450000, stock: 9, status: 1 },
            { variant_id: 29, size_id: 7, color_id: 8, price: 2450000, stock: 13, status: 1 },
            { variant_id: 30, size_id: 8, color_id: 4, price: 2450000, stock: 6, status: 1 },
        ],
        images: [
            { image_url: 'https://placehold.co/400x400/9CA3AF/FFFFFF?text=NB+574+Grey', is_primary: 1, variant_id: 28, sort_order: 1 },
            { image_url: 'https://placehold.co/400x400/1E3A5F/FFFFFF?text=NB+574+Navy', is_primary: 1, variant_id: 29, sort_order: 1 },
        ],
    },
    {
        product_id: 9,
        name: 'New Balance Fresh Foam 1080',
        description: 'Đệm Fresh Foam X cho cảm giác êm mềm, nhẹ nhàng mỗi bước chạy. Lưới Hypoknit ôm chân thoáng khí.',
        category_id: 1,
        brand_id: 3,
        material_id: 4,
        status: 1,
        rating: 4.7,
        review_count: 156,
        isNew: true,
        isBestseller: false,
        created_at: daysAgo(15),
        variants: [
            { variant_id: 31, size_id: 7, color_id: 5, price: 3650000, stock: 8, status: 1 },
            { variant_id: 32, size_id: 8, color_id: 1, price: 3650000, stock: 5, status: 1 },
            { variant_id: 33, size_id: 9, color_id: 2, price: 3650000, stock: 11, status: 1 },
        ],
        images: [
            { image_url: 'https://placehold.co/400x400/3B82F6/FFFFFF?text=FF+1080+Blue', is_primary: 1, variant_id: 31, sort_order: 1 },
            { image_url: 'https://placehold.co/400x400/111111/FFFFFF?text=FF+1080+Black', is_primary: 1, variant_id: 32, sort_order: 1 },
        ],
    },

    // ── Biti's Hunter (3) ─────────────────────────────────
    {
        product_id: 10,
        name: "Biti's Hunter X Festive",
        description: 'Phiên bản đặc biệt mùa lễ hội của Biti\'s Hunter X. Đế LiteFlex siêu nhẹ, thân giày Flyknit thoáng khí. Thiết kế năng động.',
        category_id: 2,
        brand_id: 4,
        material_id: 4,
        status: 1,
        rating: 4.3,
        review_count: 234,
        isNew: true,
        isBestseller: false,
        created_at: daysAgo(8),
        variants: [
            { variant_id: 37, size_id: 5, color_id: 3, price: 850000, stock: 20, status: 1 },
            { variant_id: 38, size_id: 6, color_id: 1, price: 850000, stock: 15, status: 1 },
            { variant_id: 39, size_id: 7, color_id: 2, price: 850000, stock: 18, status: 1 },
            { variant_id: 40, size_id: 8, color_id: 5, price: 850000, stock: 10, status: 1 },
        ],
        images: [
            { image_url: 'https://placehold.co/400x400/EF4444/FFFFFF?text=Hunter+X+Red', is_primary: 1, variant_id: 37, sort_order: 1 },
            { image_url: 'https://placehold.co/400x400/000000/FFFFFF?text=Hunter+X+Blk', is_primary: 1, variant_id: 38, sort_order: 1 },
            { image_url: 'https://placehold.co/400x400/FFFFFF/000000?text=Hunter+X+Wht', is_primary: 1, variant_id: 39, sort_order: 1 },
        ],
    },
    {
        product_id: 11,
        name: "Biti's Hunter Street",
        description: 'Giày thời trang đường phố từ Biti\'s Hunter. Đệm êm ái, thiết kế đa năng phù hợp học sinh, sinh viên.',
        category_id: 2,
        brand_id: 4,
        material_id: 3,
        status: 1,
        rating: 4.0,
        review_count: 189,
        isNew: true,
        isBestseller: false,
        created_at: daysAgo(12),
        variants: [
            { variant_id: 41, size_id: 4, color_id: 1, price: 650000, stock: 30, status: 1 },
            { variant_id: 42, size_id: 5, color_id: 2, price: 650000, stock: 25, status: 1 },
            { variant_id: 43, size_id: 6, color_id: 8, price: 650000, stock: 12, status: 1 },
            { variant_id: 44, size_id: 7, color_id: 1, price: 650000, stock: 8, status: 1 },
        ],
        images: [
            { image_url: 'https://placehold.co/400x400/1a1a1a/FFFFFF?text=Hunter+Street', is_primary: 1, variant_id: 41, sort_order: 1 },
            { image_url: 'https://placehold.co/400x400/F5F5F5/1a1a1a?text=Hunter+St+Wh', is_primary: 1, variant_id: 42, sort_order: 1 },
        ],
    },
    {
        product_id: 12,
        name: "Biti's Hunter Dép",
        description: 'Dép Biti\'s Hunter phong cách thể thao, đế êm nhẹ, quai chắc chắn. Dễ vệ sinh, thích hợp đi biển và mặc hàng ngày.',
        category_id: 6,
        brand_id: 4,
        material_id: 5,
        status: 1,
        rating: 3.8,
        review_count: 45,
        isNew: false,
        isBestseller: false,
        created_at: daysAgo(50),
        variants: [
            { variant_id: 45, size_id: 5, color_id: 1, price: 350000, stock: 40, status: 1 },
            { variant_id: 46, size_id: 6, color_id: 3, price: 350000, stock: 35, status: 1 },
            { variant_id: 47, size_id: 7, color_id: 5, price: 350000, stock: 20, status: 1 },
        ],
        images: [
            { image_url: 'https://placehold.co/400x400/111111/FFFFFF?text=Bitis+Dep', is_primary: 1, variant_id: 45, sort_order: 1 },
            { image_url: 'https://placehold.co/400x400/EF4444/FFFFFF?text=Bitis+Dep+Red', is_primary: 1, variant_id: 46, sort_order: 1 },
        ],
    },

    // ── Converse (2) ──────────────────────────────────────
    {
        product_id: 13,
        name: 'Converse Chuck Taylor All Star',
        description: 'Giày vải canvas kinh điển Chuck Taylor. Logo ngôi sao huyền thoại. Đế cao su bền bỉ, phong cách retro không bao giờ lỗi mốt.',
        category_id: 2,
        brand_id: 5,
        material_id: 3,
        status: 1,
        rating: 4.5,
        review_count: 623,
        isNew: false,
        isBestseller: true,
        created_at: daysAgo(200),
        variants: [
            { variant_id: 48, size_id: 4, color_id: 1, price: 1450000, stock: 22, status: 1 },
            { variant_id: 49, size_id: 5, color_id: 2, price: 1450000, stock: 18, status: 1 },
            { variant_id: 50, size_id: 6, color_id: 3, price: 1450000, stock: 14, status: 1 },
            { variant_id: 51, size_id: 7, color_id: 8, price: 1500000, stock: 9, status: 1 },
        ],
        images: [
            { image_url: 'https://placehold.co/400x400/1a1a1a/FFFFFF?text=Chuck+Taylor', is_primary: 1, variant_id: 48, sort_order: 1 },
            { image_url: 'https://placehold.co/400x400/F5F5F5/1a1a1a?text=Chuck+White', is_primary: 1, variant_id: 49, sort_order: 1 },
            { image_url: 'https://placehold.co/400x400/EF4444/FFFFFF?text=Chuck+Red', is_primary: 1, variant_id: 50, sort_order: 1 },
        ],
    },
    {
        product_id: 14,
        name: 'Converse Run Star Hike',
        description: 'Phiên bản platform của Chuck Taylor với đế chunky độc đáo. Nổi bật cá tính với thiết kế đường phố táo bạo.',
        category_id: 2,
        brand_id: 5,
        material_id: 3,
        status: 1,
        rating: 4.2,
        review_count: 87,
        isNew: true,
        isBestseller: false,
        created_at: daysAgo(20),
        variants: [
            { variant_id: 52, size_id: 3, color_id: 1, price: 2800000, stock: 6, status: 1 },
            { variant_id: 53, size_id: 4, color_id: 2, price: 2800000, stock: 4, status: 1 },
            { variant_id: 54, size_id: 5, color_id: 7, price: 2800000, stock: 8, status: 1 },
        ],
        images: [
            { image_url: 'https://placehold.co/400x400/000000/FFFFFF?text=Run+Star+Hike', is_primary: 1, variant_id: 52, sort_order: 1 },
            { image_url: 'https://placehold.co/400x400/FFFFFF/000000?text=RunStar+White', is_primary: 1, variant_id: 53, sort_order: 1 },
        ],
    },

    // ── Vans (2) ──────────────────────────────────────────
    {
        product_id: 15,
        name: 'Vans Old Skool',
        description: 'Giày skate huyền thoại với sọc jazz stripe đặc trưng. Da lộn kết hợp vải canvas bền bỉ. Đế waffle grip tốt.',
        category_id: 2,
        brand_id: 6,
        material_id: 6,
        status: 1,
        rating: 4.4,
        review_count: 398,
        isNew: false,
        isBestseller: false,
        created_at: daysAgo(150),
        variants: [
            { variant_id: 55, size_id: 5, color_id: 1, price: 1850000, stock: 16, status: 1 },
            { variant_id: 56, size_id: 6, color_id: 1, price: 1850000, stock: 11, status: 1 },
            { variant_id: 57, size_id: 7, color_id: 4, price: 1850000, stock: 7, status: 1 },
        ],
        images: [
            { image_url: 'https://placehold.co/400x400/1a1a1a/FFFFFF?text=Old+Skool', is_primary: 1, variant_id: 55, sort_order: 1 },
            { image_url: 'https://placehold.co/400x400/92400E/FFFFFF?text=Old+Skool+Brn', is_primary: 1, variant_id: 57, sort_order: 1 },
        ],
    },
    {
        product_id: 16,
        name: 'Vans Slide-On',
        description: 'Dép Vans quai ngang với logo Checkerboard biểu tượng. Đệm êm, thiết kế thoải mái cho mùa hè.',
        category_id: 6,
        brand_id: 6,
        material_id: 5,
        status: 1,
        rating: 3.9,
        review_count: 56,
        isNew: false,
        isBestseller: false,
        created_at: daysAgo(80),
        variants: [
            { variant_id: 58, size_id: 6, color_id: 1, price: 980000, stock: 14, status: 1 },
            { variant_id: 59, size_id: 7, color_id: 2, price: 980000, stock: 10, status: 1 },
        ],
        images: [
            { image_url: 'https://placehold.co/400x400/1a1a1a/FFFFFF?text=Vans+SlideOn', is_primary: 1, variant_id: 58, sort_order: 1 },
            { image_url: 'https://placehold.co/400x400/FAFAFA/1a1a1a?text=Vans+Slide+Wh', is_primary: 1, variant_id: 59, sort_order: 1 },
        ],
    },
];

// ─── HELPER: format price in VND ───────────────────────
export const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
};

// ─── HELPER: get min price for a product ───────────────
export const getMinPrice = (product) => {
    const activeVariants = product.variants.filter(v => v.status === 1);
    if (activeVariants.length === 0) return 0;
    return Math.min(...activeVariants.map(v => v.price));
};

// ─── HELPER: get primary image for a product ───────────
export const getPrimaryImage = (product, colorId = null) => {
    if (colorId) {
        const variant = product.variants.find(v => v.color_id === colorId);
        if (variant) {
            const img = product.images.find(i => i.variant_id === variant.variant_id && i.is_primary);
            if (img) return img.image_url;
        }
    }
    const primary = product.images.find(i => i.is_primary);
    return primary ? primary.image_url : product.images[0]?.image_url || '';
};

// ─── HELPER: get secondary image for hover ─────────────
export const getSecondaryImage = (product) => {
    const secondary = product.images.find(i => !i.is_primary && i.sort_order === 2);
    if (secondary) return secondary.image_url;
    // fallback: return a different primary (different variant)
    if (product.images.length > 1) return product.images[1].image_url;
    return null;
};

// ─── HELPER: get unique colors for a product ───────────
export const getProductColors = (product) => {
    const colorIds = [...new Set(product.variants.filter(v => v.status === 1).map(v => v.color_id))];
    return colorIds.map(cid => COLORS.find(c => c.color_id === cid)).filter(Boolean);
};

// ─── HELPER: get available sizes for a product ─────────
export const getProductSizes = (product) => {
    return product.variants
        .filter(v => v.status === 1)
        .map(v => ({
            ...SIZES.find(s => s.size_id === v.size_id),
            inStock: v.stock > 0,
            stock: v.stock,
        }))
        .filter(s => s.size_id);
};

// ─── HELPER: check if product has active promotion ─────
export const getActivePromotion = (product) => {
    const now = new Date();
    for (const promo of PROMOTIONS) {
        if (!promo.is_active) continue;
        if (new Date(promo.start_date) > now || new Date(promo.end_date) < now) continue;
        const hasVariant = product.variants.some(v => promo.product_variant_ids.includes(v.variant_id));
        if (hasVariant) return promo;
    }
    return null;
};

// ─── HELPER: calculate discounted price ────────────────
export const getDiscountedPrice = (price, promotion) => {
    if (!promotion) return null;
    if (promotion.discount_percentage) {
        return price * (1 - promotion.discount_percentage / 100);
    }
    if (promotion.fixed_price) {
        return Math.max(0, price - promotion.fixed_price);
    }
    return null;
};

// ─── HELPER: check new within 30 days ──────────────────
export const isNewProduct = (product) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return new Date(product.created_at) >= thirtyDaysAgo;
};

// ─── HELPER: get total stock for a product ─────────────
export const getTotalStock = (product) => {
    return product.variants
        .filter(v => v.status === 1)
        .reduce((sum, v) => sum + v.stock, 0);
};

// ─── HELPER: count products per category ───────────────
export const countByCategory = (categoryId) => {
    return PRODUCTS.filter(p => {
        if (p.category_id === categoryId) return true;
        // also count children
        const childCats = CATEGORIES.filter(c => c.parent_id === categoryId).map(c => c.category_id);
        return childCats.includes(p.category_id);
    }).length;
};

// ─── HELPER: count products per brand ──────────────────
export const countByBrand = (brandId) => {
    return PRODUCTS.filter(p => p.brand_id === brandId).length;
};
