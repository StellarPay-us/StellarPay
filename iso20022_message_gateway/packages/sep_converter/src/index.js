function castSEP31(messageHead, paymentInfo) {
  const groupHeader = messageHead.groupHeader;

  const sep31Object = {
    msg_id: groupHeader.msgId, // Message ID from grpHeader
    creation_date: groupHeader.creDtTm, // Creation Date Time from grpHeader
    num_of_transactions: groupHeader.nbOfTxs, // Number of Transactions from grpHeader
    control_sum: groupHeader.ctrlSum, // Control Sum from grpHeader

    sender: {
      name: paymentInfo.dbtr.name,
      iban: paymentInfo.dbtrAcct.iban,
      currency: paymentInfo.dbtrAcct.currency,
      bic: paymentInfo.dbtrAgt.bicfi,
    },
    transactions: [],
  };

  for (let i = 0; i < paymentInfo.transactions.length; i++) {
    const tx = paymentInfo.transactions[i];

    const sep31Transaction = {
      transaction_id: tx.endToEndId, // End-to-End ID from PmtId
      amount: tx.instdAmt.amount, // Amount from InstdAmt
      currency: tx.instdAmt.currency, // Currency from InstdAmt (Ccy attribute)
      exchange_rate: tx.xchgRateInf.xchgRate, // Exchange rate from XchgRateInf

      sender_bic: paymentInfo.dbtrAgt.bicfi, // Sender BIC from Debtor Agent (DbtrAgt)

      receiver: {
        name: tx.cdtrAcct.iban, // Assuming Cdtr name not present, fallback to IBAN
        bic: tx.cdtrAgt.bicfi, // Receiver BIC from Creditor Agent (CdtrAgt)
        iban: tx.cdtrAcct.iban, // Receiver IBAN from CdtrAcct
      },
      receiver_bic: tx.cdtrAgt.bicfi, // Receiver BIC from CdtrAgt

      asset: {
        code: tx.instdAmt.currency, // Map currency to asset code
        issuer: "Stellar", // Default issuer placeholder (customizable)
      },
    };

    sep31Object.transactions.push(sep31Transaction);
  }

  return sep31Object;
}

module.exports = {
  castSEP31,
};
