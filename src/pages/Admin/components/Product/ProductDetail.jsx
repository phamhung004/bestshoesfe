import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productAPI } from "../../../../services/api";
import "./ProductDetail.css";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getById(id);
      // Extract product from response (response.data or response)
      const productData = response?.data || response;
      setProduct(productData);
      setError(null);
    } catch (err) {
      setError("❌ Không thể tải thông tin sản phẩm");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="detail-loading">Đang tải...</div>;
  if (error) return <div className="detail-error">{error}</div>;
  if (!product)
    return <div className="detail-empty">Không tìm thấy sản phẩm</div>;

  return (
    <div className="product-detail-container">
      <div className="detail-header">
        <button onClick={() => navigate(-1)} className="btn-back">
          ← Quay lại
        </button>
        <h1>Chi tiết Sản phẩm</h1>
      </div>

      <div className="detail-content">
        <div className="detail-section">
          <div className="detail-item">
            <label>ID:</label>
            <span>{product.productId || product.id}</span>
          </div>
          <div className="detail-item">
            <label>Tên sản phẩm:</label>
            <span>{product.name}</span>
          </div>
          <div className="detail-item">
            <label>Mô tả:</label>
            <span>{product.description || "Không có mô tả"}</span>
          </div>
          <div className="detail-item">
            <label>Thương hiệu:</label>
            <span>{product.brand?.name || "N/A"}</span>
          </div>
          <div className="detail-item">
            <label>Danh mục:</label>
            <span>{product.category?.name || "N/A"}</span>
          </div>
          <div className="detail-item">
            <label>Chất liệu:</label>
            <span>{product.material?.materialName || "N/A"}</span>
          </div>
          <div className="detail-item">
            <label>Trạng thái:</label>
            <span
              className={product.status ? "status-active" : "status-inactive"}
            >
              {product.status ? "Hoạt động" : "Không hoạt động"}
            </span>
          </div>
          <div className="detail-item">
            <label>Ngày tạo:</label>
            <span>
              {product.createdAt
                ? new Date(product.createdAt).toLocaleDateString("vi-VN")
                : "N/A"}
            </span>
          </div>
          <div className="detail-item">
            <label>Cập nhật lần cuối:</label>
            <span>
              {product.updatedAt
                ? new Date(product.updatedAt).toLocaleDateString("vi-VN")
                : "N/A"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
