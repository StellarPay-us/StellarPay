const db = require('../utils/database');

exports.getAllMessages = () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM messages', [], (err, rows) => {
      if (err) {
        return reject(err);
      }
      resolve(rows);
    });
  });
};