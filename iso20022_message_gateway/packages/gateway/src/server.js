const { logQueueStatus } = require("./utils/queueProcessor"); 
const app = require("./app"); 
const port = 3010; 

// @dev Start the server and begin listening on the specified port
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`); 

  // @dev Set up a recurring task to log the queue status every second (1000ms)
  setInterval(logQueueStatus, 1000);
});
