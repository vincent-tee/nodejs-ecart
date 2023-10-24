const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./shop.sqlite');

db.run(`CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  price REAL NOT NULL
)`);

db.run(`CREATE TABLE IF NOT EXISTS cart (
  id INTEGER PRIMARY KEY,
  product_id INTEGER,
  quantity INTEGER,
  FOREIGN KEY(product_id) REFERENCES products(id)
)`);

db.run(`CREATE TABLE IF NOT EXISTS promotions (
  id INTEGER PRIMARY KEY,
  description TEXT NOT NULL,
  discount REAL NOT NULL
)`);

module.exports = db;
