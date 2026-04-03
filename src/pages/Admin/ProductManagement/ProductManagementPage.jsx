import React, { useReducer, useMemo, useCallback, useEffect, useRef } from 'react';
import { Check, AlertTriangle, Trash2, X } from 'lucide-react';
import './ProductManagementPage.css';

import AdminLayout from '../components/AdminLayout';
import ProductPageHeader from './components/ProductPageHeader';
import ProductKpiCards from './components/ProductKpiCards';
import ProductFilterBar from './components/ProductFilterBar';
import ProductTable from './components/ProductTable';
import ProductPagination from './components/ProductPagination';
import ProductSlideOver from './components/ProductSlideOver';
import ProductModal from './components/ProductModal/ProductModal';

import {
  productAPI,
  categoryAPI,
  brandAPI,
  materialAPI,
  sizeAPI,
  colorAPI,
  productVariantAPI,
  productImageAPI,
} from '../../../services/api';

import { STATUS_CONFIG, getMinPrice, slugify } from './mockProducts';

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
  // Server data
  products: [],
  totalElements: 0,
  serverTotalPages: 1,
  loading: false,
  error: null,
  // Lookup data from API
  categories: [],
  brands: [],
  materials: [],
  sizes: [],
  colors: [],
  // UI state
  filters: { ...INITIAL_FILTERS },
  sortConfig: { key: 'updatedAt', dir: 'desc' },
  currentPage: 1,
  rowsPerPage: 10,
  selectedIds: new Set(),
  viewMode: 'list',     // 'list' | 'grid'
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

    // ── Server-side data management ─────────────────────────
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        products: action.products,
        totalElements: action.totalElements,
        serverTotalPages: action.totalPages,
      };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.error };

    case 'SET_LOOKUP_DATA':
      return { ...state, [action.key]: action.data };

    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === action.payload.id ? action.payload : p
        ),
        slideOverProduct:
          state.slideOverProduct?.id === action.payload.id
            ? action.payload
            : state.slideOverProduct,
      };

    case 'REMOVE_PRODUCT':
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

    case 'REMOVE_PRODUCTS': {
      const toRm = action.ids;
      return {
        ...state,
        products: state.products.filter((p) => !toRm.has(p.id)),
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

const buildChips = (filters, categories = [], brands = []) => {
  const chips = [];
  if (filters.search)    chips.push({ key: 'search',    label: `"${filters.search}"` });
  if (filters.categoryId) {
    const cat = categories.find((c) => String(c.categoryId ?? c.id) === filters.categoryId);
    chips.push({ key: 'categoryId', label: cat?.name || filters.categoryId });
  }
  if (filters.brandId) {
    const brand = brands.find((b) => String(b.brandId ?? b.id) === filters.brandId);
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

  // Ref to debounce search so we don't fire a request per keystroke
  const searchDebounceRef = useRef(null);

  /* ── Fetch products from server ─────────────────────────── */
  const fetchProducts = useCallback(async (filters, page, rowsPerPage) => {
    dispatch({ type: 'FETCH_START' });
    try {
      const searchRequest = {
        pageNum: page - 1, // BE is 0-based
        pageSize: rowsPerPage,
        name: filters.search || undefined,
        categoryId: filters.categoryId ? Number(filters.categoryId) : undefined,
        brandId: filters.brandId ? Number(filters.brandId) : undefined,
        status: filters.status || undefined,
      };
      const res = await productAPI.getAll(searchRequest);
      const pageData = res?.data ?? res;
      dispatch({
        type: 'FETCH_SUCCESS',
        products: pageData?.content ?? [],
        totalElements: pageData?.totalElements ?? 0,
        totalPages: pageData?.totalPages ?? 1,
      });
    } catch (err) {
      dispatch({ type: 'FETCH_ERROR', error: err.message ?? 'Lỗi tải dữ liệu' });
    }
  }, []);

  /* ── Load lookup data (categories, brands, materials) ────── */
  useEffect(() => {
    const loadLookups = async () => {
      try {
        const [catRes, brandRes, matRes, sizeRes, colorRes] = await Promise.all([
          categoryAPI.getAll(0, 200),
          brandAPI.getAll(0, 200),
          materialAPI.getAll(0, 200),
          sizeAPI.getAll(0, 200),
          colorAPI.getAll(0, 200),
        ]);
        const extractList = (res) => {
          const d = res?.data ?? res;
          return d?.content ?? (Array.isArray(d) ? d : []);
        };
        dispatch({ type: 'SET_LOOKUP_DATA', key: 'categories', data: extractList(catRes) });
        dispatch({ type: 'SET_LOOKUP_DATA', key: 'brands',     data: extractList(brandRes) });
        dispatch({ type: 'SET_LOOKUP_DATA', key: 'materials',  data: extractList(matRes) });
        dispatch({ type: 'SET_LOOKUP_DATA', key: 'sizes',      data: extractList(sizeRes) });
        dispatch({ type: 'SET_LOOKUP_DATA', key: 'colors',     data: extractList(colorRes) });
      } catch (e) {
        console.error('Failed to load lookup data:', e);
      }
    };
    loadLookups();
  }, []);

  /* ── Trigger fetch when filters / page / rowsPerPage change ─ */
  useEffect(() => {
    // Debounce name search; fire immediately for everything else
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      fetchProducts(state.filters, state.currentPage, state.rowsPerPage);
    }, state.filters.search ? 400 : 0);
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [state.filters, state.currentPage, state.rowsPerPage, fetchProducts]);

  /* ── Derived state (client-side sort + priceRange on current page) ─ */
  const priceFilteredProducts = useMemo(() => {
    if (!state.filters.priceRange) return state.products;
    const [lo, hi] = state.filters.priceRange.split('-').map(Number);
    return state.products.filter((p) => {
      const minP = getMinPrice(p);
      return minP >= lo && minP <= hi;
    });
  }, [state.products, state.filters.priceRange]);

  const sortedProducts = useMemo(
    () => sortProducts(priceFilteredProducts, state.sortConfig),
    [priceFilteredProducts, state.sortConfig]
  );

  // Pagination is handled server-side; use products directly
  const paginatedProducts = sortedProducts;
  const totalPages = state.serverTotalPages;

  const kpiStats = useMemo(() => {
    const all = state.products;
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return {
      total:         state.totalElements,
      active:        all.filter((p) => p.status === 'ACTIVE').length,
      outOfStock:    all.filter((p) => p.status === 'OUT_OF_STOCK').length,
      inactive:      all.filter((p) => p.status === 'INACTIVE').length,
      comingSoon:    all.filter((p) => p.status === 'COMING_SOON').length,
      totalVariants: all.reduce((s, p) => s + (p.totalVariants || 0), 0),
      newThisMonth:  all.filter((p) => new Date(p.createdAt).getTime() > thirtyDaysAgo).length,
    };
  }, [state.products, state.totalElements]);

  const activeFilterChips = useMemo(
    () => buildChips(state.filters, state.categories, state.brands),
    [state.filters, state.categories, state.brands]
  );

  /* ── Toast auto-dismiss ────────────────────────────────── */
  useEffect(() => {
    if (!state.toast) return;
    const timer = setTimeout(() => dispatch({ type: 'HIDE_TOAST' }), 3000);
    return () => clearTimeout(timer);
  }, [state.toast]);

  /* ── Clamp page if server returns fewer pages ───────────── */
  useEffect(() => {
    if (totalPages > 0 && state.currentPage > totalPages) {
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

  const handleToggleStatus = useCallback(async (product) => {
    try {
      const res = await productAPI.toggleStatus(product.id);
      const updated = res?.data ?? res;
      dispatch({ type: 'UPDATE_PRODUCT', payload: updated });
      dispatch({
        type: 'SHOW_TOAST',
        message: `Đã ${updated.status === 'ACTIVE' ? 'kích hoạt' : 'tắt'} "${updated.name}"`,
        toastType: 'success',
      });
    } catch (e) {
      dispatch({ type: 'SHOW_TOAST', message: `Lỗi đổi trạng thái: ${e.message}`, toastType: 'error' });
    }
  }, []);

  const handleDelete = useCallback((product) => {
    dispatch({
      type: 'SHOW_CONFIRM',
      payload: {
        title:    `Xóa sản phẩm?`,
        body:     `Bạn có chắc muốn xóa "${product.name}"? Thao tác này không thể hoàn tác.`,
        danger:   true,
        onConfirm: async () => {
          try {
            await productAPI.delete(product.id);
            dispatch({ type: 'REMOVE_PRODUCT', id: product.id });
            dispatch({ type: 'SHOW_TOAST', message: `Đã xóa "${product.name}"`, toastType: 'info' });
            // Refresh to keep pagination correct
            fetchProducts(state.filters, state.currentPage, state.rowsPerPage);
          } catch (e) {
            dispatch({ type: 'SHOW_TOAST', message: `Lỗi xóa: ${e.message}`, toastType: 'error' });
          }
        },
      },
    });
  }, [state.filters, state.currentPage, state.rowsPerPage, fetchProducts]);

  const handleBulkDelete = useCallback(() => {
    const count = state.selectedIds.size;
    const ids = new Set(state.selectedIds);
    dispatch({
      type: 'SHOW_CONFIRM',
      payload: {
        title:    `Xóa ${count} sản phẩm?`,
        body:     `Bạn có chắc muốn xóa ${count} sản phẩm đã chọn? Thao tác này không thể hoàn tác.`,
        danger:   true,
        onConfirm: async () => {
          const results = await Promise.allSettled(
            [...ids].map((id) => productAPI.delete(id))
          );
          const failed = results.filter((r) => r.status === 'rejected').length;
          dispatch({ type: 'REMOVE_PRODUCTS', ids });
          if (failed > 0) {
            dispatch({ type: 'SHOW_TOAST', message: `Xóa ${count - failed}/${count} thành công, ${failed} lỗi`, toastType: 'error' });
          } else {
            dispatch({ type: 'SHOW_TOAST', message: `Đã xóa ${count} sản phẩm`, toastType: 'info' });
          }
          fetchProducts(state.filters, state.currentPage, state.rowsPerPage);
        },
      },
    });
  }, [state.selectedIds, state.filters, state.currentPage, state.rowsPerPage, fetchProducts]);

  /**
   * handleSaveProduct is the async orchestration handler passed to ProductModal.
   * It receives raw form data: { basicInfo, variants, variantImages, existingProduct }
   * Steps: 1) create/update product → 2) create/update/delete variants → 3) upload/delete images
   */
  const handleSaveProduct = useCallback(async ({ basicInfo, variants, variantImages, existingProduct }) => {
    const isNew = !existingProduct;

    // ── Step 1: Create or update product basic info ──────────
    const productPayload = {
      name:          basicInfo.name.trim(),
      description:   basicInfo.description?.trim() || '',
      categoryId:    basicInfo.categoryId ? Number(basicInfo.categoryId) : null,
      brandId:       basicInfo.brandId    ? Number(basicInfo.brandId)    : null,
      materialId:    basicInfo.materialId ? Number(basicInfo.materialId) : null,
      status:        basicInfo.status || 'ACTIVE',
      sku:           basicInfo.sku?.trim() || '',
      tags:          basicInfo.tags || [],
      slug:          basicInfo.slug || slugify(basicInfo.name),
      seoTitle:      basicInfo.seoTitle || '',
      seoDescription: basicInfo.seoDescription || '',
      weight:        basicInfo.weight ? Number(basicInfo.weight) : null,
      launchDate:    basicInfo.launchDate || null,
    };

    let savedProduct;
    if (isNew) {
      const res = await productAPI.create(productPayload);
      savedProduct = res?.data ?? res;
    } else {
      const res = await productAPI.update(existingProduct.id, productPayload);
      savedProduct = res?.data ?? res;
    }
    const productId = savedProduct.id;

    // ── Step 2: Manage variants ──────────────────────────────
    const existingVariantIds = new Set((existingProduct?.variants || []).map((v) => v.id));
    const savedVariantIds = new Set();
    const variantIdMap = {}; // tempId (from form) → real saved variantId

    for (const variant of variants) {
      const variantPayload = {
        productId,
        sizeId:    variant.sizeId   != null ? Number(variant.sizeId)                   : null,
        colorId:   variant.colorId  != null ? Number(variant.colorId)
                 : variant.color?.id != null ? Number(variant.color.id)                : null,
        price:     variant.price     ? Number(variant.price)     : 0,
        costPrice: variant.costPrice ? Number(variant.costPrice) : null,
        stock:     variant.stock     ? Number(variant.stock)     : 0,
        weight:    variant.weight    ? Number(variant.weight)    : null,
        status:    variant.status    || 'ACTIVE',
      };

      let savedVariant;
      if (variant.id && existingVariantIds.has(variant.id)) {
        // Existing variant → update
        const res = await productVariantAPI.update(variant.id, variantPayload);
        savedVariant = res?.data ?? res;
        savedVariantIds.add(variant.id);
      } else {
        // New variant → create
        const res = await productVariantAPI.create(variantPayload);
        savedVariant = res?.data ?? res;
      }
      variantIdMap[variant.id] = savedVariant.id;
    }

    // Delete variants that were removed from the form
    for (const oldId of existingVariantIds) {
      if (!savedVariantIds.has(oldId)) {
        await productVariantAPI.delete(oldId).catch(() => {});
      }
    }

    // ── Step 3: Manage images for each variant ───────────────
    // NOTE: key "shared" is a UI-only bucket, not a real variantId for backend API.
    // Apply shared images to variants that don't have their own image list.
    const sharedImages = Array.isArray(variantImages?.shared) ? variantImages.shared : [];

    for (const variant of variants) {
      const tempVariantId = String(variant.id);
      const variantSpecificImages = Array.isArray(variantImages?.[tempVariantId])
        ? variantImages[tempVariantId]
        : [];
      const images = variantSpecificImages.length > 0 ? variantSpecificImages : sharedImages;

      const resolvedVariantId = variantIdMap[variant.id] ?? variant.id;
      const realVariantId = Number(resolvedVariantId);
      if (!Number.isFinite(realVariantId)) continue;

      // ── Delete images that were removed in the UI ─────────
      // Compare original server images vs current UI state and delete removed ones
      const originalVariant = (existingProduct?.variants || []).find((v) => v.id === variant.id);
      if (originalVariant) {
        const originalImageIds = (originalVariant.images || []).map((img) => img.id);
        const currentImageIds = new Set(
          images.filter((img) => typeof img.id === 'number').map((img) => img.id)
        );
        for (const origId of originalImageIds) {
          if (!currentImageIds.has(origId)) {
            await productImageAPI.delete(origId).catch(() => {});
          }
        }
      }

      if (!images || images.length === 0) continue;

      // Find existing images (id is a number) vs new files (id is a string like "ts-idx")
      const existingImages = images.filter((img) => typeof img.id === 'number');
      const newImages = images.filter((img) => typeof img.id !== 'number' && img.file instanceof File);

      // Upload new files
      const uploadedImages = [];
      for (const img of newImages) {
        try {
          const res = await productImageAPI.upload(realVariantId, img.file);
          uploadedImages.push(res?.data ?? res);
        } catch (e) {
          console.error('Image upload failed:', e);
        }
      }

      // Set primary image
      const primaryImg = images.find((img) => img.isPrimary);
      if (primaryImg) {
        const primaryRealId = typeof primaryImg.id === 'number'
          ? primaryImg.id
          : uploadedImages.find((u, i) => newImages[i] === primaryImg)?.id;
        if (primaryRealId) {
          await productImageAPI.setPrimary(primaryRealId).catch(() => {});
        }
      }

      // Reorder all current images (existing kept + newly uploaded)
      const allCurrentIds = [
        ...existingImages.map((i) => i.id),
        ...uploadedImages.map((i) => i.id),
      ];
      if (allCurrentIds.length > 0) {
        await productImageAPI.reorder(realVariantId, allCurrentIds).catch(() => {});
      }
    }

    // ── Done: refresh product list ───────────────────────────
    dispatch({
      type: 'CLOSE_MODAL',
    });
    dispatch({
      type: 'SHOW_TOAST',
      message: isNew ? 'Sản phẩm đã được thêm thành công!' : 'Đã cập nhật sản phẩm',
      toastType: 'success',
    });
    fetchProducts(state.filters, state.currentPage, state.rowsPerPage);
  }, [state.filters, state.currentPage, state.rowsPerPage, fetchProducts]);

  const handleExportExcel = useCallback(() => {
    dispatch({ type: 'SHOW_TOAST', message: 'Đang xuất Excel...', toastType: 'info' });
  }, []);

  /* ── Render ────────────────────────────────────────────── */
  return (
    <AdminLayout
      activeSection="products"
      title="Quản lý Sản phẩm"
      subtitle="Quản lý và cập nhật thông tin sản phẩm"
    >
      {/* Page header */}
      <ProductPageHeader onAdd={handleOpenAdd} onExportExcel={handleExportExcel} />

      {/* Error banner */}
      {state.error && (
        <div className="pm-error-banner">
          <AlertTriangle size={16} />
          {state.error}
          <button
            type="button"
            className="pm-error-dismiss"
            onClick={() => fetchProducts(state.filters, state.currentPage, state.rowsPerPage)}
          >
            Thử lại
          </button>
        </div>
      )}

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
        resultCount={paginatedProducts.length}
        totalCount={state.totalElements}
        categories={state.categories}
        brands={state.brands}
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

      {/* Product list */}
      <ProductTable
        products={paginatedProducts}
        selectedIds={state.selectedIds}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        onAdd={handleOpenAdd}
        sortConfig={state.sortConfig}
        onSort={handleSort}
        loading={state.loading}
      />

      {/* Pagination */}
      <ProductPagination
        currentPage={state.currentPage}
        totalPages={totalPages}
        rowsPerPage={state.rowsPerPage}
        totalItems={state.totalElements}
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
          categories={state.categories}
          brands={state.brands}
          materials={state.materials}
          sizes={state.sizes}
          colors={state.colors}
          onSave={handleSaveProduct}
          onCancel={() => dispatch({ type: 'CLOSE_MODAL' })}
          onSizeCreated={(saved) => dispatch({ type: 'SET_LOOKUP_DATA', key: 'sizes', data: [...state.sizes, saved] })}
          onColorCreated={(saved) => dispatch({ type: 'SET_LOOKUP_DATA', key: 'colors', data: [...state.colors, saved] })}
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
