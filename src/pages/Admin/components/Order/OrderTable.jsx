import React, { useState } from 'react';
import { formatVND } from '../../../../utils/formatPrice';
import {
    formatDate, relativeTime, getInitials,
} from './orderHelpers';
import { STATUS_CONFIG, PAYMENT_CONFIG } from './orderConstants';

/**
 * OrderTable: data table with sorting, bulk select, action buttons
 * Props:
 *  - orders: filtered/paginated array
 *  - selectedIds: Set of selected order_ids
 *  - onToggleSelect: (id) => void
 *  - onToggleSelectAll: () => void
 *  - onRowClick: (order) => void
 *  - sortConfig: { key, dir }
 *  - onSort: (key) => void
 *  - onCopyOrderNum: (orderNumber) => void
 *  - onPrintOrder: (order) => void
 *  - onCancelOrder: (order) => void
 *  - allSelected: boolean
 *  - loading: boolean
 */
const OrderTable = ({
    orders,
    selectedIds,
    onToggleSelect,
    onToggleSelectAll,
    onRowClick,
    sortConfig,
    onSort,
    onCopyOrderNum,
    onPrintOrder,
    onCancelOrder,
    allSelected,
    loading,
}) => {
    // Track which row's "more" dropdown is open
    const [openMore, setOpenMore] = useState(null);

    // Column definitions for sortable headers
    const columns = [
        { key: 'checkbox', label: '', sortable: false, width: 40 },
        { key: 'order_number', label: 'Mã đơn', sortable: true },
        { key: 'customer_name', label: 'Khách hàng', sortable: true },
        { key: 'items', label: 'Sản phẩm', sortable: false },
        { key: 'total_amount', label: 'Tổng tiền', sortable: true },
        { key: 'payment_status', label: 'Thanh toán', sortable: true },
        { key: 'status', label: 'Trạng thái', sortable: true },
        { key: 'order_type', label: 'Loại đơn', sortable: true },
        { key: 'created_at', label: 'Ngày đặt', sortable: true },
        { key: 'actions', label: 'Thao tác', sortable: false },
    ];

    // Sort arrow indicator
    const renderSortArrow = (colKey) => {
        if (!sortConfig || sortConfig.key !== colKey) {
            return <span className="sort-arrow">↕</span>;
        }
        return (
            <span className="sort-arrow active">
                {sortConfig.dir === 'asc' ? '↑' : '↓'}
            </span>
        );
    };

    // Skeleton loading rows
    if (loading) {
        return (
            <div className="om-table-wrap">
                <div className="om-skeleton" style={{ padding: 20 }}>
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="om-skeleton-row">
                            <div className="om-skeleton-block" style={{ width: 30, height: 16 }} />
                            <div className="om-skeleton-block" style={{ width: 120, height: 16 }} />
                            <div className="om-skeleton-block" style={{ width: 150, height: 16 }} />
                            <div className="om-skeleton-block" style={{ width: 180, height: 16 }} />
                            <div className="om-skeleton-block" style={{ width: 100, height: 16 }} />
                            <div className="om-skeleton-block" style={{ width: 90, height: 16 }} />
                            <div className="om-skeleton-block" style={{ width: 90, height: 16 }} />
                            <div className="om-skeleton-block" style={{ width: 70, height: 16 }} />
                            <div className="om-skeleton-block" style={{ width: 110, height: 16 }} />
                            <div className="om-skeleton-block" style={{ width: 80, height: 16 }} />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Empty state
    if (!orders || orders.length === 0) {
        return (
            <div className="om-table-wrap">
                <div className="om-empty">
                    <div className="om-empty-icon">📭</div>
                    <h3>Không tìm thấy đơn hàng nào</h3>
                    <p>Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác</p>
                </div>
            </div>
        );
    }

    return (
        <div className="om-table-wrap">
            <div className="om-table-scroll">
                <table className="om-table" role="table">
                    <thead>
                        <tr>
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    style={col.width ? { width: col.width } : undefined}
                                    onClick={() => col.sortable && onSort(col.key)}
                                    aria-sort={
                                        sortConfig?.key === col.key
                                            ? sortConfig.dir === 'asc' ? 'ascending' : 'descending'
                                            : undefined
                                    }
                                >
                                    {col.key === 'checkbox' ? (
                                        <input
                                            type="checkbox"
                                            className="om-checkbox"
                                            checked={allSelected}
                                            onChange={onToggleSelectAll}
                                            aria-label="Chọn tất cả"
                                        />
                                    ) : (
                                        <>
                                            {col.label}
                                            {col.sortable && renderSortArrow(col.key)}
                                        </>
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => {
                            const isSelected = selectedIds.has(order.order_id);
                            const statusCfg = STATUS_CONFIG[order.status] || {};
                            const paymentCfg = PAYMENT_CONFIG[order.payment_status] || {};
                            const firstItem = order.items?.[0];
                            const extraItems = (order.items?.length || 0) - 1;

                            return (
                                <tr
                                    key={order.order_id}
                                    className={isSelected ? 'selected' : ''}
                                    onClick={(e) => {
                                        // Don't open slide-over if clicking checkbox or action buttons
                                        if (e.target.closest('.om-actions') || e.target.closest('.om-checkbox')) return;
                                        onRowClick(order);
                                    }}
                                    tabIndex={0}
                                    onKeyDown={(e) => e.key === 'Enter' && onRowClick(order)}
                                >
                                    {/* Checkbox */}
                                    <td onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            className="om-checkbox"
                                            checked={isSelected}
                                            onChange={() => onToggleSelect(order.order_id)}
                                            aria-label={`Chọn đơn ${order.order_number}`}
                                        />
                                    </td>

                                    {/* Order number */}
                                    <td>
                                        <span
                                            className="om-order-num"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onCopyOrderNum(order.order_number);
                                            }}
                                            title="Click để sao chép"
                                        >
                                            #{order.order_number}
                                        </span>
                                    </td>

                                    {/* Customer */}
                                    <td>
                                        <div className="om-customer-cell">
                                            <div className="om-avatar">{getInitials(order.customer_name)}</div>
                                            <div className="om-customer-info">
                                                <strong>{order.customer_name}</strong>
                                                <span>{order.customer_phone}</span>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Product */}
                                    <td>
                                        {firstItem ? (
                                            <div className="om-product-cell">
                                                <img
                                                    className="om-product-thumb"
                                                    src={firstItem.product?.image_url}
                                                    alt={firstItem.product?.name}
                                                    loading="lazy"
                                                />
                                                <div className="om-product-info">
                                                    <span className="om-product-name">{firstItem.product?.name}</span>
                                                    <span className="om-product-variant">
                                                        Size: {firstItem.size?.size_name} / Màu: {firstItem.color?.color_name}
                                                    </span>
                                                    {extraItems > 0 && (
                                                        <span className="om-more-products">+{extraItems} sản phẩm khác</span>
                                                    )}
                                                </div>
                                            </div>
                                        ) : order.item_count != null ? (
                                            <span className="om-product-count">{order.item_count} sản phẩm</span>
                                        ) : null}
                                    </td>

                                    {/* Total amount */}
                                    <td>
                                        <span className="om-amount">{formatVND(order.total_amount)}</span>
                                    </td>

                                    {/* Payment status */}
                                    <td>
                                        <span
                                            className="om-badge"
                                            style={{ background: paymentCfg.bg, color: paymentCfg.color }}
                                        >
                                            <span className="om-badge-dot" style={{ background: paymentCfg.color }} />
                                            {order.payment_status}
                                        </span>
                                    </td>

                                    {/* Order status */}
                                    <td>
                                        <span
                                            className="om-badge"
                                            style={{ background: statusCfg.bg, color: statusCfg.color }}
                                        >
                                            <span className="om-badge-dot" style={{ background: statusCfg.color }} />
                                            {order.status}
                                        </span>
                                    </td>

                                    {/* Order type */}
                                    <td>
                                        <span className={`om-type-chip ${order.order_type === 'Online' ? 'online' : 'instore'}`}>
                                            {order.order_type}
                                        </span>
                                    </td>

                                    {/* Date */}
                                    <td>
                                        <div className="om-date-cell" title={relativeTime(order.created_at)}>
                                            {formatDate(order.created_at)}
                                            <span className="om-date-relative">{relativeTime(order.created_at)}</span>
                                        </div>
                                    </td>

                                    {/* Actions */}
                                    <td onClick={(e) => e.stopPropagation()}>
                                        <div className="om-actions">
                                            <button
                                                className="om-action-btn"
                                                aria-label="Xem chi tiết"
                                                onClick={() => onRowClick(order)}
                                                title="Xem chi tiết"
                                            >
                                                👁
                                            </button>
                                            <button
                                                className="om-action-btn"
                                                aria-label="Chỉnh sửa"
                                                onClick={() => onRowClick(order)}
                                                title="Chỉnh sửa"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="om-action-btn"
                                                aria-label="In hóa đơn"
                                                onClick={() => onPrintOrder(order)}
                                                title="In hóa đơn"
                                            >
                                                🖨️
                                            </button>

                                            {/* More dropdown */}
                                            <div className="om-more-dropdown-wrap">
                                                <button
                                                    className="om-action-btn"
                                                    aria-label="Thêm hành động"
                                                    onClick={() => setOpenMore(openMore === order.order_id ? null : order.order_id)}
                                                >
                                                    ⋯
                                                </button>
                                                {openMore === order.order_id && (
                                                    <div className="om-more-dropdown">
                                                        <button onClick={() => { onCancelOrder(order); setOpenMore(null); }} className="destructive">
                                                            ❌ Hủy đơn
                                                        </button>
                                                        <button onClick={() => setOpenMore(null)}>
                                                            📋 Nhân bản
                                                        </button>
                                                        <button onClick={() => setOpenMore(null)}>
                                                            🚩 Gắn cờ
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

export default OrderTable;
