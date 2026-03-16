import React, { useCallback } from 'react';
import { Search, X } from 'lucide-react';

const AccountFilterBar = ({
  activeTab,
  filters,
  totalCount,
  filteredCount,
  onFilterChange,
  onClearFilters,
}) => {
  const hasActiveFilters =
    filters.search ||
    filters.status !== '' ||
    filters.tier !== '' ||
    filters.time !== '' ||
    filters.role !== '' ||
    filters.sort !== '';

  const handleSearchChange = useCallback(
    (e) => onFilterChange('search', e.target.value),
    [onFilterChange]
  );

  const activeChips = [];
  if (filters.status) activeChips.push({ key: 'status', label: `Trạng thái: ${filters.status}` });
  if (filters.tier) activeChips.push({ key: 'tier', label: `Hạng: ${filters.tier}` });
  if (filters.time) activeChips.push({ key: 'time', label: `Thời gian: ${filters.time}` });
  if (filters.role) activeChips.push({ key: 'role', label: `Vai trò: ${filters.role}` });
  if (filters.sort) activeChips.push({ key: 'sort', label: `Sắp xếp: ${filters.sort}` });

  return (
    <div className="am-card am-filter-bar am-fade-in">
      {/* Row 1 */}
      <div className="am-filter-row">
        <div className="am-search-wrap">
          <Search size={16} />
          <input
            className="am-search-input"
            type="text"
            placeholder={
              activeTab === 'customers'
                ? 'Tìm tên, email, số điện thoại...'
                : 'Tìm tên, email nhân viên...'
            }
            value={filters.search}
            onChange={handleSearchChange}
          />
        </div>

        {activeTab === 'customers' ? (
          <>
            <select
              className="am-select"
              value={filters.status}
              onChange={(e) => onFilterChange('status', e.target.value)}
              style={{ minWidth: 160 }}
            >
              <option value="">Trạng thái</option>
              <option value="Hoạt động">Hoạt động</option>
              <option value="Bị khóa">Bị khóa</option>
              <option value="Chưa xác thực">Chưa xác thực</option>
            </select>

            <select
              className="am-select"
              value={filters.tier}
              onChange={(e) => onFilterChange('tier', e.target.value)}
              style={{ minWidth: 160 }}
            >
              <option value="">Hạng thành viên</option>
              <option value="Đồng">Đồng</option>
              <option value="Bạc">Bạc</option>
              <option value="Vàng">Vàng</option>
              <option value="Bạch Kim">Bạch Kim</option>
            </select>

            <select
              className="am-select"
              value={filters.time}
              onChange={(e) => onFilterChange('time', e.target.value)}
              style={{ minWidth: 180 }}
            >
              <option value="">Thời gian đăng ký</option>
              <option value="Hôm nay">Hôm nay</option>
              <option value="7 ngày qua">7 ngày qua</option>
              <option value="30 ngày qua">30 ngày qua</option>
              <option value="3 tháng qua">3 tháng qua</option>
              <option value="Năm nay">Năm nay</option>
            </select>
          </>
        ) : (
          <>
            <select
              className="am-select"
              value={filters.role}
              onChange={(e) => onFilterChange('role', e.target.value)}
              style={{ minWidth: 160 }}
            >
              <option value="">Vai trò</option>
              <option value="ADMIN">Quản trị viên</option>
              <option value="MANAGER">Quản lý</option>
              <option value="STAFF">Nhân viên</option>
            </select>

            <select
              className="am-select"
              value={filters.status}
              onChange={(e) => onFilterChange('status', e.target.value)}
              style={{ minWidth: 160 }}
            >
              <option value="">Trạng thái</option>
              <option value="Hoạt động">Hoạt động</option>
              <option value="Bị khóa">Bị khóa</option>
            </select>
          </>
        )}
      </div>

      {/* Row 2 — shown when filters active */}
      {hasActiveFilters && (
        <div className="am-filter-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
            <span className="am-filter-info">
              Hiển thị {filteredCount} / {totalCount}{' '}
              {activeTab === 'customers' ? 'khách hàng' : 'nhân viên'}
            </span>
            <div className="am-filter-chips">
              {activeChips.map((chip) => (
                <span key={chip.key} className="am-filter-chip">
                  {chip.label}
                  <button onClick={() => onFilterChange(chip.key, '')}>
                    <X size={12} />
                  </button>
                </span>
              ))}
              {activeChips.length > 0 && (
                <button className="am-clear-filters" onClick={onClearFilters}>
                  Xóa tất cả
                </button>
              )}
            </div>
          </div>

          {activeTab === 'customers' && (
            <select
              className="am-select"
              value={filters.sort}
              onChange={(e) => onFilterChange('sort', e.target.value)}
              style={{ minWidth: 200 }}
            >
              <option value="">Sắp xếp</option>
              <option value="newest">Mới đăng ký</option>
              <option value="oldest">Cũ nhất</option>
              <option value="name-asc">Tên A→Z</option>
              <option value="spending-desc">Chi tiêu nhiều nhất</option>
              <option value="orders-desc">Đơn hàng nhiều nhất</option>
            </select>
          )}
        </div>
      )}
    </div>
  );
};

export default AccountFilterBar;
