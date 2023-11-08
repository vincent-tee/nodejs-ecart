import React, { useState, useEffect } from 'react';
import CartItems from './components/cartItems';
import Promotions from './components/promotions';
import Products from './components/products';
import Totals from './components/totals';

const App = () => {
  const cartId = '1'; // Replace with actual cart ID
  const [cartItems, setCartItems] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [totals, setTotals] = useState({ subTotal: 0, totalDiscount: 0, totalPrice: 0 });
  const [products, setProducts] = useState([]);

  const fetchCart = async () => {
    try {
      const response = await fetch(`http://localhost:3000/cart/${cartId}`);
      if (response.ok) {
        const cart = await response.json();
        console.log(cart.promotions);
        console.log(cart.totals);
        setCartItems(cart.items);
        setPromotions(cart.promotions);
        setTotals(cart.totals);
      } else {
        throw new Error('Failed to fetch cart');
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:3000/products');
        if (response.ok) {
          const products = await response.json();
          setProducts(products);
        } else {
          throw new Error('Failed to fetch products');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
    fetchCart();
  }, []);


  const decreaseItemQuantity = async (productId, currentQuantity) => {
    try {
      let updatedCart;
      if (currentQuantity > 1) {
        updatedCart = await addItemToCart(productId, -1);
      } else {
        const response = await fetch(`http://localhost:3000/cart/${cartId}/items/${productId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const responseBody = await response.text(); // Get the raw response body text
          console.log('Response Body:', responseBody); // Log it for debugging

          updatedCart = responseBody ? JSON.parse(responseBody) : {};
        } else {
          throw new Error('Failed to delete item from cart');
        }
      }

      if (updatedCart) {
        setCartItems(updatedCart.items || []);
        setPromotions(updatedCart.promotions || []);
        setTotals(updatedCart.totals || {});
      }
    } catch (error) {
      console.error('Error decreasing item quantity:', error);
      alert(error.message);
    }
  };


  const addItemToCart = async (productId, quantity) => {
    try {
      const response = await fetch(`http://localhost:3000/cart/${cartId}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, quantity }),
      });

      if (response.ok) {
        const updatedCart = await response.json();
        setCartItems(updatedCart.items);
        setPromotions(updatedCart.promotions);
        setTotals(updatedCart.totals);
      } else {
        throw new Error('Failed to add item to cart');
      }
    } catch (error) {
      console.error('Error adding item to cart:', error);
      alert(error.message);
    }
  };

  const handleDecreaseItemQuantity = async (productId, currentQuantity) => {
    try {
      await decreaseItemQuantity(productId, currentQuantity);
    } catch (error) {
      console.error('Error in handleDecreaseItemQuantity:', error);
      alert(error.message);
    }
  };


  const handleAddToCart = async (productId, quantity) => {
    try {
      await addItemToCart(productId, quantity);
    } catch (error) {
      console.error('Error in handleAddToCart:', error);
      alert(error.message);
    }
  };


  return (
    <div className="App">
      <Products products={products} onAddToCart={handleAddToCart} />
      <CartItems items={cartItems} onDecreaseQuantity={handleDecreaseItemQuantity} />
      <Promotions promotions={promotions} />
      <Totals totals={totals} />
    </div>
  );
};

export default App;
