const axios = require("axios");
const { castSEP31 } = require("./sep31Converter");

async function logQueueStatus(db) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Checking queue...`);

  db.all("SELECT * FROM queue", [], async (err, rows) => {
    if (err) {
      console.error(`[${timestamp}], failed fetching messages in queue!`);
    } else {
      if (rows && rows.length > 0) {
        try {
          getMessageWithTransactions(
            db,
            rows[0].msg_id,
            async (err, message) => {
              const response = await axios.post(
                "http://localhost:3020/transaction",
                {
                  message: castSEP31(message),
                },
                {
                  headers: {
                    "Content-Type": "application/json",
                  },
                },
              );

              if (response.status === 201) {
                db.run(
                  `DELETE FROM queue WHERE msg_id = ?`,
                  [rows[0].msg_id],
                  err => {
                    if (err === null) {
                      console.log(
                        `Successfully forwarded message: ${rows[0].msg_id}`,
                      );
                    }
                  },
                );
              }
              /**
               * @TODO improve error handling if the response is not positive
               */
            },
          );
        } catch (error) {
          console.error("Error sending transaction:", error);
        }
      }
    }
  });
}

const getMessageWithTransactions = (db, msg_id, callback) => {
  const messageQuery = `
    SELECT m.* 
    FROM messages m 
    JOIN queue q ON m.queue_id = q.id 
    WHERE m.msg_id = ?`;

  const transactionsQuery = `
    SELECT * FROM transactions WHERE msg_id = ?`;

  db.get(messageQuery, [msg_id], (err, message) => {
    if (err) {
      console.error(`Error retrieving message: ${err.message}`);
      return callback(err);
    }

    if (!message) {
      return callback(new Error("Message not found"));
    }

    db.all(transactionsQuery, [msg_id], (err, transactions) => {
      if (err) {
        console.error(`Error retrieving transactions: ${err.message}`);
        return callback(err);
      }

      const result = {
        id: message.id,
        msg_id: message.msg_id,
        cre_dt_tm: message.cre_dt_tm,
        nb_of_txs: message.nb_of_txs,
        ctrl_sum: message.ctrl_sum,
        initg_pty_name: message.initg_pty_name,
        initg_pty_org_id: message.initg_pty_org_id,
        pmt_inf_id: message.pmt_inf_id,
        pmt_mtd: message.pmt_mtd,
        svc_lvl: message.svc_lvl,
        reqd_exctn_dt: message.reqd_exctn_dt,
        dbtr_name: message.dbtr_name,
        dbtr_acct_iban: message.dbtr_acct_iban,
        dbtr_acct_currency: message.dbtr_acct_currency,
        dbtr_agt_bicfi: message.dbtr_agt_bicfi,
        transactions: transactions.map(tx => ({
          id: tx.id,
          end_to_end_id: tx.end_to_end_id,
          instd_amt: tx.instd_amt,
          instd_amt_currency: tx.instd_amt_currency,
          xchg_rate_inf_unit_ccy: tx.xchg_rate_inf_unit_ccy,
          xchg_rate_inf_xchg_rate: tx.xchg_rate_inf_xchg_rate,
          cdtr_agt_bicfi: tx.cdtr_agt_bicfi,
          cdtr_acct_iban: tx.cdtr_acct_iban,
        })),
      };

      callback(null, result);
    });
  });
};

module.exports = {
  logQueueStatus,
};
