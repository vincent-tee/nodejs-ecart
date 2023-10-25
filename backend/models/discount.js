class Discount {
  constructor(id, description, condition, discountAmount) {
      this.id = id;
      this.description = description;
      this.condition = condition;
      this.discountAmount = discountAmount;
  }

  applies(cartItems) {
      return this.condition(cartItems);
  }
}

module.exports = Discount;
