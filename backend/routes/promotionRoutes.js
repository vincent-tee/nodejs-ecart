const express = require('express');
const router = express.Router();
const Promotion = require('../models/promotion');

// Get all promotions
router.get('/promotions', async (req, res, next) => {
  try {
    const promotions = await Promotion.findAll();
    res.json(promotions);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
