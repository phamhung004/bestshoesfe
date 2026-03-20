import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Footer.css'

function Footer() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return

    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setEmail('')
      alert('Cảm ơn bạn đã đăng ký!')
    }, 1000)
  }

  const quickLinks = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Giới thiệu', href: '/#about' },
    { label: 'Sản phẩm', href: '/catalog' },
    { label: 'Khuyến mãi & Sale', href: '/#sale' },
    { label: 'Blog & Tin tức', href: '/#blog' },
    { label: 'Tuyển dụng', href: '/#career' }
  ]

  const supportLinks = [
    { label: 'Chính sách đổi trả', href: '#' },
    { label: 'Hướng dẫn chọn size', href: '#' },
    { label: 'Theo dõi đơn hàng', href: '/tra-cuu-don-hang' },
    { label: 'Câu hỏi thường gặp', href: '#' },
    { label: 'Liên hệ hỗ trợ', href: '/#contact' },
    { label: 'Chính sách bảo mật', href: '#' }
  ]

  const legalLinks = [
    { label: 'Điều khoản', href: '#' },
    { label: 'Chính sách', href: '#' },
    { label: 'Cookie', href: '#' }
  ]

  return (
    <>
      {/* Wave Divider */}
      <div className="bs-footer-wave">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 60L0 30C240 5 480 0 720 10C960 20 1200 45 1440 30L1440 60H0Z" fill="#0F172A" />
        </svg>
      </div>

      <footer className="bs-footer">
        <div className="bs-footer__inner">
          <div className="bs-footer__grid">
            {/* Column 1 — Brand */}
            <div className="bs-footer__brand-col">
              <Link to="/" className="bs-footer__logo">
                <span className="bs-footer__logo-best">BEST</span>
                <span className="bs-footer__logo-shoes">SHOES</span>
              </Link>

              <p className="bs-footer__tagline">
                Bước đi tự tin — Phong cách bền vững
              </p>

              <p className="bs-footer__desc">
                Chúng tôi mang đến những đôi giày chất lượng cao với phong cách hiện đại.
                Sản phẩm chính hãng 100%, bảo hành 12 tháng.
              </p>

              {/* Social Icons */}
              <div className="bs-footer__socials">
                {/* Facebook */}
                <a href="#" className="bs-footer__social-btn" aria-label="Facebook">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
                {/* Instagram */}
                <a href="#" className="bs-footer__social-btn" aria-label="Instagram">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>
                {/* TikTok */}
                <a href="#" className="bs-footer__social-btn" aria-label="TikTok">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78 2.84 2.84 0 0 1 .51.05V9.01a6.27 6.27 0 0 0-1 0 6.34 6.34 0 0 0 0 12.68 6.29 6.29 0 0 0 6.34-6.34V9.06a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.52-.49z" />
                  </svg>
                </a>
                {/* YouTube */}
                <a href="#" className="bs-footer__social-btn" aria-label="YouTube">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.43z" />
                    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
                  </svg>
                </a>
              </div>

              {/* Contact Info */}
              <div className="bs-footer__contact">
                <div className="bs-footer__contact-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span>081 236 216 362</span>
                </div>
                <div className="bs-footer__contact-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                  </svg>
                  <span>contact@bestshoes.com</span>
                </div>
                <div className="bs-footer__contact-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>1234 Shoe Street, Fashion City, CA 56789, USA</span>
                </div>
              </div>
            </div>

            {/* Column 2 — Quick Links */}
            <div className="bs-footer__links-col">
              <h4 className="bs-footer__heading">
                KHÁM PHÁ
                <span className="bs-footer__heading-accent" />
              </h4>
              <ul className="bs-footer__link-list">
                {quickLinks.map((link) => (
                  <li key={link.label}>
                    <Link to={link.href} className="bs-footer__link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3 — Support */}
            <div className="bs-footer__links-col">
              <h4 className="bs-footer__heading">
                HỖ TRỢ
                <span className="bs-footer__heading-accent" />
              </h4>
              <ul className="bs-footer__link-list">
                {supportLinks.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="bs-footer__link">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4 — Newsletter */}
            <div className="bs-footer__newsletter-col">
              <h4 className="bs-footer__heading">
                NHẬN ƯU ĐÃI ĐỘC QUYỀN
                <span className="bs-footer__heading-accent" />
              </h4>

              <p className="bs-footer__newsletter-text">
                Đăng ký nhận thông tin về sản phẩm mới và ưu đãi dành riêng cho thành viên.
              </p>

              <form onSubmit={handleSubmit} className="bs-footer__form">
                <input
                  type="email"
                  placeholder="Nhập email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bs-footer__input"
                  required
                />
                <button
                  type="submit"
                  className={`bs-footer__submit ${isSubmitting ? 'bs-footer__submit--loading' : ''}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="bs-footer__spinner" />
                  ) : (
                    'Đăng ký ngay →'
                  )}
                </button>
              </form>

              {/* Trust Badges */}
              <div className="bs-footer__trust">
                <div className="bs-footer__trust-item">
                  <span>🔒</span>
                  <span>Bảo mật SSL</span>
                </div>
                <span className="bs-footer__trust-divider">|</span>
                <div className="bs-footer__trust-item">
                  <span>✅</span>
                  <span>Hàng chính hãng</span>
                </div>
                <span className="bs-footer__trust-divider">|</span>
                <div className="bs-footer__trust-item">
                  <span>🚚</span>
                  <span>Freeship 500k+</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="bs-footer__bottom">
          <div className="bs-footer__bottom-inner">
            <p className="bs-footer__copyright">
              © 2026 BestShoes. Tất cả quyền được bảo lưu.
            </p>
            <div className="bs-footer__legal">
              {legalLinks.map((link, i) => (
                <span key={link.label}>
                  <a href={link.href} className="bs-footer__legal-link">{link.label}</a>
                  {i < legalLinks.length - 1 && <span className="bs-footer__legal-dot"> · </span>}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}

export default Footer
