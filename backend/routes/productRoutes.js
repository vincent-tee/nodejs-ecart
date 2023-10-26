const express = require('express');
const router = express.Router();
const Product = require('../models/product');

// Get all products
router.get('/', (req, res, next) => {
    Product.findAll().then(products => {
        res.json(products);
    }).catch(err => {
        next(err);  // Pass the error to the error handling middleware
    });
});

module.exports = router;
