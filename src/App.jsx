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

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

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
          <Route path="/account" element={<MyAccountPage />} />
          <Route path="/admin/*" element={<AdminRouter />} />
        </Routes>
      </div>
      {!isAdminRoute && <Footer />}
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <Router>
        <AppContent />
      </Router>
    </ToastProvider>
  );
}

export default App;
