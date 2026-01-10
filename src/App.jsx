import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import Purchase from './pages/Purchase'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import './App.css'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/purchase" element={<Purchase />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<Cart/>} />
        </Routes>
        <Footer />
      </div>
    </Router>
  )
}

export default App
