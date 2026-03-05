import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productVariantAPI } from "../../../../services/api";
import { useToast } from "../../../../context/useToast";
import "../Brand/BrandForm.css";

const ProductVariantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [variant, setVariant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadVariant = async () => {
      try {
        setLoading(true);
        const response = await productVariantAPI.getById(id);
        const variantData = response?.data || response;
        setVariant(variantData);
        setError(null);
      } catch (err) {
        console.error("Error loading variant:", err);
        setError("Không thể tải thông tin biến thể");
      } finally {
        setLoading(false);
      }
    };

    loadVariant();
  }, [id]);

  if (loading) {
    return <div className="brand-list-loading">Đang tải...</div>;
  }

  if (error) {
    return (
      <div className="brand-list-error">
        <p>{error}</p>
        <button
          onClick={() => navigate("/admin/product-variants/list")}
          className="btn-primary"
        >
          Quay lại
        </button>
      </div>
    );
  }

  if (!variant) {
    return (
      <div className="brand-list-error">
        <p>Không tìm thấy biến thể</p>
        <button
          onClick={() => navigate("/admin/product-variants/list")}
          className="btn-primary"
        >
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="detail-container">
      <div className="detail-header">
        <h2>Chi tiết biến thể sản phẩm</h2>
        <button
          onClick={() => navigate("/admin/product-variants/list")}
          className="btn-secondary"
        >
          Quay lại
        </button>
      </div>

      <div className="detail-content">
        <div className="detail-section">
          <h3>Thông tin cơ bản</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <label>ID:</label>
              <span>{variant.variantId}</span>
            </div>

            <div className="detail-item">
              <label>Sản phẩm:</label>
              <span>{variant.product?.name || "N/A"}</span>
            </div>

            <div className="detail-item">
              <label>Thương hiệu:</label>
              <span>{variant.product?.brand?.name || "N/A"}</span>
            </div>

            <div className="detail-item">
              <label>Danh mục:</label>
              <span>{variant.product?.category?.name || "N/A"}</span>
            </div>

            <div className="detail-item">
              <label>Chất liệu:</label>
              <span>{variant.product?.material?.materialName || "N/A"}</span>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h3>Thông tin biến thể</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Size:</label>
              <span>{variant.size?.sizeName || "N/A"}</span>
            </div>

            <div className="detail-item">
              <label>Màu:</label>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    backgroundColor: variant.color?.colorCode || "#ccc",
                    borderRadius: "4px",
                    border: "1px solid #ddd",
                  }}
                />
                <span>{variant.color?.colorName || "N/A"}</span>
              </div>
            </div>

            <div className="detail-item">
              <label>Giá bán:</label>
              <span>{variant.price?.toLocaleString("vi-VN")} ₫</span>
            </div>

            <div className="detail-item">
              <label>Giá vốn:</label>
              <span>{variant.costPrice?.toLocaleString("vi-VN")} ₫</span>
            </div>

            <div className="detail-item">
              <label>Lợi nhuận:</label>
              <span>
                {(variant.price - variant.costPrice)?.toLocaleString("vi-VN")} ₫
                (
                {variant.costPrice > 0
                  ? (
                      ((variant.price - variant.costPrice) /
                        variant.costPrice) *
                      100
                    ).toFixed(2)
                  : 0}
                %)
              </span>
            </div>

            <div className="detail-item">
              <label>Trọng lượng:</label>
              <span>{variant.weight} kg</span>
            </div>

            <div className="detail-item">
              <label>Trạng thái:</label>
              <span
                className={`status-${variant.status ? "active" : "inactive"}`}
              >
                {variant.status ? "Hoạt động" : "Không hoạt động"}
              </span>
            </div>
          </div>
        </div>

        {variant.images && variant.images.length > 0 && (
          <div className="detail-section">
            <h3>Hình ảnh</h3>
            <div className="images-grid">
              {variant.images.map((img) => (
                <div key={img.imageId} className="image-card">
                  <img
                    src={img.imageUrl}
                    alt={img.altText}
                    style={{
                      width: "100%",
                      height: "auto",
                      borderRadius: "4px",
                    }}
                  />
                  <div className="image-info">
                    <p className="image-alt">{img.altText}</p>
                    {img.isPrimary && (
                      <span className="badge-primary">Ảnh chính</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="detail-section">
          <h3>Thời gian</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Ngày tạo:</label>
              <span>
                {variant.createdAt
                  ? new Date(variant.createdAt).toLocaleString()
                  : "N/A"}
              </span>
            </div>

            <div className="detail-item">
              <label>Cập nhật:</label>
              <span>
                {variant.updatedAt
                  ? new Date(variant.updatedAt).toLocaleString()
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .detail-container {
          padding: 20px;
          background: #f5f5f5;
          border-radius: 8px;
        }

        .detail-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .detail-content {
          background: white;
          border-radius: 8px;
          padding: 20px;
        }

        .detail-section {
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid #eee;
        }

        .detail-section:last-child {
          border-bottom: none;
        }

        .detail-section h3 {
          margin: 0 0 15px 0;
          color: #333;
          font-size: 16px;
          font-weight: 600;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
        }

        .detail-item label {
          font-weight: 600;
          color: #666;
          margin-bottom: 5px;
          font-size: 14px;
        }

        .detail-item span {
          color: #333;
          font-size: 15px;
        }

        .status-active {
          color: #27ae60;
          font-weight: 500;
        }

        .status-inactive {
          color: #e74c3c;
          font-weight: 500;
        }

        .images-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 15px;
        }

        .image-card {
          border: 1px solid #ddd;
          border-radius: 4px;
          overflow: hidden;
          background: #f9f9f9;
        }

        .image-card img {
          width: 100%;
          height: 150px;
          object-fit: cover;
        }

        .image-info {
          padding: 8px;
          font-size: 12px;
        }

        .image-alt {
          margin: 0 0 5px 0;
          color: #666;
          word-break: break-word;
        }

        .badge-primary {
          display: inline-block;
          background: #3498db;
          color: white;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 11px;
        }
      `}</style>
    </div>
  );
};

export default ProductVariantDetail;
