// ─── My Account Utilities & Constants ─────────────────────

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
