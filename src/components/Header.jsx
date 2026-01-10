import { useState, useEffect } from 'react'
import './Header.css'

function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeNav, setActiveNav] = useState('Home')

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { id: 'Home', label: 'Home', href: '#' },
    { id: 'About', label: 'About', href: '#about' },
    { id: 'Catalog', label: 'Catalog', href: '#catalog' },
    { id: 'Contact', label: 'Contact', href: '#contact' }
  ]

  return (
    <header className={`header ${isScrolled ? 'header-scrolled' : ''}`}>
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* Menu Button */}
          <button 
            className="menu-button group"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <div className="menu-icon">
              <span className={`menu-line ${isMenuOpen ? 'menu-line-1-open' : ''}`}></span>
              <span className={`menu-line ${isMenuOpen ? 'menu-line-2-open' : ''}`}></span>
              <span className={`menu-line ${isMenuOpen ? 'menu-line-3-open' : ''}`}></span>
            </div>
          </button>

          {/* Vertical Line */}
          <div className="header-divider"></div>

          {/* Navigation Items */}
          <nav className="flex items-center gap-6 flex-1 justify-center">
            {navItems.map((item, index) => {
              if (item.id === 'About') {
                return (
                  <div key={item.id} className="flex items-center gap-6">
                    <a
                      href={item.href}
                      className={`nav-link ${activeNav === item.id ? 'nav-link-active' : ''}`}
                      onClick={() => setActiveNav(item.id)}
                    >
                      {item.label}
                    </a>
                    <div className="nav-divider"></div>
                    <h1 className="logo-text">
                      BESTSHOES
                    </h1>
                    <div className="nav-divider"></div>
                  </div>
                )
              }
              return (
                <a
                  key={item.id}
                  href={item.href}
                  className={`nav-link ${activeNav === item.id ? 'nav-link-active' : ''}`}
                  onClick={() => setActiveNav(item.id)}
                >
                  {item.label}
                </a>
              )
            })}
          </nav>

          {/* Vertical Line */}
          <div className="header-divider"></div>

          {/* Search Button */}
          <button 
            className="search-button group"
            aria-label="Search"
          >
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="search-icon"
            >
              <circle 
                cx="11" 
                cy="11" 
                r="8" 
                stroke="currentColor" 
                strokeWidth="2"
                className="search-circle"
              />
              <path 
                d="m21 21-4.35-4.35" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round"
                className="search-path"
              />
            </svg>
            <span className="search-ripple"></span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="mobile-menu-overlay"
          onClick={() => setIsMenuOpen(false)}
        >
          <div 
            className="mobile-menu-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mobile-menu-header">
              <h2 className="mobile-menu-title">BEST SHOES</h2>
              <button 
                className="mobile-menu-close"
                onClick={() => setIsMenuOpen(false)}
              >
                ×
              </button>
            </div>
            <nav className="mobile-menu-nav">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  className={`mobile-nav-link ${activeNav === item.id ? 'mobile-nav-link-active' : ''}`}
                  onClick={() => {
                    setActiveNav(item.id)
                    setIsMenuOpen(false)
                  }}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header

