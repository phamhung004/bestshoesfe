import { useState, useCallback, useRef } from 'react';

const BASE_URL = 'https://provinces.open-api.vn/api';

/**
 * Custom hook for Vietnamese province → district → ward cascading data
 * using provinces.open-api.vn
 */
export const useProvinces = () => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  // Cache to avoid re-fetching
  const cache = useRef({ provinces: null, districts: {}, wards: {} });

  const fetchProvinces = useCallback(async () => {
    if (cache.current.provinces) {
      setProvinces(cache.current.provinces);
      return;
    }
    setLoadingProvinces(true);
    try {
      const res = await fetch(`${BASE_URL}/p/`);
      const data = await res.json();
      const list = data.map((p) => ({ code: p.code, name: p.name }));
      cache.current.provinces = list;
      setProvinces(list);
    } catch (err) {
      console.error('Failed to fetch provinces:', err);
    } finally {
      setLoadingProvinces(false);
    }
  }, []);

  const fetchDistricts = useCallback(async (provinceCode) => {
    if (!provinceCode) {
      setDistricts([]);
      setWards([]);
      return;
    }
    if (cache.current.districts[provinceCode]) {
      setDistricts(cache.current.districts[provinceCode]);
      setWards([]);
      return;
    }
    setLoadingDistricts(true);
    setWards([]);
    try {
      const res = await fetch(`${BASE_URL}/p/${provinceCode}?depth=2`);
      const data = await res.json();
      const list = (data.districts || []).map((d) => ({ code: d.code, name: d.name }));
      cache.current.districts[provinceCode] = list;
      setDistricts(list);
    } catch (err) {
      console.error('Failed to fetch districts:', err);
    } finally {
      setLoadingDistricts(false);
    }
  }, []);

  const fetchWards = useCallback(async (districtCode) => {
    if (!districtCode) {
      setWards([]);
      return;
    }
    if (cache.current.wards[districtCode]) {
      setWards(cache.current.wards[districtCode]);
      return;
    }
    setLoadingWards(true);
    try {
      const res = await fetch(`${BASE_URL}/d/${districtCode}?depth=2`);
      const data = await res.json();
      const list = (data.wards || []).map((w) => ({ code: w.code, name: w.name }));
      cache.current.wards[districtCode] = list;
      setWards(list);
    } catch (err) {
      console.error('Failed to fetch wards:', err);
    } finally {
      setLoadingWards(false);
    }
  }, []);

  return {
    provinces,
    districts,
    wards,
    loadingProvinces,
    loadingDistricts,
    loadingWards,
    fetchProvinces,
    fetchDistricts,
    fetchWards,
  };
};
