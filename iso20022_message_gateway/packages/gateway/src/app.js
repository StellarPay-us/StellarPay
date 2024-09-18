const express = require("express");
const bodyParser = require("body-parser");
const bodyParserXml = require("body-parser-xml");
const cors = require("cors");

const app = express();

// @dev Initialize body-parser-xml to add XML parsing capabilities to body-parser
bodyParserXml(bodyParser);

// Middleware
app.use(cors()); // @dev Enable CORS to allow cross-origin requests
app.use(bodyParser.json()); // @dev Parse JSON request bodies
app.use(bodyParser.urlencoded({ extended: true })); // @dev Parse URL-encoded data

// @dev Add XML parsing middleware with a 1MB request size limit
app.use(
  bodyParser.xml({
    limit: "1MB", // @dev Limit the size of incoming XML payloads to 1MB
    xmlParseOptions: {
      explicitArray: false, // @dev Avoid wrapping single elements in arrays
    },
  })
);

// @dev Import and use message-related routes
const messageRoutes = require("./routes/messages");
app.use("/messages", messageRoutes);

// @dev Global error handler middleware for logging errors and sending a 500 response
app.use((err, req, res, next) => {
  console.error(`Error: ${err.stack}`); // @dev Log error stack trace
  res.status(500).send("Something went wrong!"); // @dev Send generic error response
  next();
});

module.exports = app; // @dev Export the Express app for use in other modules
