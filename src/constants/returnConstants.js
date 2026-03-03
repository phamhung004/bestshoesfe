// Number of days after delivery during which a return can be requested
export const RETURN_WINDOW_DAYS = 7;

// Preset return reason options shown to the customer
export const RETURN_REASONS = [
    'Sản phẩm bị lỗi / hư hỏng',
    'Sản phẩm không đúng mô tả',
    'Không vừa size',
    'Giao sai màu sắc',
    'Nhận sai sản phẩm',
    'Sản phẩm kém chất lượng',
    'Khác',
];

// Return status display config: badge CSS class suffix + label
export const RETURN_STATUS_CONFIG = {
    'Chờ duyệt':   { cls: 'acc-badge-yellow',  label: 'Chờ duyệt'   },
    'Đã duyệt':    { cls: 'acc-badge-blue',     label: 'Đã duyệt'    },
    'Đã nhận hàng':{ cls: 'acc-badge-purple',   label: 'Đã nhận hàng'},
    'Hoàn tiền':   { cls: 'acc-badge-green',    label: 'Hoàn tiền'   },
    'Từ chối':     { cls: 'acc-badge-red',      label: 'Từ chối'     },
};

// Maximum number of images a customer can attach
export const MAX_RETURN_IMAGES = 5;
