/**
 * vi.js – Nhãn tiếng Việt dùng chung toàn bộ frontend BestShoes
 *
 * Nguyên tắc:
 *  - Giá trị DB / backend key KHÔNG thay đổi (vẫn là "Online", "In-store",
 *    "ADMIN", "MANAGER", "STAFF", v.v.)
 *  - Chỉ ánh xạ → nhãn hiển thị tiếng Việt ở tầng UI.
 *  - Bổ sung translation mới vào đây, sau đó import vào component cần dùng.
 */

// ─────────────────────────────────────────────────────────────────
// Loại đơn hàng  (giá trị DB: "Online" | "In-store")
// ─────────────────────────────────────────────────────────────────
export const ORDER_TYPE_LABEL = {
  Online: 'Trực tuyến',
  'In-store': 'Tại quầy',
};

// ─────────────────────────────────────────────────────────────────
// Trạng thái đơn hàng  (giá trị DB lưu tiếng Việt nên giữ nguyên)
// Dùng để hiển thị khi cần chuẩn hoá
// ─────────────────────────────────────────────────────────────────
export const ORDER_STATUS_LABEL = {
  'Chờ xác nhận':  'Chờ xác nhận',
  'Đã xác nhận':   'Đã xác nhận',
  'Đang giao':     'Đang giao',
  'Đã giao':       'Đã giao',
  'Đã hủy':        'Đã hủy',
  'Chờ POS':       'Chờ POS',
};

// ─────────────────────────────────────────────────────────────────
// Vai trò nhân viên  (giá trị DB: "ADMIN" | "MANAGER" | "STAFF")
// ─────────────────────────────────────────────────────────────────
export const ROLE_LABEL = {
  ADMIN:   'Quản trị viên',
  MANAGER: 'Quản lý',
  STAFF:   'Nhân viên',
};

/** Nhãn có biểu tượng emoji dùng trong bảng / badge */
export const ROLE_ICON_LABEL = {
  ADMIN:   '👑 Quản trị viên',
  MANAGER: '🔧 Quản lý',
  STAFF:   '👤 Nhân viên',
};

// ─────────────────────────────────────────────────────────────────
// Cấu hình thẻ chọn vai trò trong form thêm/sửa nhân viên
// ─────────────────────────────────────────────────────────────────
export const ROLE_CARDS = [
  { key: 'STAFF',   icon: '👤', label: 'Nhân viên',     desc: 'Xem và xử lý đơn hàng' },
  { key: 'MANAGER', icon: '🔧', label: 'Quản lý',       desc: 'Quản lý sản phẩm, đơn hàng' },
  { key: 'ADMIN',   icon: '👑', label: 'Quản trị viên', desc: 'Toàn quyền hệ thống' },
];

// ─────────────────────────────────────────────────────────────────
// Tùy chọn sắp xếp sản phẩm (dùng ở SortControls)
// ─────────────────────────────────────────────────────────────────
export const SORT_OPTIONS = [
  'Đề xuất',
  'Giá: Tăng dần',
  'Giá: Giảm dần',
  'Mới nhất',
  'Đánh giá',
];

// ─────────────────────────────────────────────────────────────────
// Loại khuyến mãi
// ─────────────────────────────────────────────────────────────────
export const PROMOTION_TYPE_LABEL = {
  percentage: 'Giảm theo %',
  fixed:      'Giảm cố định',
  flash_sale: 'Flash Sale',
};

// ─────────────────────────────────────────────────────────────────
// Thông báo giả (mock) trong AdminHeader
// ─────────────────────────────────────────────────────────────────
export const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: 'warning',
    title: 'Cảnh báo hàng sắp hết',
    message: '5 sản phẩm sắp hết hàng',
    time: '5 phút trước',
    read: false,
  },
  {
    id: 2,
    type: 'success',
    title: 'Đơn hàng mới',
    message: 'Đơn hàng #1234 vừa được đặt',
    time: '15 phút trước',
    read: false,
  },
  {
    id: 3,
    type: 'info',
    title: 'Cập nhật hệ thống',
    message: 'Tính năng mới đã được triển khai',
    time: '1 giờ trước',
    read: true,
  },
];
