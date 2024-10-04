const express = require("express");
const cors = require("cors");
const app = express();

const transactionRoutes = require("./routes/transactions");

// Middleware
app.use(cors());
app.use(express.json());

app.use("/transaction", transactionRoutes);

app.use((err, req, res, next) => {
  console.error(`Error: ${err.stack}`);
  res.status(500).send("Something went wrong!");
  next();
});

module.exports = app;
