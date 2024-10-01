const { connectDB, initializeDB } = require("../src/utils/database");
const exampleMessage = require("../../../../resources/files/messages/exampleMessage.json");

describe("Test Gateway Database", () => {
  let db;
  beforeAll(() => {
    db = connectDB();
    initializeDB(db);
  });

  afterAll(done => {
    db.close(err => {
      if (err) {
        console.error(`Failed to close DB: ${err.message}`);
      }
      done();
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
    const { message, transaction } = exampleMessage;
    db.run(
      `INSERT INTO queue (msg_id) VALUES (?)`,
      [message.msg_id],
      function (err) {
        expect(err).toBeNull();
        expect(this.lastID).toBeGreaterThan(0);
        const id = this.lastID;
        db.run(
          `INSERT INTO messages 
      (msg_id, cre_dt_tm, nb_of_txs, ctrl_sum, initg_pty_name, initg_pty_org_id, pmt_inf_id, pmt_mtd, svc_lvl, reqd_exctn_dt, dbtr_name, dbtr_acct_iban, dbtr_acct_currency, dbtr_agt_bicfi, queue_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
            id,
          ],
          function (err) {
            expect(err).toBeNull();
            db.run(
              `INSERT INTO transactions (end_to_end_id, instd_amt, instd_amt_currency, xchg_rate_inf_unit_ccy, xchg_rate_inf_xchg_rate, cdtr_agt_bicfi, cdtr_acct_iban, msg_id, queue_id) 
            VALUES (?,?,?,?,?,?,?,?,?)`,
              [
                transaction.end_to_end_id,
                transaction.instd_amt,
                transaction.instd_amt_currency,
                transaction.xchg_rate_inf_unit_ccy,
                transaction.xchg_rate_inf_xchg_rate,
                transaction.cdtr_agt_bicfi,
                transaction.cdtr_acct_iban,
                message.msg_id,
                id,
              ],
              function (err) {
                expect(err).toBeNull();
                db.all("SELECT * FROM queue", [], (err, rows) => {
                  expect(err).toBeNull();
                  expect(rows.length).toBe(1);
                  expect(rows[0].msg_id).toBe("123456");
                  db.all("SELECT * FROM messages", [], (err, rows) => {
                    expect(err).toBeNull();
                    expect(rows.length).toBe(1);
                    expect(rows[0].msg_id).toBe("123456");
                    db.all("SELECT * FROM transactions", [], (err, rows) => {
                      expect(err).toBeNull();
                      expect(rows.length).toBe(1);
                      expect(rows[0].msg_id).toBe("123456");
                      done();
                    });
                  });
                });
              },
            );
          },
        );
      },
    );
  });

  it("should cascade delete the correct message and transactions upon deleting of a message in the queue", done => {
    const { message } = exampleMessage;
    db.run(`DELETE FROM queue WHERE msg_id = ?`, [message.msg_id], err => {
      expect(err).toBeNull();
      db.all("SELECT * FROM queue", [], (err, rows) => {
        expect(err).toBeNull();
        expect(rows.length).toBe(0);
        db.all("SELECT * FROM messages", [], (err, rows) => {
          expect(err).toBeNull();
          expect(rows.length).toBe(0);
          db.all("SELECT * FROM transactions", [], (err, rows) => {
            expect(err).toBeNull();
            expect(rows.length).toBe(0);
            done();
          });
        });
      });
    });
  });
});
