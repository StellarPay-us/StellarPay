const path = require("path");
const fs = require("fs").promises;
const xml2js = require("xml2js");
const isoProcessor = require("../services/isoProcessor");
const db = require("../utils/database");

/**
 * Handles incoming XML messages, validates them against an XSD schema,
 * extracts the necessary information, and stores them in the database.
 *
 * @param {Object} req - The HTTP request object containing the XML message in req.body.
 * @param {Object} res - The HTTP response object used to send the response back to the client.
 */
exports.receiveMessage = async (req, res) => {
  // Convert the incoming JSON object to XML string using xml2js
  const builder = new xml2js.Builder();
  const xmlContent = builder.buildObject(req.body);

  try {
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
    const data = isoProcessor.parseXML(xmlContent);

    // Begin a database transaction to store the parsed data
    db.serialize(() => {
      // Insert the message header details into the messages table
      db.run(
        `INSERT INTO messages (
            msg_id, cre_dt_tm, nb_of_txs, ctrl_sum, initg_pty_name, initg_pty_org_id, 
            pmt_inf_id, pmt_mtd, svc_lvl, reqd_exctn_dt, dbtr_name, dbtr_acct_iban, dbtr_acct_currency, dbtr_agt_bicfi
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.message.msgId,
          data.message.creDtTm,
          data.message.nbOfTxs,
          data.message.ctrlSum,
          data.message.initgPty.name,
          data.message.initgPty.orgId,
          data.message.pmtInfId,
          data.message.pmtMtd,
          data.message.svcLvl,
          data.message.reqdExctnDt,
          data.message.dbtr.name,
          data.message.dbtrAcct.iban,
          data.message.dbtrAcct.currency,
          data.message.dbtrAgt.bicfi,
        ],
        function (err) {
          // Handle any error that occurs while inserting the message into the database
          if (err) {
            return res.status(500).json({
              message: "An error occurred while inserting the message",
              error: err.message,
            });
          }

          const messageId = this.lastID; // Retrieve the ID of the inserted message

          // Insert all related transactions into the transactions table
          const transactionPromises = data.transactions.map(transaction => {
            return new Promise((resolve, reject) => {
              db.run(
                `INSERT INTO transactions (
                    end_to_end_id, instd_amt, instd_amt_currency, xchg_rate_inf_unit_ccy, 
                    xchg_rate_inf_xchg_rate, cdtr_agt_bicfi, cdtr_acct_iban, message_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                  transaction.endToEndId,
                  transaction.instdAmt.amount,
                  transaction.instdAmt.currency,
                  transaction.xchgRateInf.unitCcy,
                  transaction.xchgRateInf.xchgRate,
                  transaction.cdtrAgt.bicfi,
                  transaction.cdtrAcct.iban,
                  messageId, // Link each transaction to the inserted message
                ],
                function (err) {
                  if (err) {
                    reject(err); // Reject the promise if an error occurs
                  } else {
                    resolve(); // Resolve the promise when the transaction is inserted successfully
                  }
                },
              );
            });
          });

          // Insert the message into a queue for further processing
          db.run(
            `INSERT INTO queue (message_id, ready_to_forward) VALUES (?, ?)`,
            [messageId, 0], // Mark message as not ready to forward
            function (err) {
              if (err) {
                return res.status(500).json({
                  message: "An error occurred while inserting into the queue",
                  error: err.message,
                });
              }
            },
          );

          // Wait for all transaction insertions to complete
          Promise.all(transactionPromises)
            .then(() => {
              res.status(201).send("Message received and processed");
            })
            .catch(err => {
              res.status(500).json({
                message: "An error occurred while inserting transactions",
                error: err.message,
              });
            });
        },
      );
    });

    // Return a success message if all operations complete successfully
    res.status(201).send("Message received and processed");
  } catch (error) {
    // Handle any unexpected errors during message processing
    res.status(500).json({
      message: "An error occurred while processing the message",
      error: error.message,
    });
  }
};
