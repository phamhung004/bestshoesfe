import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { materialAPI } from "../../../../services/api";
import "./MaterialDetail.css";

const MaterialDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMaterial();
  }, [id]);

  const fetchMaterial = async () => {
    try {
      setLoading(true);
      const response = await materialAPI.getById(id);
      const data = response?.data || response;
      setMaterial(data);
      setError(null);
    } catch (err) {
      setError("❌ Không thể tải thông tin chất liệu");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="detail-loading">Đang tải...</div>;
  if (error) return <div className="detail-error">{error}</div>;
  if (!material)
    return <div className="detail-empty">Không tìm thấy chất liệu</div>;

  return (
    <div className="material-detail-container">
      <div className="detail-header">
        <button onClick={() => navigate(-1)} className="btn-back">
          ← Quay lại
        </button>
        <h1>Chi tiết Chất liệu</h1>
      </div>

      <div className="detail-content">
        <div className="detail-section">
          <div className="detail-item">
            <label>ID:</label>
            <span>{material.materialId}</span>
          </div>
          <div className="detail-item">
            <label>Mã chất liệu:</label>
            <span>{material.materialCode}</span>
          </div>
          <div className="detail-item">
            <label>Tên chất liệu:</label>
            <span>{material.materialName}</span>
          </div>
          <div className="detail-item">
            <label>Ngày tạo:</label>
            <span>
              {material.createdAt
                ? new Date(material.createdAt).toLocaleDateString("vi-VN")
                : "N/A"}
            </span>
          </div>
          <div className="detail-item">
            <label>Ngày cập nhật:</label>
            <span>
              {material.updatedAt
                ? new Date(material.updatedAt).toLocaleDateString("vi-VN")
                : "N/A"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialDetail;
