const { logQueueStatus } = require("./utils/queueProcessor");
const app = require("./app");
const port = 3010;

// Start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);

  setInterval(logQueueStatus, 1000);
});
