import React from 'react';
import CatalogFilterSidebar from './CatalogFilterSidebar';

const FilterDrawer = ({ isOpen, onClose, filters, onFilterChange, onReset, filteredCount, onApply }) => {
    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="catalog-filter-drawer-overlay" onClick={onClose} />

            {/* Drawer */}
            <div className="catalog-filter-drawer">
                <div className="catalog-drawer-header">
                    <h3 className="catalog-drawer-title">Bộ lọc</h3>
                    <button className="catalog-drawer-close" onClick={onClose} aria-label="Đóng bộ lọc">×</button>
                </div>

                <div className="catalog-drawer-body">
                    {/* Reuse the same filter sidebar content */}
                    <CatalogFilterSidebar
                        filters={filters}
                        onFilterChange={onFilterChange}
                        onReset={onReset}
                    />
                </div>

                <div className="catalog-drawer-footer">
                    <button className="catalog-drawer-reset" onClick={onReset}>
                        Đặt lại
                    </button>
                    <button className="catalog-drawer-apply" onClick={() => { onApply(); onClose(); }}>
                        Xem {filteredCount} sản phẩm
                    </button>
                </div>
            </div>
        </>
    );
};

export default FilterDrawer;
