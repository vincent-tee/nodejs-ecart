class Cart {
  constructor(db, cartId) {
    this.db = db;
    this.cartId = cartId;
  }

  create() {
    return new Promise((resolve, reject) => {
        this.db.run(`INSERT INTO carts DEFAULT VALUES`, function(err) {
            if (err) reject(err);
            else {
                this.cartId = this.lastID;
                resolve(this.cartId);
            }
        });
    });
}

  addItem(productId, quantity) {
      return new Promise((resolve, reject) => {
          this.db.run(`INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)`, [this.cartId, productId, quantity], (err) => {
              if (err) reject(err);
              else resolve();
          });
      });
  }

  listItems() {
      return new Promise((resolve, reject) => {
          this.db.all(`SELECT products.*, cart_items.quantity
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
          this.db.run(`DELETE FROM cart_items
                  WHERE cart_items.cart_id = ? and cart_items.product_id = ?`,
                  [this.cartId, productId], (err) => {
              if (err) reject(err);
              else resolve();
          })
      })
  }

  loadPromotions() {
    return new Promise((resolve, reject) => {
        this.db.all(`SELECT * FROM promotions`, [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
  }

  async applyPromotions() {
    const promotions = await this.loadPromotions();
    const items = await this.listItems();

    let totalDiscount = 0;

    for (let promotion of promotions) {
        if (promotion.type === 'MultiBuy') {
            const targetItems = items.filter(item => item.id === promotion.target_product_id);
            if (targetItems.length >= promotion.required_quantity) {
                const discountTimes = Math.floor(targetItems.length / promotion.required_quantity);
                totalDiscount += discountTimes * (promotion.required_quantity * promotion.target_product_price - promotion.discount_price);
            }
        } else if (promotion.type === 'BasketTotal') {
            const totalPrice = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
            if (totalPrice >= promotion.threshold_price) {
                totalDiscount += promotion.discount_amount;
            }
        }
    }

    return totalDiscount;
  }

  async total() {
    const items = await this.listItems();
    const totalDiscount = await this.applyPromotions();
    const totalPrice = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    return totalPrice - totalDiscount;
  }

  // ... Other methods for handling cart operations, discounts, and total calculations ...
}

module.exports = Cart;
