import React, { useState, useEffect } from 'react';
import { X, Image } from 'lucide-react';
import StarSelector from './StarSelector';

const WriteReviewModal = ({ product, onClose, onSubmit }) => {
    const [rating, setRating] = useState(0);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [qualityRating, setQualityRating] = useState(0);
    const [sizeRating, setSizeRating] = useState(0);
    const [deliveryRating, setDeliveryRating] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [onClose]);

    const handleSubmit = async () => {
        const errs = {};
        if (rating === 0) errs.rating = 'Vui lòng chọn số sao';
        if (!content.trim() || content.trim().length < 10) errs.content = 'Nội dung đánh giá ít nhất 10 ký tự';
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }

        setSubmitting(true);
        try {
            await onSubmit({ rating, title, content, qualityRating, sizeRating, deliveryRating });
            onClose();
        } catch (err) {
            // error handled by parent
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="acc-modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="acc-modal-card acc-modal-md">
                <div className="acc-modal-header">
                    <h3 className="acc-modal-title">Viết đánh giá</h3>
                    <button className="acc-modal-close" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="acc-modal-body">
                    {/* Product info */}
                    <div className="acc-review-product-header">
                        <div className="acc-review-thumb" style={{ background: product.thumbColor }}>
                            <span>👟</span>
                        </div>
                        <div>
                            <div className="acc-review-product-name">{product.productName}</div>
                            <div className="acc-review-product-variant">{product.variant}</div>
                        </div>
                    </div>

                    {/* Overall rating */}
                    <div className="acc-form-group">
                        <label className="acc-form-label">Đánh giá tổng quan <span className="acc-required">*</span></label>
                        <StarSelector value={rating} onChange={setRating} size={32} />
                        {errors.rating && <p className="acc-form-error">{errors.rating}</p>}
                    </div>

                    {/* Title */}
                    <div className="acc-form-group">
                        <label className="acc-form-label">Tiêu đề đánh giá <span className="acc-optional">(không bắt buộc)</span></label>
                        <input
                            className="acc-form-input"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Tóm tắt trải nghiệm của bạn..."
                            maxLength={100}
                        />
                    </div>

                    {/* Content */}
                    <div className="acc-form-group">
                        <label className="acc-form-label">Nội dung đánh giá <span className="acc-required">*</span></label>
                        <textarea
                            className={`acc-form-textarea${errors.content ? ' error' : ''}`}
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                            maxLength={500}
                            rows={4}
                        />
                        <div className="acc-char-counter">{content.length}/500</div>
                        {errors.content && <p className="acc-form-error">{errors.content}</p>}
                    </div>

                    {/* Sub-ratings */}
                    <div className="acc-sub-ratings">
                        <div className="acc-sub-rating-row">
                            <span>Chất lượng sản phẩm</span>
                            <StarSelector value={qualityRating} onChange={setQualityRating} size={20} />
                        </div>
                        <div className="acc-sub-rating-row">
                            <span>Độ chính xác size</span>
                            <StarSelector value={sizeRating} onChange={setSizeRating} size={20} />
                        </div>
                        <div className="acc-sub-rating-row">
                            <span>Tốc độ giao hàng</span>
                            <StarSelector value={deliveryRating} onChange={setDeliveryRating} size={20} />
                        </div>
                    </div>

                    {/* Photo upload (decorative) */}
                    <div className="acc-photo-upload-area">
                        <Image size={28} className="acc-photo-upload-icon" />
                        <div className="acc-photo-upload-text">Kéo thả hoặc nhấn để tải ảnh</div>
                        <div className="acc-photo-upload-hint">Tối đa 3 ảnh (JPG, PNG)</div>
                    </div>
                </div>

                <div className="acc-modal-footer">
                    <button className="acc-btn-ghost" onClick={onClose}>Hủy</button>
                    <button className="acc-btn-primary" onClick={handleSubmit} disabled={submitting}>
                        {submitting ? <><span className="acc-spinner" /> Đang gửi...</> : 'Gửi đánh giá'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WriteReviewModal;
