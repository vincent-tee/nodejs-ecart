const Promotion = require('./promotion');
const db = require("../database");

class MultiBuyPromotion extends Promotion {
    constructor(id, targetProductId, requiredQuantity, discountedPrice) {
        super(id);
        this.targetProductId = targetProductId;
        this.requiredQuantity = requiredQuantity;
        this.discountedPrice = discountedPrice;
    }
}

module.exports = MultiBuyPromotion;
