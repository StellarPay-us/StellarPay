const express = require("express");
const cors = require("cors");
const app = express();
const xml2js = require("xml2js");

const messageRoutes = require("./routes/messages");
const { convertJSONToXML } = require("./utils/jsonToXML");

// Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  if (req.is("application/xml")) {
    let data = "";
    req.setEncoding("utf8");
    req.on("data", chunk => {
      data += chunk;
    });

    req.on("end", () => {
      const parser = new xml2js.Parser({
        explicitArray: false,
        trim: true,
        normalize: false,
      });

      parser.parseString(data, (err, result) => {
        if (err) {
          return next(err);
        }
        req.body = result;
        next();
      });
    });
  } else if (req.is("application/json")) {
    try {
      const data = convertJSONToXML(req.body);

      const parser = new xml2js.Parser({
        explicitArray: false,
        trim: true,
        normalize: false,
      });

      parser.parseString(data, (err, result) => {
        if (err) {
          return next(err);
        }
        req.body = result;
        next();
      });
    } catch (error) {
      return next(new SyntaxError(error.message));
    }
  } else {
    next();
  }
});

app.use("/messages", messageRoutes);

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError) {
    return res.status(400).json({
      message: `Invalid JSON or XML format: ${err.message}`,
    });
  }

  res.status(500).send("Something went wrong!");

  next(err);
});

module.exports = app;
