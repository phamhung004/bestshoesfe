import { useState } from 'react'
import './Footer.css'

function Footer() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return
    
    setIsSubmitting(true)
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setEmail('')
      alert('Thank you for subscribing!')
    }, 1000)
  }

  const footerLinks = [
    { label: 'About Us', href: '#about' },
    { label: 'Catalog', href: '#catalog' },
    { label: 'Sale', href: '#sale' },
    { label: 'Preview', href: '#preview' },
    { label: 'Career', href: '#career' },
    { label: 'Blog', href: '#blog' }
  ]

  const legalLinks = [
    { label: 'Terms', href: '#terms' },
    { label: 'Privacy', href: '#privacy' },
    { label: 'Cookies', href: '#cookies' }
  ]

  return (
    <footer className="footer">
      <div className="container mx-auto px-6 py-12">
        <div className="footer-grid">
          {/* Left Column - Company Info */}
          <div className="footer-company">
            <div className="footer-brand">
              <h3 className="footer-logo">
                BEST SHOES
              </h3>
              <p className="footer-description">
                BEST Shoes offers top-quality footwear with a focus on comfort and style. From casual sneakers to formal shoes, our diverse collection meets high standards of design and durability. Discover the perfect pair with Well Shoes.
              </p>
            </div>

            {/* Contact Info */}
            <div className="footer-contact">
              <a 
                href="tel:081236216362" 
                className="contact-item group"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3.5 2C3.5 1.17 4.17 0.5 5 0.5H6.5C7.33 0.5 8 1.17 8 2V2.5C8 4.43 6.43 6 4.5 6H4C3.17 6 2.5 6.67 2.5 7.5V9C2.5 9.83 3.17 10.5 4 10.5H5.5C6.33 10.5 7 11.17 7 12V13.5C7 14.33 7.67 15 8.5 15H10C10.83 15 11.5 14.33 11.5 13.5V12.5C11.5 8.91 8.59 6 5 6V5.5C8.59 5 11.5 2.09 11.5 -1.5V-3C11.5 -3.83 10.83 -4.5 10 -4.5H8.5C7.67 -4.5 7 -3.83 7 -3V-1.5C7 0.71 5.21 2.5 3 2.5H2.5C1.67 2.5 1 3.17 1 4V5.5C1 6.33 1.67 7 2.5 7H4C4.83 7 5.5 7.67 5.5 8.5V10C5.5 10.83 6.17 11.5 7 11.5H8.5C9.33 11.5 10 10.83 10 10V9C10 5.41 7.09 2.5 3.5 2.5V2C7.09 2 10 -0.91 10 -4.5V-6C10 -6.83 9.33 -7.5 8.5 -7.5H7C6.17 -7.5 5.5 -6.83 5.5 -6V-4.5C5.5 -2.29 3.71 -0.5 1.5 -0.5H1C0.17 -0.5 -0.5 0.17 -0.5 1V2.5C-0.5 3.33 0.17 4 1 4H2.5C3.33 4 4 4.67 4 5.5V7C4 7.83 4.67 8.5 5.5 8.5H7C7.83 8.5 8.5 7.83 8.5 7V6C8.5 2.41 5.59 -0.5 2 -0.5V-1C5.59 -1 8.5 -3.91 8.5 -7.5V-9C8.5 -9.83 7.83 -10.5 7 -10.5H5.5C4.67 -10.5 4 -9.83 4 -9V-7.5C4 -5.29 2.21 -3.5 0 -3.5H-0.5C-1.33 -3.5 -2 -2.83 -2 -2V-0.5C-2 0.33 -1.33 1 -0.5 1H1C1.83 1 2.5 1.67 2.5 2.5V4C2.5 4.83 3.17 5.5 4 5.5H5.5C6.33 5.5 7 4.83 7 4V3C7 -0.59 4.09 -3.5 0.5 -3.5V-4C4.09 -4 7 -6.91 7 -10.5V-12C7 -12.83 6.33 -13.5 5.5 -13.5H4C3.17 -13.5 2.5 -12.83 2.5 -12V-10.5C2.5 -8.29 0.71 -6.5 -1.5 -6.5H-2C-2.83 -6.5 -3.5 -5.83 -3.5 -5V-3.5C-3.5 -2.67 -2.83 -2 -2 -2H-0.5C0.33 -2 1 -1.33 1 -0.5V1C1 1.83 1.67 2.5 2.5 2.5H4Z" fill="currentColor"/>
                </svg>
                <span>081236216362</span>
                <div className="contact-underline"></div>
              </a>
              
              <a 
                href="mailto:contact@wellshoes.gom" 
                className="contact-item group"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.58 1.5H16.5V14.95H1.58V1.5Z" fill="currentColor"/>
                  <path d="M1.5 3L9 9L16.5 3" stroke="currentColor" strokeWidth="2"/>
                  <path d="M1.5 5.25H16.5" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <span>contact@bestshoes.gom</span>
                <div className="contact-underline"></div>
              </a>
              
              <div className="contact-item contact-address">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 2H20V22H4V2Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M2 8H22" stroke="currentColor" strokeWidth="2"/>
                  <path d="M9 7H15" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <span>
                  BEST Shoes Headquarters<br/>
                  1234 Shoe Street, Fashion City, CA 56789, USA
                </span>
              </div>
              
              <div className="footer-legal">
                {legalLinks.map((link, index) => (
                  <a 
                    key={index}
                    href={link.href} 
                    className="legal-link"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Middle Column - Links */}
          <div className="footer-links">
            {footerLinks.map((link, index) => (
              <a 
                key={index}
                href={link.href} 
                className="footer-link"
              >
                <span className="footer-link-text">{link.label}</span>
                <div className="footer-link-underline"></div>
              </a>
            ))}
          </div>

          {/* Right Column - Newsletter */}
          <div className="footer-newsletter">
            <div className="newsletter-box">
              <p className="newsletter-title">
                Get information and updates on wellshoes by entering your email.
              </p>
              <form onSubmit={handleSubmit} className="newsletter-form">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="newsletter-input"
                  required
                />
                <button 
                  type="submit"
                  className={`newsletter-button ${isSubmitting ? 'newsletter-button-loading' : ''}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="newsletter-spinner"></div>
                  ) : (
                    <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path 
                        d="M3.5 10.5L17.5 10.5M10.5 3.5L17.5 10.5L10.5 17.5" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="footer-copyright">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-center gap-2">
            <p className="copyright-text">
              © Shoes E-Commerce. All rights reserved
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

