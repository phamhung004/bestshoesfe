/**
 * POS utility functions (pure helpers — no mock data dependency).
 */

/** Format a number as Vietnamese Dong */
export const formatVND = (amount) =>
  new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';

/** Format an ISO datetime string to dd/MM/yyyy HH:mm */
export const formatDateTime = (isoStr) => {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/** Get initials from a full name (e.g. "Nguyễn Văn An" → "NA") */
export const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return parts.length === 1
    ? parts[0][0].toUpperCase()
    : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/** Compute the price range string for a list of variants (promotion-aware) */
export const getPriceRange = (variants) => {
  const prices = variants
    .filter((v) => v.status === 'ACTIVE')
    .map((v) => v.promotionPrice != null ? v.promotionPrice : v.price);
  if (!prices.length) return '—';
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? formatVND(min) : `${formatVND(min)} – ${formatVND(max)}`;
};

/** Check if any variant in a list has a promotion */
export const hasPromotion = (variants) =>
  variants.some((v) => v.status === 'ACTIVE' && v.promotionPrice != null);

/** Get the effective price for a variant (promotion-aware) */
export const getEffectivePrice = (variant) =>
  variant.promotionPrice != null ? variant.promotionPrice : variant.price;

/** Human-readable time-ago string from an ISO datetime */
export const timeAgo = (isoStr) => {
  if (!isoStr) return '';
  const diffMs = Date.now() - new Date(isoStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Vừa tạo';
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  return `${Math.floor(hours / 24)} ngày trước`;
};
