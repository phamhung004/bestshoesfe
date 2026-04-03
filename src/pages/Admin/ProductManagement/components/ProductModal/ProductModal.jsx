import React, { useState, useEffect } from 'react';
import { X, Check, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import TabBasicInfo from './TabBasicInfo';
import TabVariants from './TabVariants';
import TabImages from './TabImages';
import { slugify } from '../../mockProducts';

const TABS = [
  { index: 0, label: 'Thông tin cơ bản', short: '① Cơ bản' },
  { index: 1, label: 'Biến thể & Kho',   short: '② Biến thể' },
  { index: 2, label: 'Hình ảnh',          short: '③ Hình ảnh' },
];

const emptyBasicInfo = {
  name: '',
  description: '',
  categoryId: '',
  brandId: '',
  materialId: '',
  status: 'ACTIVE',
  tags: [],
  slug: '',
  _slugManual: false,
  seoTitle: '',
  seoDescription: '',
  weight: '',
  launchDate: '',
  sku: '',
};

/**
 * ProductModal
 *
 * Props:
 *   mode       'add' | 'edit'
 *   product    Product | null  (null for add)
 *   categories Category[]
 *   brands     Brand[]
 *   materials  Material[]
 *   sizes      Size[]
 *   colors     Color[]
 *   onSave     async ({ basicInfo, variants, variantImages, existingProduct }) => void
 *   onCancel   () => void
 */
const ProductModal = ({ mode, product, categories = [], brands = [], materials = [], sizes = [], colors = [], onSave, onCancel, onSizeCreated, onColorCreated }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [completedTabs, setCompletedTabs] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Tab 1 — Basic info form state
  const [basicInfo, setBasicInfo] = useState(() => {
    if (product) {
      return {
        name:            product.name || '',
        description:     product.description || '',
        categoryId:      product.category ? String(product.category.id) : '',
        brandId:         product.brand    ? String(product.brand.id) : '',
        materialId:      product.material ? String(product.material.id) : '',
        status:          product.status || 'ACTIVE',
        tags:            product.tags || [],
        slug:            product.slug || '',
        _slugManual:     !!product.slug,
        seoTitle:        product.seoTitle || '',
        seoDescription:  product.seoDescription || '',
        weight:          product.weight || '',
        launchDate:      product.launchDate || '',
        sku:             product.sku || '',
      };
    }
    return { ...emptyBasicInfo };
  });

  // Tab 2 — Variants
  const [variants, setVariants] = useState(() => product?.variants || []);

  // Tab 3 — Images per variant (pre-populated with existing images in edit mode)
  const [variantImages, setVariantImages] = useState(() => {
    if (!product?.variants) return {};
    const init = {};
    for (const v of product.variants) {
      if (Array.isArray(v.images) && v.images.length > 0) {
        init[v.id] = v.images.map((img) => ({
          id: img.id,          // number → existing on server
          imageUrl: img.imageUrl,
          altText: img.altText,
          isPrimary: img.isPrimary,
          sortOrder: img.sortOrder,
          objectUrl: img.imageUrl, // use Cloudinary URL for preview
        }));
      }
    }
    return init;
  });

  // Validation errors
  const [errors, setErrors] = useState({});

  const handleBasicInfoChange = (field, value) => {
    setBasicInfo((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((e) => { const n = {...e}; delete n[field]; return n; });
  };

  const handleImagesChange = (variantId, images) => {
    setVariantImages((prev) => ({ ...prev, [variantId]: images }));
  };

  /* ── Validation ───────────────────────────────────────────── */
  const validateTab0 = () => {
    const errs = {};
    if (!basicInfo.name.trim()) errs.name = 'Tên sản phẩm không được để trống';
    else if (basicInfo.name.trim().length < 3) errs.name = 'Tên quá ngắn (tối thiểu 3 ký tự)';
    if (!basicInfo.categoryId) errs.categoryId = 'Vui lòng chọn danh mục';
    if (!basicInfo.brandId)    errs.brandId    = 'Vui lòng chọn thương hiệu';
    if (!basicInfo.sku?.trim()) errs.sku = 'Mã sản phẩm (SKU) là bắt buộc';
    return errs;
  };

  const validateTab1 = () => {
    const errs = {};
    if (variants.length === 0) {
      errs.variants = 'Vui lòng thêm ít nhất 1 biến thể';
    } else {
      const hasPrice = variants.some((v) => parseFloat(v.price) > 0);
      if (!hasPrice) errs.variants = 'Ít nhất 1 biến thể cần có giá bán';
    }
    return errs;
  };

  /* ── Navigation ───────────────────────────────────────────── */
  const goNext = () => {
    if (activeTab === 0) {
      const errs = validateTab0();
      if (Object.keys(errs).length > 0) { setErrors(errs); return; }
      setCompletedTabs((c) => new Set([...c, 0]));
    }
    if (activeTab === 1) {
      const errs = validateTab1();
      if (Object.keys(errs).length > 0) { setErrors(errs); return; }
      setCompletedTabs((c) => new Set([...c, 1]));
    }
    setActiveTab((t) => Math.min(t + 1, 2));
    setErrors({});
  };

  const goBack = () => {
    setActiveTab((t) => Math.max(t - 1, 0));
    setErrors({});
  };

  const handleSave = async () => {
    const errs0 = validateTab0();
    const errs1 = validateTab1();
    const allErrs = { ...errs0, ...errs1 };
    if (Object.keys(allErrs).length > 0) {
      setErrors(allErrs);
      setActiveTab(Object.keys(errs0).length > 0 ? 0 : 1);
      return;
    }

    setSaving(true);
    setSaveError(null);
    try {
      await onSave({
        basicInfo,
        variants,
        variantImages,
        existingProduct: product || null,
      });
      // Modal is closed by parent after successful save
    } catch (err) {
      const data = err?.response?.data;
      let message;
      if (data && typeof data === 'object') {
        if (data.message) {
          message = data.message;
        } else {
          // field-errors map from @Valid: { name: "...", brandId: "..." }
          const values = Object.values(data).filter(Boolean);
          if (values.length > 0) message = values.join('; ');
        }
      }
      setSaveError(message || err?.message || 'Lỗi lưu sản phẩm. Vui lòng thử lại.');
      setSaving(false);
    }
  };

  /* ── Escape key ───────────────────────────────────────────── */
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, []);

  /* ── Error count per tab ──────────────────────────────────── */
  const tab0Errors = ['name', 'categoryId', 'brandId', 'sku'].filter((k) => errors[k]).length;
  const tab1Errors = ['variants'].filter((k) => errors[k]).length;

  return (
    <div className="pm-modal-overlay">
      <div className="pm-modal">
        {/* ── Header ──────────────────────────────────────── */}
        <div className="pm-modal-header">
          <div>
            <div className="pm-modal-title">
              {mode === 'add' ? 'Thêm sản phẩm mới' : `Chỉnh sửa: ${product?.name || ''}`}
            </div>

            {/* Tab pills */}
            <div className="pm-modal-tabs">
              {TABS.map(({ index, short }) => {
                const isActive    = activeTab === index;
                const isCompleted = completedTabs.has(index);
                const errCount    = index === 0 ? tab0Errors : index === 1 ? tab1Errors : 0;
                return (
                  <button
                    key={index}
                    type="button"
                    className={`pm-tab-pill ${isActive ? 'active' : ''} ${isCompleted && !isActive ? 'completed' : ''}`}
                    onClick={() => setActiveTab(index)}
                  >
                    {isCompleted && !isActive && !errCount ? (
                      <Check size={12} />
                    ) : errCount > 0 ? (
                      <span style={{ background: '#ef4444', color: '#fff', borderRadius: '50%', width: 16, height: 16, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>
                        {errCount}
                      </span>
                    ) : null}
                    {short}
                  </button>
                );
              })}
            </div>
          </div>

          <button className="pm-btn-icon" onClick={onCancel} type="button" title="Đóng">
            <X size={18} />
          </button>
        </div>

        {/* ── Body ────────────────────────────────────────── */}
        <div className="pm-modal-body">
          {activeTab === 0 && (
            <TabBasicInfo
              data={basicInfo}
              onChange={handleBasicInfoChange}
              errors={errors}
              categories={categories}
              brands={brands}
              materials={materials}
            />
          )}
          {activeTab === 1 && (
            <TabVariants
              variants={variants}
              onChange={setVariants}
              errors={errors}
              sizes={sizes}
              colors={colors}
              onSizeCreated={onSizeCreated}
              onColorCreated={onColorCreated}
            />
          )}
          {activeTab === 2 && (
            <TabImages
              variants={variants}
              variantImages={variantImages}
              onImagesChange={handleImagesChange}
            />
          )}
        </div>

        {/* ── Footer ──────────────────────────────────────── */}
        <div className="pm-modal-footer">
          <div className="pm-modal-footer-left">
            {activeTab > 0 && (
              <button
                type="button"
                className="pm-btn pm-btn-ghost pm-btn-sm"
                onClick={goBack}
              >
                <ChevronLeft size={14} />
                Quay lại
              </button>
            )}
            {saveError && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#ef4444', fontSize: 13 }}>
                <AlertTriangle size={14} />
                {saveError}
              </span>
            )}
          </div>

          <div className="pm-modal-footer-right">
            <span style={{ fontSize: 13, color: '#94a3b8' }}>
              Bước {activeTab + 1}/3
            </span>
            <button
              type="button"
              className="pm-btn pm-btn-outline pm-btn-sm"
              onClick={onCancel}
            >
              Hủy
            </button>

            {activeTab < 2 ? (
              <button
                type="button"
                className="pm-btn pm-btn-primary pm-btn-sm"
                onClick={goNext}
              >
                Tiếp theo
                <ChevronRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                className="pm-btn pm-btn-primary pm-btn-sm"
                style={{ background: '#16a34a', borderColor: '#16a34a' }}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span
                      style={{
                        display: 'inline-block', width: 14, height: 14,
                        border: '2px solid rgba(255,255,255,0.4)',
                        borderTopColor: '#fff',
                        borderRadius: '50%',
                        animation: 'pm-spin 0.8s linear infinite',
                      }}
                    />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Check size={14} />
                    Lưu sản phẩm
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pm-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ProductModal;
