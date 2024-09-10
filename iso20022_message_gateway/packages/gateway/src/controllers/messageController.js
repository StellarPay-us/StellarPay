const path = require("path");
const fs = require("fs").promises;
const xml2js = require("xml2js");
const isoProcessor = require("../services/isoProcessor");
const db = require("../utils/database");

exports.receiveMessage = async (req, res) => {
  // Parse the incoming XML object to a string
  const builder = new xml2js.Builder();
  const xmlContent = builder.buildObject(req.body);

  try {
    const xsdPath = path.join(
      __dirname,
      "../../../../../resources/files/definitions",
      "pain.001.001.12.xsd",
    );
    const xsdContent = await fs.readFile(xsdPath, "utf-8");

    // Validate the XML content against the XSD schema using the isoProcessor
    const validationResult = await isoProcessor.validateXML(
      xmlContent,
      xsdContent,
    );

    if (!validationResult.valid) {
      return res.status(400).json({
        message: "Invalid XML message",
        errors: validationResult.errors,
      });
    }

    // Parsing ISO20022 Message to extract important information
    const data = isoProcessor.parseXML(xmlContent);

    // Save data to DB
    db.serialize(() => {
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
          if (err) {
            return res.status(500).json({
              message: "An error occurred while inserting the message",
              error: err.message,
            });
          }

          const messageId = this.lastID;

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
                  messageId,
                ],
                function (err) {
                  if (err) {
                    reject(err);
                  } else {
                    resolve();
                  }
                },
              );
            });
          });

          db.run(
            `INSERT INTO queue (message_id, ready_to_forward) VALUES (?, ?)`,
            [messageId, 0],
            function (err) {
              if (err) {
                return res.status(500).json({
                  message: "An error occurred while inserting into the queue",
                  error: err.message,
                });
              }
            },
          );

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

    res.status(201).send("Message received and processed");
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while processing the message",
      error: error.message,
    });
  }
};
