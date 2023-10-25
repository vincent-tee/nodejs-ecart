class Cart {
  constructor(rules) {
      this.rules = rules;
      this.items = [];
  }

  addItem(product) {
      this.items.push(product);
  }

  removeItem(productId) {
      this.items = this.items.filter(item => item.id !== productId);
  }

  listItems() {
      return this.items;
  }

  total() {
      let total = this.items.reduce((acc, item) => acc + item.price, 0);
      let discounts = this.total_discounts();
      return total - discounts;
  }

  total_discounts() {
      return this.rules.reduce((acc, rule) => {
          if (rule.applies(this.items)) {
              // return acc + rule.discountAmount;
          }
          return acc;
      }, 0);
  }
}

module.exports = Cart;
