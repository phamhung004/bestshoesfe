import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { sizeAPI } from "../../../../services/api";
import "./SizeDetail.css";

const SizeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [size, setSize] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSize();
  }, [id]);

  const fetchSize = async () => {
    try {
      setLoading(true);
      const response = await sizeAPI.getById(id);
      const data = response?.data || response;
      setSize(data);
      setError(null);
    } catch (err) {
      setError("❌ Không thể tải thông tin kích cỡ");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="detail-loading">Đang tải...</div>;
  if (error) return <div className="detail-error">{error}</div>;
  if (!size) return <div className="detail-empty">Không tìm thấy kích cỡ</div>;

  return (
    <div className="size-detail-container">
      <div className="detail-header">
        <button onClick={() => navigate(-1)} className="btn-back">
          ← Quay lại
        </button>
        <h1>Chi tiết Kích cỡ</h1>
      </div>

      <div className="detail-content">
        <div className="detail-section">
          <div className="detail-item">
            <label>ID:</label>
            <span>{size.sizeId}</span>
          </div>
          <div className="detail-item">
            <label>Tên kích cỡ:</label>
            <span>{size.sizeName}</span>
          </div>
          <div className="detail-item">
            <label>Trạng thái:</label>
            <span className={size.status ? "status-active" : "status-inactive"}>
              {size.status ? "Hoạt động" : "Không hoạt động"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SizeDetail;
