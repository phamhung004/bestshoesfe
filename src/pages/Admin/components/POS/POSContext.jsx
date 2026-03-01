import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { sizeAPI, colorAPI, brandAPI, categoryAPI } from '../../../../services/api';

/**
 * POSContext — loads reference data (sizes, colors, brands, categories) once
 * at the POSPage level and exposes lookup helpers to all child components.
 *
 * Backend returns paginated responses: { status, message, data: { content: [...], totalElements } }
 */
const POSContext = createContext(null);

export const usePOS = () => {
  const ctx = useContext(POSContext);
  if (!ctx) throw new Error('usePOS must be used inside <POSProvider>');
  return ctx;
};

export const POSProvider = ({ children }) => {
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load all reference data once
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const [sizeRes, colorRes, brandRes, catRes] = await Promise.all([
          sizeAPI.getAll(0, 200),
          colorAPI.getAll(0, 200),
          brandAPI.getAll(0, 200),
          categoryAPI.getAll(0, 200),
        ]);

        if (cancelled) return;

        // Extract content arrays from paginated responses
        const extract = (res) => {
          if (!res) return [];
          // Response shape: { status, message, data: { content: [...] } }
          if (res.data?.content) return res.data.content;
          // Or sometimes data is the array directly
          if (Array.isArray(res.data)) return res.data;
          if (Array.isArray(res)) return res;
          return [];
        };

        setSizes(extract(sizeRes));
        setColors(extract(colorRes));
        setBrands(extract(brandRes));
        setCategories(extract(catRes));
      } catch (err) {
        if (!cancelled) setError(err.message || 'Không thể tải dữ liệu');
        console.error('POSContext: failed to load reference data', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // ── Lookup helpers ──────────────────────────────────────────
  const getSizeName = useCallback(
    (sizeId) => sizes.find((s) => s.sizeId === sizeId)?.sizeName || '?',
    [sizes]
  );

  const getColor = useCallback(
    (colorId) =>
      colors.find((c) => c.colorId === colorId) || { colorName: '?', colorCode: '#ccc' },
    [colors]
  );

  const getBrandName = useCallback(
    (brandId) => brands.find((b) => b.brandId === brandId)?.name || '',
    [brands]
  );

  const getCategoryName = useCallback(
    (catId) => categories.find((c) => c.categoryId === catId)?.name || '',
    [categories]
  );

  const value = {
    sizes,
    colors,
    brands,
    categories,
    loading,
    error,
    getSizeName,
    getColor,
    getBrandName,
    getCategoryName,
  };

  return <POSContext.Provider value={value}>{children}</POSContext.Provider>;
};

export default POSContext;
