const { parseTransaction } = require("../utils/sep31Parser");

exports.receiveTransaction = async (req, res) => {

  try {
    // Parse the received message
    const parsedResult = parseTransaction(req.body.message);

    console.log(parsedResult)

    res.status(201).send(`Transaction received and processed: ${JSON.stringify(req.body)}`);
  } catch (error) {
    /**
     * @TODO improve error handling for the sender and gateway
     */
    console.error(error);
  }
};
