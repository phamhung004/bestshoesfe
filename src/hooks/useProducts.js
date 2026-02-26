import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productApi } from '../api/productApi';
import { useDebounce } from './useDebounce';

/**
 * Hook for the Catalog page.
 * Manages filter state, fetches products, and syncs filters to URL search params.
 */
export function useProducts() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize filters from URL params
  const [filters, setFilters] = useState(() => ({
    categoryId: searchParams.get('categoryId')
      ? Number(searchParams.get('categoryId')) : undefined,
    brandId: searchParams.get('brandId')
      ? Number(searchParams.get('brandId')) : undefined,
    minPrice: searchParams.get('minPrice')
      ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice')
      ? Number(searchParams.get('maxPrice')) : undefined,
    sizeName: searchParams.get('sizeName') ?? undefined,
    colorId: searchParams.get('colorId')
      ? Number(searchParams.get('colorId')) : undefined,
    keyword: searchParams.get('keyword') ?? undefined,
    isNew: searchParams.get('isNew') === 'true' ? true : undefined,
    onSale: searchParams.get('onSale') === 'true' ? true : undefined,
    sortBy: searchParams.get('sortBy') ?? 'newest',
    page: Number(searchParams.get('page') ?? '0'),
    size: Number(searchParams.get('size') ?? '12'),
  }));

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debounce keyword to avoid firing API on every keypress
  const debouncedKeyword = useDebounce(filters.keyword, 400);

  // ── Fetch products when filters change ────────────────
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const fetchParams = {
      ...filters,
      keyword: debouncedKeyword,
    };
    // Remove undefined values so they don't appear as "undefined" in query string
    Object.keys(fetchParams).forEach((k) => {
      if (fetchParams[k] === undefined) delete fetchParams[k];
    });

    productApi.getProducts(fetchParams)
      .then((res) => {
        if (!cancelled) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message ?? 'Không thể tải sản phẩm');
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [
    filters.categoryId, filters.brandId,
    filters.minPrice, filters.maxPrice,
    filters.sizeName, filters.colorId,
    debouncedKeyword,
    filters.isNew, filters.onSale,
    filters.sortBy, filters.page, filters.size,
  ]);

  // ── Sync filters → URL search params ─────────────────
  useEffect(() => {
    const params = {};
    if (filters.categoryId != null) params.categoryId = String(filters.categoryId);
    if (filters.brandId != null)    params.brandId    = String(filters.brandId);
    if (filters.minPrice != null)   params.minPrice   = String(filters.minPrice);
    if (filters.maxPrice != null)   params.maxPrice   = String(filters.maxPrice);
    if (filters.sizeName)           params.sizeName   = filters.sizeName;
    if (filters.colorId != null)    params.colorId    = String(filters.colorId);
    if (filters.keyword)            params.keyword    = filters.keyword;
    if (filters.isNew === true)     params.isNew      = 'true';
    if (filters.onSale === true)    params.onSale     = 'true';
    if (filters.sortBy && filters.sortBy !== 'newest') params.sortBy = filters.sortBy;
    if (filters.page > 0)           params.page       = String(filters.page);
    if (filters.size !== 12)        params.size       = String(filters.size);
    setSearchParams(params, { replace: true });
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Update a single filter value ──────────────────────
  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      // Reset to page 0 when changing any filter except page itself
      page: key !== 'page' ? 0 : value,
    }));
  }, []);

  // ── Reset all filters ─────────────────────────────────
  const resetFilters = useCallback(() => {
    setFilters({ sortBy: 'newest', page: 0, size: 12 });
  }, []);

  // ── Count active filters (for badge) ─────────────────
  const activeFilterCount = [
    filters.categoryId,
    filters.brandId,
    filters.minPrice,
    filters.maxPrice,
    filters.sizeName,
    filters.colorId,
    filters.isNew,
    filters.onSale,
  ].filter((v) => v != null && v !== false).length;

  return {
    filters,
    data,
    loading,
    error,
    updateFilter,
    resetFilters,
    activeFilterCount,
    products: data?.content ?? [],
    totalPages: data?.totalPages ?? 0,
    totalElements: data?.totalElements ?? 0,
    currentPage: data?.pageNumber ?? 0,
  };
}
