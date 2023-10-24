const express = require("express");
const db = require('./database.js');
const app = express();

app.use(express.json());
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
