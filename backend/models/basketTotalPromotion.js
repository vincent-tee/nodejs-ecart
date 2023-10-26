// File: models/basketTotalPromotion.js
const Promotion = require('./promotion');
const db = require("../database");

class BasketTotalPromotion extends Promotion {
    constructor(id, thresholdAmount, discountAmount) {
        super(id);
        this.thresholdAmount = thresholdAmount;
        this.discountAmount = discountAmount;
    }
}

module.exports = BasketTotalPromotion;
