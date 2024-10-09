const exampleMessage = require('../../resources/files/messages/exampleSEP31.json');
const { parseTransaction } = require('../src/utils/sep31Parser'); 

describe("Test Sender Parser", () => {
  it("should parse a message object into the create disbursement object and initiate disbursement file", () => {
    const result = parseTransaction(exampleMessage);

    const expectedDisbursement = {
      name: "Max Musterman",
      wallet_id: "US33XXX1234567890123456789012",
      asset_id: "USD",
      country_code: "US"
    };

    const expectedCsvContent = "phone,id,amount,verification\n" +
      "BANKEU11,DE89370400440532013000,1000,batch001\n" +
      "BANKGB22,GB29NWBK60161331926819,1000,batch002";

    expect(result.disbursement).toEqual(expectedDisbursement);

    result.csvFile.text().then((csvContent) => {
      // Trim the content to avoid the trailing newline mismatch
      expect(csvContent.trim()).toBe(expectedCsvContent.trim());
    });
  });
});
