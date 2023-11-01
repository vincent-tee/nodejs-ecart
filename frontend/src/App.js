import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  // Rename the state variable to 'products' and initialize it as an empty array
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  console.log(cart);

  useEffect(() => {
    fetch("http://localhost:3000/products")
      .then((res) => res.json())
      .then((data) => {
        // Update the state with the array of product objects
        setProducts(data);
      });
  }, []);

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  return (
    <div className="App">
      {/* Map over the array of product objects and render each one */}
      {products.map((product, index) => (
        <div key={index}>
          <h2>{product.name}</h2>
          <p>Price: ${product.price}</p>
          <input type="submit" value="add" onClick={() => addToCart(product)} />
        </div>
      ))}
      <div>

      </div>
    </div>
  );
}

export default App;
