const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors"); // ✅ import CORS

const app = express();
const port = 5000;

// ✅ Enable CORS for your frontend origin
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Sample endpoint to handle GET, POST, PUT, and DELETE
app.route("/api/data")
  .get((req, res) => {
    // Handle GET request
    res.json({ message: "GET request received", queryParams: req.query });
  })
  .post((req, res) => {
    // Handle POST request
    res.json({ message: "POST request received", body: req.body });
  })
  .put((req, res) => {
    // Handle PUT request
    res.json({ message: "PUT request received", body: req.body });
  })
  .delete((req, res) => {
    // Handle DELETE request
    res.json({ message: "DELETE request received" });
  });

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
