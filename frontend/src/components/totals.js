import React from 'react';

const Totals = ({ totals }) => {
  const { subTotal = 0, totalDiscount = 0, totalPrice = 0 } = totals;

  return (
    <div>
      <h2>Totals</h2>
      <div>Subtotal: ${subTotal.toFixed(2)}</div>
      <div>Discount: -${totalDiscount.toFixed(2)}</div>
      <div>Total Price: ${totalPrice.toFixed(2)}</div>
    </div>
  );
};

export default Totals;
