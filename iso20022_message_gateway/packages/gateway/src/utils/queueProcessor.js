/**
 * Fetches messages from the `queue`.
 */
function logQueueStatus(db) {
  const timestamp = new Date().toISOString(); 
  console.log(`[${timestamp}] Checking queue...`);

  db.all("SELECT * FROM queue", [], (err, rows) => {
    if (err) {
      console.error(`[${timestamp}], failed fetching messages in queue!`);
    } else {
      if (rows && rows.length > 0) {
        console.log(rows[0].msg_id);
      }
    }
  });
}

module.exports = {
  logQueueStatus,
};
