import React from 'react';
import {
    Pencil, Trash2, Package, Eye, EyeOff,
    Zap, Snowflake, Tag, Star,
    ArrowUpDown, ChevronUp, ChevronDown,
    ImageIcon,
} from 'lucide-react';

/* ── helpers ─────────────────────────────────────────────────────── */

const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit',
    });
};

const TYPE_CONFIG = {
    flash_sale: { label: 'Flash Sale', icon: Zap, className: 'flash-sale' },
    seasonal: { label: 'Theo mùa', icon: Snowflake, className: 'seasonal' },
    clearance: { label: 'Thanh lý', icon: Tag, className: 'clearance' },
    special: { label: 'Đặc biệt', icon: Star, className: 'special' },
};

const getStatusInfo = (promotion) => {
    const now = new Date();
    const start = new Date(promotion.startDate);
    const end = new Date(promotion.endDate);

    if (!promotion.isActive) return { label: 'Đã tắt', className: 'inactive' };
    if (now > end) return { label: 'Hết hạn', className: 'expired' };
    if (now < start) return { label: 'Sắp tới', className: 'upcoming' };
    return { label: 'Đang chạy', className: 'active' };
};

/* ── columns ─────────────────────────────────────────────────────── */

const COLUMNS = [
    { key: 'index', label: '#', sortable: false, width: 44 },
    { key: 'name', label: 'Tên đợt giảm giá', sortable: true },
    { key: 'type', label: 'Loại', sortable: true },
    { key: 'discount', label: 'Giảm giá', sortable: false },
    { key: 'startDate', label: 'Thời gian', sortable: true },
    { key: 'status', label: 'Trạng thái', sortable: false },
    { key: 'variantCount', label: 'SP áp dụng', sortable: true },
    { key: 'actions', label: 'Thao tác', sortable: false },
];

/* ── component ───────────────────────────────────────────────────── */

const PromotionTable = ({
    promotions,
    loading,
    onRowClick,
    onEdit,
    onManageVariants,
    onToggleStatus,
    onDelete,
    sortConfig,
    onSort,
    selectedPromotionId,
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
            <div className="pm-table-wrap">
                <div className="pm-skeleton" style={{ padding: 20 }}>
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="pm-skeleton-row" style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
                            <div className="pm-skeleton-block" style={{ width: 30, height: 16 }} />
                            <div className="pm-skeleton-block" style={{ width: 180, height: 16 }} />
                            <div className="pm-skeleton-block" style={{ width: 90, height: 16 }} />
                            <div className="pm-skeleton-block" style={{ width: 100, height: 16 }} />
                            <div className="pm-skeleton-block" style={{ width: 150, height: 16 }} />
                            <div className="pm-skeleton-block" style={{ width: 80, height: 16 }} />
                            <div className="pm-skeleton-block" style={{ width: 60, height: 16 }} />
                            <div className="pm-skeleton-block" style={{ width: 110, height: 16 }} />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    /* empty state */
    if (!promotions || promotions.length === 0) {
        return (
            <div className="pm-table-wrap">
                <div className="pm-empty">
                    <div className="pm-empty-icon"><Tag size={48} /></div>
                    <h3>Không tìm thấy đợt giảm giá nào</h3>
                    <p>Thử thay đổi bộ lọc hoặc tạo đợt giảm giá mới</p>
                </div>
            </div>
        );
    }

    return (
        <div className="pm-table-wrap">
            <div className="pm-table-scroll">
                <table className="pm-table" role="table">
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
                        {promotions.map((promo, idx) => {
                            const typeCfg = TYPE_CONFIG[promo.type] || {};
                            const TypeIcon = typeCfg.icon || Tag;
                            const statusInfo = getStatusInfo(promo);
                            const isSelected = selectedPromotionId === promo.promotionId;

                            return (
                                <tr
                                    key={promo.promotionId}
                                    className={isSelected ? 'selected' : ''}
                                    onClick={(e) => {
                                        if (e.target.closest('.pm-actions')) return;
                                        onRowClick?.(promo);
                                    }}
                                    tabIndex={0}
                                    onKeyDown={(e) => e.key === 'Enter' && onRowClick?.(promo)}
                                >
                                    {/* # */}
                                    <td style={{ textAlign: 'center', color: 'var(--gray-400)', fontSize: 12 }}>
                                        {pageOffset + idx + 1}
                                    </td>

                                    {/* name + description */}
                                    <td>
                                        <div className="pm-promo-name">
                                            <span className="name">{promo.name}</span>
                                            {promo.description && (
                                                <span className="description">
                                                    {promo.description.length > 60
                                                        ? promo.description.substring(0, 60) + '…'
                                                        : promo.description}
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    {/* type badge */}
                                    <td>
                                        <span className={`pm-type-badge ${typeCfg.className || ''}`}>
                                            <TypeIcon size={12} />
                                            {typeCfg.label || promo.type}
                                        </span>
                                    </td>

                                    {/* discount */}
                                    <td>
                                        <span className="pm-discount">
                                            {promo.discountPercentage ? `${promo.discountPercentage}%` : '-'}
                                        </span>
                                    </td>

                                    {/* date range */}
                                    <td>
                                        <div className="pm-date-cell">
                                            <span>{formatDate(promo.startDate)}</span>
                                            <small>→ {formatDate(promo.endDate)}</small>
                                        </div>
                                    </td>

                                    {/* status badge */}
                                    <td>
                                        <span className={`pm-status-badge ${statusInfo.className}`}>
                                            <span className="pm-badge-dot" style={{
                                                background: statusInfo.className === 'active' ? 'var(--success-500)'
                                                    : statusInfo.className === 'inactive' ? 'var(--danger-500)'
                                                    : statusInfo.className === 'expired' ? 'var(--warning-500)'
                                                    : 'var(--primary-500)',
                                            }} />
                                            {statusInfo.label}
                                        </span>
                                    </td>

                                    {/* variant count */}
                                    <td style={{ textAlign: 'center' }}>
                                        <span className="pm-variant-count">
                                            {promo.variantCount ?? promo.promotionDetails?.length ?? '-'}
                                        </span>
                                    </td>

                                    {/* actions */}
                                    <td onClick={(e) => e.stopPropagation()}>
                                        <div className="pm-actions">
                                            <button
                                                className="pm-action-btn"
                                                aria-label="Edit"
                                                title="Chỉnh sửa"
                                                onClick={() => onEdit?.(promo)}
                                            >
                                                <Pencil size={15} />
                                            </button>
                                            <button
                                                className="pm-action-btn"
                                                aria-label="View"
                                                title="Quản lý sản phẩm"
                                                onClick={() => onManageVariants?.(promo)}
                                            >
                                                <Package size={15} />
                                            </button>
                                            <button
                                                className="pm-action-btn"
                                                aria-label={promo.isActive ? 'Tắt' : 'Bật'}
                                                title={promo.isActive ? 'Tắt đợt giảm giá' : 'Bật đợt giảm giá'}
                                                onClick={() => onToggleStatus?.(promo)}
                                            >
                                                {promo.isActive ? <Eye size={15} /> : <EyeOff size={15} />}
                                            </button>
                                            <button
                                                className="pm-action-btn"
                                                aria-label="Delete"
                                                title="Xóa"
                                                onClick={() => onDelete?.(promo)}
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

export default PromotionTable;
