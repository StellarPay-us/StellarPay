const db = require("./database");

/**
 * Logs the current status of messages in the queue that are not yet ready to be forwarded.
 * Fetches messages from the `queue` and associated details from the `messages` table,
 * and logs their status, including the message ID, creation time, transaction count, control sum, etc.
 */
function logQueueStatus() {
  const timestamp = new Date().toISOString(); // Get current timestamp for logging
  console.log(`[${timestamp}] Checking queue...`);

  // SQL query to fetch messages from the queue that are not ready to forward (ready_to_forward = 0)
  db.all(
    `SELECT queue.id, messages.msg_id, messages.cre_dt_tm, messages.nb_of_txs, messages.ctrl_sum, 
            messages.initg_pty_name, messages.initg_pty_org_id
     FROM queue
     JOIN messages ON queue.message_id = messages.id
     WHERE queue.ready_to_forward = 0`,
    (err, rows) => {
      // Handle errors during database query
      if (err) {
        console.error(
          `[${timestamp}] Error fetching messages from queue: ${err.message}`,
        );
        return;
      }

      // Log if no messages are found in the queue
      if (rows.length === 0) {
        console.log(`[${timestamp}] No messages in the queue.`);
      } else {
        // Log details of each message in the queue
        rows.forEach(row => {
          console.log(`[${timestamp}] Message in queue:
        ID: ${row.id}, Msg ID: ${row.msg_id}, Created At: ${row.cre_dt_tm}, 
        Number of Transactions: ${row.nb_of_txs}, Control Sum: ${row.ctrl_sum}, 
        Initiating Party: ${row.initg_pty_name}, Org ID: ${row.initg_pty_org_id}`);
        });
      }
    },
  );
}

module.exports = {
  logQueueStatus,
};
