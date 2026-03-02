import { useScrollReveal } from '../hooks';

const TRUST_ITEMS = [
  { icon: '🚚', title: 'Miễn phí vận chuyển', sub: 'Đơn từ 500.000 ₫' },
  { icon: '🔄', title: 'Đổi trả dễ dàng', sub: 'Trong vòng 7 ngày' },
  { icon: '✅', title: 'Hàng chính hãng 100%', sub: 'Cam kết từ thương hiệu' },
  { icon: '🛡', title: 'Bảo hành 12 tháng', sub: 'Cho tất cả sản phẩm' },
];

/**
 * Trust bar — static trust/confidence items below the hero.
 */
export default function TrustBar() {
  const ref = useScrollReveal();
  return (
    <section className="trust-bar">
      <div className="trust-bar-container scroll-reveal" ref={ref}>
        {TRUST_ITEMS.map((item, i) => (
          <div className="trust-item scroll-reveal-child" key={i}>
            <span className="trust-icon">{item.icon}</span>
            <div>
              <div className="trust-text-title">{item.title}</div>
              <div className="trust-text-sub">{item.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
