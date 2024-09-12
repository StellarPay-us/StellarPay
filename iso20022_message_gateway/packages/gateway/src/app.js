const express = require("express");
const bodyParser = require("body-parser");
const bodyParserXml = require("body-parser-xml");
const cors = require("cors");

const app = express();

// Initialize body-parser-xml
bodyParserXml(bodyParser);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Add XML parsing middleware
app.use(
  bodyParser.xml({
    limit: "1MB",
    xmlParseOptions: {
      explicitArray: false,
    },
  }),
);

// Routes
const messageRoutes = require("./routes/messages");
app.use("/messages", messageRoutes);

app.use((err, req, res, next) => {
  console.error(`Error: ${err.stack}`);
  res.status(500).send("Something went wrong!");
  next();
});

module.exports = app;
