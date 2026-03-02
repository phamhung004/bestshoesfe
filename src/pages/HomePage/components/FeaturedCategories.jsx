import { Link } from 'react-router-dom';
import { useScrollReveal } from '../hooks';
import { CategorySkeleton } from './SkeletonLoaders';

// Default gradients/icons for category display when no images are available
const CATEGORY_STYLES = [
  { gradient: 'linear-gradient(135deg, #2563EB, #312E81)', icon: '🏃', className: 'tall' },
  { gradient: 'linear-gradient(135deg, #9333EA, #EC4899)', icon: '👟', className: '' },
  { gradient: 'linear-gradient(135deg, #374151, #111827)', icon: '👞', className: '' },
  { gradient: 'linear-gradient(135deg, #FB923C, #EF4444)', icon: '🩴', className: 'wide' },
];

function CategoryCard({ name, count, gradient, icon, className, delay }) {
  const ref = useScrollReveal();
  return (
    <Link
      to={`/catalog?categoryId=${name}`}
      className={`category-card ${className} scroll-reveal`}
      ref={ref}
      style={{ transitionDelay: `${delay * 0.1}s` }}
    >
      <div className="category-card-bg" style={{ background: gradient }} />
      <div className="category-card-icon">{icon}</div>
      <div className="category-card-overlay" />
      <div className="category-card-content">
        <h3 className="category-card-name">{name}</h3>
        {count != null && <div className="category-card-count">{count} sản phẩm</div>}
        <span className="category-card-link">
          Xem ngay <span className="arrow">→</span>
        </span>
      </div>
    </Link>
  );
}

/**
 * Featured Categories — shows top categories from API data.
 * Falls back to skeleton loaders while loading.
 *
 * @param {{ categories: Array, loading: boolean }} props
 */
export default function FeaturedCategories({ categories = [], loading = false }) {
  const ref = useScrollReveal();

  // Map API categories to display cards (max 4)
  const displayCategories = categories.slice(0, 4).map((cat, i) => ({
    name: cat.categoryName || cat.name || 'Danh mục',
    count: cat.productCount ?? null,
    categoryId: cat.categoryId || cat.id,
    ...CATEGORY_STYLES[i % CATEGORY_STYLES.length],
  }));

  return (
    <section className="featured-categories">
      <div className="section-container">
        <div className="section-header scroll-reveal" ref={ref}>
          <div className="section-eyebrow">DANH MỤC</div>
          <h2 className="section-title">
            Tìm đôi giày<br />phù hợp với bạn
          </h2>
          <p className="section-subtitle">
            Từ giày thể thao đến giày công sở — chúng tôi có tất cả.
          </p>
        </div>

        {loading ? (
          <CategorySkeleton />
        ) : displayCategories.length > 0 ? (
          <div className="category-grid">
            {displayCategories.map((cat, i) => (
              <CategoryCard key={cat.categoryId || i} {...cat} delay={i} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
