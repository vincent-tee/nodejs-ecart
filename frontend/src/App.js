import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  // Rename the state variable to 'products' and initialize it as an empty array
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/products")
      .then((res) => res.json())
      .then((data) => {
        // Update the state with the array of product objects
        setProducts(data);
      });
  }, []);

  return (
    <div className="App">
      {/* Map over the array of product objects and render each one */}
      {products.map((product, index) => (
        <div key={index}>
          <h2>{product.name}</h2>
          <p>Price: ${product.price}</p>
        </div>
      ))}
    </div>
  );
}

export default App;
