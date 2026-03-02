import React from 'react';
import { Search } from 'lucide-react';

const STATUS_TABS = [
    { key: 'all', label: 'Tất cả' },
    { key: 'active', label: 'Hoạt động' },
    { key: 'upcoming', label: 'Sắp tới' },
    { key: 'expiring', label: 'Sắp hết hạn' },
    { key: 'expired', label: 'Hết hạn' },
    { key: 'inactive', label: 'Ẩn' },
];

const CouponFilters = ({
    filters,
    onFilterChange,
    onClear,
    activeTab,
    onTabChange,
    tabCounts,
    resultCount,
}) => {
    return (
        <>
            <div className="cm-filters">
                <div className="cm-filters-row">
                    {/* Search */}
                    <div className="cm-search-box">
                        <span className="cm-search-icon">
                            <Search size={14} />
                        </span>
                        <input
                            type="text"
                            placeholder="Tìm theo mã hoặc tên giảm giá..."
                            value={filters.search}
                            onChange={(e) => onFilterChange('search', e.target.value)}
                            aria-label="Tìm kiếm mã giảm giá"
                        />
                    </div>

                    {/* Type dropdown */}
                    <select
                        className="cm-filter-select"
                        value={filters.type}
                        onChange={(e) => onFilterChange('type', e.target.value)}
                        aria-label="Lọc theo loại"
                    >
                        <option value="">Tất cả loại</option>
                        <option value="Percentage">Phần trăm</option>
                        <option value="Fixed Amount">Số tiền cố định</option>
                    </select>

                    {/* Date range */}
                    <div className="cm-date-range">
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
                    <button className="cm-clear-link" onClick={onClear}>
                        Xóa bộ lọc
                    </button>

                    {/* Result count */}
                    <span className="cm-result-count">
                        Hiển thị <strong>{resultCount}</strong> kết quả
                    </span>
                </div>
            </div>

            {/* Status tabs */}
            <div className="cm-status-tabs">
                {STATUS_TABS.map((tab) => (
                    <button
                        key={tab.key}
                        className={`cm-tab ${activeTab === tab.key ? 'active' : ''}`}
                        onClick={() => onTabChange(tab.key)}
                    >
                        {tab.label}
                        <span className="cm-tab-count">{tabCounts[tab.key] ?? 0}</span>
                    </button>
                ))}
            </div>
        </>
    );
};

export default CouponFilters;
