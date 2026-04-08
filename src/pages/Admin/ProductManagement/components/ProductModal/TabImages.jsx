import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, X } from 'lucide-react';

const MAX_IMAGES = 10;

/**
 * ImageDropZone for a single variant
 *
 * Props:
 *   variantId    string | number
 *   label        string
 *   images       [{ url, isPrimary, file?, objectUrl? }]
 *   onImagesChange  (variantId, images) => void
 */
const ImageDropZone = ({ variantId, label, images, onImagesChange }) => {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);
  const imagesRef = useRef(images);
  imagesRef.current = images;

  // Cleanup object URLs on unmount (uses ref to avoid stale closure)
  useEffect(() => {
    return () => {
      imagesRef.current.forEach((img) => {
        if (img.objectUrl && img.file) URL.revokeObjectURL(img.objectUrl);
      });
    };
  }, []);

  const addFiles = (files) => {
    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) return;
    const toAdd = Array.from(files).slice(0, remaining);
    const newImgs = toAdd.map((file, idx) => ({
      id: `${Date.now()}-${idx}`,
      file,
      objectUrl: URL.createObjectURL(file),
      isPrimary: images.length === 0 && idx === 0,
    }));
    onImagesChange(variantId, [...images, ...newImgs]);
    // Reset input so the same file can be re-selected
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  const handleRemove = (imgId) => {
    const img = images.find((i) => i.id === imgId);
    if (img?.objectUrl) URL.revokeObjectURL(img.objectUrl);
    const next = images.filter((i) => i.id !== imgId);
    // If we removed the primary, make first remaining primary
    if (img?.isPrimary && next.length > 0) {
      next[0] = { ...next[0], isPrimary: true };
    }
    onImagesChange(variantId, next);
  };

  const handleSetPrimary = (imgId) => {
    onImagesChange(
      variantId,
      images.map((i) => ({ ...i, isPrimary: i.id === imgId }))
    );
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>
        {label}
        <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 400, marginLeft: 6 }}>
          ({images.length}/{MAX_IMAGES} ảnh)
        </span>
      </div>

      {/* Dropzone */}
      {images.length < MAX_IMAGES && (
        <div
          className={`pm-dropzone ${dragOver ? 'dragover' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <div className="pm-dropzone-icon">
            <UploadCloud size={40} />
          </div>
          <div className="pm-dropzone-text">
            {dragOver ? 'Thả ảnh vào đây!' : 'Kéo thả ảnh vào đây hoặc'}
          </div>
          <button type="button" className="pm-dropzone-btn" onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>
            Chọn từ máy tính
          </button>
          <div className="pm-dropzone-sub">PNG, JPG, WEBP — Tối đa 5MB mỗi ảnh</div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => addFiles(e.target.files)}
          />
        </div>
      )}

      {/* Image grid */}
      {images.length > 0 && (
        <div className="pm-image-grid">
          {images.map((img) => (
            <div
              key={img.id}
              className={`pm-image-card ${img.isPrimary ? 'primary' : ''}`}
            >
              <img
                src={img.objectUrl || img.url}
                alt="product"
              />
              {img.isPrimary && (
                <div className="pm-primary-badge">★ CHÍNH</div>
              )}
              <div className="pm-img-actions">
                {!img.isPrimary && (
                  <button
                    type="button"
                    className="pm-img-action-btn pm-img-action-primary"
                    onClick={() => handleSetPrimary(img.id)}
                  >
                    Đặt làm chính
                  </button>
                )}
                <button
                  type="button"
                  className="pm-img-action-btn pm-img-action-remove"
                  onClick={() => handleRemove(img.id)}
                >
                  <X size={10} style={{ marginRight: 2 }} /> Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * TabImages
 *
 * Props:
 *   variants         Variant[]
 *   variantImages    { [variantId]: Image[] }
 *   onImagesChange   (variantId, images) => void
 */
const TabImages = ({ variants = [], variantImages = {}, onImagesChange }) => {
  const [activeVariantId, setActiveVariantId] = useState('shared');

  const pills = [
    { id: 'shared', label: 'Ảnh dùng chung', color: null },
    ...variants.map((v) => ({
      id: v.id,
      label: `${v.size} / ${v.color.name}`,
      color: v.color.code,
    })),
  ];

  const activeImages = variantImages[activeVariantId] || [];

  if (variants.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
        <UploadCloud size={48} style={{ margin: '0 auto 12px', color: '#c7d2fe' }} />
        <div style={{ fontSize: 14, fontWeight: 600, color: '#64748b' }}>
          Vui lòng tạo biến thể trước ở tab "Biến thể & Kho"
        </div>
        <div style={{ fontSize: 13, marginTop: 4 }}>
          Sau đó quay lại đây để thêm ảnh cho từng biến thể
        </div>
      </div>
    );
  }

  const activeLabel =
    pills.find((p) => p.id === activeVariantId)?.label || 'Ảnh dùng chung';

  return (
    <div>
      {/* Variant pills */}
      <div className="pm-variant-pills">
        {pills.map((pill) => {
          const isActive = activeVariantId === pill.id;
          const imgCount = (variantImages[pill.id] || []).length;
          return (
            <button
              key={pill.id}
              type="button"
              className={`pm-variant-pill ${isActive ? 'active' : ''}`}
              onClick={() => setActiveVariantId(pill.id)}
            >
              {pill.color && (
                <span
                  style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: pill.color,
                    border: '1px solid rgba(0,0,0,0.12)',
                    flexShrink: 0,
                  }}
                />
              )}
              {pill.label}
              {imgCount > 0 && (
                <span
                  style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: isActive ? '#ffffff' : '#22c55e',
                    flexShrink: 0,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Upload zone for active variant */}
      <ImageDropZone
        key={activeVariantId}
        variantId={activeVariantId}
        label={activeLabel}
        images={activeImages}
        onImagesChange={onImagesChange}
      />

      {/* Helper tip */}
      <div style={{ padding: '10px 14px', background: '#f0fdf4', borderRadius: 10, border: '1px solid #bbf7d0' }}>
        <span style={{ fontSize: 12, color: '#15803d' }}>
          💡 <strong>Mẹo:</strong> Ảnh trong "Ảnh dùng chung" sẽ hiển thị cho tất cả biến thể không có ảnh riêng.
        </span>
      </div>
    </div>
  );
};

export default TabImages;
