const { logQueueStatus } = require("./utils/queueProcessor");
const { connectDB, initializeDB } = require("./utils/database");
const app = require("./app");
const port = 3010;

const db = connectDB();
initializeDB(db);

let intervalId;

const server = app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);

  intervalId = setInterval(async () => {
    try {
      await logQueueStatus(db);
    } catch (error) {
      console.error("Error logging queue status:", error);
    }
  }, 5000);
});

const closeServer = () => {
  clearInterval(intervalId);
  return new Promise(resolve => {
    server.close(resolve);
  });
};

module.exports = { app, server, closeServer };
