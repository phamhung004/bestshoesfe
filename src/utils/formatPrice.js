/**
 * Format a number as Vietnamese currency (VND)
 * Output: "1.250.000 ₫"
 */
export const formatPrice = (amount) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(amount ?? 0);

/**
 * Format a number in short form
 * Output: "1.25tr ₫" / "500k ₫"
 */
export const formatPriceShort = (amount) => {
  if (amount == null) return '0 ₫';
  if (amount >= 1_000_000)
    return `${(amount / 1_000_000).toFixed(1).replace('.0', '')}tr ₫`;
  if (amount >= 1_000)
    return `${(amount / 1_000).toFixed(0)}k ₫`;
  return `${amount} ₫`;
};

/**
 * Alias for convenience (matches existing formatVND usage in catalog)
 */
export const formatVND = formatPrice;
