import { useState, useEffect } from 'react';
import { productApi } from '../api/productApi';

// Module-level cache so navigating back doesn't re-fetch
let cachedOptions = null;

/**
 * Hook to fetch filter sidebar options once per session.
 * Data is cached at module scope.
 */
export function useFilterOptions() {
  const [options, setOptions] = useState(cachedOptions);
  const [loading, setLoading] = useState(!cachedOptions);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (cachedOptions) return; // Use cached data

    let cancelled = false;
    setLoading(true);

    productApi.getFilterOptions()
      .then((data) => {
        if (!cancelled) {
          cachedOptions = data;
          setOptions(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message ?? 'Không thể tải bộ lọc');
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, []);

  return { options, loading, error };
}
