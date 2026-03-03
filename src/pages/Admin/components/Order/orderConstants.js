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

export const ALL_STATUSES = [
    'Tất cả',
    'Chờ xác nhận',
    'Đã xác nhận',
    'Đang giao',
    'Đã giao',
    'Trả hàng/Hoàn tiền',
    'Đã hủy',
];

/**
 * Valid forward status transitions map.
 * Mirrors backend validateStatusTransition logic:
 *  - Status flows forward: Chờ xác nhận → Đã xác nhận → Đang giao → Đã giao
 *  - "Trả hàng/Hoàn tiền" and "Đã hủy" can be reached from any active state
 *  - "Đã hủy" is a terminal state (no further transitions)
 *  - "Trả hàng/Hoàn tiền" is also terminal
 */
export const VALID_NEXT_STATUSES = {
    'Chờ xác nhận': ['Đã xác nhận', 'Đang giao', 'Đã giao', 'Trả hàng/Hoàn tiền', 'Đã hủy'],
    'Đã xác nhận': ['Đang giao', 'Đã giao', 'Trả hàng/Hoàn tiền', 'Đã hủy'],
    'Đang giao': ['Đã giao', 'Trả hàng/Hoàn tiền', 'Đã hủy'],
    'Đã giao': ['Trả hàng/Hoàn tiền', 'Đã hủy'],
    'Trả hàng/Hoàn tiền': [],
    'Đã hủy': [],
};

/**
 * Check if a status is a terminal state (no further transitions allowed)
 */
export const isTerminalStatus = (status) => {
    return status === 'Đã hủy' || status === 'Trả hàng/Hoàn tiền';
};

/**
 * Get the list of valid next statuses for a given current status
 */
export const getValidNextStatuses = (currentStatus) => {
    return VALID_NEXT_STATUSES[currentStatus] || [];
};
