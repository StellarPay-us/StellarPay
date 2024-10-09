const parseTransaction = message => {
  const csvRows = [["phone", "id", "amount", "verification"]];

  const disbursement = {
    name: message.sender.name,
    wallet_id: message.sender.iban,
    asset_id: message.sender.currency,
    country_code: message.sender.iban.slice(0, 2), // Extract country code from sender's IBAN
  };

  message.transactions.forEach(tx => {
    csvRows.push([
      tx.receiver.bic,
      tx.receiver.iban,
      tx.amount,
      tx.transaction_id,
    ]);
  });

  // Convert CSV rows to binary
  const csvContent = csvRows.map(row => row.join(",")).join("\n");
  const csvBlob = new Blob([csvContent], { type: "text/csv" });

  return {
    disbursement,
    csvFile: csvBlob,
  };
};

module.exports = {
  parseTransaction,
};
