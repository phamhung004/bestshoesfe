import React from "react";
import { Routes, Route, useParams } from "react-router-dom";
import AdminDashboard from "./index";
import AnalyticsDashboard from "./components/Analytics/AnalyticsDashboard";
import BrandDetail from "./components/Brand/BrandDetail";
import CategoryDetail from "./components/Category/CategoryDetail";
import MaterialDetail from "./components/Material/MaterialDetail";
import ProductDetail from "./components/Product/ProductDetail";
import ProductManagementPage from "./ProductManagement/ProductManagementPage";
import AccountManagementPage from "./AccountManagement/AccountManagementPage";

const AdminRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/analytics" element={<AnalyticsDashboard />} />
      <Route path="/brand/:id" element={<BrandDetail />} />
      <Route path="/category/:id" element={<CategoryDetail />} />
      <Route path="/material/:id" element={<MaterialDetail />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/products" element={<ProductManagementPage />} />
      <Route path="/tai-khoan" element={<AccountManagementPage />} />
    </Routes>
  );
};

export default AdminRouter;
