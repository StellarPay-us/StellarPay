const { castSEP31 } = require("../src/index");

describe("SEP Converter", () => {
  const message = {
    id: 1,
    msg_id: "S-BU-001",
    cre_dt_tm: "2024-05-04T12:38:00",
    nb_of_txs: 2,
    ctrl_sum: 2000,
    initg_pty_name: "Max Musterman",
    initg_pty_org_id: "123456",
    pmt_inf_id: "X-BA-PAY002",
    pmt_mtd: "TRF",
    svc_lvl: "NORM",
    reqd_exctn_dt: "2024-05-04T14:00:00",
    dbtr_name: "Max Musterman",
    dbtr_acct_iban: "US33XXX1234567890123456789012",
    dbtr_acct_currency: "USD",
    dbtr_agt_bicfi: "BANKUS22",
    transactions: [
      {
        id: 1,
        end_to_end_id: "batch001",
        instd_amt: 1000,
        instd_amt_currency: "USD",
        xchg_rate_inf_unit_ccy: "EUR",
        xchg_rate_inf_xchg_rate: 0.9,
        cdtr_agt_bicfi: "BANKEU11",
        cdtr_acct_iban: "DE89370400440532013000",
      },
      {
        id: 2,
        end_to_end_id: "batch002",
        instd_amt: 1000,
        instd_amt_currency: "USD",
        xchg_rate_inf_unit_ccy: "GBP",
        xchg_rate_inf_xchg_rate: 0.77,
        cdtr_agt_bicfi: "BANKGB22",
        cdtr_acct_iban: "GB29NWBK60161331926819",
      },
    ],
  };

  let result; // Declare result here for reuse in tests

  beforeEach(() => {
    result = castSEP31(message);
  });

  it("should correctly map message header fields", () => {
    expect(result.msg_id).toBe(message.msg_id);
    expect(result.creation_date).toBe(message.cre_dt_tm);
    expect(result.num_of_transactions).toBe(message.nb_of_txs);
    expect(result.control_sum).toBe(message.ctrl_sum);
  });

  it("should correctly map sender details", () => {
    expect(result.sender.name).toBe(message.dbtr_name);
    expect(result.sender.iban).toBe(message.dbtr_acct_iban);
    expect(result.sender.currency).toBe(message.dbtr_acct_currency);
    expect(result.sender.bic).toBe(message.dbtr_agt_bicfi);
  });

  it("should correctly map transactions", () => {
    expect(result.transactions.length).toBe(message.transactions.length);

    message.transactions.forEach((tx, index) => {
      const mappedTx = result.transactions[index];
      expect(mappedTx.transaction_id).toBe(tx.end_to_end_id);
      expect(mappedTx.amount).toBe(tx.instd_amt);
      expect(mappedTx.currency).toBe(tx.instd_amt_currency);
      expect(mappedTx.exchange_rate).toBe(tx.xchg_rate_inf_xchg_rate);
      expect(mappedTx.receiver.bic).toBe(tx.cdtr_agt_bicfi);
      expect(mappedTx.receiver.iban).toBe(tx.cdtr_acct_iban);
      expect(mappedTx.asset.code).toBe(tx.instd_amt_currency);
    });
  });

  it("should default asset issuer to 'Stellar'", () => {
    result.transactions.forEach(tx => {
      expect(tx.asset.issuer).toBe("Stellar");
    });
  });
});
