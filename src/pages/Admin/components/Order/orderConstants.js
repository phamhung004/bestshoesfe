export const STATUS_CONFIG = {
    'Chờ xác nhận':       { color: '#EAB308', bg: '#FEF9C3', label: 'Chờ xác nhận' },
    'Đã xác nhận':        { color: '#3B82F6', bg: '#DBEAFE', label: 'Đã xác nhận' },
    'Đang đóng gói':      { color: '#F97316', bg: '#FFF7ED', label: 'Đang đóng gói' },
    'Bàn giao ĐVVC':      { color: '#0EA5E9', bg: '#E0F2FE', label: 'Bàn giao ĐVVC' },
    'Đang giao':          { color: '#8B5CF6', bg: '#EDE9FE', label: 'Đang giao' },
    'Đã giao':            { color: '#22C55E', bg: '#DCFCE7', label: 'Đã giao' },
    'Trả hàng/Hoàn tiền': { color: '#F97316', bg: '#FFF7ED', label: 'Trả hàng/Hoàn tiền' },
    'Đã hủy':             { color: '#EF4444', bg: '#FEE2E2', label: 'Đã hủy' },
    'Chờ POS':            { color: '#0D9488', bg: '#CCFBF1', label: 'Hóa đơn chờ' },
};

export const PAYMENT_CONFIG = {
    'Đã thanh toán':             { color: '#16A34A', bg: '#DCFCE7' },
    'Chưa thanh toán':           { color: '#EA580C', bg: '#FFF7ED' },
    'Chờ thanh toán':            { color: '#CA8A04', bg: '#FEF9C3' },
    'Cần xác nhận thanh toán': { color: '#7C3AED', bg: '#EDE9FE' },
    'Không thanh toán':          { color: '#EF4444', bg: '#FEE2E2' },
};

export const PAYMENT_METHOD_LABEL = {
    'COD':            'Thanh toán khi nhận hàng (COD)',
    'BANK_TRANSFER':  'Chuyển khoản ngân hàng',
    'CASH':           'Tiền mặt',
    'cash':           'Tiền mặt',
};

export const ALL_STATUSES = [
    'Tất cả',
    'Chờ xác nhận',
    'Đã xác nhận',
    'Đang đóng gói',
    'Bàn giao ĐVVC',
    'Đang giao',
    'Đã giao',
    'Trả hàng/Hoàn tiền',
    'Đã hủy',
    'Chờ POS',
];

/**
 * Valid forward status transitions map.
 * Mirrors backend validateStatusTransition logic:
 *  - Chờ xác nhận → Đã xác nhận → Đang đóng gói → Bàn giao ĐVVC → Đang giao → Đã giao
 *  - "Trả hàng/Hoàn tiền" can be reached from "Đã giao"
 *  - "Đã hủy" is handled separately via the dedicated cancel button/endpoint
 *  - "Đã hủy" and "Trả hàng/Hoàn tiền" are terminal states
 */
export const VALID_NEXT_STATUSES = {
    'Chờ xác nhận':       ['Đã xác nhận'],
    'Đã xác nhận':        ['Đang đóng gói'],
    'Đang đóng gói':      ['Bàn giao ĐVVC'],
    'Bàn giao ĐVVC':      ['Đang giao'],
    'Đang giao':          ['Đã giao'],
    'Đã giao':            ['Trả hàng/Hoàn tiền'],
    'Trả hàng/Hoàn tiền': [],
    'Đã hủy':             [],
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
