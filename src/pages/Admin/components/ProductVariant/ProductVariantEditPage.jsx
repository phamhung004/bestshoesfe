import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { productVariantAPI } from "../../../../services/api";
import { useToast } from "../../../../context/useToast";

const ProductVariantEditPage = () => {
  const { variantId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    sku: "",
    price: "",
    costPrice: "",
    weight: "",
    quantity: "",
    status: true,
  });

  useEffect(() => {
    const loadVariant = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await productVariantAPI.getById(variantId);
        const wrapped = typeof response?.status === "number";
        const apiStatus = wrapped ? response.status : 0;
        const data = wrapped ? response?.data : response;
        const message = wrapped ? response?.message : null;

        if (apiStatus !== 0 || !data) {
          throw new Error(message || "Không thể tải biến thể");
        }

        setFormData({
          sku: data.sku || "",
          price: data.price ?? "",
          costPrice: data.costPrice ?? "",
          weight: data.weight ?? "",
          quantity: data.quantity ?? data.stock ?? "",
          status: data.status ?? true,
        });
      } catch (err) {
        const message = err?.response?.data?.message || err?.message || "Không thể tải biến thể";
        setError(message);
        showToast(message, "error");
      } finally {
        setLoading(false);
      }
    };

    loadVariant();
  }, [variantId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const payload = {
        sku: formData.sku?.trim(),
        price: Number(formData.price) || 0,
        costPrice: Number(formData.costPrice) || 0,
        weight: Number(formData.weight) || 0,
        quantity: Number(formData.quantity) || 0,
        status: Boolean(formData.status),
      };

      const response = await productVariantAPI.update(variantId, payload);
      const wrapped = typeof response?.status === "number";

      if (wrapped && response.status !== 0) {
        throw new Error(response?.message || "Cập nhật biến thể thất bại");
      }

      showToast("Cập nhật biến thể thành công", "success");
      navigate(-1);
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Cập nhật biến thể thất bại";
      setError(message);
      showToast(message, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: 24, textAlign: "center" }}>Đang tải dữ liệu biến thể...</div>;
  }

  return (
    <div style={{ padding: 24, background: "#F6F8FC", minHeight: "100%" }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          border: "1px solid #67e8f9",
          background: "#99FFFF",
          color: "#0f172a",
          borderRadius: 8,
          padding: "8px 12px",
          fontWeight: 600,
          cursor: "pointer",
          marginBottom: 14,
        }}
      >
        ← Quay lại
      </button>

      <div
        style={{
          maxWidth: 860,
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
          border: "1px solid #E2E8F0",
          padding: 20,
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: 16 }}>Chỉnh sửa biến thể #{variantId}</h2>

        {error ? (
          <div
            style={{
              marginBottom: 14,
              color: "#b91c1c",
              border: "1px solid #fecaca",
              background: "#fef2f2",
              borderRadius: 10,
              padding: "10px 12px",
            }}
          >
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span>SKU</span>
              <input name="sku" value={formData.sku} disabled style={disabledInputStyle} />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span>Giá bán</span>
              <input name="price" type="number" min="0" value={formData.price} onChange={handleChange} required style={inputStyle} />
            </label>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span>Giá vốn</span>
              <input name="costPrice" type="number" min="0" value={formData.costPrice} onChange={handleChange} style={inputStyle} />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span>Trọng lượng (kg)</span>
              <input name="weight" type="number" min="0" step="0.01" value={formData.weight} onChange={handleChange} style={inputStyle} />
            </label>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span>Tồn kho</span>
              <input name="quantity" type="number" min="0" value={formData.quantity} onChange={handleChange} style={inputStyle} />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span>Trạng thái</span>
              <select
                value={String(formData.status)}
                onChange={(event) => setFormData((prev) => ({ ...prev, status: event.target.value === "true" }))}
                style={inputStyle}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </label>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button type="button" onClick={() => navigate(-1)} style={secondaryBtnStyle}>
              Hủy
            </button>
            <button type="submit" disabled={saving} style={primaryBtnStyle}>
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const inputStyle = {
  border: "1px solid #CBD5E1",
  borderRadius: 10,
  padding: "10px 12px",
  fontSize: 14,
  outline: "none",
};

const disabledInputStyle = {
  ...inputStyle,
  background: "#f1f5f9",
  color: "#475569",
  cursor: "not-allowed",
};

const secondaryBtnStyle = {
  border: "1px solid #CBD5E1",
  background: "#fff",
  borderRadius: 10,
  padding: "9px 14px",
  cursor: "pointer",
};

const primaryBtnStyle = {
  border: "none",
  background: "linear-gradient(135deg, #4F46E5, #0EA5E9)",
  color: "#fff",
  borderRadius: 10,
  padding: "9px 14px",
  fontWeight: 600,
  cursor: "pointer",
};

export default ProductVariantEditPage;
