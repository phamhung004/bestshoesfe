import React, { useReducer, useMemo, useCallback, useEffect } from 'react';
import { Check, AlertTriangle, Trash2, X } from 'lucide-react';
import './ProductManagementPage.css';

import AdminLayout from '../components/AdminLayout';
import ProductPageHeader from './components/ProductPageHeader';
import ProductKpiCards from './components/ProductKpiCards';
import ProductFilterBar from './components/ProductFilterBar';
import ProductTable from './components/ProductTable';
import ProductGrid from './components/ProductGrid';
import ProductPagination from './components/ProductPagination';
import ProductSlideOver from './components/ProductSlideOver';
import ProductModal from './components/ProductModal/ProductModal';

import {
  mockProducts,
  STATUS_CONFIG,
  MOCK_CATEGORIES,
  MOCK_BRANDS,
  getMinPrice,
} from './mockProducts';

/* ═══════════════════════════════════════════════════════════
   REDUCER
   ═══════════════════════════════════════════════════════════ */
const INITIAL_FILTERS = {
  search: '',
  categoryId: '',
  brandId: '',
  status: '',
  priceRange: '',
};

const initialState = {
  products: mockProducts,
  viewMode: 'list',
  filters: { ...INITIAL_FILTERS },
  sortConfig: { key: 'updatedAt', dir: 'desc' },
  currentPage: 1,
  rowsPerPage: 10,
  selectedIds: new Set(),
  slideOverProduct: null,
  modalMode: null,      // 'add' | 'edit' | null
  modalProduct: null,
  confirmDialog: null,  // { title, body, onConfirm }
  toast: null,          // { message, type }
};

function productReducer(state, action) {
  switch (action.type) {
    case 'SET_FILTER':
      return {
        ...state,
        filters: { ...state.filters, [action.key]: action.value },
        currentPage: 1,
        selectedIds: new Set(),
      };
    case 'CLEAR_FILTERS':
      return { ...state, filters: { ...INITIAL_FILTERS }, currentPage: 1, selectedIds: new Set() };

    case 'SET_SORT':
      return { ...state, sortConfig: action.payload, currentPage: 1 };

    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };

    case 'SET_PAGE':
      return { ...state, currentPage: action.payload };

    case 'SET_ROWS_PER_PAGE':
      return { ...state, rowsPerPage: action.payload, currentPage: 1 };

    case 'TOGGLE_SELECT': {
      const next = new Set(state.selectedIds);
      next.has(action.id) ? next.delete(action.id) : next.add(action.id);
      return { ...state, selectedIds: next };
    }
    case 'SET_SELECTED':
      return { ...state, selectedIds: action.payload };
    case 'CLEAR_SELECTION':
      return { ...state, selectedIds: new Set() };

    case 'OPEN_SLIDE_OVER':
      return { ...state, slideOverProduct: action.payload };
    case 'CLOSE_SLIDE_OVER':
      return { ...state, slideOverProduct: null };

    case 'OPEN_MODAL':
      return { ...state, modalMode: action.mode, modalProduct: action.product || null };
    case 'CLOSE_MODAL':
      return { ...state, modalMode: null, modalProduct: null };

    case 'SAVE_PRODUCT':
      if (state.modalMode === 'add') {
        const newProduct = {
          ...action.payload,
          id: Date.now(),
        };
        return {
          ...state,
          products: [newProduct, ...state.products],
          modalMode: null,
          modalProduct: null,
        };
      } else {
        return {
          ...state,
          products: state.products.map((p) =>
            p.id === action.payload.id ? action.payload : p
          ),
          modalMode: null,
          modalProduct: null,
          // Update slide-over if it was showing this product
          slideOverProduct:
            state.slideOverProduct?.id === action.payload.id
              ? action.payload
              : state.slideOverProduct,
        };
      }

    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter((p) => p.id !== action.id),
        confirmDialog: null,
        selectedIds: (() => {
          const s = new Set(state.selectedIds);
          s.delete(action.id);
          return s;
        })(),
      };

    case 'BULK_DELETE': {
      const toDelete = state.selectedIds;
      return {
        ...state,
        products: state.products.filter((p) => !toDelete.has(p.id)),
        selectedIds: new Set(),
        confirmDialog: null,
      };
    }

    case 'SHOW_TOAST':
      return { ...state, toast: { message: action.message, type: action.toastType || 'success' } };
    case 'HIDE_TOAST':
      return { ...state, toast: null };

    case 'SHOW_CONFIRM':
      return { ...state, confirmDialog: action.payload };
    case 'HIDE_CONFIRM':
      return { ...state, confirmDialog: null };

    default:
      return state;
  }
}

/* ═══════════════════════════════════════════════════════════
   DERIVED STATE HELPERS
   ═══════════════════════════════════════════════════════════ */
const matchesFilters = (product, filters) => {
  const { search, categoryId, brandId, status, priceRange } = filters;

  if (search) {
    const q = search.toLowerCase();
    const inName  = product.name.toLowerCase().includes(q);
    const inSku   = (product.sku || '').toLowerCase().includes(q);
    const inBrand = (product.brand?.name || '').toLowerCase().includes(q);
    if (!inName && !inSku && !inBrand) return false;
  }

  if (categoryId && String(product.category?.id) !== categoryId) return false;
  if (brandId    && String(product.brand?.id)    !== brandId)    return false;
  if (status     && product.status               !== status)     return false;

  if (priceRange) {
    const [lo, hi] = priceRange.split('-').map(Number);
    const minP = getMinPrice(product);
    if (minP < lo || minP > hi) return false;
  }

  return true;
};

const sortProducts = (arr, { key, dir }) => {
  const sorted = [...arr].sort((a, b) => {
    let va, vb;
    switch (key) {
      case 'name':      va = a.name.toLowerCase();     vb = b.name.toLowerCase(); break;
      case 'price':     va = getMinPrice(a);            vb = getMinPrice(b);       break;
      case 'stock':     va = a.totalStock;              vb = b.totalStock;         break;
      case 'updatedAt': va = new Date(a.updatedAt);    vb = new Date(b.updatedAt); break;
      case 'createdAt': va = new Date(a.createdAt);    vb = new Date(b.createdAt); break;
      default:          va = a.id;                      vb = b.id;
    }
    if (va < vb) return dir === 'asc' ? -1 : 1;
    if (va > vb) return dir === 'asc' ? 1 : -1;
    return 0;
  });
  return sorted;
};

const buildChips = (filters) => {
  const chips = [];
  if (filters.search)    chips.push({ key: 'search',    label: `"${filters.search}"` });
  if (filters.categoryId) {
    const cat = MOCK_CATEGORIES.find((c) => String(c.id) === filters.categoryId);
    chips.push({ key: 'categoryId', label: cat?.name || filters.categoryId });
  }
  if (filters.brandId) {
    const brand = MOCK_BRANDS.find((b) => String(b.id) === filters.brandId);
    chips.push({ key: 'brandId', label: brand?.name || filters.brandId });
  }
  if (filters.status) {
    chips.push({ key: 'status', label: STATUS_CONFIG[filters.status]?.label || filters.status });
  }
  if (filters.priceRange) {
    const labels = {
      '0-1000000':         'Dưới 1 triệu',
      '1000000-3000000':   '1 – 3 triệu',
      '3000000-5000000':   '3 – 5 triệu',
      '5000000-999999999': 'Trên 5 triệu',
    };
    chips.push({ key: 'priceRange', label: labels[filters.priceRange] || filters.priceRange });
  }
  return chips;
};

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════════════ */
const ProductManagementPage = () => {
  const [state, dispatch] = useReducer(productReducer, initialState);

  /* ── Derived state ──────────────────────────────────────── */
  const filteredProducts = useMemo(
    () => state.products.filter((p) => matchesFilters(p, state.filters)),
    [state.products, state.filters]
  );

  const sortedProducts = useMemo(
    () => sortProducts(filteredProducts, state.sortConfig),
    [filteredProducts, state.sortConfig]
  );

  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / state.rowsPerPage));

  const paginatedProducts = useMemo(() => {
    const start = (state.currentPage - 1) * state.rowsPerPage;
    return sortedProducts.slice(start, start + state.rowsPerPage);
  }, [sortedProducts, state.currentPage, state.rowsPerPage]);

  const kpiStats = useMemo(() => {
    const all = state.products;
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return {
      total:         all.length,
      active:        all.filter((p) => p.status === 'ACTIVE').length,
      outOfStock:    all.filter((p) => p.status === 'OUT_OF_STOCK').length,
      inactive:      all.filter((p) => p.status === 'INACTIVE').length,
      comingSoon:    all.filter((p) => p.status === 'COMING_SOON').length,
      totalVariants: all.reduce((s, p) => s + (p.totalVariants || 0), 0),
      newThisMonth:  all.filter((p) => new Date(p.createdAt).getTime() > thirtyDaysAgo).length,
    };
  }, [state.products]);

  const activeFilterChips = useMemo(() => buildChips(state.filters), [state.filters]);

  /* ── Toast auto-dismiss ────────────────────────────────── */
  useEffect(() => {
    if (!state.toast) return;
    const timer = setTimeout(() => dispatch({ type: 'HIDE_TOAST' }), 3000);
    return () => clearTimeout(timer);
  }, [state.toast]);

  /* ── Clamp page if filters shrink results ───────────────── */
  useEffect(() => {
    if (state.currentPage > totalPages) {
      dispatch({ type: 'SET_PAGE', payload: 1 });
    }
  }, [totalPages, state.currentPage]);

  /* ── Handlers ────────────────────────────────────────────  */
  const handleFilterChange = useCallback((key, value) => {
    dispatch({ type: 'SET_FILTER', key, value });
  }, []);

  const handleClearFilters = useCallback(() => {
    dispatch({ type: 'CLEAR_FILTERS' });
  }, []);

  const handleRemoveChip = useCallback((key) => {
    dispatch({ type: 'SET_FILTER', key, value: '' });
  }, []);

  const handleViewMode = useCallback((mode) => {
    dispatch({ type: 'SET_VIEW_MODE', payload: mode });
  }, []);

  const handleSort = useCallback((config) => {
    dispatch({ type: 'SET_SORT', payload: config });
  }, []);

  const handleToggleSelect = useCallback((id) => {
    dispatch({ type: 'TOGGLE_SELECT', id });
  }, []);

  const handleToggleSelectAll = useCallback((newSet) => {
    dispatch({ type: 'SET_SELECTED', payload: newSet });
  }, []);

  const handleView = useCallback((product) => {
    dispatch({ type: 'OPEN_SLIDE_OVER', payload: product });
  }, []);

  const handleOpenAdd = useCallback(() => {
    dispatch({ type: 'OPEN_MODAL', mode: 'add', product: null });
  }, []);

  const handleEdit = useCallback((product) => {
    dispatch({ type: 'CLOSE_SLIDE_OVER' });
    dispatch({ type: 'OPEN_MODAL', mode: 'edit', product });
  }, []);

  const handleDelete = useCallback((product) => {
    dispatch({
      type: 'SHOW_CONFIRM',
      payload: {
        title:    `Xóa sản phẩm?`,
        body:     `Bạn có chắc muốn xóa "${product.name}"? Thao tác này không thể hoàn tác.`,
        danger:   true,
        onConfirm: () => {
          dispatch({ type: 'DELETE_PRODUCT', id: product.id });
          dispatch({ type: 'SHOW_TOAST', message: `Đã xóa "${product.name}"`, toastType: 'info' });
        },
      },
    });
  }, []);

  const handleBulkDelete = useCallback(() => {
    const count = state.selectedIds.size;
    dispatch({
      type: 'SHOW_CONFIRM',
      payload: {
        title:    `Xóa ${count} sản phẩm?`,
        body:     `Bạn có chắc muốn xóa ${count} sản phẩm đã chọn? Thao tác này không thể hoàn tác.`,
        danger:   true,
        onConfirm: () => {
          dispatch({ type: 'BULK_DELETE' });
          dispatch({ type: 'SHOW_TOAST', message: `Đã xóa ${count} sản phẩm`, toastType: 'info' });
        },
      },
    });
  }, [state.selectedIds.size]);

  const handleSaveProduct = useCallback((productData) => {
    dispatch({ type: 'SAVE_PRODUCT', payload: productData });
    const isNew = state.modalMode === 'add';
    dispatch({
      type: 'SHOW_TOAST',
      message: isNew ? 'Sản phẩm đã được thêm thành công' : 'Đã cập nhật sản phẩm',
      toastType: 'success',
    });
  }, [state.modalMode]);

  const handleExportExcel = useCallback(() => {
    dispatch({ type: 'SHOW_TOAST', message: 'Đang xuất Excel...', toastType: 'info' });
  }, []);

  /* ── Render ────────────────────────────────────────────── */
  return (
    <AdminLayout
      activeSection="product-management/products"
      title="Quản lý Sản phẩm"
      subtitle="Quản lý và cập nhật thông tin sản phẩm"
    >
      {/* Page header */}
      <ProductPageHeader onAdd={handleOpenAdd} onExportExcel={handleExportExcel} />

      {/* KPI cards */}
      <ProductKpiCards stats={kpiStats} />

      {/* Filter bar */}
      <ProductFilterBar
        filters={state.filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        activeFilterChips={activeFilterChips}
        onRemoveChip={handleRemoveChip}
        viewMode={state.viewMode}
        onViewModeChange={handleViewMode}
        sortConfig={state.sortConfig}
        onSortChange={handleSort}
        resultCount={filteredProducts.length}
        totalCount={state.products.length}
      />

      {/* Bulk action bar */}
      {state.selectedIds.size > 0 && (
        <div className="pm-bulk-bar">
          <span className="pm-bulk-label">
            {state.selectedIds.size} sản phẩm được chọn
          </span>
          <div className="pm-bulk-actions">
            <button
              type="button"
              className="pm-bulk-btn pm-bulk-btn-danger"
              onClick={handleBulkDelete}
            >
              <Trash2 size={13} />
              Xóa tất cả
            </button>
            <button
              type="button"
              className="pm-bulk-btn pm-bulk-btn-ghost"
              onClick={() => dispatch({ type: 'CLEAR_SELECTION' })}
            >
              <X size={13} />
              Hủy chọn
            </button>
          </div>
        </div>
      )}

      {/* Product list or grid */}
      {state.viewMode === 'list' ? (
        <ProductTable
          products={paginatedProducts}
          selectedIds={state.selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAdd={handleOpenAdd}
          sortConfig={state.sortConfig}
          onSort={handleSort}
          loading={false}
        />
      ) : (
        <ProductGrid
          products={paginatedProducts}
          selectedIds={state.selectedIds}
          onToggleSelect={handleToggleSelect}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAdd={handleOpenAdd}
        />
      )}

      {/* Pagination */}
      <ProductPagination
        currentPage={state.currentPage}
        totalPages={totalPages}
        rowsPerPage={state.rowsPerPage}
        totalItems={filteredProducts.length}
        onPageChange={(page) => dispatch({ type: 'SET_PAGE', payload: page })}
        onRowsPerPageChange={(rows) => dispatch({ type: 'SET_ROWS_PER_PAGE', payload: rows })}
      />

      {/* Product detail slide-over */}
      <ProductSlideOver
        product={state.slideOverProduct}
        onClose={() => dispatch({ type: 'CLOSE_SLIDE_OVER' })}
        onEdit={handleEdit}
      />

      {/* Add/Edit modal */}
      {state.modalMode && (
        <ProductModal
          mode={state.modalMode}
          product={state.modalProduct}
          onSave={handleSaveProduct}
          onCancel={() => dispatch({ type: 'CLOSE_MODAL' })}
        />
      )}

      {/* Confirm dialog */}
      {state.confirmDialog && (
        <div className="pm-confirm-overlay">
          <div className="pm-confirm">
            <div className="pm-confirm-icon">
              {state.confirmDialog.danger ? '🗑️' : '❓'}
            </div>
            <div className="pm-confirm-title">{state.confirmDialog.title}</div>
            <div className="pm-confirm-body">{state.confirmDialog.body}</div>
            <div className="pm-confirm-actions">
              <button
                type="button"
                className="pm-btn pm-btn-outline pm-btn-sm"
                onClick={() => dispatch({ type: 'HIDE_CONFIRM' })}
              >
                Hủy
              </button>
              <button
                type="button"
                className={`pm-btn pm-btn-sm ${state.confirmDialog.danger ? 'pm-btn-danger' : 'pm-btn-primary'}`}
                onClick={() => {
                  state.confirmDialog.onConfirm();
                  dispatch({ type: 'HIDE_CONFIRM' });
                }}
              >
                {state.confirmDialog.danger ? (
                  <><Trash2 size={13} /> Xóa</>
                ) : (
                  <><Check size={13} /> Xác nhận</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      {state.toast && (
        <div className="pm-toast-wrap">
          <div className={`pm-toast ${state.toast.type}`}>
            {state.toast.type === 'success' && <Check size={16} />}
            {state.toast.type === 'error'   && <AlertTriangle size={16} />}
            {state.toast.type === 'info'    && <span style={{ fontSize: 16 }}>ℹ️</span>}
            {state.toast.message}
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ProductManagementPage;
