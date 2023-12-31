const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./shop.sqlite');

db.run("PRAGMA foreign_keys = ON");

db.serialize(() => {
    // Products Table
    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL
    )`);

    // Carts Table
    db.run(`CREATE TABLE IF NOT EXISTS carts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    // Cart Items Table
    db.run(`CREATE TABLE IF NOT EXISTS cart_items (
        cart_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        FOREIGN KEY(cart_id) REFERENCES carts(id),
        FOREIGN KEY(product_id) REFERENCES products(id)
    )`);

    // Promotions Table
    db.run(`CREATE TABLE IF NOT EXISTS promotions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        description TEXT NOT NULL
    )`);

    // Multi Buy Promotions Table
    db.run(`CREATE TABLE IF NOT EXISTS multi_buy_promotions (
        promotion_id INTEGER PRIMARY KEY,
        target_product_id INTEGER NOT NULL,
        required_quantity INTEGER NOT NULL,
        discount_price REAL NOT NULL,
        FOREIGN KEY(promotion_id) REFERENCES promotions(id),
        FOREIGN KEY(target_product_id) REFERENCES products(id)
    )`);

    // Basket Total Promotions Table
    db.run(`CREATE TABLE IF NOT EXISTS basket_total_promotions (
        promotion_id INTEGER PRIMARY KEY,
        threshold_price REAL NOT NULL,
        discount_amount REAL NOT NULL,
        FOREIGN KEY(promotion_id) REFERENCES promotions(id)
    )`);

    // Cart Promotions Table
    db.run(`CREATE TABLE IF NOT EXISTS cart_promotions (
      cart_id INTEGER NOT NULL,
      promotion_id INTEGER NOT NULL,
      PRIMARY KEY (cart_id, promotion_id),
      FOREIGN KEY (cart_id) REFERENCES carts(id),
      FOREIGN KEY (promotion_id) REFERENCES promotions(id)
    )`);

    // Promotions View
    db.run(`
      CREATE VIEW IF NOT EXISTS v_promotion_details AS
      SELECT
        p.id,
        p.type,
        p.description,
        mb.target_product_id,
        mb.required_quantity,
        mb.discount_price,
        bt.threshold_price,
        bt.discount_amount
      FROM promotions p
      LEFT JOIN multi_buy_promotions mb ON p.id = mb.promotion_id
      LEFT JOIN basket_total_promotions bt ON p.id = bt.promotion_id
    `);
});

module.exports = db;
