import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { brandAPI } from "../../../../services/api";
import "./BrandDetail.css";

const BrandDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [brand, setBrand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBrand();
  }, [id]);

  const fetchBrand = async () => {
    try {
      setLoading(true);
      const response = await brandAPI.getById(id);
      // Extract brand from response (response.data or response)
      const brandData = response?.data || response;
      setBrand(brandData);
      setError(null);
    } catch (err) {
      setError("❌ Không thể tải thông tin thương hiệu");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="detail-loading">Đang tải...</div>;
  if (error) return <div className="detail-error">{error}</div>;
  if (!brand)
    return <div className="detail-empty">Không tìm thấy thương hiệu</div>;

  return (
    <div className="brand-detail-container">
      <div className="detail-header">
        <button onClick={() => navigate(-1)} className="btn-back">
          ← Quay lại
        </button>
        <h1>Chi tiết Thương hiệu</h1>
      </div>

      <div className="detail-content">
        <div className="detail-section">
          <div className="detail-item">
            <label>ID:</label>
            <span>{brand.brandId}</span>
          </div>
          <div className="detail-item">
            <label>Tên thương hiệu:</label>
            <span>{brand.name}</span>
          </div>
          <div className="detail-item">
            <label>Slug:</label>
            <span>{brand.slug}</span>
          </div>
          <div className="detail-item">
            <label>Mô tả:</label>
            <span>{brand.description || "Không có mô tả"}</span>
          </div>
          <div className="detail-item">
            <label>Quốc gia:</label>
            <span>{brand.originCountry}</span>
          </div>
          <div className="detail-item">
            <label>Website:</label>
            <a href={brand.website} target="_blank" rel="noopener noreferrer">
              {brand.website}
            </a>
          </div>
          <div className="detail-item">
            <label>Trạng thái:</label>
            <span
              className={brand.status ? "status-active" : "status-inactive"}
            >
              {brand.status ? "Hoạt động" : "Không hoạt động"}
            </span>
          </div>
          {brand.logo && (
            <div className="detail-item">
              <label>Logo:</label>
              <img
                src={brand.logo}
                alt={brand.name}
                className="brand-detail-logo"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrandDetail;
