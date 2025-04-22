const express = require('express');
const app = express();
const port = 4000;

app.use(express.json());

let products = [];

app.post('/products', (req, res) => {
  const product = req.body;
  product.id = products.length + 1;
  products.push(product);
  res.json({ message: "Product added successfully", id: product.id });
});

app.get('/products', (req, res) => {
  res.json(products);
});

app.listen(port, () => {
  console.log(`Offline API server running at http://localhost:${port}`);
});