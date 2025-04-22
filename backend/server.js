require("dotenv").config();  // To use environment variables
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 5000; // Use environment variable for port
const SECRET_KEY = process.env.SECRET_KEY; // Use environment variable for secret key

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",  // Frontend URL from .env
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));
app.use(bodyParser.json());

// Dummy user credentials (simulate a login system)
const dummyUser = {
  username: "pawan",
  password: "1234"
};

// 🛡️ JWT Authentication Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
}

// 🔐 Protected /api/data route with all methods
app.route("/api/data")
  .get(authenticateToken, (req, res) => {
    res.json({ message: "GET (protected)", user: req.user });
  })
  .post(authenticateToken, (req, res) => {
    res.json({ message: "POST (protected)", user: req.user, body: req.body });
  })
  .put(authenticateToken, (req, res) => {
    res.json({ message: "PUT (protected)", user: req.user, body: req.body });
  })
  .delete(authenticateToken, (req, res) => {
    res.json({ message: "DELETE (protected)", user: req.user });
  });

// Test endpoint for general testing
app.post("/api/test-endpoint", (req, res) => {
  const { test } = req.body;

  if (test === "pass") {
    return res.json({ status: "success", message: "Test data received" });
  } else {
    return res.json({ status: "fail", message: "Test failed" });
  }
});

// Logging incoming request headers for debugging
app.all("/api/data", (req, res) => {
  console.log("Received Headers:", req.headers);

  const response = {
    status: "success",
    headersReceived: req.headers,
    method: req.method,
    body: req.body,
    timestamp: new Date().toISOString(),
  };

  res.json(response);
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
