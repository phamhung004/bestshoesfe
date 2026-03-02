import { useState, useEffect, useRef } from 'react';
import { useScrollReveal } from '../hooks';

const TESTIMONIALS = [
  { name: 'Nguyễn Văn Minh', initial: 'M', stars: 5, product: 'Nike Pegasus 40', text: 'Giày chất lượng tuyệt vời, đúng size, giao hàng nhanh. Mình đã mua lần thứ 3 rồi và lần nào cũng hài lòng. Highly recommend BestShoes!' },
  { name: 'Trần Thị Lan', initial: 'L', stars: 5, product: 'Adidas Stan Smith', text: 'Ban đầu mình hơi lo về size nhưng có hướng dẫn chọn size rất chi tiết. Đôi giày đẹp hơn ngoài mong đợi, da thật mềm và thoải mái.' },
  { name: 'Lê Hoàng Nam', initial: 'N', stars: 4, product: 'Vans Old Skool', text: 'Mua online mà được đổi trả free trong 7 ngày nên rất yên tâm. Sản phẩm đúng như mô tả, đóng gói cẩn thận. Sẽ tiếp tục ủng hộ shop!' },
  { name: 'Phạm Thu Hà', initial: 'H', stars: 5, product: 'Converse Chuck Taylor', text: 'Flash sale giảm 40% mà hàng vẫn xịn. Nhân viên tư vấn nhiệt tình, ship siêu nhanh chỉ 1 ngày. Tuyệt vời!' },
  { name: 'Hoàng Đức Anh', initial: 'A', stars: 5, product: 'Nike Air Max 270', text: 'Giày thể thao chạy bộ êm chân, đúng chất lượng Nike chính hãng. Giá ở đây tốt hơn nhiều so với cửa hàng.' },
  { name: 'Ngô Thị Bảo Châu', initial: 'C', stars: 4, product: "Biti's Hunter X", text: 'Giao diện web dễ dùng, thanh toán nhanh. Đôi dép da đẹp y hình, sẽ giới thiệu cho bạn bè cùng mua!' },
];

const renderStars = (n) => {
  let s = '';
  for (let i = 0; i < 5; i++) s += i < n ? '★' : '☆';
  return s;
};

/**
 * Testimonials Section — hardcoded reviews with auto-sliding carousel.
 */
export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0);
  const [isDesktop, setIsDesktop] = useState(true);
  const autoRef = useRef(null);

  const cardsPerView = isDesktop ? 3 : 1;
  const maxIndex = Math.ceil(TESTIMONIALS.length / cardsPerView) - 1;

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Auto slide
  useEffect(() => {
    autoRef.current = setInterval(() => {
      setCurrent(prev => (prev >= maxIndex ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(autoRef.current);
  }, [maxIndex]);

  const goTo = (idx) => {
    setCurrent(idx);
    clearInterval(autoRef.current);
    autoRef.current = setInterval(() => {
      setCurrent(prev => (prev >= maxIndex ? 0 : prev + 1));
    }, 4000);
  };

  const ref = useScrollReveal();

  return (
    <section className="testimonials-section">
      <div className="section-container">
        <div className="section-header scroll-reveal" ref={ref}>
          <div className="section-eyebrow">KHÁCH HÀNG NÓI GÌ</div>
          <h2 className="section-title">
            Hơn 10,000 khách hàng<br />
            <span style={{ color: 'var(--hp-primary)' }}>hài lòng với BestShoes</span>
          </h2>
        </div>

        <div className="testimonials-rating-summary">
          <div className="testimonials-big-rating">4.9</div>
          <div className="testimonials-stars-row">★★★★★</div>
          <div className="testimonials-count">Dựa trên 10,842 đánh giá</div>
        </div>

        <div className="testimonial-carousel">
          <div
            className="testimonial-track"
            style={{ transform: `translateX(-${current * (100 / (isDesktop ? 1 : 1))}%)` }}
          >
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="testimonial-card scroll-reveal-child">
                <div className="testimonial-stars">{renderStars(t.stars)}</div>
                <div className="testimonial-quote-mark">"</div>
                <p className="testimonial-text">{t.text}</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.initial}</div>
                  <div>
                    <div className="testimonial-author-name">{t.name}</div>
                    <div className="testimonial-author-meta">
                      Đã mua: {t.product} &nbsp;
                      <span className="testimonial-verified">✓ Đã xác minh</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="testimonial-dots">
          {Array.from({ length: maxIndex + 1 }, (_, i) => (
            <button
              key={i}
              className={`testimonial-dot ${current === i ? 'active' : ''}`}
              onClick={() => goTo(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
