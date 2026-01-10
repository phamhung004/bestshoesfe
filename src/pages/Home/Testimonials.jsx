import { testimonials } from './data'
import './Testimonials.css'

function Testimonials() {
  return (
    <section className="testimonials-section">
      <div className="container mx-auto px-6 py-12">
        <div className="testimonials-container">
          {/* Left Content */}
          <div className="testimonials-header">
            <h2 className="testimonials-title">
              Testimonial
            </h2>
            <p className="testimonials-intro">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas sagittis lorem erat, sed convallis risus luctus eget. Duis felis nisi, mattis vel orci at, egestas
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="testimonials-grid-wrapper">
            <div className="testimonials-grid">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="testimonial-card">
                  <div className="testimonial-header">
                    <span className="testimonial-name">
                      {testimonial.name}
                    </span>
                    <div className="testimonial-rating">
                      <span className="rating-value">
                        {testimonial.rating}
                      </span>
                      <div className="rating-stars">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 0L11.0206 6.21885L17.5595 6.21885L12.2694 10.0623L14.2901 16.2812L9 12.4377L3.70993 16.2812L5.73056 10.0623L0.440492 6.21885L6.97937 6.21885L9 0Z" fill="#2C3333"/>
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="testimonial-text">
                    {testimonial.text}
                  </p>
                </div>
              ))}
            </div>
            {/* Testimonial Illustration */}
            <div className="testimonials-illustration">
              <img 
                src="/images/testimonial-illustration.svg" 
                alt="Testimonial illustration" 
                className="testimonial-illustration-img"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Testimonials

