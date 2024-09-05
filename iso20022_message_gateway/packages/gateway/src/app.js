const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
const messageRoutes = require("./routes/messages");
app.use("/messages", messageRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`Error: ${err.stack}`);
  res.status(500).send("Something went wrong!");
  next(); // Passing control to the next middleware (if needed)
});

module.exports = app;
