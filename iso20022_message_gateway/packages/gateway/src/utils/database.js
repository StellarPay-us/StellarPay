const sqlite3 = require("sqlite3").verbose();

let dbInstance = null;

const connectDB = DB_PATH => {
  const dbPath = DB_PATH || ":memory:";
  if (!dbInstance) {
    dbInstance = new sqlite3.Database(dbPath, err => {
      if (err) {
        console.error(`Error connecting to SQLite database: ${err.message}`);
      } else {
        console.log("Successfully connected to the SQLite database.");
      }
    });
  }
  return dbInstance;
};

const initializeDB = db => {
  db.run(`PRAGMA foreign_keys = ON`, err => {
    if (err) {
      console.error(`Error enabling foreign keys: ${err.message}`);
    }
  });

  // Queue table to track whether a message is ready to be forwarded
  db.run(
    `CREATE TABLE IF NOT EXISTS queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        msg_id TEXT UNIQUE NOT NULL
    )`,
    err => {
      if (err) {
        console.error(`Error creating queue table: ${err.message}`);
      } else {
        console.log("Queue table created or already exists.");
      }
    },
  );

  // Create the messages table to reflect combined message and payment information
  db.run(
    `CREATE TABLE IF NOT EXISTS messages (
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
        dbtr_agt_bicfi TEXT NOT NULL,
        queue_id INTEGER NOT NULL,
        FOREIGN KEY (queue_id) REFERENCES queue(id) ON DELETE CASCADE
    )`,
    err => {
      if (err) {
        console.error(`Error creating messages table: ${err.message}`);
      } else {
        console.log("Messages table created or already exists.");
      }
    },
  );

  // Create the transactions table to store the transactions related to a message
  db.run(
    `CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        end_to_end_id TEXT NOT NULL,
        instd_amt REAL NOT NULL,
        instd_amt_currency TEXT NOT NULL,
        xchg_rate_inf_unit_ccy TEXT NOT NULL,
        xchg_rate_inf_xchg_rate REAL NOT NULL,
        cdtr_agt_bicfi TEXT NOT NULL,
        cdtr_acct_iban TEXT NOT NULL,
        msg_id TEXT NOT NULL,
        queue_id INTEGER NOT NULL,
        FOREIGN KEY (queue_id) REFERENCES queue(id) ON DELETE CASCADE
    )`,
    err => {
      if (err) {
        console.error(`Error creating transactions table: ${err.message}`);
      } else {
        console.log("Transactions table created or already exists.");
      }
    },
  );
};

module.exports = {
  connectDB,
  initializeDB,
  getInstance: () => {
    if (!dbInstance) {
      throw new Error("Database not initialized yet");
    }
    return dbInstance;
  },
};
