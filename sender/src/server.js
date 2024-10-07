const app = require("./app");
const StellarSdk = require("@stellar/stellar-sdk");
const axios = require("axios");

const port = 3020;

let intervalId;

const server = app.listen(port, async () => {
  console.log(`Server listening at http://localhost:${port}`);

  try {
    const pair = StellarSdk.Keypair.random();
    const publicKey = pair.publicKey();
    const secretKey = pair.secret();

    console.log("Public Key:", publicKey);
    console.log("Secret Key:", secretKey);

    const friendbotUrl = `https://friendbot.stellar.org?addr=${publicKey}`;

    console.log("Requesting testnet lumens...");
    const response = await axios.get(friendbotUrl);

    if (response.status === 200) {
      console.log("Testnet lumens successfully funded to the wallet.");
      console.log("Wallet setup complete.");
    } else {
      console.error("Failed to fund testnet lumens.");
    }
  } catch (error) {
    console.error("Error setting up Stellar wallet:", error);
  }
});

const closeServer = () => {
  clearInterval(intervalId);
  return new Promise(resolve => {
    server.close(resolve);
  });
};

module.exports = { app, server, closeServer };
