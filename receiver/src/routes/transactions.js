const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");

router.post("/", transactionController.receiveTransaction);

module.exports = router;
