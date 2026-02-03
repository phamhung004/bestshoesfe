import { useState } from 'react'
import './Home.css'

// Asset URLs from Figma
const imgNavigations3Guest = "https://www.figma.com/api/mcp/asset/8b166456-c618-4122-9ae7-ee2036991ca8";
const imgUnsplash2DcYhvbHvM = "https://www.figma.com/api/mcp/asset/fd7ab765-a03f-4f19-98cf-b7f6c026c5e5";
const imgUnsplashV4BCFqVm9Gs = "https://www.figma.com/api/mcp/asset/78d8ef50-bd75-4860-b25a-38ae3bd8e2e1";
const imgUnsplashV4BCFqVm9Gs1 = "https://www.figma.com/api/mcp/asset/32da07a9-97d4-4a96-8749-d8fa9010af7b";
const imgUnsplash2DcYhvbHvM1 = "https://www.figma.com/api/mcp/asset/2932c83e-17bb-475e-a2ff-229612750434";
const imgUnsplashV4BCFqVm9Gs2 = "https://www.figma.com/api/mcp/asset/d5e21ddb-daca-4da9-acfd-d73749bfd291";
const imgRectangle56 = "https://www.figma.com/api/mcp/asset/96949b42-fadb-4b31-8cb3-736b65ea3cf2";
const imgRectangle59 = "https://www.figma.com/api/mcp/asset/c9df341e-b037-44f0-ac34-b8be2c732b2d";
const imgPexelsOlanmaEtigweuwa38562562 = "https://www.figma.com/api/mcp/asset/26c46f64-4a52-47fe-b13b-5041b230d779";
const imgRectangle49 = "https://www.figma.com/api/mcp/asset/7a6b2f1f-b897-4362-8a77-a87cbe3a8728";
const imgPexelsXiaomingTian28750002 = "https://www.figma.com/api/mcp/asset/83d2f6f0-1879-498e-a8b7-66e672bdc2db";
const imgSocialIconsWhiteInstagram = "https://www.figma.com/api/mcp/asset/5d4dbce3-061f-4115-aa03-da581e23f72a";
const imgSocialIconsWhiteDribbble = "https://www.figma.com/api/mcp/asset/2844840f-7fad-472a-8c5c-b250bcdbd8dd";
const imgSocialIconsWhiteTwitter = "https://www.figma.com/api/mcp/asset/4648a89d-b891-449f-a3a4-cb1562511b97";
const imgSocialIconsWhiteYoutube = "https://www.figma.com/api/mcp/asset/b1777dd4-b213-4ae2-9628-bd9c74591ee7";
const imgSend1 = "https://www.figma.com/api/mcp/asset/99b58e36-bcb1-4a9c-9299-abbd050e1360";
const imgSearch = "https://www.figma.com/api/mcp/asset/de765bf2-b7ac-401c-8cb6-490e9eb051b8";
const imgArrowDownCircle = "https://www.figma.com/api/mcp/asset/dd3011ab-8413-4932-bb55-7b3d3e7e19d7";
const imgDivider = "https://www.figma.com/api/mcp/asset/d91b1706-966c-41f2-8531-a31daff76dbd";
const imgLocation = "https://www.figma.com/api/mcp/asset/2a64b715-cadc-4d1d-9226-ac29303fe941";
const imgVector = "https://www.figma.com/api/mcp/asset/8bdc47a6-6f5b-47e5-8440-b7a3b00eddfb";
const imgNotification = "https://www.figma.com/api/mcp/asset/f127dc5e-ecc0-4b33-a958-16f135943902";
const imgHeart = "https://www.figma.com/api/mcp/asset/05f7e81b-4246-4389-91c1-8a210cc32e41";
const imgBag = "https://www.figma.com/api/mcp/asset/906ea896-de57-4ffd-bcbe-3393ff5ac77b";
const imgDivider1 = "https://www.figma.com/api/mcp/asset/8182e0ae-6238-4de7-b9f9-0c942e56c859";
const imgFrame2089 = "https://www.figma.com/api/mcp/asset/a9bb5e10-6f5e-4e3c-85c1-da8bb72beb09";
const imgBbcLogo = "https://www.figma.com/api/mcp/asset/fe428889-4d67-4a7d-8876-5b6a0cd247ed";
const imgBritishGqLogo = "https://www.figma.com/api/mcp/asset/9c2fbe51-61fe-4ca2-adae-a9129dee9e68";
const imgLine = "https://www.figma.com/api/mcp/asset/0d7ed141-6282-4f05-beb2-64b5b325e887";
const imgFrame2185 = "https://www.figma.com/api/mcp/asset/85271ad8-9af4-4d63-8d4b-198b7a8d1f34";
const imgEye1 = "https://www.figma.com/api/mcp/asset/aed07d6f-7ed0-4bca-8c5b-6c8a8cdc4e2d";
const imgHeart2 = "https://www.figma.com/api/mcp/asset/5aef092e-1658-4a02-b89c-62daf5f40e5d";
const imgColorSelection = "https://www.figma.com/api/mcp/asset/c1acc189-f100-4142-bae5-811ca713a2e5";
const imgLine1 = "https://www.figma.com/api/mcp/asset/d3f6a26f-e3b3-4401-bc7c-124ade605ed3";
const imgFrame = "https://www.figma.com/api/mcp/asset/281694ab-4e76-4314-93ab-41cfee7fd1c2";
const imgVector1 = "https://www.figma.com/api/mcp/asset/8a68d278-dd90-4e78-b834-e34ab00eaa80";
const imgVector2 = "https://www.figma.com/api/mcp/asset/805fa0ab-c481-47d4-a200-ab554a54ee27";
const imgVector3 = "https://www.figma.com/api/mcp/asset/a0ee5fb5-28f6-43f0-8d96-61f56065d407";
const imgVector4 = "https://www.figma.com/api/mcp/asset/cfc1df3c-404e-4110-bb67-124f519d5749";
const imgVector5 = "https://www.figma.com/api/mcp/asset/ccb22139-fd34-4cb2-95a7-0ee5f3b668f1";
const imgVector6 = "https://www.figma.com/api/mcp/asset/a9850361-45e1-4a6d-8f54-c1e451fcaad4";

// Navigation Component
function Navigation() {
  const [trendingActive, setTrendingActive] = useState('Casual Streetwear')

  const trendingItems = [
    { id: 'holographic', label: 'Holographic Neon Jacket' },
    { id: 'casual', label: 'Casual Streetwear', active: true },
    { id: '80s', label: "80's Outfit" }
  ]

  return (
    <>
      {/* Banner Top */}
      <div className="home-banner">
        <div className="home-banner-content">
          <span className="home-banner-item">About</span>
          <span className="home-banner-item">Partner</span>
          <span className="home-banner-item">Promo</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="home-navigation">
        <div className="home-nav-container">
          {/* Logo */}
          <div className="home-logo">
            <img src={imgVector} alt="Luxe Logo" />
          </div>

          {/* Search Bar */}
          <div className="home-search-container">
            <div className="home-search">
              <div className="home-search-category">
                <span>Men&apos;s</span>
                <div className="w-6 h-6">
                  <img src={imgArrowDownCircle} alt="Dropdown" className="w-full h-full" />
                </div>
              </div>
              <div className="home-search-divider" />
              <input
                type="text"
                className="home-search-input"
                placeholder="Search..."
              />
              <div className="home-search-icon">
                <img src={imgSearch} alt="Search" />
              </div>
            </div>
          </div>

          {/* Trending Searches */}
          <div className="home-trending">
            {trendingItems.map((item) => (
              <div
                key={item.id}
                className={`home-trending-item ${trendingActive === item.label ? 'active' : ''}`}
                onClick={() => setTrendingActive(item.label)}
              >
                {item.label}
              </div>
            ))}
          </div>

          {/* Ship To */}
          <div className="home-ship-to">
            <div className="home-ship-icon">
              <img src={imgLocation} alt="Location" />
            </div>
            <span className="home-ship-label">Ship to</span>
            <div className="home-ship-address">
              <span>Address</span>
              <div className="home-ship-arrow">
                <img src={imgArrowDownCircle} alt="Dropdown" />
              </div>
            </div>
          </div>

          {/* Nav Icons & Auth */}
          <div className="home-nav-icons">
            <div className="home-nav-icon-btn">
              <img src={imgNotification} alt="Notifications" />
            </div>
            <div className="home-nav-icon-btn">
              <img src={imgHeart} alt="Favorites" />
            </div>
            <div className="home-nav-icon-btn">
              <img src={imgBag} alt="Shopping Bag" />
            </div>
            <div className="home-nav-divider" />
            <div className="home-nav-auth">
              <button className="home-auth-btn outline">Sign in</button>
              <button className="home-auth-btn filled">Register</button>
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}

// Hero Component
function HeroSection() {
  return (
    <section
      className="home-hero"
      style={{ backgroundImage: `url('${imgNavigations3Guest}')` }}
    >
      <div className="home-hero-overlay">
        <h1 className="home-hero-heading">
          Explore a World of<br />Style and Comfort
        </h1>
        <p className="home-hero-text">
          Explore our handpicked selection of the latest men&apos;s fashion trends.
          From classic suits to casual essentials, we have you covered.
        </p>
        <a href="/catalog" className="home-hero-cta">SHOP NOW</a>
      </div>
    </section>
  )
}

// Partners Component
function PartnersSection() {
  const partners = [
    {
      logo: imgFrame2089,
      quote: "It was an absolute pleasure working with them. They are the best, Highly Recommended!"
    },
    {
      logo: imgBbcLogo,
      quote: "Love this! Does exactly what it is supposed to do and so far without any real issues."
    },
    {
      logo: imgBritishGqLogo,
      quote: "Thanks. I am fully satisfied and would recommend buying from them as they have made my life so much easier :)"
    }
  ]

  return (
    <section className="home-partners">
      <h2 className="home-partners-title">Our Partners</h2>
      <div className="home-partners-grid">
        {partners.map((partner, index) => (
          <div key={index} className="home-partner-card">
            <div className="home-partner-logo">
              <img src={partner.logo} alt={`Partner ${index + 1} Logo`} />
            </div>
            <p className="home-partner-quote">{partner.quote}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// Product Card Component
function ProductCard({ image, name, price, isNew = true, badgeColor = '#4b5563', isSmall = false }) {
  return (
    <div className={`home-product-card ${isSmall ? 'small' : ''}`}>
      <img src={image} alt={name} className="home-product-image" />
      <div className="home-product-info">
        <div>
          <h3 className="home-product-name">{name}</h3>
          <p className="home-product-price">{price}</p>
        </div>
        <span className="home-product-badge" style={{ color: badgeColor }}>New</span>
      </div>
      <div className="home-product-actions">
        <div className="home-product-icons">
          <div className="home-product-icon">
            <img src={imgFrame2185} alt="Add to cart" />
          </div>
          <div className="home-product-icon">
            <img src={imgEye1} alt="View details" />
          </div>
          <div className="home-product-icon">
            <img src={imgHeart2} alt="Add to favorites" />
          </div>
        </div>
        <div className="home-product-colors">
          <img src={imgColorSelection} alt="Color options" />
        </div>
      </div>
    </div>
  )
}

// Top Selling Component
function TopSellingSection() {
  return (
    <section className="home-topselling">
      <h2 className="home-topselling-title">Top Selling</h2>
      <div className="home-products-grid">
        <div className="home-products-row">
          <ProductCard
            image={imgUnsplash2DcYhvbHvM}
            name="Lounge Chair"
            price="$2900"
            badgeColor="#111827"
          />
          <ProductCard
            image={imgUnsplashV4BCFqVm9Gs}
            name="Lounge Chair"
            price="$2900"
            badgeColor="#f9fafb"
          />
          <ProductCard
            image={imgUnsplashV4BCFqVm9Gs1}
            name="Lounge Chair"
            price="$2900"
            badgeColor="#f9fafb"
          />
        </div>
        <div className="home-products-row">
          <ProductCard
            image={imgUnsplash2DcYhvbHvM1}
            name="Two Seater Sofa"
            price="$2900"
            isSmall={true}
          />
          <ProductCard
            image={imgUnsplashV4BCFqVm9Gs2}
            name="Two Seater Sofa"
            price="$2900"
            isSmall={true}
          />
        </div>
      </div>
    </section>
  )
}

// Banner Section Component
function BannerSection() {
  return (
    <section className="home-banner-section">
      <div className="home-banner-card">
        <div className="home-banner-content-wrapper">
          <h3 className="home-banner-title">Best Deal</h3>
        </div>
        <div className="home-banner-image">
          <img src={imgRectangle56} alt="Best Deal Product" />
        </div>
      </div>
      <div className="home-banner-card">
        <div className="home-banner-content-wrapper">
          <h3 className="home-banner-title">Game Console</h3>
        </div>
        <div className="home-banner-image">
          <img src={imgRectangle59} alt="Game Console Product" />
        </div>
      </div>
    </section>
  )
}

// Collections Component
function CollectionsSection() {
  return (
    <section className="home-collections">
      <h2 className="home-collections-title">Collections</h2>
      <div className="home-collections-grid">
        <div className="home-collection-item">
          <span className="home-collection-name">Her Closet</span>
          <div className="home-collection-image rotated">
            <img src={imgPexelsOlanmaEtigweuwa38562562} alt="Her Closet" />
          </div>
          <div className="home-collection-arrow">
            <img src={imgFrame} alt="Arrow" />
          </div>
        </div>
        <div className="home-collection-main">
          <span className="home-collection-name">Men&apos;s Classic</span>
          <div className="home-collection-image">
            <img src={imgRectangle49} alt="Men&apos;s Classic" />
          </div>
        </div>
        <div className="home-collection-item">
          <span className="home-collection-name">Outdoor Fashion</span>
          <div className="home-collection-image">
            <img src={imgPexelsXiaomingTian28750002} alt="Outdoor Fashion" />
          </div>
          <div className="home-collection-arrow">
            <img src={imgFrame} alt="Arrow" />
          </div>
        </div>
      </div>
    </section>
  )
}

// Trusted Partners Component
function TrustedPartnersSection() {
  const logos = [
    imgVector1,
    imgVector2,
    imgVector3,
    imgVector4,
    imgVector5,
    imgVector6
  ]

  return (
    <section className="home-trusted">
      <div className="home-trusted-header">
        <h2 className="home-trusted-title">Our Trusted Partners</h2>
        <p className="home-trusted-text">
          We just got featured in the following magazines and it has been the most incredible journey.
          We work with the best fashion magazines across the world
        </p>
      </div>
      <div className="home-trusted-logos">
        {logos.map((logo, index) => (
          <div key={index} className="home-trusted-logo-card">
            <img src={logo} alt={`Partner Logo ${index + 1}`} />
          </div>
        ))}
      </div>
    </section>
  )
}

// Footer Component
function Footer() {
  const [email, setEmail] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    alert('Thank you for subscribing!')
    setEmail('')
  }

  const companyLinks = ['Blog', 'Pricing', 'About us', 'Contact us', 'Testimonials']
  const legalLinks = ['Legal policy', 'Status policy', 'Privacy policy', 'Terms of service']

  return (
    <footer className="home-footer">
      <div className="home-footer-brand">
        <h3 className="home-footer-logo">Luxe</h3>
        <div className="home-footer-copyright">
          <p>Copyright © 2021 Luxe</p>
          <p>All rights reserved</p>
        </div>
        <div className="home-footer-social">
          <div className="home-footer-social-icon">
            <img src={imgSocialIconsWhiteInstagram} alt="Instagram" />
          </div>
          <div className="home-footer-social-icon">
            <img src={imgSocialIconsWhiteDribbble} alt="Dribbble" />
          </div>
          <div className="home-footer-social-icon">
            <img src={imgSocialIconsWhiteTwitter} alt="Twitter" />
          </div>
          <div className="home-footer-social-icon">
            <img src={imgSocialIconsWhiteYoutube} alt="YouTube" />
          </div>
        </div>
      </div>

      <div className="home-footer-links">
        <h4 className="home-footer-links-title">Company</h4>
        <div className="home-footer-links-list">
          {companyLinks.map((link, index) => (
            <a key={index} href="#" className="home-footer-link">{link}</a>
          ))}
        </div>
      </div>

      <div className="home-footer-links-group">
        <div className="home-footer-links-list">
          {legalLinks.map((link, index) => (
            <a key={index} href="#" className="home-footer-link">{link}</a>
          ))}
        </div>
      </div>

      <div className="home-footer-newsletter">
        <h4 className="home-footer-newsletter-title">Get updates</h4>
        <form className="home-footer-newsletter-form" onSubmit={handleSubmit}>
          <input
            type="email"
            className="home-footer-newsletter-input"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" className="home-footer-newsletter-btn">
            <img src={imgSend1} alt="Send" />
          </button>
        </form>
      </div>
    </footer>
  )
}

// Main Home Component
function Home() {
  return (
    <div className="home-page">
      <Navigation />
      <HeroSection />
      <PartnersSection />
      <TopSellingSection />
      <BannerSection />
      <CollectionsSection />
      <TrustedPartnersSection />
      <Footer />
    </div>
  )
}

export default Home
