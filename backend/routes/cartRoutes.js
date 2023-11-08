const express = require('express');
const router = express.Router();
const Cart = require('../models/cart');
const Promotion = require('../models/promotion');
const db = require('../database')

// Middleware to create a cart if it doesn't exist
router.use('/:cartId', async (req, res, next) => {
    try {
        const cartId = req.params.cartId;
        db.get(`SELECT id FROM carts WHERE id = ?`, [cartId], (err, row) => {
            if (err) return next(err);
            if (!row) return res.status(404).send('Cart not found');
            req.cartId = cartId;  // cart exists, proceed to the next middleware/route handler
            next();
        });
    } catch (err) {
        next(err);
    }
});


// Add item to cart
router.post('/:cartId/items', async (req, res, next) => {
    const { cartId } = req.params;
    const { productId, quantity } = req.body;
    try {
        const cart = new Cart(db, cartId);
        await cart.addItem(productId, quantity);

        const items = await cart.listItems();
        const promotions = await cart.loadCartPromotions();
        const totals = await cart.total();

        res.status(201).json({ items, promotions, totals });
    } catch (err) {
        next(err);
    }
});


// List items in cart along with promotions
router.get('/:cartId', async (req, res, next) => {
    const { cartId } = req.params;
    try {
        const cart = new Cart(db, cartId);
        const items = await cart.listItems();
        const promotions = await cart.loadCartPromotions();  // Fetch promotions for this cart
        const totals = await cart.total();
        res.json({ items, promotions, totals });  // Include both items and promotions in the response
    } catch (err) {
        next(err);
    }
});

router.delete('/:cartId/items/:productId', async (req, res, next) => {
  const { cartId, productId } = req.params;
  try {
      const cart = new Cart(db, cartId);
      await cart.removeItem(productId);

      const items = await cart.listItems();
      const promotions = await cart.loadCartPromotions();
      const totals = await cart.total();
      res.status(200).json({ items, promotions, totals });
  } catch (err) {
      next(err);
  }
});

module.exports = router;
