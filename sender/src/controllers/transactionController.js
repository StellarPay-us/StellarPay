exports.receiveTransaction = async (req, res) => {
    res.status(201).send(`Transaction received: ${JSON.stringify(req.body)}`);
};