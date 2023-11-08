import React from 'react';

const Products = ({ products, onAddToCart }) => {
  return (
    <div>
      <h2>Products</h2>
      {products.map((product, index) => (
        <div key={index}>
          <h3>{product.name}</h3>
          <p>Price: ${product.price.toFixed(2)}</p>
          <button onClick={() => onAddToCart(product.id, 1)}>Add to Cart</button>
        </div>
      ))}
    </div>
  );
};

export default Products;
