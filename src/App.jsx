import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Toast from "./components/Toast";
import { ToastProvider } from "./context/ToastContext";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage/HomePage";
import Catalog from "./pages/Catalog2/CatalogPage";
import Purchase from "./pages/Purchase";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import "./App.css";
import Cart from "./pages/Cart/CartPage";
import Checkout from "./pages/Checkout";
import Payment from "./pages/Payment";
import AdminRouter from "./pages/Admin/AdminRouter";
import MyAccountPage from "./pages/MyAccount";
import ProductDetailPage from "./pages/ProductDetail/ProductDetailPage";
import OrderTrackingPage from "./pages/OrderTracking/OrderTrackingPage";
import ProductManagementPage from "./pages/Admin/ProductManagement/ProductManagementPage";
import AccountManagementPage from "./pages/Admin/AccountManagement/AccountManagementPage";
import POSPage from "./pages/Admin/components/POS/POSPage";
import CheckoutPage from "./pages/Checkout";
import OrderManagement from "./pages/Admin/components/Order/OrderManagement";
import PromotionList from "./pages/Admin/components/PromotionList";
import TuVanPage from "./pages/TuVanPage";
import ChatWidget from "./components/AiChat";

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const hideChatWidget = isAdminRoute || location.pathname === '/tu-van';

  return (
    <div className="min-h-screen bg-white">
      <Toast />
      {!isAdminRoute && <Header />}
      <div className="main-container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/purchase/:productId" element={<Purchase />} />
          <Route path="/products/:productId" element={<ProductDetailPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/tra-cuu-don-hang" element={<OrderTrackingPage />} />
          <Route path="/account" element={<ProtectedRoute><MyAccountPage /></ProtectedRoute>} />
          <Route path="/admin/*" element={<ProtectedRoute requireAdmin><AdminRouter /></ProtectedRoute>} />
          <Route path="/admin/san-pham" element={<ProtectedRoute requireAdmin><ProductManagementPage /></ProtectedRoute>} />
          <Route path="/admin/tai-khoan" element={<ProtectedRoute requireAdmin><AccountManagementPage /></ProtectedRoute>} />
          <Route path="/admin/tai-quay" element={<ProtectedRoute requireAdmin><POSPage /></ProtectedRoute>} />
          <Route path="/admin/don-hang" element={<ProtectedRoute requireAdmin><OrderManagement /></ProtectedRoute>} />
          <Route path="/admin/dot-giam-gia" element={<ProtectedRoute requireAdmin><PromotionList /></ProtectedRoute>} />
          <Route path="/tu-van" element={<TuVanPage />} />

        </Routes>
      </div>
      {!isAdminRoute && <Footer />}
      {!hideChatWidget && <ChatWidget />}
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <AppContent />
          </Router>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
