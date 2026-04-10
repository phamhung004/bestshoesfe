/**
 * Return Management — UI constants and helper functions.
 * Mock data has been removed; all data now comes from the backend API.
 */

// ── Return Status config ────────────────────────────────────────
export const RETURN_STATUS_CONFIG = {
    'Chờ duyệt': { color: '#EAB308', bg: '#FEF9C3', label: 'Chờ duyệt' },
    'Đã duyệt': { color: '#3B82F6', bg: '#DBEAFE', label: 'Đã duyệt' },
    'Đã nhận hàng': { color: '#8B5CF6', bg: '#EDE9FE', label: 'Đã nhận hàng' },
    'Đã kiểm định': { color: '#0EA5E9', bg: '#E0F2FE', label: 'Đã kiểm định' },
    'Hoàn tiền': { color: '#22C55E', bg: '#DCFCE7', label: 'Hoàn tiền' },
    'Từ chối': { color: '#EF4444', bg: '#FEE2E2', label: 'Từ chối' },
};

export const ALL_RETURN_STATUSES = [
    'Tất cả', 'Chờ duyệt', 'Đã duyệt', 'Đã nhận hàng', 'Đã kiểm định', 'Hoàn tiền', 'Từ chối',
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

// Mapping from admin reason label → backend enum value
export const REASON_TO_CATEGORY = {
    'Sản phẩm lỗi':      'PRODUCT_DEFECT',
    'Sai size':           'WRONG_SIZE',
    'Sai màu':            'WRONG_COLOR',
    'Không như mô tả':    'NOT_AS_DESCRIBED',
    'Đổi ý':              'OTHER',
    'Giao thiếu hàng':    'WRONG_PRODUCT',
    'Khác':               'OTHER',
};

// ── Refund methods — must match backend mapPaymentToRefundMethod() ──────────────────────────────
export const REFUND_METHODS = [
    { value: 'Tiền mặt', icon: '💵', label: 'Tiền mặt' },
    { value: 'Chuyển khoản', icon: '🏦', label: 'Chuyển khoản' },
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
    const diff = Date.now() - new Date(isoStr);
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
