import { Link } from 'react-router-dom';
import { useScrollReveal } from '../hooks';

/**
 * Final CTA Banner — static call-to-action at the bottom of the homepage.
 */
export default function FinalCtaBanner() {
  const ref = useScrollReveal();
  return (
    <section className="final-cta">
      <div className="final-cta-glow" />
      <div className="final-cta-lines" />
      <div className="section-container">
        <div className="final-cta-content scroll-reveal" ref={ref}>
          <h2 className="final-cta-title">
            Sẵn sàng tìm đôi giày<br />hoàn hảo của bạn?
          </h2>
          <p className="final-cta-sub">
            Khám phá hơn 10,000 sản phẩm từ 50+ thương hiệu hàng đầu thế giới.
            Freeship — Đổi trả miễn phí — Chính hãng.
          </p>
          <div className="final-cta-buttons">
            <Link to="/catalog" className="final-cta-btn-primary">Mua sắm ngay →</Link>
            <Link to="/catalog?onSale=true" className="final-cta-btn-outline">Xem khuyến mãi</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
