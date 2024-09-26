const path = require("path");
const fs = require("fs").promises;
const xml2js = require("xml2js");
const isoProcessor = require("../services/isoProcessor");
const { getInstance } = require("../utils/database");

/**
 * Handles incoming XML messages, validates them against an XSD schema,
 * extracts the necessary information, and stores them in the database.
 *
 * @param {Object} req - The HTTP request object containing the XML message in req.body.
 * @param {Object} res - The HTTP response object used to send the response back to the client.
 */
exports.receiveMessage = async (req, res) => {
  // Convert the incoming JSON object to XML string using xml2js
  const builder = new xml2js.Builder({
    xmldec: {
      version: "1.0",
      encoding: "UTF-8",
      standalone: undefined,
    },
  });
  const xmlContent = builder.buildObject(req.body);

  try {
    const db = getInstance();

    // Define the path to the XSD schema for validation
    const xsdPath = path.join(
      __dirname,
      "../../../../../resources/files/definitions",
      "pain.001.001.12.xsd",
    );
    const xsdContent = await fs.readFile(xsdPath, "utf-8");

    // Validate the XML content against the XSD schema
    const validationResult = await isoProcessor.validateXML(
      xmlContent,
      xsdContent,
    );

    // If validation fails, return a 400 response with validation errors
    if (!validationResult.valid) {
      return res.status(400).json({
        message: "Invalid XML message",
        errors: validationResult.errors,
      });
    }

    // Parse the XML message and extract the necessary fields using isoProcessor
    const { message, transactions } = isoProcessor.parseXML(xmlContent);

    db.run(
      `INSERT INTO queue (msg_id) VALUES (?)`,
      [message.msgId],
      function () {
        const id = this.lastID;
        db.run(
          `INSERT INTO messages 
      (msg_id, cre_dt_tm, nb_of_txs, ctrl_sum, initg_pty_name, initg_pty_org_id, pmt_inf_id, pmt_mtd, svc_lvl, reqd_exctn_dt, dbtr_name, dbtr_acct_iban, dbtr_acct_currency, dbtr_agt_bicfi, queue_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            message.msgId,
            message.creDtTm,
            message.nbOfTxs,
            message.ctrlSum,
            message.initgPty.name,
            message.initgPty.orgId,
            message.pmtInfId,
            message.pmtMtd,
            message.svcLvl,
            message.reqdExctnDt,
            message.dbtr.name,
            message.dbtrAcct.iban,
            message.dbtrAcct.currency,
            message.dbtrAgt.bicfi,
            id,
          ],
          () => {
            for (const transaction of transactions) {
              db.run(
                `INSERT INTO transactions (end_to_end_id, instd_amt, instd_amt_currency, xchg_rate_inf_unit_ccy, xchg_rate_inf_xchg_rate, cdtr_agt_bicfi, cdtr_acct_iban, msg_id, queue_id) 
              VALUES (?,?,?,?,?,?,?,?,?)`,
                [
                  transaction.endToEndId,
                  transaction.instdAmt.amount,
                  transaction.instdAmt.currency,
                  transaction.xchgRateInf.unitCcy,
                  transaction.xchgRateInf.xchgRate,
                  transaction.cdtrAgt.bicfi,
                  transaction.cdtrAcct.iban,
                  message.msgId,
                  id,
                ],
              );
            }
          },
        );
      },
    );

    res.status(201).send("Message received and processed");
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while processing the message",
      error: error.message,
    });
  }
};