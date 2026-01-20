import React, { useState } from 'react';
import FilterSidebar from '../../components/FilterSidebar';
import ProductGrid from '../../components/ProductGrid';
import LoginPanel from '../../components/LoginPanel';
import SortControls from '../../components/SortControls';
import './Catalog.css';

const Catalog = () => {
  // Lifted filter state here so both sidebar and grid share it
  const [filters, setFilters] = useState({
    categoryId: [],
    brandId: [],
    materialId: [],
    sizeId: [],
    colorId: [],
  });

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="catalog-container">
      <div className="catalog-content">
        {/* Left Sidebar - Filters */}
        <div className="catalog-sidebar">
          <FilterSidebar onApply={handleApplyFilters} />
        </div>

        {/* Main Content */}
        <div className="catalog-main">
          <div className="catalog-header">
            <h1 className="catalog-title">Explore</h1>
            <SortControls />
          </div>
          <ProductGrid filters={filters} />
        </div>

        {/* Right Sidebar - Login */}
        <div className="catalog-login-panel">
          <LoginPanel />
        </div>
      </div>
    </div>
  );
};

export default Catalog;
