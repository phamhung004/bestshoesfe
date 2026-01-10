import React from 'react';
import './ProductDescription.css';

const ProductDescription = () => {
  return (
    <div className="product-description">
      <div className="description-container">
        <h2 className="description-title">Description</h2>
        <div className="description-content">
          <p className="description-text">
            Introducing our sleek and versatile White Sneakers, the ultimate fusion of style and comfort.
            Crafted with a clean, minimalist design, these sneakers are perfect for any occasion, from casual
            outings to laid-back office days. The pristine white color not only offers a timeless look but
            also pairs effortlessly with any outfit. Whether you're dressing up or down, these sneakers
            will elevate your wardrobe with their sophisticated charm. Made from high-quality materials, they
            boast a soft, breathable upper that keeps your feet cool and dry throughout the day. The cushioned
            insole provides exceptional comfort and support, while the durable outsole ensures reliable traction
            and stability. Designed with both fashion and function in mind, these sneakers are a must-have staple
            for any fashion-forward individual. Key Features Minimalist Design: Classic white color and sleek
            silhouette complement any outfit, making them a versatile addition to your wardrobe. Premium Materials:
            High-quality leather or synthetic upper for durability and a refined appearance. Breathable Comfort:
            Soft, breathable material ensures optimal airflow, keeping your feet cool and comfortable all day long.
            Cushioned Insole: Equipped with a cushioned insole for superior comfort and shock absorption, reducing foot
            fatigue. Durable Outsole: Designed with a robust rubber outsole for excellent traction and longevity,
            providing stability on various surfaces. Versatile Wear: Ideal for a range of occasions, from casual outings
            to more polished looks, effortlessly transitioning from day to night. Easy Maintenance: The white surface is
            easy to clean, allowing for a fresh and pristine look with minimal effort.
          </p>
        </div>
      </div>

      {/* Additional Images Section */}
      <div className="additional-images">
        <div className="images-row">
          <div className="additional-image">
            <div className="additional-image-placeholder"></div>
          </div>
          <div className="additional-image">
            <div className="additional-image-placeholder"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDescription;
