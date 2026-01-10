import './Hero.css'

function Hero() {
  return (
    <section className="hero-section" aria-label="Hero">
      <div className="hero-frame">
        <div className="hero-left">
          <div className="hero-text-block">
            <h1 className="hero-line hero-line-1">YOUR</h1>
            <h1 className="hero-line hero-line-2">DREAM</h1>
            <h1 className="hero-line hero-line-3">SHOES</h1>
            <h1 className="hero-line hero-line-4">ARE HERE</h1>
          </div>

          <div className="hero-actions">
            <button className="cta-button">VIEW CATALOG</button>

            <div className="social-buttons" aria-hidden="false">
              <button className="social-btn" aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.5"/><path d="M12 8.25A3.75 3.75 0 1012 15.75 3.75 3.75 0 0012 8.25z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/></svg>
              </button>
              <button className="social-btn" aria-label="X">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M6 6L18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </button>
              <button className="social-btn" aria-label="YouTube">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 7.5C22 7.5 21.5 5.5 20 4.9C18.1 4.2 12 4.2 12 4.2C12 4.2 5.9 4.2 4 4.9C2.5 5.5 2 7.5 2 7.5C2 7.5 2 9.7 2 11.9V12.1C2 14.3 2 16.5 2 16.5C2 16.5 2.5 18.5 4 19.1C5.9 19.8 12 19.8 12 19.8C12 19.8 18.1 19.8 20 19.1C21.5 18.5 22 16.5 22 16.5C22 16.5 22 14.3 22 12.1V11.9C22 9.7 22 7.5 22 7.5Z" stroke="currentColor" strokeWidth="1.2"/><path d="M10 9.5L15 12L10 14.5V9.5Z" fill="currentColor"/></svg>
              </button>
            </div>
          </div>

          {/* decorative crosses */}
          <div className="decor-x decor-x-1" aria-hidden="true">+</div>
          <div className="decor-x decor-x-2" aria-hidden="true">+</div>
        </div>

        <div className="hero-right" aria-hidden="false">
          <div className="shoe-stack">
            <div className="shoe-card shoe-card-1">
              <img src="/images/feature-image-1.png" alt="Yellow shoe" />
            </div>
            <div className="shoe-card shoe-card-2">
              <img src="/images/feature-image-2.png" alt="Green shoe" />
            </div>
            <div className="shoe-card shoe-card-3">
              <img src="/images/hero-illustration.svg" alt="Brown shoe" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero

