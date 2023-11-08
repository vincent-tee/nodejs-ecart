import React from 'react';

const CartItems = ({ items, onDecreaseQuantity }) => (
  <div>
    <h2>Cart Items</h2>
    <ul>
      {items.map((item, index) => (
        <li key={index}>
          {item.productName} - Quantity: {item.quantity}
          <button onClick={() => onDecreaseQuantity(item.id, item.quantity)}>
            -
          </button>
        </li>
      ))}
    </ul>
  </div>
);

export default CartItems;
