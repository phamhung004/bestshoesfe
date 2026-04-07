import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import './Header.css'

function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMiniCartOpen, setIsMiniCartOpen] = useState(false)
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false)
  const [catalogAccordionOpen, setCatalogAccordionOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuth()
  const { cartItems: ctxCartItems, totalItems: cartCount, totalAmount: cartSubtotal } = useCart()
  const { wishlistIds } = useWishlist()
  const wishlistCount = wishlistIds.size
  const searchInputRef = useRef(null)
  const miniCartRef = useRef(null)
  const megaMenuTimeoutRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mini cart on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (miniCartRef.current && !miniCartRef.current.contains(e.target)) {
        setIsMiniCartOpen(false)
      }
    }
    if (isMiniCartOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMiniCartOpen])

  // Close search on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false)
        setIsMiniCartOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Auto-focus search input
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isSearchOpen])

  // Lock body scroll when drawer open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isMenuOpen])

  const navItems = [
    { id: 'Home', label: 'Trang chủ', href: '/' },
    { id: 'About', label: 'Giới thiệu', href: '/#about' },
    { id: 'Catalog', label: 'Sản phẩm', href: '/catalog' },
    { id: 'Sale', label: 'Khuyến mãi', href: '/#sale' },
    { id: 'AiChat', label: '✨ Tư vấn AI', href: '/tu-van' },
    { id: 'Contact', label: 'Liên hệ', href: '/#contact' }
  ]

  const megaMenuCategories = [
    { icon: '🏃', label: 'Giày chạy bộ', href: '/catalog?cat=running' },
    { icon: '⭐', label: 'Sneaker', href: '/catalog?cat=sneaker' },
    { icon: '💼', label: 'Giày da công sở', href: '/catalog?cat=formal' },
    { icon: '🩴', label: 'Dép & Sandal', href: '/catalog?cat=sandal' }
  ]

  const megaMenuBrands = [
    { name: 'Nike', href: '/catalog?brand=nike' },
    { name: 'Adidas', href: '/catalog?brand=adidas' },
    { name: 'New Balance', href: '/catalog?brand=nb' },
    { name: "Biti's Hunter", href: '/catalog?brand=bitis' }
  ]

  const getActiveNav = () => {
    if (location.pathname === '/catalog') return 'Catalog'
    if (location.pathname === '/') return 'Home'
    return ''
  }

  const activeNav = getActiveNav()

  const handleMegaMenuEnter = () => {
    clearTimeout(megaMenuTimeoutRef.current)
    setIsMegaMenuOpen(true)
  }

  const handleMegaMenuLeave = () => {
    megaMenuTimeoutRef.current = setTimeout(() => {
      setIsMegaMenuOpen(false)
    }, 150)
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  return (
    <>
      <header className={`bs-header ${isScrolled ? 'bs-header--scrolled' : ''}`}>
        <div className="bs-header__inner">
          {/* Mobile hamburger */}
          <button
            className="bs-header__hamburger"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`bs-hamburger__line ${isMenuOpen ? 'bs-hamburger__line--top' : ''}`} />
            <span className={`bs-hamburger__line ${isMenuOpen ? 'bs-hamburger__line--mid' : ''}`} />
            <span className={`bs-hamburger__line ${isMenuOpen ? 'bs-hamburger__line--bot' : ''}`} />
          </button>

          {/* Logo */}
          <Link to="/" className="bs-header__logo">
            <span className="bs-logo__best">BEST</span>
            <span className="bs-logo__shoes">SHOES</span>
          </Link>

          {/* Desktop navigation */}
          <nav className="bs-header__nav">
            {navItems.map((item) => (
              <div
                key={item.id}
                className="bs-nav__item-wrapper"
                onMouseEnter={item.id === 'Catalog' ? handleMegaMenuEnter : undefined}
                onMouseLeave={item.id === 'Catalog' ? handleMegaMenuLeave : undefined}
              >
                <Link
                  to={item.href}
                  className={`bs-nav__link ${activeNav === item.id ? 'bs-nav__link--active' : ''}`}
                >
                  {item.label}
                  {item.id === 'Catalog' && (
                    <svg className="bs-nav__chevron" width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </Link>

                {/* Mega Menu */}
                {item.id === 'Catalog' && (
                  <div className={`bs-megamenu ${isMegaMenuOpen ? 'bs-megamenu--open' : ''}`}>
                    <div className="bs-megamenu__content">
                      <div className="bs-megamenu__col">
                        <h4 className="bs-megamenu__heading">Danh mục</h4>
                        <ul className="bs-megamenu__list">
                          {megaMenuCategories.map((cat) => (
                            <li key={cat.label}>
                              <Link to={cat.href} className="bs-megamenu__link">
                                <span className="bs-megamenu__icon">{cat.icon}</span>
                                {cat.label}
                              </Link>
                            </li>
                          ))}
                          <li>
                            <Link to="/catalog" className="bs-megamenu__link bs-megamenu__link--all">
                              Xem tất cả →
                            </Link>
                          </li>
                        </ul>
                      </div>
                      <div className="bs-megamenu__col">
                        <h4 className="bs-megamenu__heading">Thương hiệu nổi bật</h4>
                        <ul className="bs-megamenu__list">
                          {megaMenuBrands.map((brand) => (
                            <li key={brand.name}>
                              <Link to={brand.href} className="bs-megamenu__link">
                                <span className="bs-megamenu__brand-dot" />
                                {brand.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="bs-megamenu__banner">
                      <span>🔥 Sale cuối tuần — Giảm đến 40%</span>
                      <Link to="/catalog?sale=true" className="bs-megamenu__banner-link">Xem ngay →</Link>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right actions */}
          <div className="bs-header__actions">
            {/* Search */}
            <div className={`bs-search ${isSearchOpen ? 'bs-search--open' : ''}`}>
              <input
                ref={searchInputRef}
                type="text"
                className="bs-search__input"
                placeholder="Tìm kiếm sản phẩm..."
              />
              <button
                className="bs-search__clear"
                onClick={() => setIsSearchOpen(false)}
                aria-label="Close search"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <button
              className="bs-header__icon-btn bs-header__search-btn"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label="Search"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </button>

            {/* Wishlist */}
            <button
              className="bs-header__icon-btn bs-header__wishlist-btn"
              aria-label="Wishlist"
              onClick={() => navigate('/account#wishlist')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {wishlistCount > 0 && (
                <span className="bs-header__badge bs-header__badge--red">{wishlistCount}</span>
              )}
            </button>

            {/* Auth */}
            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Link to="/account" className="bs-header__icon-btn" title={user?.fullName} style={{ fontSize: '13px', fontWeight: 600 }}>
                  {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                </Link>
                <button
                  className="bs-header__icon-btn"
                  onClick={() => { logout(); navigate('/'); }}
                  style={{ fontSize: '12px' }}
                  title="Đăng xuất"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </button>
              </div>
            ) : (
              <Link to="/login" className="bs-header__icon-btn" title="Đăng nhập">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </Link>
            )}

            {/* Cart */}
            <div className="bs-header__cart-wrapper" ref={miniCartRef}>
              <button
                className="bs-header__icon-btn bs-header__cart-btn"
                onClick={() => setIsMiniCartOpen(!isMiniCartOpen)}
                aria-label="Cart"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                {cartCount > 0 && (
                  <span className="bs-header__badge bs-header__badge--indigo">{cartCount}</span>
                )}
              </button>

              {/* Mini Cart Dropdown */}
              <div className={`bs-minicart ${isMiniCartOpen ? 'bs-minicart--open' : ''}`}>
                <div className="bs-minicart__header">
                  <h4>Giỏ hàng ({cartCount})</h4>
                </div>
                {ctxCartItems.length === 0 ? (
                  <div className="bs-minicart__empty">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                    <p>Giỏ hàng trống</p>
                  </div>
                ) : (
                  <>
                    <div className="bs-minicart__items">
                      {ctxCartItems.slice(0, 5).map((item) => (
                        <div key={item.cart_item_id} className="bs-minicart__item">
                          <img src={item.image_url || 'https://placehold.co/80x80/FAFAFA/111111?text=Shoe'} alt={item.product?.name} className="bs-minicart__item-img" />
                          <div className="bs-minicart__item-info">
                            <p className="bs-minicart__item-name">{item.product?.name}</p>
                            <p className="bs-minicart__item-meta">SL: {item.quantity}</p>
                            <div className="bs-minicart__item-row">
                              <span className="bs-minicart__item-price">{formatPrice(item.variant?.price)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="bs-minicart__footer">
                      <div className="bs-minicart__subtotal">
                        <span>Tạm tính</span>
                        <span className="bs-minicart__subtotal-price">{formatPrice(cartSubtotal)}</span>
                      </div>
                      <Link to="/cart" className="bs-minicart__btn bs-minicart__btn--outline" onClick={() => setIsMiniCartOpen(false)}>
                        Xem giỏ hàng
                      </Link>
                      <Link to="/checkout" className="bs-minicart__btn bs-minicart__btn--primary" onClick={() => setIsMiniCartOpen(false)}>
                        Thanh toán
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div className={`bs-drawer-overlay ${isMenuOpen ? 'bs-drawer-overlay--open' : ''}`} onClick={() => setIsMenuOpen(false)} />
      <aside className={`bs-drawer ${isMenuOpen ? 'bs-drawer--open' : ''}`}>
        <div className="bs-drawer__header">
          <Link to="/" className="bs-drawer__logo" onClick={() => setIsMenuOpen(false)}>
            <span className="bs-logo__best">BEST</span>
            <span className="bs-logo__shoes">SHOES</span>
          </Link>
          <button className="bs-drawer__close" onClick={() => setIsMenuOpen(false)} aria-label="Close menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav className="bs-drawer__nav">
          {navItems.map((item) => (
            <div key={item.id}>
              {item.id === 'Catalog' ? (
                <>
                  <button
                    className={`bs-drawer__link ${activeNav === item.id ? 'bs-drawer__link--active' : ''}`}
                    onClick={() => setCatalogAccordionOpen(!catalogAccordionOpen)}
                  >
                    <span>{item.label}</span>
                    <svg className={`bs-drawer__chevron ${catalogAccordionOpen ? 'bs-drawer__chevron--open' : ''}`} width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <div className={`bs-drawer__accordion ${catalogAccordionOpen ? 'bs-drawer__accordion--open' : ''}`}>
                    {megaMenuCategories.map((cat) => (
                      <Link
                        key={cat.label}
                        to={cat.href}
                        className="bs-drawer__sublink"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <span className="bs-drawer__subicon">{cat.icon}</span>
                        {cat.label}
                      </Link>
                    ))}
                    <Link to="/catalog" className="bs-drawer__sublink bs-drawer__sublink--all" onClick={() => setIsMenuOpen(false)}>
                      Xem tất cả →
                    </Link>
                  </div>
                </>
              ) : (
                <Link
                  to={item.href}
                  className={`bs-drawer__link ${activeNav === item.id ? 'bs-drawer__link--active' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span>{item.label}</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              )}
            </div>
          ))}
        </nav>

        <div className="bs-drawer__divider" />

        <div className="bs-drawer__bottom">
          <div className="bs-drawer__search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input type="text" placeholder="Tìm kiếm..." className="bs-drawer__search-input" />
          </div>
          <div className="bs-drawer__icons">
            <button className="bs-drawer__icon-btn" aria-label="Wishlist" onClick={() => { setIsMenuOpen(false); navigate('/account#wishlist'); }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {wishlistCount > 0 && <span className="bs-drawer__badge">{wishlistCount}</span>}
            </button>
            <button className="bs-drawer__icon-btn" aria-label="Cart">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {cartCount > 0 && <span className="bs-drawer__badge bs-drawer__badge--indigo">{cartCount}</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Header
