const db = require('./database.js');

function runQuery(query, params) {
    return new Promise((resolve, reject) => {
      db.run(query, params, function(err) {
          if (err) reject(err);
          else resolve(this);
      });
  });
}

async function seedDatabase() {
  const Cart = require('./models/cart');
  const cart = new Cart(db);

  const products = [
    { name: 'A', price: 30 },
    { name: 'B', price: 20 },
    { name: 'C', price: 50 },
    { name: 'D', price: 15 },
  ];

  try {
    await runQuery("DELETE FROM cart_items");
    await runQuery("DELETE FROM cart_promotions");
    await runQuery("DELETE FROM multi_buy_promotions");
    await runQuery("DELETE FROM basket_total_promotions");
    await runQuery("DELETE FROM products");
    await runQuery("DELETE FROM carts");
    await runQuery("DELETE FROM promotions");

    const cartId = await cart.create();

    console.log(cartId);

    const productIDs = {};

    for (const product of products) {
      await runQuery("INSERT INTO products (name, price) VALUES (?, ?)", [product.name, product.price]);
      const { lastID } = await runQuery("SELECT last_insert_rowid() as lastID");
      productIDs[product.name] = lastID;
      console.log("Inserting into cart_items with cart_id:", cartId, "and product_id:", lastID);
      await runQuery("INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)", [cartId, lastID, 3]);

    }

    const promotions = [
      {
        type: 'multi-buy',
        description: 'If 3 of Item A is purchased, the total price of all three will be $75 (multiples of 3 discount)',
        target_product_id: productIDs['A'],
        required_quantity: 3,
        discount_price: 75.00,
      },
      {
        type: 'multi-buy',
        description: 'If 2 of Item B is purchased, the total price of both will be $35 (multiples of 2 discount)',
        target_product_id: productIDs['B'],
        required_quantity: 2,
        discount_price: 35.00,
      },
      {
        type: 'basket-total',
        description: 'If the total basket price (after previous discounts) is over $150, the basket receives an additional discount of $20',
        threshold_price: 150.00,
        discount_amount: 20.00,
      },
    ];

    for (const promotion of promotions) {
        const prom = await runQuery("INSERT INTO promotions (type, description) VALUES (?, ?)", [promotion.type, promotion.description])
        const { lastID } = await runQuery("SELECT last_insert_rowid() as lastID");
        console.log(lastID);


        if (promotion.type === 'multi-buy') {
          const result = await runQuery("INSERT INTO multi_buy_promotions (promotion_id, target_product_id, required_quantity, discount_price) VALUES (?, ?, ?, ?)",
          [lastID, promotion.target_product_id, promotion.required_quantity, promotion.discount_price])
          console.log('Inserted cart item:', result);
        } else if (promotion.type === 'basket-total') {
          await runQuery("INSERT INTO basket_total_promotions (promotion_id, threshold_price, discount_amount) VALUES (?, ?, ?)",
          [lastID, promotion.threshold_price, promotion.discount_amount])
        }
    }

  } catch (err) {
    console.error('Error:', err.message)
  } finally {
    db.close()
  }
};

seedDatabase();
