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

  test("should convert ISO20022 message to SEP-31 format", () => {
    const sep31Object = castSEP31(mockMessageHead, mockPaymentInfo);
    expect(sep31Object.msg_id).toBe("MSG12345");
    expect(sep31Object.creation_date).toBe("2023-09-01T12:00:00");
    expect(sep31Object.num_of_transactions).toBe("1");
    expect(sep31Object.control_sum).toBe("1000.00");
    expect(sep31Object.sender.name).toBe("Debtor Name");
    expect(sep31Object.sender.iban).toBe("DE89370400440532013000");
    expect(sep31Object.transactions.length).toBe(1);
    expect(sep31Object.transactions[0].transaction_id).toBe("E2E12345");
    expect(sep31Object.transactions[0].amount).toBe("1000.00");
    expect(sep31Object.transactions[0].currency).toBe("EUR");
    expect(sep31Object.transactions[0].exchange_rate).toBe("1.00");
    expect(sep31Object.transactions[0].receiver.iban).toBe(
      "FI2112345600000785",
    );
  });

  test("should handle multiple transactions", () => {
    const multiTransactionPaymentInfo = {
      ...mockPaymentInfo,
      transactions: [
        ...mockPaymentInfo.transactions,
        {
          endToEndId: "E2E12346",
          instdAmt: { amount: "500.00", currency: "USD" },
          xchgRateInf: { unitCcy: "USD", xchgRate: "1.10" },
          cdtrAgt: { bicfi: "BOFAUS3N" },
          cdtrAcct: { iban: "US1234567890123456" },
        },
      ],
    };
    const sep31Object = castSEP31(mockMessageHead, multiTransactionPaymentInfo);
    expect(sep31Object.transactions.length).toBe(2);
    expect(sep31Object.transactions[1].transaction_id).toBe("E2E12346");
    expect(sep31Object.transactions[1].amount).toBe("500.00");
    expect(sep31Object.transactions[1].currency).toBe("USD");
    expect(sep31Object.transactions[1].exchange_rate).toBe("1.10");
    expect(sep31Object.transactions[1].receiver.iban).toBe(
      "US1234567890123456",
    );
  });
});
