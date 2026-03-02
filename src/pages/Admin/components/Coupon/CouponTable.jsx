import React from 'react';
import {
    Pencil, Trash2, Eye, EyeOff, Ticket,
    ArrowUpDown, ChevronUp, ChevronDown,
} from 'lucide-react';

/* ── helpers ─────────────────────────────────────────────────────── */

const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit',
    });
};

const formatCurrency = (amount) => {
    if (amount == null) return '-';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const getStatusInfo = (coupon) => {
    const now = new Date();
    const start = new Date(coupon.startDate);
    const end = new Date(coupon.endDate);
    if (!coupon.status) return { label: 'Ẩn', className: 'inactive' };
    if (now > end) return { label: 'Hết hạn', className: 'expired' };
    if (now < start) return { label: 'Sắp tới', className: 'upcoming' };
    return { label: 'Hoạt động', className: 'active' };
};

const getUsageText = (usedCount, usageLimit) => {
    if (!usageLimit) return `${usedCount || 0}`;
    return `${usedCount || 0}/${usageLimit}`;
};

const getUsagePercent = (usedCount, usageLimit) => {
    if (!usageLimit || usageLimit <= 0) return 0;
    return Math.min(100, Math.round(((usedCount || 0) / usageLimit) * 100));
};

/* ── columns ─────────────────────────────────────────────────────── */

const COLUMNS = [
    { key: 'index', label: '#', sortable: false, width: 44 },
    { key: 'code', label: 'Mã', sortable: true },
    { key: 'name', label: 'Tên mã giảm giá', sortable: true },
    { key: 'type', label: 'Loại', sortable: true },
    { key: 'value', label: 'Giá trị', sortable: true },
    { key: 'minimumAmount', label: 'Đơn tối thiểu', sortable: true },
    { key: 'usage', label: 'Sử dụng', sortable: false },
    { key: 'startDate', label: 'Thời hạn', sortable: true },
    { key: 'status', label: 'Trạng thái', sortable: false },
    { key: 'actions', label: 'Thao tác', sortable: false },
];

/* ── component ───────────────────────────────────────────────────── */

const CouponTable = ({
    coupons,
    loading,
    onRowClick,
    onEdit,
    onToggleStatus,
    onDelete,
    sortConfig,
    onSort,
    selectedCouponId,
    pageOffset = 0,
}) => {

    const renderSortArrow = (colKey) => {
        if (!sortConfig || sortConfig.key !== colKey) {
            return <span className="sort-arrow"><ArrowUpDown size={12} /></span>;
        }
        return (
            <span className="sort-arrow active">
                {sortConfig.dir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </span>
        );
    };

    /* loading skeleton */
    if (loading) {
        return (
            <div className="cm-table-wrap">
                <div className="cm-skeleton" style={{ padding: 20 }}>
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="cm-skeleton-row" style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
                            <div className="cm-skeleton-block" style={{ width: 30, height: 16 }} />
                            <div className="cm-skeleton-block" style={{ width: 80, height: 16 }} />
                            <div className="cm-skeleton-block" style={{ width: 160, height: 16 }} />
                            <div className="cm-skeleton-block" style={{ width: 90, height: 16 }} />
                            <div className="cm-skeleton-block" style={{ width: 80, height: 16 }} />
                            <div className="cm-skeleton-block" style={{ width: 100, height: 16 }} />
                            <div className="cm-skeleton-block" style={{ width: 70, height: 16 }} />
                            <div className="cm-skeleton-block" style={{ width: 140, height: 16 }} />
                            <div className="cm-skeleton-block" style={{ width: 80, height: 16 }} />
                            <div className="cm-skeleton-block" style={{ width: 100, height: 16 }} />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    /* empty state */
    if (!coupons || coupons.length === 0) {
        return (
            <div className="cm-table-wrap">
                <div className="cm-empty">
                    <div className="cm-empty-icon"><Ticket size={48} /></div>
                    <h3>Không tìm thấy mã giảm giá nào</h3>
                    <p>Thử thay đổi bộ lọc hoặc tạo mã giảm giá mới</p>
                </div>
            </div>
        );
    }

    return (
        <div className="cm-table-wrap">
            <div className="cm-table-scroll">
                <table className="cm-table" role="table">
                    <thead>
                        <tr>
                            {COLUMNS.map((col) => (
                                <th
                                    key={col.key}
                                    style={col.width ? { width: col.width } : undefined}
                                    onClick={() => col.sortable && onSort?.(col.key)}
                                    aria-sort={
                                        sortConfig?.key === col.key
                                            ? sortConfig.dir === 'asc' ? 'ascending' : 'descending'
                                            : undefined
                                    }
                                >
                                    {col.label}
                                    {col.sortable && renderSortArrow(col.key)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {coupons.map((coupon, idx) => {
                            const statusInfo = getStatusInfo(coupon);
                            const isSelected = selectedCouponId === coupon.couponId;
                            const usagePct = getUsagePercent(coupon.usedCount, coupon.usageLimit);

                            return (
                                <tr
                                    key={coupon.couponId}
                                    className={isSelected ? 'selected' : ''}
                                    onClick={(e) => {
                                        if (e.target.closest('.cm-actions')) return;
                                        onRowClick?.(coupon);
                                    }}
                                    tabIndex={0}
                                    onKeyDown={(e) => e.key === 'Enter' && onRowClick?.(coupon)}
                                >
                                    {/* # */}
                                    <td style={{ textAlign: 'center', color: 'var(--gray-400)', fontSize: 12 }}>
                                        {pageOffset + idx + 1}
                                    </td>

                                    {/* code */}
                                    <td>
                                        <span className="cm-coupon-code">{coupon.code}</span>
                                    </td>

                                    {/* name + description */}
                                    <td>
                                        <div className="cm-coupon-name-cell">
                                            <span className="name">{coupon.name || <i style={{ color: 'var(--gray-400)' }}>Chưa đặt tên</i>}</span>
                                            {coupon.description && (
                                                <span className="description">
                                                    {coupon.description.length > 50
                                                        ? coupon.description.substring(0, 50) + '…'
                                                        : coupon.description}
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    {/* type badge */}
                                    <td>
                                        <span className={`cm-type-badge ${coupon.type === 'Percentage' ? 'percentage' : 'fixed'}`}>
                                            {coupon.type === 'Percentage' ? 'Phần trăm' : 'Cố định'}
                                        </span>
                                    </td>

                                    {/* value */}
                                    <td>
                                        <span className="cm-discount-value">
                                            {coupon.type === 'Percentage'
                                                ? `${coupon.value}%`
                                                : formatCurrency(coupon.value)
                                            }
                                        </span>
                                    </td>

                                    {/* minimum amount */}
                                    <td style={{ fontSize: 13 }}>
                                        {coupon.minimumAmount
                                            ? formatCurrency(coupon.minimumAmount)
                                            : <span style={{ color: 'var(--gray-400)' }}>—</span>
                                        }
                                    </td>

                                    {/* usage */}
                                    <td>
                                        <div className="cm-usage-cell">
                                            <span className="cm-usage-text">
                                                {getUsageText(coupon.usedCount, coupon.usageLimit)}
                                            </span>
                                            {coupon.usageLimit > 0 && (
                                                <div className="cm-usage-bar">
                                                    <div
                                                        className="cm-usage-bar-fill"
                                                        style={{
                                                            width: `${usagePct}%`,
                                                            background: usagePct >= 90
                                                                ? 'var(--danger-500)'
                                                                : usagePct >= 50
                                                                    ? 'var(--warning-500)'
                                                                    : 'var(--success-500)',
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    {/* date range */}
                                    <td>
                                        <div className="cm-date-cell">
                                            <span>{formatDate(coupon.startDate)}</span>
                                            <small>→ {formatDate(coupon.endDate)}</small>
                                        </div>
                                    </td>

                                    {/* status badge */}
                                    <td>
                                        <span className={`cm-status-badge ${statusInfo.className}`}>
                                            <span className="cm-badge-dot" style={{
                                                background: statusInfo.className === 'active' ? 'var(--success-500)'
                                                    : statusInfo.className === 'inactive' ? 'var(--danger-500)'
                                                        : statusInfo.className === 'expired' ? 'var(--warning-500)'
                                                            : 'var(--primary-500)',
                                            }} />
                                            {statusInfo.label}
                                        </span>
                                    </td>

                                    {/* actions */}
                                    <td onClick={(e) => e.stopPropagation()}>
                                        <div className="cm-actions">
                                            <button
                                                className="cm-action-btn"
                                                aria-label="Edit"
                                                title="Chỉnh sửa"
                                                onClick={() => onEdit?.(coupon)}
                                            >
                                                <Pencil size={15} />
                                            </button>
                                            <button
                                                className="cm-action-btn"
                                                aria-label={coupon.status ? 'Ẩn' : 'Bật'}
                                                title={coupon.status ? 'Ẩn mã giảm giá' : 'Kích hoạt mã giảm giá'}
                                                onClick={() => onToggleStatus?.(coupon)}
                                            >
                                                {coupon.status ? <Eye size={15} /> : <EyeOff size={15} />}
                                            </button>
                                            <button
                                                className="cm-action-btn"
                                                aria-label="Delete"
                                                title="Xóa"
                                                onClick={() => onDelete?.(coupon)}
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CouponTable;
