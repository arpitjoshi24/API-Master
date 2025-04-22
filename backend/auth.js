const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 4000;

const DATA_FILE = path.join(__dirname, 'products.json');

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Helper: Load existing products from file
const loadProducts = () => {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return []; // Return empty array if file doesn't exist or is invalid
  }
};

// Helper: Save products to file
const saveProducts = (products) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2));
};

app.post('/products', (req, res) => {
  const products = loadProducts();
  const product = req.body;
  product.id = products.length + 1;
  products.push(product);
  saveProducts(products);
  res.json({ message: "Product added successfully", id: product.id });
});

app.get('/products', (req, res) => {
  const products = loadProducts();
  res.json(products);
});
app.delete('/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  let products = loadProducts();
  const newProducts = products.filter(p => p.id !== id);

  if (products.length === newProducts.length) {
    return res.status(404).json({ message: "Product not found" });
  }

  saveProducts(newProducts);
  res.json({ message: `Product with id ${id} deleted successfully` });
});
app.put('/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  let products = loadProducts();

  const index = products.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ message: "Product not found" });
  }

  // Update the existing product (but keep the original ID)
  products[index] = { ...products[index], ...req.body, id };
  saveProducts(products);

  res.json({ message: `Product with id ${id} updated successfully`, product: products[index] });
});

app.listen(port, () => {
  console.log(`Offline API server running at http://localhost:${port}`);
});
