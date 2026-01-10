import React from 'react';
import ProductDisplay from '../../components/ProductDisplay';
import ProductGallery from '../../components/ProductGallery';
import ProductDescription from '../../components/ProductDescription';
import './Purchase.css';

const Purchase = () => {
  return (
    <div className="purchase-page">
      <ProductDisplay />
      <ProductGallery />
      <ProductDescription />
    </div>
  );
};

export default Purchase;
