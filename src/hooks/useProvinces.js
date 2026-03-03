import { useState, useCallback, useRef } from 'react';
import { shippingApi } from '../api/shippingApi';

/**
 * Custom hook for Vietnamese province → district → ward cascading data.
 * Uses GHN (Giao Hàng Nhanh) master data via backend proxy.
 *
 * Each item has:
 * - provinces: { code: GhnProvinceID (number), name: ProvinceName }
 * - districts: { code: GhnDistrictID (number), name: DistrictName }
 * - wards:     { code: GhnWardCode (string), name: WardName }
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
      const res = await shippingApi.getProvinces();
      const raw = res.data?.data || res.data || [];
      const list = raw.map((p) => ({ code: p.provinceId, name: p.provinceName }));
      // Sort alphabetically by name
      list.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
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
      const res = await shippingApi.getDistricts(provinceCode);
      const raw = res.data?.data || res.data || [];
      const list = raw.map((d) => ({ code: d.districtId, name: d.districtName }));
      list.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
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
      const res = await shippingApi.getWards(districtCode);
      const raw = res.data?.data || res.data || [];
      const list = raw.map((w) => ({ code: w.wardCode, name: w.wardName }));
      list.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
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
