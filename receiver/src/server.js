const app = require("./app");
const port = 3030;


let intervalId;

const server = app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

const closeServer = () => {
  clearInterval(intervalId);
  return new Promise(resolve => {
    server.close(resolve);
  });
};

module.exports = { app, server, closeServer };

