import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { productVariantAPI, productImageAPI } from '../services/api';
import './ProductGrid.css';

const ProductGrid = ({ filters = {} }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // Decide which endpoint to call: filtered or all active
        const hasAnyFilter = filters && Object.keys(filters).some(k => {
          const v = filters[k];
          return Array.isArray(v) ? v.length > 0 : v !== undefined && v !== null;
        });

        const response = hasAnyFilter
          ? await productVariantAPI.getByFilters(filters)
          : await productVariantAPI.getActiveWithDetails();

        // Collect variant IDs and fetch images in batch
        const variantIds = response.map((v) => v.variantId).filter(Boolean);
        const images = variantIds.length ? await productImageAPI.getByVariantIds(variantIds) : [];

        // Build map: variantId => [images]
        const imagesByVariant = images.reduce((acc, img) => {
          const vid = img.variantId;
          if (!acc[vid]) acc[vid] = [];
          acc[vid].push(img);
          return acc;
        }, {});

        // Transform the API response to match ProductCard expectations
        const transformedProducts = response.map((variant) => {
          const imgs = imagesByVariant[variant.variantId] || [];
          const primary = imgs.find((i) => i.isPrimary === true || i.isPrimary === 1);
          const imageUrl = primary ? primary.imageUrl : (imgs[0] ? imgs[0].imageUrl : null);

          return {
            id: variant.variantId,
            name: variant.product?.name || 'Unknown Product',
            price: variant.price ? Number(variant.price).toFixed(2) : '0.00',
            variantId: variant.variantId,
            productId: variant.product?.productId,
            size: variant.size?.sizeName,
            color: variant.color?.colorName,
            brand: variant.product?.brand?.name,
            category: variant.product?.category?.name,
            imageUrl,
          };
        });

        setProducts(transformedProducts);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [JSON.stringify(filters)]);

  // Group products into rows of 3
  const productRows = [];
  for (let i = 0; i < products.length; i += 3) {
    productRows.push(products.slice(i, i + 3));
  }

  if (loading) {
    return (
      <div className="product-grid">
        <div className="loading-container">
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-grid">
        <div className="error-container">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="product-grid">
        <div className="empty-container">
          <p>No products available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {productRows.map((row, rowIndex) => (
        <div key={rowIndex} className="product-row">
          {row.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ))}
    </div>
  );
};

export default ProductGrid;
