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
    await runQuery("DELETE FROM products");
    await runQuery("DELETE FROM carts");
    const cartId = await cart.create();

    for (const product of products) {
      await runQuery("INSERT INTO products (name, price) VALUES (?, ?)", [product.name, product.price]);
      const { lastID } = await runQuery("SELECT last_insert_rowid() as lastID");
      await runQuery("INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)", [cartId, lastID, 1]);
   }
  } catch (err) {
    console.error('Error:', err.message)
  } finally {
    db.close()
  }
};

seedDatabase();
