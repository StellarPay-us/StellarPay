const { parseTransaction } = require("../utils/sep31Parser");
const { getExchangePricesAndCostsForPathPayment, buildTransaction, signAndSubmitTx } = require("../utils/pathPayment");
const StellarSdk = require("@stellar/stellar-sdk");
const axios = require("axios");

exports.receiveTransaction = async (req, res) => {

  try {
    const keypair = StellarSdk.Keypair.random();
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

    const message = req.body.message;

    // Setting up assets
    const sourceAsset = {
      code: 'native',
      issuer: ''
    };
    const serverUrl = 'https://horizon-testnet.stellar.org';

    for(const transaction of message.transactions) {
      const destinationAsset = {
        code: message.sender.currency,
        issuer: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5'
      };
      // Check path payment rate
      const rate = await getExchangePricesAndCostsForPathPayment(sourceAsset, transaction.amount.toString(), destinationAsset, serverUrl);
      
      /**@TODO Find the exchange rate clostest to the expected exchange rate */
      
      // Build transaction
      const tx = await buildTransaction(
        keypair,
        sourceAsset,
        transaction.amount,
        destinationAsset,
        rate[0].destinationAmount,
        serverUrl
      );

      // Sign and submit the transaction
      await signAndSubmitTx(tx, keypair, serverUrl);

      // Parse the received message
      const parsedResult = parseTransaction(message);

      /**@TODO Post parsedResult.disbursement to SDP */

      /**@TODO Fund wallet on SDP with the destination assets */

      /**@TODO Post parsedResult.csvFile to kickstart the disbursement */
    }

    res.status(201).send(`Transaction received and processed: ${JSON.stringify(req.body)}`);
  } catch (error) {
    /**
     * @TODO improve error handling for the sender and gateway
     */
    console.error(error);
  }
};
