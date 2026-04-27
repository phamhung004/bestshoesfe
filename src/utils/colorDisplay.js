export const getColorName = (color) => {
  if (!color) return '';
  return color.colorName || color.color_name || color.name || '';
};

export const getColorCode = (color) => {
  if (!color) return '';
  return color.colorCode || color.color_code || color.hex || '';
};

export const getColorLabel = (color) => {
  const name = getColorName(color);
  const code = getColorCode(color);
  return name || code || 'Màu';
};

export const buildColorFromVariant = (variant = {}) => ({
  colorName: variant.colorName || variant.color_name || variant.color?.colorName || variant.color?.color_name,
  colorCode: variant.colorCode || variant.color_code || variant.color?.colorCode || variant.color?.color_code,
});
