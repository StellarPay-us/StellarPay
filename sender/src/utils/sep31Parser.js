const parseTransaction = message => {
  // Initialize a 2D array to hold CSV rows, starting with the header
  const csvRows = [["phone", "id", "amount", "verification"]];

  // Create an object to hold disbursement details from the message sender
  const disbursement = {
    name: message.sender.name, // Sender's name
    wallet_id: message.sender.iban, // Sender's IBAN as wallet ID
    asset_id: message.sender.currency, // Sender's currency as asset ID
    country_code: message.sender.iban.slice(0, 2), // Extract country code from sender's IBAN (first 2 characters)
  };

  // Iterate over each transaction in the message
  message.transactions.forEach(tx => {
    // Push transaction details into the csvRows array
    csvRows.push([
      tx.receiver.bic, // Receiver's BIC (Bank Identifier Code)
      tx.receiver.iban, // Receiver's IBAN (International Bank Account Number)
      tx.amount, // Transaction amount
      tx.transaction_id, // Transaction ID
    ]);
  });

  // Convert the array of CSV rows into a single CSV string
  const csvContent = csvRows.map(row => row.join(",")).join("\n");
  
  // Create a new Blob object to represent the CSV content as a file
  const csvBlob = new Blob([csvContent], { type: "text/csv" });

  // Return an object containing the disbursement details and the CSV file
  return {
    disbursement,
    csvFile: csvBlob, // The CSV file as a Blob
  };
};

// Export the parseTransaction function for use in other modules
module.exports = {
  parseTransaction,
};
