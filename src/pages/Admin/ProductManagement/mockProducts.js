// ─── Status config ────────────────────────────────────────────────────────────
export const STATUS_CONFIG = {
  ACTIVE: {
    label: 'Đang bán',
    className: 'pm-badge-active',
    dot: '#22c55e',
  },
  OUT_OF_STOCK: {
    label: 'Hết hàng',
    className: 'pm-badge-out',
    dot: '#ef4444',
  },
  INACTIVE: {
    label: 'Ngừng bán',
    className: 'pm-badge-inactive',
    dot: '#9ca3af',
  },
  COMING_SOON: {
    label: 'Sắp ra mắt',
    className: 'pm-badge-soon',
    dot: '#3b82f6',
  },
};

// ─── Lookup data ───────────────────────────────────────────────────────────────
export const MOCK_CATEGORIES = [
  { id: 1, name: 'Giày chạy bộ', parentId: null },
  { id: 2, name: 'Sneakers', parentId: null },
  { id: 3, name: 'Lifestyle', parentId: null },
  { id: 4, name: 'Basketball', parentId: null },
  { id: 5, name: 'Giày da', parentId: null },
  { id: 6, name: 'Dép', parentId: null },
  { id: 7, name: 'Sandal', parentId: null },
];

export const MOCK_BRANDS = [
  { id: 1, name: 'Nike' },
  { id: 2, name: 'Adidas' },
  { id: 3, name: 'Vans' },
  { id: 4, name: 'Converse' },
  { id: 5, name: 'Puma' },
  { id: 6, name: 'New Balance' },
  { id: 7, name: "Biti's" },
  { id: 8, name: 'Skechers' },
];

export const MOCK_SIZES = ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];

export const MOCK_COLORS = [
  { id: 1, name: 'Đen', code: '#1a1a1a' },
  { id: 2, name: 'Trắng', code: '#f5f5f5' },
  { id: 3, name: 'Đỏ', code: '#ef4444' },
  { id: 4, name: 'Xanh dương', code: '#3b82f6' },
  { id: 5, name: 'Xanh lá', code: '#22c55e' },
  { id: 6, name: 'Xám', code: '#6b7280' },
  { id: 7, name: 'Vàng', code: '#f59e0b' },
  { id: 8, name: 'Hồng', code: '#ec4899' },
];

export const MOCK_MATERIALS = [
  { id: 1, name: 'Da thật' },
  { id: 2, name: 'Da tổng hợp' },
  { id: 3, name: 'Vải' },
  { id: 4, name: 'Lưới' },
  { id: 5, name: 'Canvas' },
  { id: 6, name: 'Cao su' },
];

// ─── Helper to build realistic variant sets ───────────────────────────────────
const mkVariant = (id, size, colorIdx, price, costPrice, stock) => ({
  id,
  size,
  color: MOCK_COLORS[colorIdx],
  price,
  costPrice,
  stock,
  weight: 380,
  status: stock === 0 ? 'INACTIVE' : 'ACTIVE',
  images: [],
});

// ─── 8 Mock products ───────────────────────────────────────────────────────────
export const mockProducts = [
  // 1 ── Nike Pegasus 40 — Đang bán, HOT
  {
    id: 1,
    name: 'Nike Pegasus 40',
    sku: 'NK-PEG40-001',
    slug: 'nike-pegasus-40',
    description:
      'Nike Pegasus 40 mang đến sự kết hợp hoàn hảo giữa đệm React phản hồi cao và độ bền vượt trội. Thiết kế lưới thoáng khí giúp chân luôn khô thoáng trong suốt quá trình tập luyện.',
    category: { id: 1, name: 'Giày chạy bộ' },
    brand: { id: 1, name: 'Nike' },
    material: { id: 4, name: 'Lưới' },
    status: 'ACTIVE',
    tags: ['hot'],
    imageUrl:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
    variants: [
      mkVariant(101, '39', 0, 3_200_000, 2_100_000, 6),
      mkVariant(102, '40', 0, 3_200_000, 2_100_000, 8),
      mkVariant(103, '41', 0, 3_200_000, 2_100_000, 9),
      mkVariant(104, '42', 0, 3_200_000, 2_100_000, 7),
      mkVariant(105, '39', 1, 3_500_000, 2_300_000, 6),
      mkVariant(106, '40', 1, 3_500_000, 2_300_000, 4),
      mkVariant(107, '41', 1, 3_500_000, 2_300_000, 5),
      mkVariant(108, '42', 1, 3_500_000, 2_300_000, 3),
    ],
    totalVariants: 8,
    totalStock: 48,
    createdAt: '2026-01-10T09:00:00',
    updatedAt: '2026-02-20T14:30:00',
    seoTitle: 'Nike Pegasus 40 - Giày chạy bộ cao cấp | BestShoes',
    seoDescription:
      'Mua Nike Pegasus 40 chính hãng tại BestShoes. Công nghệ đệm React, thiết kế lưới thoáng khí.',
  },

  // 2 ── Adidas Stan Smith — Đang bán, tồn kho thấp, có khuyến mãi
  {
    id: 2,
    name: 'Adidas Stan Smith',
    sku: 'AD-SS-002',
    slug: 'adidas-stan-smith',
    description:
      'Adidas Stan Smith là biểu tượng sneaker kinh điển với thiết kế tối giản. Phần upper bằng da tổng hợp cao cấp, đế cao su bền bỉ.',
    category: { id: 2, name: 'Sneakers' },
    brand: { id: 2, name: 'Adidas' },
    material: { id: 2, name: 'Da tổng hợp' },
    status: 'ACTIVE',
    tags: [],
    salePrice: 2_380_000, // -15% from 2_800_000
    imageUrl:
      'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=400&q=80',
    variants: [
      mkVariant(201, '38', 1, 2_800_000, 1_800_000, 1),
      mkVariant(202, '39', 1, 2_800_000, 1_800_000, 1),
      mkVariant(203, '40', 1, 2_800_000, 1_800_000, 1),
    ],
    totalVariants: 3,
    totalStock: 3,
    createdAt: '2025-11-05T10:00:00',
    updatedAt: '2026-02-18T08:15:00',
    seoTitle: 'Adidas Stan Smith - Sneaker kinh điển | BestShoes',
    seoDescription: 'Adidas Stan Smith chính hãng tại BestShoes. Biểu tượng sneaker trường tồn.',
  },

  // 3 ── Vans Old Skool — Hết hàng
  {
    id: 3,
    name: 'Vans Old Skool',
    sku: 'VN-OS-003',
    slug: 'vans-old-skool',
    description:
      'Vans Old Skool với chi tiết sọc Jazz đặc trưng, cổ thấp linh hoạt và đế Waffle giúp bám đường tốt. Thiết kế canvas kinh điển không bao giờ lỗi mốt.',
    category: { id: 2, name: 'Sneakers' },
    brand: { id: 3, name: 'Vans' },
    material: { id: 5, name: 'Canvas' },
    status: 'OUT_OF_STOCK',
    tags: [],
    imageUrl:
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400&q=80',
    variants: [
      mkVariant(301, '38', 0, 1_850_000, 1_100_000, 0),
      mkVariant(302, '39', 0, 1_850_000, 1_100_000, 0),
      mkVariant(303, '40', 0, 1_850_000, 1_100_000, 0),
      mkVariant(304, '41', 0, 1_850_000, 1_100_000, 0),
    ],
    totalVariants: 4,
    totalStock: 0,
    createdAt: '2025-09-14T11:00:00',
    updatedAt: '2026-02-01T16:00:00',
    seoTitle: 'Vans Old Skool - Sneaker kinh điển đế bánh waffle | BestShoes',
    seoDescription: 'Vans Old Skool chính hãng. Canvas bền đẹp, đế Waffle bám đường.',
  },

  // 4 ── New Balance 574 — Đang bán
  {
    id: 4,
    name: 'New Balance 574',
    sku: 'NB-574-004',
    slug: 'new-balance-574',
    description:
      'New Balance 574 kết hợp hoàn hảo giữa phong cách retro và sự thoải mái hiện đại. Công nghệ ENCAP mang lại sự hỗ trợ tối ưu cho đôi chân.',
    category: { id: 3, name: 'Lifestyle' },
    brand: { id: 6, name: 'New Balance' },
    material: { id: 4, name: 'Lưới' },
    status: 'ACTIVE',
    tags: [],
    imageUrl:
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&q=80',
    variants: [
      mkVariant(401, '39', 5, 2_200_000, 1_400_000, 5),
      mkVariant(402, '40', 5, 2_200_000, 1_400_000, 8),
      mkVariant(403, '41', 5, 2_200_000, 1_400_000, 9),
    ],
    totalVariants: 3,
    totalStock: 22,
    createdAt: '2025-10-20T09:00:00',
    updatedAt: '2026-02-15T12:00:00',
    seoTitle: 'New Balance 574 - Phong cách retro bền vững | BestShoes',
    seoDescription: 'New Balance 574 chính hãng. Công nghệ ENCAP, thiết kế retro hiện đại.',
  },

  // 5 ── Converse Chuck Taylor — Đang bán, BÁN CHẠY
  {
    id: 5,
    name: 'Converse Chuck Taylor All Star',
    sku: 'CV-CT-005',
    slug: 'converse-chuck-taylor-all-star',
    description:
      'Converse Chuck Taylor All Star là đôi giày canvas kinh điển nhất mọi thời đại. Thiết kế đơn giản nhưng đầy cá tính với đế cao su và mũi giày tròn đặc trưng.',
    category: { id: 2, name: 'Sneakers' },
    brand: { id: 4, name: 'Converse' },
    material: { id: 5, name: 'Canvas' },
    status: 'ACTIVE',
    tags: ['bestseller'],
    imageUrl:
      'https://images.unsplash.com/photo-1494496195158-c3bc5e09cb30?w=400&q=80',
    variants: [
      mkVariant(501, '37', 0, 1_500_000, 900_000, 3),
      mkVariant(502, '38', 0, 1_500_000, 900_000, 4),
      mkVariant(503, '39', 0, 1_500_000, 900_000, 4),
      mkVariant(504, '40', 0, 1_500_000, 900_000, 4),
    ],
    totalVariants: 4,
    totalStock: 15,
    createdAt: '2025-08-01T08:00:00',
    updatedAt: '2026-02-10T10:30:00',
    seoTitle: 'Converse Chuck Taylor All Star chính hãng | BestShoes',
    seoDescription: 'Converse Chuck Taylor All Star - Biểu tượng sneaker canvas bất tử.',
  },

  // 6 ── Biti's Hunter X — Đang bán, MỚI (5 ngày trước)
  {
    id: 6,
    name: "Biti's Hunter X",
    sku: 'BT-HX-006',
    slug: 'bitis-hunter-x',
    description:
      "Biti's Hunter X nâng cấp với công nghệ đệm LiteFlex Plus phản hồi cao, trọng lượng siêu nhẹ chỉ 198g. Made in Vietnam - tự hào thương hiệu Việt.",
    category: { id: 2, name: 'Sneakers' },
    brand: { id: 7, name: "Biti's" },
    material: { id: 4, name: 'Lưới' },
    status: 'ACTIVE',
    tags: ['new'],
    imageUrl:
      'https://images.unsplash.com/photo-1539185441755-769473a23570?w=400&q=80',
    variants: [
      mkVariant(601, '38', 2, 750_000, 420_000, 12),
      mkVariant(602, '39', 2, 750_000, 420_000, 15),
      mkVariant(603, '40', 2, 750_000, 420_000, 18),
      mkVariant(604, '41', 2, 750_000, 420_000, 10),
      mkVariant(605, '42', 2, 750_000, 420_000, 12),
    ],
    totalVariants: 5,
    totalStock: 67,
    // Created 5 days ago — will show "MỚI" badge
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    seoTitle: "Biti's Hunter X - Sneaker Made in Vietnam | BestShoes",
    seoDescription: "Biti's Hunter X chính hãng. Công nghệ LiteFlex Plus, siêu nhẹ 198g.",
  },

  // 7 ── Puma RS-X — Ngừng bán
  {
    id: 7,
    name: 'Puma RS-X',
    sku: 'PM-RSX-007',
    slug: 'puma-rs-x',
    description:
      'Puma RS-X được lấy cảm hứng từ giày chạy bộ thập niên 80s với thiết kế chunky độc đáo. Đế RS (Running System) mang lại sự êm ái tuyệt vời.',
    category: { id: 3, name: 'Lifestyle' },
    brand: { id: 5, name: 'Puma' },
    material: { id: 2, name: 'Da tổng hợp' },
    status: 'INACTIVE',
    tags: [],
    imageUrl:
      'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?w=400&q=80',
    variants: [
      mkVariant(701, '39', 7, 2_100_000, 1_300_000, 0),
      mkVariant(702, '40', 7, 2_100_000, 1_300_000, 0),
      mkVariant(703, '41', 7, 2_100_000, 1_300_000, 0),
    ],
    totalVariants: 3,
    totalStock: 0,
    createdAt: '2025-06-15T10:00:00',
    updatedAt: '2026-01-05T09:00:00',
    seoTitle: 'Puma RS-X - Sneaker chunky phong cách retro | BestShoes',
    seoDescription: 'Puma RS-X chính hãng. Đế RS Running System êm ái, thiết kế chunky.',
  },

  // 8 ── Jordan Air 1 Mid — Sắp ra mắt
  {
    id: 8,
    name: 'Jordan Air 1 Mid',
    sku: 'JD-AM1-008',
    slug: 'jordan-air-1-mid',
    description:
      'Jordan Air 1 Mid mang biểu tượng bóng rổ huyền thoại lên đường phố. Cổ cao độc đáo, miếng đệm Air-Sole giảm chấn hiệu quả.',
    category: { id: 4, name: 'Basketball' },
    brand: { id: 1, name: 'Nike' },
    material: { id: 1, name: 'Da thật' },
    status: 'COMING_SOON',
    tags: [],
    imageUrl:
      'https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=400&q=80',
    variants: [
      mkVariant(801, '40', 0, 4_500_000, 2_900_000, 2),
      mkVariant(802, '41', 0, 4_500_000, 2_900_000, 3),
      mkVariant(803, '42', 0, 4_500_000, 2_900_000, 3),
    ],
    totalVariants: 3,
    totalStock: 8,
    createdAt: '2026-02-01T14:00:00',
    updatedAt: '2026-02-25T11:00:00',
    seoTitle: 'Jordan Air 1 Mid - Biểu tượng bóng rổ huyền thoại | BestShoes',
    seoDescription: 'Jordan Air 1 Mid chính hãng tại BestShoes. Đệm Air-Sole, da thật cao cấp.',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
/** Returns the lowest variant price for a product */
export const getMinPrice = (product) =>
  product.variants.length ? Math.min(...product.variants.map((v) => v.price)) : 0;

/** Returns the highest variant price */
export const getMaxPrice = (product) =>
  product.variants.length ? Math.max(...product.variants.map((v) => v.price)) : 0;

/** Returns unique colors used across variants */
export const getUniqueColors = (product) => {
  const seen = new Set();
  return product.variants.filter((v) => {
    if (seen.has(v.color.id)) return false;
    seen.add(v.color.id);
    return true;
  }).map((v) => v.color);
};

/** Returns relative time string in Vietnamese */
export const getRelativeTime = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (mins < 60) return `${mins} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 30) return `${days} ngày trước`;
  return new Date(dateStr).toLocaleDateString('vi-VN');
};

/** Returns true if product was created within the last 30 days */
export const isNewProduct = (product) => {
  return Date.now() - new Date(product.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000;
};

/** Slugify a Vietnamese string to URL-safe slug */
export const slugify = (str) =>
  str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
