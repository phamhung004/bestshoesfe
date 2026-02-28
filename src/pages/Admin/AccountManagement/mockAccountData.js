/* ═══════════════════════════════════════════════════════════
   Mock data for Account Management Page
   ═══════════════════════════════════════════════════════════ */

const now = new Date();
const daysAgo = (d) => {
  const date = new Date(now);
  date.setDate(date.getDate() - d);
  return date.toISOString();
};

// ── Customers ────────────────────────────────────────────────
export const mockCustomers = [
  {
    customerId: 1,
    fullName: 'Nguyễn Văn Minh',
    email: 'minh@gmail.com',
    phone: '0912345678',
    gender: 'Nam',
    dateOfBirth: '1998-05-15',
    status: 1,
    verifiedAt: daysAgo(180),
    createdAt: daysAgo(180),
    updatedAt: daysAgo(2),
    avatar: null,
    totalOrders: 15,
    totalSpending: 18500000,
  },
  {
    customerId: 2,
    fullName: 'Trần Thị Lan',
    email: 'lan@gmail.com',
    phone: '0987654321',
    gender: 'Nữ',
    dateOfBirth: '1995-11-22',
    status: 1,
    verifiedAt: daysAgo(60),
    createdAt: daysAgo(60),
    updatedAt: daysAgo(5),
    avatar: null,
    totalOrders: 8,
    totalSpending: 4200000,
  },
  {
    customerId: 3,
    fullName: 'Lê Hoàng Nam',
    email: 'nam@yahoo.com',
    phone: '0901234567',
    gender: 'Nam',
    dateOfBirth: '2000-03-10',
    status: 0,
    verifiedAt: daysAgo(45),
    createdAt: daysAgo(45),
    updatedAt: daysAgo(10),
    avatar: null,
    totalOrders: 2,
    totalSpending: 750000,
    lockReason: 'Vi phạm chính sách hoàn trả',
  },
  {
    customerId: 4,
    fullName: 'Phạm Thị Hoa',
    email: 'hoa@gmail.com',
    phone: '0978123456',
    gender: 'Nữ',
    dateOfBirth: '1990-08-30',
    status: 1,
    verifiedAt: daysAgo(365),
    createdAt: daysAgo(365),
    updatedAt: daysAgo(1),
    avatar: null,
    totalOrders: 32,
    totalSpending: 45800000,
  },
  {
    customerId: 5,
    fullName: 'Đặng Minh Tuấn',
    email: 'tuan@outlook.com',
    phone: null,
    gender: 'Nam',
    dateOfBirth: '1997-01-05',
    status: 1,
    verifiedAt: null,
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3),
    avatar: null,
    totalOrders: 0,
    totalSpending: 0,
  },
  {
    customerId: 6,
    fullName: 'Nguyễn Thị Thu',
    email: 'thu@gmail.com',
    phone: '0965432198',
    gender: 'Nữ',
    dateOfBirth: '1993-07-18',
    status: 1,
    verifiedAt: daysAgo(90),
    createdAt: daysAgo(90),
    updatedAt: daysAgo(7),
    avatar: null,
    totalOrders: 6,
    totalSpending: 3100000,
  },
  {
    customerId: 7,
    fullName: 'Võ Thanh Long',
    email: 'long@gmail.com',
    phone: '0932198765',
    gender: 'Nam',
    dateOfBirth: '2001-12-01',
    status: 1,
    verifiedAt: null,
    createdAt: daysAgo(7),
    updatedAt: daysAgo(7),
    avatar: null,
    totalOrders: 1,
    totalSpending: 380000,
  },
  {
    customerId: 8,
    fullName: 'Bùi Thị Bích',
    email: 'bich@gmail.com',
    phone: '0945678901',
    gender: 'Nữ',
    dateOfBirth: '1996-04-25',
    status: 1,
    verifiedAt: daysAgo(240),
    createdAt: daysAgo(240),
    updatedAt: daysAgo(3),
    avatar: null,
    totalOrders: 12,
    totalSpending: 9750000,
  },
];

// ── Employees ────────────────────────────────────────────────
export const mockEmployees = [
  {
    employeeId: 1,
    fullName: 'Nguyễn Admin',
    email: 'admin@bestshoes.com',
    phone: '0900000001',
    roleId: 1,
    roleName: 'ADMIN',
    status: 1,
    createdAt: daysAgo(365),
    updatedAt: daysAgo(1),
    avatar: null,
  },
  {
    employeeId: 2,
    fullName: 'Trần Quản Lý',
    email: 'manager@bestshoes.com',
    phone: '0900000002',
    roleId: 2,
    roleName: 'MANAGER',
    status: 1,
    createdAt: daysAgo(200),
    updatedAt: daysAgo(5),
    avatar: null,
  },
  {
    employeeId: 3,
    fullName: 'Lê Nhân Viên',
    email: 'staff1@bestshoes.com',
    phone: '0900000003',
    roleId: 3,
    roleName: 'STAFF',
    status: 1,
    createdAt: daysAgo(150),
    updatedAt: daysAgo(10),
    avatar: null,
  },
  {
    employeeId: 4,
    fullName: 'Phạm Thị Sale',
    email: 'staff2@bestshoes.com',
    phone: '0900000004',
    roleId: 3,
    roleName: 'STAFF',
    status: 0,
    createdAt: daysAgo(120),
    updatedAt: daysAgo(30),
    avatar: null,
  },
];

// ── Addresses (for customer 1: Nguyễn Văn Minh) ─────────────
export const mockAddresses = [
  {
    addressId: 1,
    customerId: 1,
    recipientName: 'Nguyễn Văn Minh',
    phone: '0912345678',
    province: 'TP. Hồ Chí Minh',
    district: 'Quận 1',
    ward: 'Phường Bến Nghé',
    streetAddress: '123 Nguyễn Huệ',
    isDefault: true,
    createdAt: daysAgo(170),
  },
  {
    addressId: 2,
    customerId: 1,
    recipientName: 'Nguyễn Văn Minh',
    phone: '0912345678',
    province: 'TP. Hồ Chí Minh',
    district: 'Quận 1',
    ward: 'Phường Phạm Ngũ Lão',
    streetAddress: '456 Lê Lợi',
    isDefault: false,
    createdAt: daysAgo(100),
  },
];

// ── Orders (for customer 1: Nguyễn Văn Minh) ────────────────
export const mockOrders = [
  {
    orderId: 1,
    customerId: 1,
    orderNumber: 'ORD-20260223-001',
    status: 'Đã giao',
    totalAmount: 3200000,
    createdAt: daysAgo(5),
    itemCount: 2,
    items: [
      { name: 'Nike Air Max 90', thumbnail: null },
      { name: 'Adidas Ultraboost', thumbnail: null },
    ],
  },
  {
    orderId: 2,
    customerId: 1,
    orderNumber: 'ORD-20260220-002',
    status: 'Đang giao',
    totalAmount: 5800000,
    createdAt: daysAgo(8),
    itemCount: 3,
    items: [
      { name: 'Puma RS-X', thumbnail: null },
      { name: 'New Balance 574', thumbnail: null },
      { name: 'Nike Dunk Low', thumbnail: null },
    ],
  },
  {
    orderId: 3,
    customerId: 1,
    orderNumber: 'ORD-20260215-003',
    status: 'Đã hủy',
    totalAmount: 1500000,
    createdAt: daysAgo(13),
    itemCount: 1,
    items: [
      { name: 'Adidas Stan Smith', thumbnail: null },
    ],
  },
];

// ── Helpers ──────────────────────────────────────────────────
export const CURRENT_EMPLOYEE_ID = 1; // logged-in admin

export function getMemberTier(totalSpending) {
  if (totalSpending > 20000000) return 'Bạch Kim';
  if (totalSpending >= 5000000) return 'Vàng';
  if (totalSpending >= 1000000) return 'Bạc';
  return 'Đồng';
}

export function getCustomerStatus(customer) {
  if (customer.status === 0) return 'locked';
  if (!customer.verifiedAt) return 'unverified';
  return 'active';
}

export function formatVND(amount) {
  return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
}

export function formatDate(isoStr) {
  const d = new Date(isoStr);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export function formatDateTime(isoStr) {
  const d = new Date(isoStr);
  return `${formatDate(isoStr)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function relativeTime(isoStr) {
  const diff = Math.floor((now - new Date(isoStr)) / 1000);
  if (diff < 60) return 'Vừa xong';
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} ngày trước`;
  if (diff < 31536000) return `${Math.floor(diff / 2592000)} tháng trước`;
  return `${Math.floor(diff / 31536000)} năm trước`;
}

export function isNewCustomer(createdAt) {
  const diff = (now - new Date(createdAt)) / (1000 * 60 * 60 * 24);
  return diff <= 7;
}

export function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0][0].toUpperCase();
}

const AVATAR_COLORS = [
  { bg: '#eef2ff', text: '#4f46e5' }, // indigo
  { bg: '#f3e8ff', text: '#7c3aed' }, // purple
  { bg: '#dcfce7', text: '#16a34a' }, // green
  { bg: '#ffedd5', text: '#ea580c' }, // orange
  { bg: '#fce7f3', text: '#db2777' }, // pink
  { bg: '#ccfbf1', text: '#0d9488' }, // teal
];

export function getAvatarColor(id) {
  return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

// ── KPI computed data ────────────────────────────────────────
export function computeCustomerKpis(customers) {
  const total = customers.length;
  const active = customers.filter((c) => c.status === 1 && c.verifiedAt).length;
  const locked = customers.filter((c) => c.status === 0).length;
  const unverified = customers.filter((c) => c.status === 1 && !c.verifiedAt).length;
  const newThisMonth = customers.filter((c) => {
    const d = new Date(c.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const activePercent = total > 0 ? ((active / total) * 100).toFixed(1) : '0';
  return { total, active, locked, unverified, newThisMonth, activePercent };
}

export function computeEmployeeKpis(employees) {
  const total = employees.length;
  const admins = employees.filter((e) => e.roleName === 'ADMIN' && e.status === 1).length;
  const managers = employees.filter((e) => e.roleName === 'MANAGER' && e.status === 1).length;
  const staff = employees.filter((e) => e.roleName === 'STAFF' && e.status === 1).length;
  return { total, admins, managers, staff };
}
