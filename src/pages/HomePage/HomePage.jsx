import { Link } from 'react-router-dom';
import { useHomepageData } from '../../hooks/useHomepageData';
import {
  HeroSection,
  TrustBar,
  FeaturedCategories,
  FlashSaleSection,
  BestSellersSection,
  BrandBanner,
  TestimonialsSection,
  FinalCtaBanner,
} from './components';
import './HomePage.css';

/* ═══════════════════════════════════════════════════════
   MAIN HOMEPAGE COMPONENT
   ═══════════════════════════════════════════════════════ */
function HomePage() {
  const {
    bestSellers,
    flashSaleProducts,
    categories,
    brands,
    promotions,
    sectionLoading,
  } = useHomepageData();

  return (
    <div className="homepage">
      <HeroSection />
      <TrustBar />
      <FeaturedCategories
        categories={categories}
        loading={sectionLoading.categories}
      />
      <FlashSaleSection
        products={flashSaleProducts}
        promotions={promotions}
        loading={sectionLoading.flashSale}
      />

      {/* AI Consultation CTA */}
      <div className="w-full bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <p className="text-white text-sm font-medium">
            <span className="mr-1.5">👟</span>
            Chưa biết chọn giày nào? Để AI tư vấn cho bạn!
          </p>
          <Link
            to="/tu-van"
            className="shrink-0 px-4 py-1.5 bg-white text-blue-700 text-sm font-semibold rounded-full hover:bg-blue-50 transition-colors"
          >
            Tư vấn ngay →
          </Link>
        </div>
      </div>

      <BestSellersSection
        products={bestSellers}
        brands={brands}
        loading={sectionLoading.bestSellers}
      />
      <BrandBanner
        brands={brands}
        loading={sectionLoading.brands}
      />
      <TestimonialsSection />
      <FinalCtaBanner />
    </div>
  );
}

export default HomePage;
