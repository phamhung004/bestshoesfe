import Header from './components/Header'
import Footer from './components/Footer'
import Catalog from './pages/Catalog'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Catalog />
      <Footer />
    </div>
  )
}

export default App
