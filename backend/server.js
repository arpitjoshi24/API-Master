const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
const port = 5000;
const SECRET_KEY = "your-secret-key"; // Use dotenv in production

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
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

// 🔐 Login Route — returns JWT on valid credentials
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (username === dummyUser.username && password === dummyUser.password) {
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ token });
  } else {
    res.status(401).json({ message: "Invalid username or password" });
  }
});

// ✅ Sample endpoint — public access
app.get("/api/data/public", (req, res) => {
  res.json({ message: "This is public data", time: new Date() });
});

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

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});


// test.js
// server.js


app.use(cors());
app.use(express.json());

app.post("/api/test-endpoint", (req, res) => {
  const { test } = req.body;

  if (test === "pass") {
    return res.json({ status: "success", message: "Test data received" });
  } else {
    return res.json({ status: "fail", message: "Test failed" });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

//header tab 

app.use(express.json());

app.all('/api/data', (req, res) => {
  console.log("Received Headers:", req.headers);

  const response = {
    status: "success",
    headersReceived: req.headers,
    method: req.method,
    body: req.body,
    timestamp: new Date().toISOString()
  };

  res.json(response);
});

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});


