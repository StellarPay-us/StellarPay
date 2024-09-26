exports.receiveTransaction = async (req, res) => {
    console.log(JSON.stringify(req.body));
    res.status(201).send(`Transaction received: ${JSON.stringify(req.body)}`);
};