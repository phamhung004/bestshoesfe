import React from 'react';
import { ALL_RETURN_STATUSES, ALL_REASONS, REFUND_METHODS } from './mockReturns';

/**
 * ReturnFilters — search, dropdowns, date range, status tabs, result count.
 */
const ReturnFilters = ({
    filters,
    onFilterChange,
    onClear,
    activeTab,
    onTabChange,
    statusCounts,
    resultCount,
}) => {
    return (
        <div className="rm-filters">
            {/* Search + dropdowns row */}
            <div className="rm-filters-row">
                <div className="rm-search-box">
                    <span className="rm-search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Tìm theo mã đơn, tên KH, SĐT..."
                        value={filters.search}
                        onChange={e => onFilterChange('search', e.target.value)}
                        aria-label="Tìm kiếm yêu cầu trả hàng"
                    />
                </div>

                <select
                    className="rm-filter-select"
                    value={filters.returnStatus}
                    onChange={e => onFilterChange('returnStatus', e.target.value)}
                    aria-label="Lọc trạng thái"
                >
                    <option value="">Trạng thái trả hàng</option>
                    {ALL_RETURN_STATUSES.filter(s => s !== 'Tất cả').map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>

                <select
                    className="rm-filter-select"
                    value={filters.reason}
                    onChange={e => onFilterChange('reason', e.target.value)}
                    aria-label="Lọc lý do"
                >
                    <option value="">Lý do trả hàng</option>
                    {ALL_REASONS.map(r => (
                        <option key={r} value={r}>{r}</option>
                    ))}
                </select>

                <select
                    className="rm-filter-select"
                    value={filters.refundMethod}
                    onChange={e => onFilterChange('refundMethod', e.target.value)}
                    aria-label="Lọc phương thức hoàn"
                >
                    <option value="">Phương thức hoàn tiền</option>
                    {REFUND_METHODS.map(m => (
                        <option key={m.value} value={m.value}>{m.icon} {m.label}</option>
                    ))}
                </select>

                <select
                    className="rm-filter-select"
                    value={filters.orderType}
                    onChange={e => onFilterChange('orderType', e.target.value)}
                    aria-label="Lọc loại đơn"
                >
                    <option value="">Loại đơn</option>
                    <option value="Online">Trực tuyến</option>
                    <option value="In-store">Tại quầy</option>
                </select>

                <div className="rm-date-range">
                    <input
                        type="date"
                        value={filters.dateFrom}
                        onChange={e => onFilterChange('dateFrom', e.target.value)}
                        aria-label="Từ ngày"
                    />
                    <span style={{ color: 'var(--gray-400)', fontSize: '12px' }}>→</span>
                    <input
                        type="date"
                        value={filters.dateTo}
                        onChange={e => onFilterChange('dateTo', e.target.value)}
                        aria-label="Đến ngày"
                    />
                </div>

                <button className="rm-btn rm-btn-primary rm-btn-sm" onClick={() => { }}>
                    🔍 Lọc
                </button>
                <button className="rm-clear-link" onClick={onClear}>
                    Xóa bộ lọc
                </button>

                <span className="rm-result-count">
                    Hiển thị {resultCount} yêu cầu trả hàng
                </span>
            </div>

            {/* Status tabs */}
            <div className="rm-status-tabs">
                {ALL_RETURN_STATUSES.map(status => (
                    <button
                        key={status}
                        className={`rm-tab ${activeTab === status ? 'active' : ''}`}
                        onClick={() => onTabChange(status)}
                    >
                        {status}
                        <span className="rm-tab-count">{statusCounts[status] || 0}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ReturnFilters;
