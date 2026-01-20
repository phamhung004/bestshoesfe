import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProductDisplay from '../../components/ProductDisplay';
import ProductGallery from '../../components/ProductGallery';
import ProductDescription from '../../components/ProductDescription';
import { productVariantAPI, productImageAPI } from '../../services/api';
import './Purchase.css';

const Purchase = () => {
  const { productId } = useParams();
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);

        // Get all variants for this product with details
        const variants = await productVariantAPI.getByProductWithDetails(productId);

        if (variants && variants.length > 0) {
          // Get images for all variants
          const variantIds = variants.map(v => v.variantId);
          const images = variantIds.length ? await productImageAPI.getByVariantIds(variantIds) : [];

          // Group images by variant
          const imagesByVariant = images.reduce((acc, img) => {
            const vid = img.variantId;
            if (!acc[vid]) acc[vid] = [];
            acc[vid].push(img);
            return acc;
          }, {});

          // Structure the product data
          const product = variants[0].product;
          const allVariants = variants.map(variant => ({
            ...variant,
            images: imagesByVariant[variant.variantId] || []
          }));

          setProductData({
            product,
            variants: allVariants,
            allImages: images
          });
        } else {
          setError('Product not found');
        }
      } catch (err) {
        console.error('Error fetching product data:', err);
        setError('Failed to load product data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProductData();
    }
  }, [productId]);

  if (loading) {
    return (
      <div className="purchase-page">
        <div className="loading-container">
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="purchase-page">
        <div className="error-container">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!productData) {
    return (
      <div className="purchase-page">
        <div className="error-container">
          <p>Product not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="purchase-page">
      <ProductDisplay productData={productData} />
      <ProductGallery productData={productData} />
      <ProductDescription productData={productData} />
    </div>
  );
};

export default Purchase;
