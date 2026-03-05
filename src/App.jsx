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
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import Purchase from "./pages/Purchase";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import "./App.css";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Payment from "./pages/Payment";
import AdminRouter from "./pages/Admin/AdminRouter";

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isHomePage = location.pathname === "/";

  return (
    <div className="min-h-screen bg-white">
      <Toast />
      {!isAdminRoute && !isHomePage && <Header />}
      <div className="main-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/products/:productId" element={<Purchase />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/admin/*" element={<AdminRouter />} />
        </Routes>
      </div>
      {!isAdminRoute && !isHomePage && <Footer />}
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
