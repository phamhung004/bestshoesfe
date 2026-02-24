import React, { useState } from 'react';
import {
    RETURN_STATUS_CONFIG, REASON_CONFIG, REFUND_METHODS,
    formatVND, formatDate, relativeTime, getInitials,
} from './mockReturns';

/**
 * ReturnTable — sortable data table with checkboxes, status badges,
 * reason pills, action buttons, skeleton loading, and empty state.
 */
const ReturnTable = ({
    returns,
    selectedIds,
    onToggleSelect,
    onToggleSelectAll,
    onRowClick,
    sortConfig,
    onSort,
    onCopyReturnCode,
    onApprove,
    onReject,
    onPrint,
    allSelected,
    loading,
}) => {
    const [openMore, setOpenMore] = useState(null);
    const [openQuick, setOpenQuick] = useState(null);
    const [orderPopover, setOrderPopover] = useState(null);

    // Sort arrow helper
    const sortArrow = (key) => {
        if (sortConfig.key !== key) return <span className="sort-arrow">↕</span>;
        return <span className="sort-arrow active">{sortConfig.dir === 'asc' ? '↑' : '↓'}</span>;
    };

    // Close dropdowns on outside click
    const handleRowAction = (e, returnItem, action) => {
        e.stopPropagation();
        action(returnItem);
    };

    // Skeleton loading rows
    if (loading) {
        return (
            <div className="rm-table-wrap">
                <div className="rm-table-scroll">
                    <table className="rm-table">
                        <thead>
                            <tr>
                                {Array.from({ length: 10 }).map((_, i) => (
                                    <th key={i}><div className="rm-skeleton-cell" style={{ width: i === 0 ? 16 : `${60 + i * 10}px` }}></div></th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: 5 }).map((_, rowIdx) => (
                                <tr key={rowIdx} className="rm-skeleton-row">
                                    {Array.from({ length: 10 }).map((_, colIdx) => (
                                        <td key={colIdx}>
                                            <div className="rm-skeleton-cell" style={{ width: `${50 + colIdx * 12}px`, height: 14 }}></div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    // Empty state
    if (returns.length === 0) {
        return (
            <div className="rm-table-wrap">
                <div className="rm-empty-state">
                    <div className="rm-empty-icon">↩️</div>
                    <h3>Không có yêu cầu trả hàng nào</h3>
                    <p>Thay đổi bộ lọc hoặc tạo yêu cầu trả hàng mới.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="rm-table-wrap">
            <div className="rm-table-scroll">
                <table className="rm-table">
                    <thead>
                        <tr>
                            <th style={{ width: 40 }}>
                                <input
                                    type="checkbox"
                                    className="rm-checkbox"
                                    checked={allSelected}
                                    onChange={onToggleSelectAll}
                                    aria-label="Chọn tất cả"
                                />
                            </th>
                            <th onClick={() => onSort('return_code')}>Mã yêu cầu {sortArrow('return_code')}</th>
                            <th onClick={() => onSort('order_number')}>Đơn gốc {sortArrow('order_number')}</th>
                            <th onClick={() => onSort('customer_name')}>Khách hàng {sortArrow('customer_name')}</th>
                            <th>Sản phẩm trả</th>
                            <th onClick={() => onSort('return_reason')}>Lý do {sortArrow('return_reason')}</th>
                            <th onClick={() => onSort('total_amount')}>Tiền hoàn {sortArrow('total_amount')}</th>
                            <th onClick={() => onSort('return_status')}>Trạng thái {sortArrow('return_status')}</th>
                            <th>P.thức hoàn</th>
                            <th onClick={() => onSort('created_at')}>Ngày YC {sortArrow('created_at')}</th>
                            <th style={{ width: 120 }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {returns.map(ret => {
                            const statusCfg = RETURN_STATUS_CONFIG[ret.return_status] || {};
                            const reasonCfg = REASON_CONFIG[ret.return_reason] || {};
                            const refundMethodObj = REFUND_METHODS.find(m => m.value === ret.refund_method);
                            const firstItem = ret.items[0];
                            const moreCount = ret.items.length - 1;
                            const isSelected = selectedIds.has(ret.return_id);
                            const isPartial = ret.total_amount !== ret.original_total;

                            return (
                                <tr
                                    key={ret.return_id}
                                    className={isSelected ? 'selected' : ''}
                                    onClick={() => onRowClick(ret)}
                                >
                                    {/* Checkbox */}
                                    <td onClick={e => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            className="rm-checkbox"
                                            checked={isSelected}
                                            onChange={() => onToggleSelect(ret.return_id)}
                                            aria-label={`Chọn ${ret.return_code}`}
                                        />
                                    </td>

                                    {/* Return code */}
                                    <td>
                                        <span
                                            className="rm-return-code"
                                            onClick={e => handleRowAction(e, ret, () => onCopyReturnCode(ret.return_code))}
                                            title="Click để sao chép"
                                        >
                                            {ret.return_code}
                                        </span>
                                    </td>

                                    {/* Order number */}
                                    <td onClick={e => e.stopPropagation()}>
                                        <div className="rm-order-popover-wrap">
                                            <span
                                                className="rm-order-chip"
                                                onClick={() => setOrderPopover(orderPopover === ret.return_id ? null : ret.return_id)}
                                            >
                                                {ret.order_number}
                                            </span>
                                            {orderPopover === ret.return_id && (
                                                <div className="rm-order-popover">
                                                    <div className="pop-row">
                                                        <span className="pop-label">Mã đơn:</span>
                                                        <span className="pop-value">{ret.order_number}</span>
                                                    </div>
                                                    <div className="pop-row">
                                                        <span className="pop-label">Ngày đặt:</span>
                                                        <span className="pop-value">{formatDate(ret.order_created_at)}</span>
                                                    </div>
                                                    <div className="pop-row">
                                                        <span className="pop-label">Loại:</span>
                                                        <span className="pop-value">{ret.order_type}</span>
                                                    </div>
                                                    <div className="pop-row">
                                                        <span className="pop-label">Tổng đơn:</span>
                                                        <span className="pop-value">{formatVND(ret.original_total)}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    {/* Customer */}
                                    <td>
                                        <div className="rm-customer-cell">
                                            <div className="rm-avatar">{getInitials(ret.customer_name)}</div>
                                            <div className="rm-customer-info">
                                                <strong>{ret.customer_name}</strong>
                                                <span>{ret.customer_phone}</span>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Products */}
                                    <td>
                                        {firstItem && (
                                            <div className="rm-product-cell">
                                                <img
                                                    src={firstItem.product.image_url}
                                                    alt={firstItem.product.name}
                                                    className="rm-product-thumb"
                                                />
                                                <div className="rm-product-info">
                                                    <span className="rm-product-name">{firstItem.product.name}</span>
                                                    <span className="rm-product-variant">
                                                        Size: {firstItem.size.size_name} / Màu: {firstItem.color.color_name}
                                                    </span>
                                                    <span className="rm-qty-badge">x{firstItem.quantity}</span>
                                                    {moreCount > 0 && (
                                                        <span className="rm-more-products">+{moreCount} sản phẩm khác</span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </td>

                                    {/* Reason */}
                                    <td>
                                        <span
                                            className="rm-reason-badge"
                                            style={{ background: reasonCfg.bg, color: reasonCfg.color }}
                                        >
                                            {reasonCfg.icon} {ret.return_reason}
                                        </span>
                                    </td>

                                    {/* Amount */}
                                    <td>
                                        <span className="rm-amount">{formatVND(ret.total_amount)}</span>
                                        {isPartial && (
                                            <span className="rm-amount-original">{formatVND(ret.original_total)}</span>
                                        )}
                                    </td>

                                    {/* Status */}
                                    <td>
                                        <span className="rm-badge" style={{ background: statusCfg.bg, color: statusCfg.color }}>
                                            <span className="rm-badge-dot" style={{ background: statusCfg.color }}></span>
                                            {statusCfg.label}
                                        </span>
                                    </td>

                                    {/* Refund method */}
                                    <td>
                                        <span className="rm-refund-method">
                                            {refundMethodObj?.icon} {ret.refund_method}
                                        </span>
                                    </td>

                                    {/* Date */}
                                    <td>
                                        <div className="rm-date-cell">
                                            {formatDate(ret.created_at)}
                                            <div className="rm-date-relative">{relativeTime(ret.created_at)}</div>
                                        </div>
                                    </td>

                                    {/* Actions */}
                                    <td onClick={e => e.stopPropagation()}>
                                        <div className="rm-actions">
                                            <button
                                                className="rm-action-btn"
                                                aria-label="Xem chi tiết"
                                                title="Xem chi tiết"
                                                onClick={() => onRowClick(ret)}
                                            >
                                                👁
                                            </button>

                                            {ret.return_status === 'Chờ duyệt' && (
                                                <div className="rm-more-dropdown-wrap">
                                                    <button
                                                        className="rm-action-btn"
                                                        aria-label="Duyệt / Từ chối"
                                                        title="Duyệt / Từ chối"
                                                        onClick={() => setOpenQuick(openQuick === ret.return_id ? null : ret.return_id)}
                                                    >
                                                        ✅
                                                    </button>
                                                    {openQuick === ret.return_id && (
                                                        <div className="rm-quick-action-dropdown">
                                                            <button className="approve-btn" onClick={() => { onApprove(ret); setOpenQuick(null); }}>
                                                                ✅ Duyệt yêu cầu
                                                            </button>
                                                            <button className="reject-btn" onClick={() => { onReject(ret); setOpenQuick(null); }}>
                                                                ❌ Từ chối
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <button
                                                className="rm-action-btn"
                                                aria-label="In phiếu trả"
                                                title="In phiếu trả"
                                                onClick={() => onPrint()}
                                            >
                                                🖨
                                            </button>

                                            <div className="rm-more-dropdown-wrap">
                                                <button
                                                    className="rm-action-btn"
                                                    aria-label="Thêm"
                                                    onClick={() => setOpenMore(openMore === ret.return_id ? null : ret.return_id)}
                                                >
                                                    ⋯
                                                </button>
                                                {openMore === ret.return_id && (
                                                    <div className="rm-more-dropdown">
                                                        <button onClick={() => { setOpenMore(null); }}>
                                                            📝 Ghi chú
                                                        </button>
                                                        <button onClick={() => { setOpenMore(null); }}>
                                                            📊 Xuất Excel dòng này
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
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

export default ReturnTable;
