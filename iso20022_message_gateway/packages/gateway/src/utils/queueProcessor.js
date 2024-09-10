const db = require('./database'); 

function logQueueStatus() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Checking queue...`);

  db.all(`SELECT queue.id, messages.msg_id, messages.cre_dt_tm, messages.nb_of_txs, messages.ctrl_sum, 
                 messages.initg_pty_name, messages.initg_pty_org_id
          FROM queue
          JOIN messages ON queue.message_id = messages.id
          WHERE queue.ready_to_forward = 0`, (err, rows) => {
    if (err) {
      console.error(`[${timestamp}] Error fetching messages from queue: ${err.message}`);
      return;
    }

    if (rows.length === 0) {
      console.log(`[${timestamp}] No messages in the queue.`);
    } else {
      rows.forEach((row) => {
        console.log(`[${timestamp}] Message in queue:
        ID: ${row.id}, Msg ID: ${row.msg_id}, Created At: ${row.cre_dt_tm}, 
        Number of Transactions: ${row.nb_of_txs}, Control Sum: ${row.ctrl_sum}, 
        Initiating Party: ${row.initg_pty_name}, Org ID: ${row.initg_pty_org_id}`);
      });
    }
  });
}

module.exports = {
  logQueueStatus,
};
