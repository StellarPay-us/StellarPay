/**
 * Transforms the provided message head and payment information into a SEP-31 formatted object.
 *
 * @param {Object} messageHead - The message header containing group header details.
 * @param {Object} paymentInfo - The payment information including debtor and transaction details.
 * @returns {Object} - Returns a SEP-31 compliant object with transaction details.
 */
function castSEP31(messageHead, paymentInfo) {
  const groupHeader = messageHead.groupHeader;

  // Create the SEP-31 object with required fields from groupHeader and paymentInfo
  const sep31Object = {
    msg_id: groupHeader.msgId, // Message ID from group header (GrpHdr)
    creation_date: groupHeader.creDtTm, // Creation Date Time from group header (GrpHdr)
    num_of_transactions: groupHeader.nbOfTxs, // Number of Transactions from group header (GrpHdr)
    control_sum: groupHeader.ctrlSum, // Control Sum from group header (GrpHdr)

    sender: {
      name: paymentInfo.dbtr?.name, // Sender name from Debtor (Dbtr)
      iban: paymentInfo.dbtrAcct?.iban, // Sender IBAN from Debtor Account (DbtrAcct)
      currency: paymentInfo.dbtrAcct?.currency, // Sender currency from Debtor Account (DbtrAcct)
      bic: paymentInfo.dbtrAgt?.bicfi, // Sender BIC from Debtor Agent (DbtrAgt)
    },
    transactions: [], // Array to hold transactions
  };

  // Loop through transactions in paymentInfo and map each transaction to SEP-31 format
  for (let i = 0; i < paymentInfo.transactions.length; i++) {
    const tx = paymentInfo.transactions[i];

    // Construct each SEP-31 transaction object
    const sep31Transaction = {
      transaction_id: tx.endToEndId, // Transaction ID (End-to-End ID) from PmtId
      amount: tx.instdAmt.amount, // Transaction amount from Instructed Amount (InstdAmt)
      currency: tx.instdAmt.currency, // Transaction currency from Instructed Amount (InstdAmt)
      exchange_rate: tx.xchgRateInf?.xchgRate, // Exchange rate from Exchange Rate Info (XchgRateInf)

      sender_bic: paymentInfo.dbtrAgt?.bicfi, // Sender BIC from Debtor Agent (DbtrAgt)

      receiver: {
        name: tx.cdtrAcct.iban, // Receiver name not present, fallback to IBAN
        bic: tx.cdtrAgt.bicfi, // Receiver BIC from Creditor Agent (CdtrAgt)
        iban: tx.cdtrAcct.iban, // Receiver IBAN from Creditor Account (CdtrAcct)
      },
      receiver_bic: tx.cdtrAgt.bicfi, // Receiver BIC from Creditor Agent (CdtrAgt)

      asset: {
        code: tx.instdAmt.currency, // Asset code maps to transaction currency
        issuer: "Stellar", // Default asset issuer placeholder (can be customized)
      },
    };

    // Add the constructed transaction to the SEP-31 object's transactions array
    sep31Object.transactions.push(sep31Transaction);
  }

  return sep31Object;
}

module.exports = {
  castSEP31,
};
