import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { colorAPI } from "../../../../services/api";
import "./ColorDetail.css";

const ColorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [color, setColor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchColor();
  }, [id]);

  const fetchColor = async () => {
    try {
      setLoading(true);
      const response = await colorAPI.getById(id);
      const data = response?.data || response;
      setColor(data);
      setError(null);
    } catch (err) {
      setError("❌ Không thể tải thông tin màu sắc");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatColorCode = (code) => {
    if (!code) return "";
    const trimmed = String(code).trim();
    if (trimmed.startsWith("#")) return trimmed;
    return `#${trimmed}`;
  };

  if (loading) return <div className="detail-loading">Đang tải...</div>;
  if (error) return <div className="detail-error">{error}</div>;
  if (!color) return <div className="detail-empty">Không tìm thấy màu sắc</div>;

  return (
    <div className="color-detail-container">
      <div className="detail-header">
        <button onClick={() => navigate(-1)} className="btn-back">
          ← Quay lại
        </button>
        <h1>Chi tiết Màu sắc</h1>
      </div>

      <div className="detail-content">
        <div className="detail-section">
          <div className="detail-item">
            <label>ID:</label>
            <span>{color.colorId}</span>
          </div>
          <div className="detail-item">
            <label>Tên màu:</label>
            <span>{color.colorName}</span>
          </div>
          <div className="detail-item">
            <label>Mã màu:</label>
            <span>{formatColorCode(color.colorCode)}</span>
          </div>
          <div className="detail-item">
            <label>Xem trước:</label>
            <div
              style={{
                width: "100px",
                height: "80px",
                backgroundColor: formatColorCode(color.colorCode),
                border: "1px solid #d1d5db",
                borderRadius: "6px",
              }}
            />
          </div>
          <div className="detail-item">
            <label>Trạng thái:</label>
            <span
              className={color.status ? "status-active" : "status-inactive"}
            >
              {color.status ? "Hoạt động" : "Không hoạt động"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorDetail;
