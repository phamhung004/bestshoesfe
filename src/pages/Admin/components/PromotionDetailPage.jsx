import React, { useState, useEffect } from 'react';
import { promotionAPI } from '../../../services/api';
import PromotionVariantList from './PromotionVariantList';
import PromotionVariantPicker from './PromotionVariantPicker';
import PromotionForm from './PromotionForm';
import './PromotionDetailPage.css';

/**
 * PromotionDetailPage
 * - Shows when user clicks "Quản lý SP" on a promotion row.
 * - Two tabs: "Thông tin chung" (edit form) and "Sản phẩm áp dụng" (variant list).
 * - PromotionVariantPicker modal opens when adding variants.
 */
const PromotionDetailPage = ({ promotion: initialPromotion, onBack, onSaved }) => {
  const [activeTab, setActiveTab] = useState('variants');
  const [promotion, setPromotion] = useState(initialPromotion);
  const [showPicker, setShowPicker] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Keep promotion data fresh
  useEffect(() => {
    if (initialPromotion?.promotionId) {
      promotionAPI.getById(initialPromotion.promotionId).then(setPromotion).catch(console.error);
    }
  }, [initialPromotion?.promotionId]);

  const handleFormSaved = (result) => {
    setPromotion(result);
    onSaved && onSaved();
  };

  const handleVariantsSaved = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="promo-detail-page">
      <div className="promo-detail-header">
        <button className="btn-back" onClick={onBack}>
          ← Quay lại danh sách
        </button>
        <div className="promo-detail-title">
          <h2>{promotion?.name || 'Đợt giảm giá'}</h2>
          <span className="promo-detail-id">#{promotion?.promotionId}</span>
        </div>
      </div>

      <div className="promo-detail-tabs">
        <button
          className={`promo-tab ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          📋 Thông tin chung
        </button>
        <button
          className={`promo-tab ${activeTab === 'variants' ? 'active' : ''}`}
          onClick={() => setActiveTab('variants')}
        >
          📦 Sản phẩm áp dụng
        </button>
      </div>

      <div className="promo-detail-content">
        {activeTab === 'info' && (
          <div className="promo-info-tab">
            <PromotionForm
              promotion={promotion}
              onSave={handleFormSaved}
              onCancel={onBack}
              isEditing={true}
            />
          </div>
        )}

        {activeTab === 'variants' && (
          <div className="promo-variants-tab">
            <PromotionVariantList
              key={refreshKey}
              promotionId={promotion?.promotionId}
              promotion={promotion}
              onAddVariants={() => setShowPicker(true)}
            />
          </div>
        )}
      </div>

      {showPicker && (
        <PromotionVariantPicker
          promotionId={promotion?.promotionId}
          onClose={() => setShowPicker(false)}
          onSaved={handleVariantsSaved}
        />
      )}
    </div>
  );
};

export default PromotionDetailPage;
