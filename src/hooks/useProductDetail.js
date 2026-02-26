import { useState, useEffect } from 'react';
import { productApi } from '../api/productApi';

/**
 * Hook for the Product Detail page.
 * Fetches product detail + related products in parallel.
 * Manages selected variant, color, size, and stock state.
 *
 * @param {number} productId
 */
export function useProductDetail(productId) {
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stockMap, setStockMap] = useState({});

  // ── Fetch product detail + related in parallel ────────
  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    setError(null);
    setSelectedVariant(null);
    setSelectedColor(null);
    setSelectedSize(null);

    Promise.all([
      productApi.getProductDetail(productId),
      productApi.getRelatedProducts(productId, 8),
    ])
      .then(([detail, related]) => {
        setProduct(detail);
        setRelatedProducts(related);

        // Set default selections from first active variant
        if (detail.variants && detail.variants.length > 0) {
          const first = detail.variants[0];
          setSelectedColor({
            colorId: first.colorId,
            colorName: first.colorName,
            colorCode: first.colorCode,
          });
          setSelectedSize(first.sizeName);
          setSelectedVariant(first);
        }

        // Check stock for all variants
        const variantIds = detail.variants.map((v) => v.variantId);
        return productApi.checkStock(variantIds);
      })
      .then((stock) => setStockMap(stock))
      .catch((err) => {
        setError(err.message ?? 'Không thể tải sản phẩm');
      })
      .finally(() => setLoading(false));
  }, [productId]);

  // ── Find matching variant when color/size changes ─────
  useEffect(() => {
    if (!product || !selectedColor || !selectedSize) return;
    const match = product.variants.find(
      (v) =>
        v.colorId === selectedColor.colorId && v.sizeName === selectedSize
    );
    setSelectedVariant(match ?? null);
  }, [selectedColor, selectedSize, product]);

  // ── Derived: available sizes for selected color ───────
  const availableSizesForColor = product?.variants
    .filter((v) => v.colorId === selectedColor?.colorId)
    .map((v) => v.sizeName) ?? [];

  // ── Derived: all sizes across product ─────────────────
  const allSizes = product
    ? [...new Set(product.variants.map((v) => v.sizeName))].sort()
    : [];

  // ── Derived: distinct colors ──────────────────────────
  const availableColors = product
    ? Array.from(
        new Map(
          product.variants.map((v) => [
            v.colorId,
            { colorId: v.colorId, colorName: v.colorName, colorCode: v.colorCode },
          ])
        ).values()
      )
    : [];

  // ── Derived: stock info ───────────────────────────────
  const stockCount = selectedVariant
    ? (stockMap[selectedVariant.variantId] ?? 0)
    : 0;

  const isInStock = stockCount > 0;

  return {
    product,
    relatedProducts,
    loading,
    error,
    selectedVariant,
    selectedColor,
    selectedSize,
    setSelectedColor,
    setSelectedSize,
    availableColors,
    availableSizesForColor,
    allSizes,
    isInStock,
    stockCount,
    stockMap,
  };
}
