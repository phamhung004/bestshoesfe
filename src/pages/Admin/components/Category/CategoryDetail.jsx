import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { categoryAPI } from "../../../../services/api";
import "./CategoryDetail.css";

const CategoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategory();
  }, [id]);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      const response = await categoryAPI.getById(id);
      const data = response?.data || response;
      setCategory(data);
      setError(null);
    } catch (err) {
      setError("❌ Không thể tải thông tin danh mục");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="detail-loading">Đang tải...</div>;
  if (error) return <div className="detail-error">{error}</div>;
  if (!category)
    return <div className="detail-empty">Không tìm thấy danh mục</div>;

  return (
    <div className="category-detail-container">
      <div className="detail-header">
        <button onClick={() => navigate(-1)} className="btn-back">
          ← Quay lại
        </button>
        <h1>Chi tiết Danh mục</h1>
      </div>

      <div className="detail-content">
        <div className="detail-section">
          <div className="detail-item">
            <label>ID:</label>
            <span>{category.categoryId}</span>
          </div>
          <div className="detail-item">
            <label>Tên danh mục:</label>
            <span>{category.name}</span>
          </div>
          <div className="detail-item">
            <label>Mô tả:</label>
            <span>{category.description || "Không có mô tả"}</span>
          </div>
          <div className="detail-item">
            <label>Trạng thái:</label>
            <span
              className={category.status ? "status-active" : "status-inactive"}
            >
              {category.status ? "Hoạt động" : "Không hoạt động"}
            </span>
          </div>
          {category.image && (
            <div className="detail-item">
              <label>Hình ảnh:</label>
              <img
                src={category.image}
                alt={category.name}
                className="category-detail-image"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryDetail;
