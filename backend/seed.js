const db = require('./database.js');

const products = [
    { name: 'A', price: 30 },
    { name: 'B', price: 20 },
    { name: 'C', price: 50 },
    { name: 'D', price: 15 },

];

products.forEach(product => {
    db.run("INSERT INTO products (name, price) VALUES (?, ?)", [product.name, product.price], (err) => {
        if (err) {
            console.error('Error inserting data:', err.message);
        }
    });
});

db.close();
test
