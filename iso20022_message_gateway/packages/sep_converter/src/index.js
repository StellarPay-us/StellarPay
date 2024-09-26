/**
 * Transforms the provided message head and payment information into a SEP-31 compliant formatted object.
 *
 * @param {Object} message - The message containing the transaction details.
 * @returns {Object} - Returns a SEP-31 compliant object with transaction details.
 */
function castSEP31(message) {
  const sep31Object = {
    msg_id: message.msg_id,
    creation_date: message.cre_dt_tm,
    num_of_transactions: message.nb_of_txs,
    control_sum: message.ctrl_sum,

    sender: {
      name: message.dbtr_name,
      iban: message.dbtr_acct_iban,
      currency: message.dbtr_acct_currency,
      bic: message.dbtr_agt_bicfi,
    },
    transactions: [],
  };

  for (const tx of message.transactions) {
    const transaction = {
      transaction_id: tx.end_to_end_id,
      amount: tx.instd_amt,
      currency: tx.instd_amt_currency,
      exchange_rate: tx.xchg_rate_inf_xchg_rate,

      receiver: {
        bic: tx.cdtr_agt_bicfi,
        iban: tx.cdtr_acct_iban,
      },

      asset: {
        code: tx.instd_amt_currency,
        issuer: "Stellar", // Default asset issuer placeholder
      },
    };

    sep31Object.transactions.push(transaction);
  }

  return sep31Object;
}

module.exports = {
  castSEP31,
};
