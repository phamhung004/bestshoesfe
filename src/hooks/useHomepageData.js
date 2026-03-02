import { useState, useEffect, useRef } from 'react';
import { productApi } from '../api/productApi';
import { brandApi } from '../api/brandApi';
import { promotionApi } from '../api/promotionApi';

// Module-level cache — persists across navigations within the same session
let cache = null;

/**
 * Hook to fetch all homepage data in parallel.
 * Each section has independent error handling — one failing API won't block others.
 *
 * Returns:
 *   bestSellers     — popular products (from /products?sortBy=popular)
 *   flashSaleProducts — products on sale (from /products?onSale=true)
 *   categories      — from /products/filter-options
 *   brands          — from /brands/list
 *   promotions      — currently running promotions
 *   loading         — true when any section is still loading
 *   sectionLoading  — { bestSellers, flashSale, categories, brands, promotions }
 *   errors          — { bestSellers, flashSale, categories, brands, promotions }
 */
export function useHomepageData() {
  const [data, setData] = useState(cache || {
    bestSellers: [],
    flashSaleProducts: [],
    categories: [],
    brands: [],
    promotions: [],
  });

  const [sectionLoading, setSectionLoading] = useState({
    bestSellers: !cache,
    flashSale: !cache,
    categories: !cache,
    brands: !cache,
    promotions: !cache,
  });

  const [errors, setErrors] = useState({
    bestSellers: null,
    flashSale: null,
    categories: null,
    brands: null,
    promotions: null,
  });

  const fetchedRef = useRef(false);

  useEffect(() => {
    if (cache || fetchedRef.current) return;
    fetchedRef.current = true;

    // Helper to update specific section
    const updateSection = (section, value) => {
      setData(prev => ({ ...prev, [section]: value }));
      setSectionLoading(prev => ({ ...prev, [section]: false }));
    };

    const updateError = (section, error) => {
      setErrors(prev => ({ ...prev, [section]: error }));
      setSectionLoading(prev => ({ ...prev, [section]: false }));
    };

    // 1. Best sellers — popular products
    productApi.getProducts({ sortBy: 'popular', size: 8, page: 0 })
      .then((res) => {
        const products = res?.content || res?.data?.content || [];
        updateSection('bestSellers', products);
      })
      .catch((err) => {
        console.warn('[Homepage] Failed to load best sellers:', err.message);
        updateError('bestSellers', err.message);
      });

    // 2. Flash sale products — on sale
    productApi.getProducts({ onSale: true, size: 8, page: 0 })
      .then((res) => {
        const products = res?.content || res?.data?.content || [];
        updateSection('flashSaleProducts', products);
      })
      .catch((err) => {
        console.warn('[Homepage] Failed to load flash sale:', err.message);
        updateError('flashSale', err.message);
      });

    // 3. Categories — from filter options
    productApi.getFilterOptions()
      .then((res) => {
        const cats = res?.categories || res?.data?.categories || [];
        updateSection('categories', cats);
      })
      .catch((err) => {
        console.warn('[Homepage] Failed to load categories:', err.message);
        updateError('categories', err.message);
      });

    // 4. Brands
    brandApi.getAll({ page: 0, size: 50 })
      .then((res) => {
        // BrandController wraps in ApiResponse { status, message, data }
        const brandList = res?.data || res || [];
        const activeBrands = Array.isArray(brandList)
          ? brandList.filter(b => b.status !== false)
          : [];
        updateSection('brands', activeBrands);
      })
      .catch((err) => {
        console.warn('[Homepage] Failed to load brands:', err.message);
        updateError('brands', err.message);
      });

    // 5. Currently running promotions
    promotionApi.getCurrentlyRunning()
      .then((res) => {
        const promos = Array.isArray(res) ? res : (res?.data || []);
        updateSection('promotions', promos);
      })
      .catch((err) => {
        console.warn('[Homepage] Failed to load promotions:', err.message);
        updateError('promotions', err.message);
      });
  }, []);

  // Cache data when all sections are done loading
  const loading = Object.values(sectionLoading).some(Boolean);
  useEffect(() => {
    if (!loading && !cache && data.bestSellers.length > 0) {
      cache = { ...data };
    }
  }, [loading, data]);

  return {
    ...data,
    loading,
    sectionLoading,
    errors,
  };
}

/**
 * Clear the homepage data cache (useful for dev/testing or after data changes)
 */
export function clearHomepageCache() {
  cache = null;
}
