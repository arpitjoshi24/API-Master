const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = 5000;

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));


app.use(bodyParser.json());

app.route("/api/data")
  .get((req, res) => {

    res.json({ message: "GET request received", queryParams: req.query });
  })
  .post((req, res) => {

    res.json({ message: "POST request received", body: req.body });
  })
  .put((req, res) => {
 
    res.json({ message: "PUT request received", body: req.body });
  })
  .delete((req, res) => {
    
    res.json({ message: "DELETE request received" });
  });

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
