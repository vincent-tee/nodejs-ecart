const express = require("express");
const db = require('./database.js');
const app = express();
const productRoutes = require('./backend/routes/productRoutes');
const cartRoutes = require('./backend/routes/cartRoutes');
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.listen(PORT, () => {
  console.log(`Server Listening on PORT: ${PORT}`);
});

app.get('/status', (request, response) => {
  const status = {
     'Status': 'Running'
  };

  response.send(status);
});

app.use(express.json());

// ... any other routes

app.use('/products', productRoutes);
app.use('/cart', cartRoutes);
// ... any other route middlewares

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
