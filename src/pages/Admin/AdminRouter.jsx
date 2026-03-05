import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminDashboard from "./index";
import AnalyticsDashboard from "./components/Analytics/AnalyticsDashboard";
import BrandDetail from "./components/Brand/BrandDetail";
import CategoryDetail from "./components/Category/CategoryDetail";
import MaterialDetail from "./components/Material/MaterialDetail";
import SizeDetail from "./components/Size/SizeDetail";
import ColorDetail from "./components/Color/ColorDetail";

const AdminRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
<<<<<<< Updated upstream
      <Route path="/analytics" element={<AnalyticsDashboard />} />
      <Route path="/brand/:id" element={<BrandDetail />} />
      <Route path="/category/:id" element={<CategoryDetail />} />
      <Route path="/material/:id" element={<MaterialDetail />} />
      <Route path="/product/:id" element={<ProductDetail />} />
=======

      <Route path="/products" element={<Navigate to="/admin/products/list" replace />} />
      <Route path="/products/list" element={<AdminDashboard />} />
      <Route path="/products/add" element={<AdminDashboard />} />
      <Route path="/products/edit/:productId" element={<AdminDashboard />} />
      <Route path="/products/detail/:id" element={<AdminDashboard />} />

      <Route path="/product-variants/:variantId/edit" element={<AdminDashboard />} />

      <Route path="/brands" element={<Navigate to="/admin/brands/list" replace />} />
      <Route path="/brands/list" element={<AdminDashboard />} />
      <Route path="/brands/detail/:id" element={<BrandDetail />} />

      <Route path="/categories" element={<Navigate to="/admin/categories/list" replace />} />
      <Route path="/categories/list" element={<AdminDashboard />} />
      <Route path="/categories/detail/:id" element={<CategoryDetail />} />

      <Route path="/materials" element={<Navigate to="/admin/materials/list" replace />} />
      <Route path="/materials/list" element={<AdminDashboard />} />
      <Route path="/materials/detail/:id" element={<MaterialDetail />} />

      <Route path="/colors" element={<Navigate to="/admin/colors/list" replace />} />
      <Route path="/colors/list" element={<AdminDashboard />} />
      <Route path="/colors/detail/:id" element={<ColorDetail />} />

      <Route path="/sizes" element={<Navigate to="/admin/sizes/list" replace />} />
      <Route path="/sizes/list" element={<AdminDashboard />} />
      <Route path="/sizes/detail/:id" element={<SizeDetail />} />
>>>>>>> Stashed changes
    </Routes>
  );
};

export default AdminRouter;
