import React from 'react';
import ProductCard from './ProductCard';
import './ProductGrid.css';

// Sample product data matching the Figma design
const products = [
  {
    id: 1,
    name: 'WELL SHOES SNEAKERS WHITE - 001',
    price: '100'
  },
  {
    id: 2,
    name: 'WELL SHOES SNEAKERS WHITE - 002',
    price: '100'
  },
  {
    id: 3,
    name: 'hS Sneakers blue gaya - 001',
    price: '100'
  },
  {
    id: 4,
    name: 'WS High SNEAKERS Tosca - 002',
    price: '100'
  },
  {
    id: 5,
    name: 'Casual Sneakers blue - 010',
    price: '100'
  },
  {
    id: 6,
    name: 'Casual Sneakers brown - 015',
    price: '100'
  },
  {
    id: 7,
    name: 'OF Sneakers great worst',
    price: '100'
  },
  {
    id: 8,
    name: 'White sneakers alakazam',
    price: '100'
  },
  {
    id: 9,
    name: 'sport street white - 001',
    price: '100'
  }
];

const ProductGrid = () => {
  // Group products into rows of 3
  const productRows = [];
  for (let i = 0; i < products.length; i += 3) {
    productRows.push(products.slice(i, i + 3));
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
