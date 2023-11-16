class Cart {
  constructor(db, cartId) {
    this.db = db;
    this.cartId = cartId;
  }

  create() {
    return new Promise((resolve, reject) => {
      this.db.run(`INSERT INTO carts DEFAULT VALUES`, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }


  addItem(productId, quantity) {
      return new Promise((resolve, reject) => {
          this.db.get(`SELECT quantity FROM cart_items WHERE cart_id = ? AND product_id = ?`,
          [this.cartId, productId], (err, row) => {
              if (err) {
                  reject(err);
              } else if (row) {
                  const newQuantity = row.quantity + quantity;
                  this.db.run(`UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND product_id = ?`,
                  [newQuantity, this.cartId, productId], (updateErr) => {
                      if (updateErr) {
                          reject(updateErr);
                      } else {
                          resolve();
                      }
                  });
              } else {
                  this.db.run(`INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)`,
                  [this.cartId, productId, quantity], (insertErr) => {
                      if (insertErr) {
                          reject(insertErr);
                      } else {
                          resolve();
                      }
                  });
              }
          });
      })
      .then(() => this.checkAndApplyPromotions())
      .catch(err => {
          console.error('Error in addItem:', err);
          throw err;
      });
  }

  removeItem(productId) {
    return new Promise((resolve, reject) => {
        this.db.run(`
            DELETE FROM cart_items
            WHERE cart_id = ? AND product_id = ?
        `, [this.cartId, productId], (err) => {
            if (err) reject(err);
            else resolve();
        });
    })
    .then(() => this.checkAndApplyPromotions())
    .catch(err => {
        console.error('Error in removeItem:', err);
        throw err;
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

  loadCartPromotions() {
    return new Promise((resolve, reject) => {
        this.db.all(`SELECT promotions.*
                FROM cart_promotions
                JOIN promotions ON cart_promotions.promotion_id = promotions.id
                WHERE cart_promotions.cart_id = ?`,
        [this.cartId], (err, rows) => {
            if (err) reject(err);
            else
                resolve(rows);
        });
    });
  }

  loadAllPromotions() {
    return new Promise((resolve, reject) => {
      this.db.all(`SELECT * FROM v_promotion_details`, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async checkAndApplyPromotions() {
    try {
      const allPromotions = await this.loadAllPromotions();
      const items = await this.listItems();
      const cartPromotions = await this.loadCartPromotions();

      for (const cartPromotion of cartPromotions) {
        const promotionDetails = allPromotions.find(p => p.id === cartPromotion.id);
        if (!promotionDetails || !await this.isPromotionApplicable(promotionDetails, items)) {
          await this.removePromotion(cartPromotion.id);
        }
      }

      for (const promotion of allPromotions) {
        const promotionAlreadyApplied = cartPromotions.some(p => p.id === promotion.id);
        if (!promotionAlreadyApplied && await this.isPromotionApplicable(promotion, items)) {
          await this.addPromotion(promotion.id);
        }
      }
    } catch (err) {
      console.error('Error in checkAndApplyPromotions:', err);
      throw err;
    }
  }

  async isPromotionApplicable(promotion, items) {
    let isApplicable = false;

    if (promotion.type === 'multi-buy') {
      const targetItems = items.filter(item => item.id === promotion.target_product_id);
      const totalQuantity = targetItems.reduce((acc, item) => acc + item.quantity, 0);
      isApplicable = totalQuantity >= promotion.required_quantity;
    } else if (promotion.type === 'basket-total') {
      const totalPrice = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
      isApplicable = totalPrice >= promotion.threshold_price;
    }

    return isApplicable;
  }

  addPromotion(promotionId) {
    return new Promise((resolve, reject) => {
      this.db.run(`INSERT INTO cart_promotions (cart_id, promotion_id) VALUES (?, ?)`,
      [this.cartId, promotionId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  removePromotion(promotionId) {
    return new Promise((resolve, reject) => {
      this.db.run(`
          DELETE from cart_promotions
          WHERE cart_id = ? AND promotion_id = ?
      `, [this.cartId, promotionId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  calculatePromotionDiscount(promotion, items) {
    let discount = 0;

    if (promotion.type === 'multi-buy') {
      const targetItems = items.filter(item => item.id === promotion.target_product_id);
      const totalQuantity = targetItems.reduce((acc, item) => acc + item.quantity, 0);

      const setsForDiscount = Math.floor(totalQuantity / promotion.required_quantity);

      if (setsForDiscount > 0) {
        const discountPerSet = (targetItems[0].price * promotion.required_quantity) - promotion.discount_price;
        discount += discountPerSet * setsForDiscount;
      }
    } else if (promotion.type === 'basket-total') {
      const totalPrice = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
      if (totalPrice >= promotion.threshold_price) {
        discount += promotion.discount_amount;
      }
    }

    return discount;
  }


  async calculateTotalDiscount() {
    const promotions = await this.loadAllPromotions();
    const items = await this.listItems();
    let totalDiscount = 0;

    for (const promotion of promotions) {
      if (await this.isPromotionApplicable(promotion, items)) {
        totalDiscount += this.calculatePromotionDiscount(promotion, items);
      }
    }

    return totalDiscount;
  }


  async total() {
    const items = await this.listItems();
    const totalDiscount = await this.calculateTotalDiscount();
    const subTotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const totalPrice = subTotal - totalDiscount
    return {subTotal, totalDiscount, totalPrice };
  }
}

module.exports = Cart;
