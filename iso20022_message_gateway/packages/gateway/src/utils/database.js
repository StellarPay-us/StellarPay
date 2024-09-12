const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(":memory:");

db.serialize(() => {
  // Create the messages table to reflect combined message and payment information
  db.run(`CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        msg_id TEXT UNIQUE NOT NULL,
        cre_dt_tm TEXT NOT NULL,
        nb_of_txs INTEGER NOT NULL,
        ctrl_sum REAL NOT NULL,
        initg_pty_name TEXT NOT NULL,
        initg_pty_org_id TEXT NOT NULL,
        pmt_inf_id TEXT NOT NULL,
        pmt_mtd TEXT NOT NULL,
        svc_lvl TEXT NOT NULL,
        reqd_exctn_dt TEXT NOT NULL,
        dbtr_name TEXT NOT NULL,
        dbtr_acct_iban TEXT NOT NULL,
        dbtr_acct_currency TEXT NOT NULL,
        dbtr_agt_bicfi TEXT NOT NULL
    )`);

  // Create the transactions table to store the transactions related to a message
  db.run(`CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        end_to_end_id TEXT NOT NULL,
        instd_amt REAL NOT NULL,
        instd_amt_currency TEXT NOT NULL,
        xchg_rate_inf_unit_ccy TEXT NOT NULL,
        xchg_rate_inf_xchg_rate REAL NOT NULL,
        cdtr_agt_bicfi TEXT NOT NULL,
        cdtr_acct_iban TEXT NOT NULL,
        message_id INTEGER NOT NULL,
        FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
    )`);

  // Queue table to track whether a message is ready to be forwarded
  db.run(`CREATE TABLE IF NOT EXISTS queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        message_id INTEGER NOT NULL,
        ready_to_forward INTEGER DEFAULT 0,
        FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
    )`);
});

module.exports = db;
