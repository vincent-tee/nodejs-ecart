const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./shop.sqlite');

db.run(`CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  price REAL NOT NULL
)`);

db.run(`CREATE TABLE IF NOT EXISTS cart_items (
  id INTEGER PRIMARY KEY,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY(product_id) REFERENCES products(id)
)`);

db.run(`CREATE TABLE IF NOT EXISTS discounts (
  id INTEGER PRIMARY KEY,
  description TEXT NOT NULL,
  discount REAL NOT NULL,
  condition TEXT NOT NULL
)`);

module.exports = db;
