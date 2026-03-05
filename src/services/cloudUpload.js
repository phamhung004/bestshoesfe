const CLOUDINARY_CLOUD_NAME =
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ||
  import.meta.env.VITE_CLOUD_NAME ||
  "";
const CLOUDINARY_UPLOAD_PRESET =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ||
  import.meta.env.VITE_CLOUDINARY_PRESET ||
  import.meta.env.VITE_UPLOAD_PRESET ||
  "";
const CLOUDINARY_FOLDER =
  import.meta.env.VITE_CLOUDINARY_FOLDER ||
  import.meta.env.VITE_UPLOAD_FOLDER ||
  "bestshoes";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export const validateImageFile = (file) => {
  if (!file) return "File không hợp lệ";
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Chỉ hỗ trợ JPG, PNG, WEBP";
  }
  if (file.size > MAX_SIZE_BYTES) {
    return `Dung lượng tối đa ${MAX_SIZE_MB}MB`;
  }
  return null;
};

export const getCloudUploadConfigError = () => {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    return "Thiếu cấu hình Cloudinary. Vui lòng thêm VITE_CLOUDINARY_CLOUD_NAME và VITE_CLOUDINARY_UPLOAD_PRESET";
  }

  return null;
};

export const uploadLocalFileToCloud = async (file) => {
  const configError = getCloudUploadConfigError();
  if (configError) {
    throw new Error(configError);
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", CLOUDINARY_FOLDER);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || "Upload ảnh thất bại");
  }

  if (!data?.secure_url) {
    throw new Error("Cloud upload thành công nhưng không nhận được URL public");
  }

  return data.secure_url;
};

export const imageUploadConstraints = {
  allowedTypes: ALLOWED_TYPES,
  maxSizeMb: MAX_SIZE_MB,
};
