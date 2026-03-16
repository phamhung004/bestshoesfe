import React from 'react';
import { ALL_STATUSES, STATUS_CONFIG } from './orderConstants';

/**
 * OrderFilters: search bar, dropdown filters, date range, status tabs
 * Props:
 *  - filters: { search, status, paymentStatus, orderType, dateFrom, dateTo }
 *  - onFilterChange: (key, value) => void
 *  - onClear: () => void
 *  - onApply: () => void
 *  - activeTab: string
 *  - onTabChange: (tab) => void
 *  - statusCounts: { [status]: number }
 *  - resultCount: number
 */
const OrderFilters = ({
    filters,
    onFilterChange,
    onClear,
    activeTab,
    onTabChange,
    statusCounts,
    resultCount,
}) => {
    return (
        <>
            {/* Filter bar */}
            <div className="om-filters">
                <div className="om-filters-row">
                    {/* Search */}
                    <div className="om-search-box">
                        <span className="om-search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Tìm theo mã đơn, tên KH, SĐT..."
                            value={filters.search}
                            onChange={(e) => onFilterChange('search', e.target.value)}
                            aria-label="Tìm kiếm đơn hàng"
                        />
                    </div>

                    {/* Status dropdown */}
                    <select
                        className="om-filter-select"
                        value={filters.status}
                        onChange={(e) => onFilterChange('status', e.target.value)}
                        aria-label="Lọc trạng thái đơn"
                    >
                        <option value="">Trạng thái đơn</option>
                        <option value="Chờ xác nhận">Chờ xác nhận</option>
                        <option value="Đã xác nhận">Đã xác nhận</option>
                        <option value="Đang giao">Đang giao</option>
                        <option value="Đã giao">Đã giao</option>
                        <option value="Trả hàng/Hoàn tiền">Trả hàng/Hoàn tiền</option>
                        <option value="Đã hủy">Đã hủy</option>
                    </select>

                    {/* Payment status dropdown */}
                    <select
                        className="om-filter-select"
                        value={filters.paymentStatus}
                        onChange={(e) => onFilterChange('paymentStatus', e.target.value)}
                        aria-label="Lọc trạng thái thanh toán"
                    >
                        <option value="">Trạng thái TT</option>
                        <option value="Đã thanh toán">Đã thanh toán</option>
                        <option value="Chưa thanh toán">Chưa thanh toán</option>
                    </select>

                    {/* Order type dropdown */}
                    <select
                        className="om-filter-select"
                        value={filters.orderType}
                        onChange={(e) => onFilterChange('orderType', e.target.value)}
                        aria-label="Lọc loại đơn"
                    >
                        <option value="">Loại đơn</option>
                        <option value="Online">Trực tuyến</option>
                        <option value="In-store">Tại quầy</option>
                    </select>

                    {/* Date range */}
                    <div className="om-date-range">
                        <input
                            type="date"
                            value={filters.dateFrom}
                            onChange={(e) => onFilterChange('dateFrom', e.target.value)}
                            aria-label="Từ ngày"
                        />
                        <span style={{ color: 'var(--gray-400)', fontSize: 12 }}>→</span>
                        <input
                            type="date"
                            value={filters.dateTo}
                            onChange={(e) => onFilterChange('dateTo', e.target.value)}
                            aria-label="Đến ngày"
                        />
                    </div>

                    {/* Clear */}
                    <button className="om-clear-link" onClick={onClear}>
                        Xóa bộ lọc
                    </button>

                    {/* Result count */}
                    <span className="om-result-count">
                        Hiển thị <strong>{resultCount}</strong> đơn hàng
                    </span>
                </div>
            </div>

            {/* Status tabs */}
            <div className="om-status-tabs">
                {ALL_STATUSES.map((tab) => (
                    <button
                        key={tab}
                        className={`om-tab ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => onTabChange(tab)}
                    >
                        {tab}
                        <span className="om-tab-count">{statusCounts[tab] ?? 0}</span>
                    </button>
                ))}
            </div>
        </>
    );
};

export default OrderFilters;
