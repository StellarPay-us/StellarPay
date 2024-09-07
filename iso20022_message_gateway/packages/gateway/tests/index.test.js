const db = require("../src/utils/database");
const request = require("supertest");
const app = require("../src/app");
const fs = require("fs").promises;
const path = require("path");
const messageService = require("../src/services/isoProcessor");

// Mocking the messageService.validateXML function
jest.mock("../src/services/isoProcessor");

describe("POST /messages", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // it("should return 201 for a valid XML message", async () => {
  //   const xmlPath = path.join(
  //     __dirname,
  //     "../../../../resources/files/messages",
  //     "pain.001.001.12.xml",
  //   );
  //   const xmlContent = await fs.readFile(xmlPath, "utf-8");

  //   // Mocking validateXML to return a valid response
  //   messageService.validateXML.mockResolvedValue({ valid: true, errors: [] });

  //   const response = await request(app)
  //     .post("/messages")
  //     .send(xmlContent)
  //     .set("Content-Type", "application/xml");

  //   expect(response.status).toBe(201);
  //   expect(response.text).toBe("Message received and processed");
  // });

  it("should return 400 for an invalid XML message", async () => {
    const xmlPath = path.join(
      __dirname,
      "../../../../resources/files/messages",
      "errorMessage.xml",
    );
    const xmlContent = await fs.readFile(xmlPath, "utf-8");

    // Mocking validateXML to return an invalid response
    messageService.validateXML.mockResolvedValue({
      valid: false,
      errors: ["Invalid XML structure"],
    });

    const response = await request(app)
      .post("/messages")
      .send(xmlContent)
      .set("Content-Type", "application/xml");

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "Invalid XML message",
      errors: ["Invalid XML structure"],
    });
  });

  it("should return 500 if an error occurs during processing", async () => {
    const xmlPath = path.join(
      __dirname,
      "../../../../resources/files/messages",
      "pain.001.001.12.xml",
    );
    const xmlContent = await fs.readFile(xmlPath, "utf-8");

    // Mocking validateXML to throw an error
    messageService.validateXML.mockRejectedValue(
      new Error("Something went wrong"),
    );

    const response = await request(app)
      .post("/messages")
      .send(xmlContent)
      .set("Content-Type", "application/xml");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      message: "An error occurred while processing the message",
      error: "Something went wrong",
    });
  });

  it("should initialize the database correctly", done => {
    db.serialize(() => {
      db.all(
        `SELECT name FROM sqlite_master WHERE type='table' AND name IN ('messages', 'transactions', 'queue')`,
        (err, rows) => {
          expect(err).toBeNull();
          expect(rows.length).toBe(3);
          expect(rows.map(r => r.name)).toEqual(
            expect.arrayContaining(["messages", "transactions", "queue"]),
          );
          done();
        },
      );
    });
  });

  it("should store and retrieve the correct values in the tables", done => {
    const message = {
      msg_id: "123456",
      cre_dt_tm: "2024-09-02T00:00:00Z",
      nb_of_txs: 1,
      ctrl_sum: 1000.0,
      initg_pty_name: "Test Name",
      initg_pty_org_id: "Test Org ID",
      pmt_inf_id: "PMT001",
      pmt_mtd: "TRF",
      svc_lvl: "SEPA",
      reqd_exctn_dt: "2024-09-03",
      dbtr_name: "Debtor Name",
      dbtr_acct_iban: "US12345678901234567890123456",
      dbtr_acct_currency: "USD",
      dbtr_agt_bicfi: "BANKUS33XXX",
    };

    const transaction = {
      end_to_end_id: "E2E123",
      instd_amt: 1000.0,
      instd_amt_currency: "USD",
      xchg_rate_inf_unit_ccy: "USD",
      xchg_rate_inf_xchg_rate: 1.0,
      cdtr_agt_bicfi: "BANKUS33XXX",
      cdtr_acct_iban: "US12345678901234567890123456",
    };

    db.serialize(() => {
      // Insert a message
      db.run(
        `INSERT INTO messages (msg_id, cre_dt_tm, nb_of_txs, ctrl_sum, initg_pty_name, initg_pty_org_id, pmt_inf_id, pmt_mtd, svc_lvl, reqd_exctn_dt, dbtr_name, dbtr_acct_iban, dbtr_acct_currency, dbtr_agt_bicfi) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          message.msg_id,
          message.cre_dt_tm,
          message.nb_of_txs,
          message.ctrl_sum,
          message.initg_pty_name,
          message.initg_pty_org_id,
          message.pmt_inf_id,
          message.pmt_mtd,
          message.svc_lvl,
          message.reqd_exctn_dt,
          message.dbtr_name,
          message.dbtr_acct_iban,
          message.dbtr_acct_currency,
          message.dbtr_agt_bicfi,
        ],
        function (err) {
          expect(err).toBeNull();

          const messageId = this.lastID;

          // Insert a transaction associated with the message
          db.run(
            `INSERT INTO transactions (end_to_end_id, instd_amt, instd_amt_currency, xchg_rate_inf_unit_ccy, xchg_rate_inf_xchg_rate, cdtr_agt_bicfi, cdtr_acct_iban, message_id) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              transaction.end_to_end_id,
              transaction.instd_amt,
              transaction.instd_amt_currency,
              transaction.xchg_rate_inf_unit_ccy,
              transaction.xchg_rate_inf_xchg_rate,
              transaction.cdtr_agt_bicfi,
              transaction.cdtr_acct_iban,
              messageId,
            ],
            function (err) {
              expect(err).toBeNull();

              // Insert a record into the queue associated with the message
              db.run(
                `INSERT INTO queue (message_id, ready_to_forward) VALUES (?, ?)`,
                [messageId, 0],
                function (err) {
                  expect(err).toBeNull();

                  // Verify that the message was inserted correctly
                  db.get(
                    `SELECT * FROM messages WHERE msg_id = ?`,
                    [message.msg_id],
                    (err, row) => {
                      expect(err).toBeNull();
                      expect(row).toBeDefined();
                      expect(row.msg_id).toBe(message.msg_id);
                      expect(row.cre_dt_tm).toBe(message.cre_dt_tm);
                      expect(row.nb_of_txs).toBe(message.nb_of_txs);
                      expect(row.ctrl_sum).toBe(message.ctrl_sum);
                      expect(row.initg_pty_name).toBe(message.initg_pty_name);
                      expect(row.initg_pty_org_id).toBe(
                        message.initg_pty_org_id,
                      );
                      expect(row.pmt_inf_id).toBe(message.pmt_inf_id);
                      expect(row.pmt_mtd).toBe(message.pmt_mtd);
                      expect(row.svc_lvl).toBe(message.svc_lvl);
                      expect(row.reqd_exctn_dt).toBe(message.reqd_exctn_dt);
                      expect(row.dbtr_name).toBe(message.dbtr_name);
                      expect(row.dbtr_acct_iban).toBe(message.dbtr_acct_iban);
                      expect(row.dbtr_acct_currency).toBe(
                        message.dbtr_acct_currency,
                      );
                      expect(row.dbtr_agt_bicfi).toBe(message.dbtr_agt_bicfi);

                      // Verify that the transaction was inserted correctly
                      db.get(
                        `SELECT * FROM transactions WHERE message_id = ?`,
                        [messageId],
                        (err, row) => {
                          expect(err).toBeNull();
                          expect(row).toBeDefined();
                          expect(row.end_to_end_id).toBe(
                            transaction.end_to_end_id,
                          );
                          expect(row.instd_amt).toBe(transaction.instd_amt);
                          expect(row.instd_amt_currency).toBe(
                            transaction.instd_amt_currency,
                          );
                          expect(row.xchg_rate_inf_unit_ccy).toBe(
                            transaction.xchg_rate_inf_unit_ccy,
                          );
                          expect(row.xchg_rate_inf_xchg_rate).toBe(
                            transaction.xchg_rate_inf_xchg_rate,
                          );
                          expect(row.cdtr_agt_bicfi).toBe(
                            transaction.cdtr_agt_bicfi,
                          );
                          expect(row.cdtr_acct_iban).toBe(
                            transaction.cdtr_acct_iban,
                          );

                          // Verify that the queue record was inserted correctly
                          db.get(
                            `SELECT * FROM queue WHERE message_id = ?`,
                            [messageId],
                            (err, row) => {
                              expect(err).toBeNull();
                              expect(row).toBeDefined();
                              expect(row.message_id).toBe(messageId);
                              expect(row.ready_to_forward).toBe(0);
                              done();
                            },
                          );
                        },
                      );
                    },
                  );
                },
              );
            },
          );
        },
      );
    });
  });
});
