const { castSEP31 } = require("../src/index");

describe("SEP Converter", () => {
  const mockMessageHead = {
    groupHeader: {
      msgId: "MSG12345",
      creDtTm: "2023-09-01T12:00:00",
      nbOfTxs: "1",
      ctrlSum: "1000.00",
      initgPty: {
        name: "Test Initiator",
        orgId: "ORG123",
      },
    },
  };

  const mockPaymentInfo = {
    pmtInfId: "PMT123",
    pmtMtd: "TRF",
    nbOfTxs: "1",
    ctrlSum: "1000.00",
    svcLvl: "SEPA",
    reqdExctnDt: "2023-09-02",
    dbtr: { name: "Debtor Name" },
    dbtrAcct: { iban: "DE89370400440532013000", currency: "EUR" },
    dbtrAgt: { bicfi: "DEUTDEFF" },
    transactions: [
      {
        endToEndId: "E2E12345",
        instdAmt: { amount: "1000.00", currency: "EUR" },
        xchgRateInf: { unitCcy: "EUR", xchgRate: "1.00" },
        cdtrAgt: { bicfi: "NDEAFIHH" },
        cdtrAcct: { iban: "FI2112345600000785" },
      },
    ],
  };

  test("should handle missing exchange rate", () => {
    const noExchangeRatePaymentInfo = {
      ...mockPaymentInfo,
      transactions: [
        {
          endToEndId: "E2E12347",
          instdAmt: { amount: "2000.00", currency: "GBP" },
          xchgRateInf: null, // No exchange rate info
          cdtrAgt: { bicfi: "HSBCGB2L" },
          cdtrAcct: { iban: "GB33BUKB20201555555555" },
        },
      ],
    };
  
    const sep31Object = castSEP31(mockMessageHead, noExchangeRatePaymentInfo);
    expect(sep31Object.transactions[0].exchange_rate).toBeUndefined();
    expect(sep31Object.transactions[0].amount).toBe("2000.00");
    expect(sep31Object.transactions[0].currency).toBe("GBP");
    expect(sep31Object.transactions[0].receiver.iban).toBe(
      "GB33BUKB20201555555555"
    );
  });
  
  test("should handle missing debtor information", () => {
    const missingDebtorInfo = {
      ...mockPaymentInfo,
      dbtr: null, // Missing debtor info
      dbtrAcct: null, // Missing debtor account info
      dbtrAgt: null, // Missing debtor agent info
    };
  
    const sep31Object = castSEP31(mockMessageHead, missingDebtorInfo);
    expect(sep31Object.sender).toEqual({
      name: undefined,
      iban: undefined,
      currency: undefined,
      bic: undefined,
    });
  });
  
  test("should handle missing creditor account IBAN", () => {
    const missingCreditorIBAN = {
      ...mockPaymentInfo,
      transactions: [
        {
          endToEndId: "E2E12348",
          instdAmt: { amount: "1500.00", currency: "JPY" },
          xchgRateInf: { unitCcy: "JPY", xchgRate: "130.50" },
          cdtrAgt: { bicfi: "MUFGJPJT" },
          cdtrAcct: { iban: null }, // Missing IBAN
        },
      ],
    };
  
    const sep31Object = castSEP31(mockMessageHead, missingCreditorIBAN);
    expect(sep31Object.transactions[0].receiver.iban).toBeNull();
    expect(sep31Object.transactions[0].amount).toBe("1500.00");
    expect(sep31Object.transactions[0].currency).toBe("JPY");
  });
  
  test("should handle empty transactions array", () => {
    const emptyTransactions = {
      ...mockPaymentInfo,
      transactions: [], // No transactions
    };
  
    const sep31Object = castSEP31(mockMessageHead, emptyTransactions);
    expect(sep31Object.transactions.length).toBe(0);
  });
  
  test("should correctly handle control sum mismatch", () => {
    const controlSumMismatch = {
      ...mockPaymentInfo,
      ctrlSum: "1500.00", // Control sum different from transaction total
      transactions: [
        {
          endToEndId: "E2E12349",
          instdAmt: { amount: "1000.00", currency: "EUR" },
          xchgRateInf: { unitCcy: "EUR", xchgRate: "1.00" },
          cdtrAgt: { bicfi: "DEUTDEFF" },
          cdtrAcct: { iban: "DE89370400440532013000" },
        },
      ],
    };
  
    const sep31Object = castSEP31(mockMessageHead, controlSumMismatch);
    expect(sep31Object.control_sum).toBe("1000.00"); // Matches transaction total, not provided control sum
  });
});
