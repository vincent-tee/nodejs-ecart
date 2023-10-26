class Cart {
  constructor(cartId) {  // Changed cartID to cartId
      this.cartId = cartId;
  }

  create() {
      return new Promise((resolve, reject) => {
          db.run(`INSERT INTO carts (id) VALUES (?)`, [this.cartId], (err) => {
              if (err) reject(err);
              else resolve();
          });
      });
  }

  addItem(productId, quantity) {
      return new Promise((resolve, reject) => {
          db.run(`INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)`, [this.cartId, productId, quantity], (err) => {
              if (err) reject(err);
              else resolve();
          });
      });
  }

  listItems() {
      return new Promise((resolve, reject) => {
          db.all(`SELECT products.*, cart_items.quantity
                  FROM cart_items
                  JOIN products ON cart_items.product_id = products.id
                  WHERE cart_items.cart_id = ?`, [this.cartId], (err, rows) => {
              if (err) reject(err);
              else resolve(rows);
          });
      });
  }

  removeItem(productId) {
      return new Promise((resolve, reject) => {
          db.run(`DELETE FROM cart_items
                  WHERE cart_items.cart_id = ? and cart_items.product_id = ?`,
                  [this.cartId, productId], (err) => {
              if (err) reject(err);
              else resolve();
          })
      })
  }

  // ... Other methods for handling cart operations, discounts, and total calculations ...
}

module.exports = Cart;
