import React from 'react';
import { Search } from 'lucide-react';

const STATUS_TABS = [
    { key: 'all', label: 'Tất cả' },
    { key: 'running', label: 'Đang chạy' },
    { key: 'upcoming', label: 'Sắp tới' },
    { key: 'expiring', label: 'Sắp hết hạn' },
    { key: 'expired', label: 'Đã hết hạn' },
    { key: 'inactive', label: 'Đã tắt' },
];

const PromotionFilters = ({
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
            <div className="pm-filters">
                <div className="pm-filters-row">
                    {/* Search */}
                    <div className="pm-search-box">
                        <span className="pm-search-icon">
                            <Search size={14} />
                        </span>
                        <input
                            type="text"
                            placeholder="Tìm theo tên đợt giảm giá..."
                            value={filters.search}
                            onChange={(e) => onFilterChange('search', e.target.value)}
                            aria-label="Tìm kiếm đợt giảm giá"
                        />
                    </div>

                    {/* Type dropdown */}
                    <select
                        className="pm-filter-select"
                        value={filters.type}
                        onChange={(e) => onFilterChange('type', e.target.value)}
                        aria-label="Lọc theo loại"
                    >
                        <option value="">Tất cả loại</option>
                        <option value="flash_sale">Flash Sale</option>
                        <option value="seasonal">Theo mùa</option>
                        <option value="clearance">Thanh lý</option>
                        <option value="special">Đặc biệt</option>
                    </select>

                    {/* Date range */}
                    <div className="pm-date-range">
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
                    <button className="pm-clear-link" onClick={onClear}>
                        Xóa bộ lọc
                    </button>

                    {/* Result count */}
                    <span className="pm-result-count">
                        Hiển thị <strong>{resultCount}</strong> kết quả
                    </span>
                </div>
            </div>

            {/* Status tabs */}
            <div className="pm-status-tabs">
                {STATUS_TABS.map((tab) => (
                    <button
                        key={tab.key}
                        className={`pm-tab ${activeTab === tab.key ? 'active' : ''}`}
                        onClick={() => onTabChange(tab.key)}
                    >
                        {tab.label}
                        <span className="pm-tab-count">{tabCounts[tab.key] ?? 0}</span>
                    </button>
                ))}
            </div>
        </>
    );
};

export default PromotionFilters;
