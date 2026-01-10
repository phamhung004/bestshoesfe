import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './ProductHeader.css';

const ProductHeader = () => {
  const [activeNav, setActiveNav] = useState('Home');
  const location = useLocation();

  React.useEffect(() => {
    if (location.pathname === '/') setActiveNav('Home');
    else if (location.pathname === '/catalog') setActiveNav('Catalog');
    else setActiveNav('Home');
  }, [location.pathname]);

  const navItems = [
    { id: 'Home', label: 'Home', href: '/' },
    { id: 'About', label: 'About', href: '/#about' },
    { id: 'Catalog', label: 'Catalog', href: '/catalog' },
    { id: 'Contact', label: 'Contact', href: '/#contact' }
  ];

  return (
    <header className="product-header">
      <div className="header-content">
        {/* Menu Button */}
        <button className="menu-button">
          <div className="hamburger">
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </div>
        </button>

        {/* Vertical Line */}
        <div className="header-line"></div>

        {/* Navigation */}
        <nav className="header-nav">
          <div className="nav-group">
            <Link
              to="/"
              className={`nav-item ${activeNav === 'Home' ? 'nav-item-active' : ''}`}
            >
              Home
            </Link>
            <Link
              to="/#about"
              className={`nav-item ${activeNav === 'About' ? 'nav-item-active' : ''}`}
            >
              About
            </Link>
          </div>

          {/* Vertical Line */}
          <div className="nav-line"></div>

          {/* Logo */}
          <div className="logo">
            WELL SHOES
          </div>

          {/* Vertical Line */}
          <div className="nav-line"></div>

          <div className="nav-group">
            <Link
              to="/catalog"
              className={`nav-item ${activeNav === 'Catalog' ? 'nav-item-active' : ''}`}
            >
              Catalog
            </Link>
            <Link
              to="/#contact"
              className={`nav-item ${activeNav === 'Contact' ? 'nav-item-active' : ''}`}
            >
              Contact
            </Link>
          </div>
        </nav>

        {/* Vertical Line */}
        <div className="header-line"></div>

        {/* Search Button */}
        <button className="search-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="11" cy="11" r="8" stroke="#2C3333" strokeWidth="2"/>
            <path d="m21 21-4.35-4.35" stroke="#2C3333" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </header>
  );
};

export default ProductHeader;
