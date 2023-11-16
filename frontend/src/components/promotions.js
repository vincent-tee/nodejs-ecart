import React from 'react';

const Promotions = ({ promotions }) => (
  <div>
    <h2>Active Promotions</h2>
    <ul>
      {promotions.map((promotion, index) => (
        <li key={index}>{promotion.description}</li>
      ))}
    </ul>
  </div>
);

export default Promotions;
