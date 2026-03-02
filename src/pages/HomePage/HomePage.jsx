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
