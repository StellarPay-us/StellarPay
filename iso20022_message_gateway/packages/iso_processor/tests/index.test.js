const { validateXML, parseXML } = require("../src/index");
const fs = require("fs");
const path = require("path");

describe("XML Processor Library", () => {
  test("validateXML should return valid for a correct XML file", async () => {
    const xmlPath = path.join(
      __dirname,
      "../../../../resources/files/messages",
      "pain.001.001.12.xml",
    );
    const xsdPath = path.join(
      __dirname,
      "../../../../resources/files/definitions",
      "pain.001.001.12.xsd",
    );

    const data = fs.readFileSync(xmlPath);
    const xsdContent = fs.readFileSync(xsdPath);
    console.log(data.toString());
    const result = await validateXML(data.toString(), xsdContent);

    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  test("validateXML should return errors for an incorrect XML file", async () => {
    const xmlPath = path.join(
      __dirname,
      "../../../../resources/files/messages",
      "errorMessage.xml",
    );
    const xsdPath = path.join(
      __dirname,
      "../../../../resources/files/definitions",
      "pain.001.001.12.xsd",
    );

    const data = fs.readFileSync(xmlPath);
    const xsdContent = fs.readFileSync(xsdPath);
    const result = await validateXML(data.toString(), xsdContent);

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test("parseXML should correctly parse a valid XML message with all required elements", () => {
    const xmlPath = path.join(
      __dirname,
      "../../../../resources/files/messages",
      "pain.001.001.12.xml",
    );
    const data = fs.readFileSync(xmlPath).toString();

    const result = parseXML(data);

    // Test the "message" object (combination of grpHeader and paymentInfo)
    expect(result).toHaveProperty("message");
    expect(result.message).toHaveProperty("msgId");
    expect(result.message).toHaveProperty("creDtTm");
    expect(result.message).toHaveProperty("nbOfTxs");
    expect(result.message).toHaveProperty("ctrlSum");
    expect(result.message.initgPty).toHaveProperty("name");
    expect(result.message.initgPty).toHaveProperty("orgId");
    expect(result.message).toHaveProperty("pmtInfId");
    expect(result.message).toHaveProperty("pmtMtd");
    expect(result.message).toHaveProperty("svcLvl");
    expect(result.message).toHaveProperty("reqdExctnDt");
    expect(result.message.dbtr).toHaveProperty("name");
    expect(result.message.dbtrAcct).toHaveProperty("iban");
    expect(result.message.dbtrAcct).toHaveProperty("currency");
    expect(result.message.dbtrAgt).toHaveProperty("bicfi");

    // Test the "transactions" array
    expect(result).toHaveProperty("transactions");
    expect(result.transactions.length).toBeGreaterThan(0);

    const firstTransaction = result.transactions[0];
    expect(firstTransaction).toHaveProperty("endToEndId");
    expect(firstTransaction).toHaveProperty("instdAmt");
    expect(firstTransaction.instdAmt).toHaveProperty("amount");
    expect(firstTransaction.instdAmt).toHaveProperty("currency");
    expect(firstTransaction).toHaveProperty("xchgRateInf");
    expect(firstTransaction.xchgRateInf).toHaveProperty("unitCcy");
    expect(firstTransaction.xchgRateInf).toHaveProperty("xchgRate");
    expect(firstTransaction).toHaveProperty("cdtrAgt");
    expect(firstTransaction.cdtrAgt).toHaveProperty("bicfi");
    expect(firstTransaction).toHaveProperty("cdtrAcct");
    expect(firstTransaction.cdtrAcct).toHaveProperty("iban");
  });

  test("parseXML should throw an error if any required element or attribute is missing", () => {
    const invalidXmlContent = `
      <Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.12">
          <CstmrCdtTrfInitn>
              <GrpHdr>
                  <MsgId>S-BU-001</MsgId>
                  <CreDtTm>2024-05-04T12:38:00</CreDtTm>
                  <NbOfTxs>1</NbOfTxs>
                  <CtrlSum>1000.00</CtrlSum>
                  <InitgPty>
                      <Nm>Max Musterman</Nm>
                      <Id>123456</Id>
                  </InitgPty>
              </GrpHdr>
              <PmtInf>
                  <PmtInfId>X-BA-PAY002</PmtInfId>
                  <PmtMtd>TRF</PmtMtd>
                  <NbOfTxs>1</NbOfTxs>
                  <CtrlSum>1000.00</CtrlSum>
                  <SvcLvl>
                      <Cd>NORM</Cd>
                  </SvcLvl>
                  <ReqdExctnDt>2024-05-04T14:00:00</ReqdExctnDt>
                  <Dbtr>
                      <Nm>Max Musterman</Nm>
                  </Dbtr>
                  <DbtrAcct>
                      <Id>
                          <IBAN>US33XXX1234567890123456789012</IBAN>
                      </Id>
                      <Ccy>USD</Ccy>
                  </DbtrAcct>
                  <DbtrAgt>
                      <FinInstnId>
                          <BICFI>BANKUS22</BICFI>
                      </FinInstnId>
                  </DbtrAgt>
                  <CdtTrfTxInf>
                      <PmtId>
                          <EndToEndId>batch001</EndToEndId>
                      </PmtId>
                      <Amt>
                          <!-- Missing Ccy attribute -->
                          <InstdAmt>1000.00</InstdAmt>
                      </Amt>
                      <XchgRateInf>
                          <UnitCcy>EUR</UnitCcy>
                          <XchgRate>0.90</XchgRate>
                      </XchgRateInf>
                      <CdtrAgt>
                          <FinInstnId>
                              <BICFI>BANKEU11</BICFI>
                          </FinInstnId>
                      </CdtrAgt>
                      <CdtrAcct>
                          <Id>
                              <IBAN>DE89370400440532013000</IBAN>
                          </Id>
                      </CdtrAcct>
                  </CdtTrfTxInf>
              </PmtInf>
          </CstmrCdtTrfInitn>
      </Document>
    `;

    expect(() => parseXML(invalidXmlContent)).toThrow(
      'Missing or empty attribute "Ccy" in <InstdAmt> element.',
    );
  });

  test("parseXML should throw an error if the XchgRateInf element is missing", () => {
    const invalidXmlContent = `
      <Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.12">
          <CstmrCdtTrfInitn>
              <GrpHdr>
                  <MsgId>S-BU-001</MsgId>
                  <CreDtTm>2024-05-04T12:38:00</CreDtTm>
                  <NbOfTxs>1</NbOfTxs>
                  <CtrlSum>1000.00</CtrlSum>
                  <InitgPty>
                      <Nm>Max Musterman</Nm>
                      <Id>123456</Id>
                  </InitgPty>
              </GrpHdr>
              <PmtInf>
                  <PmtInfId>X-BA-PAY002</PmtInfId>
                  <PmtMtd>TRF</PmtMtd>
                  <NbOfTxs>1</NbOfTxs>
                  <CtrlSum>1000.00</CtrlSum>
                  <SvcLvl>
                      <Cd>NORM</Cd>
                  </SvcLvl>
                  <ReqdExctnDt>2024-05-04T14:00:00</ReqdExctnDt>
                  <Dbtr>
                      <Nm>Max Musterman</Nm>
                  </Dbtr>
                  <DbtrAcct>
                      <Id>
                          <IBAN>US33XXX1234567890123456789012</IBAN>
                      </Id>
                      <Ccy>USD</Ccy>
                  </DbtrAcct>
                  <DbtrAgt>
                      <FinInstnId>
                          <BICFI>BANKUS22</BICFI>
                      </FinInstnId>
                  </DbtrAgt>
                  <CdtTrfTxInf>
                      <PmtId>
                          <EndToEndId>batch001</EndToEndId>
                      </PmtId>
                      <Amt>
                          <InstdAmt Ccy="USD">1000.00</InstdAmt>
                      </Amt>
                      <!-- Missing XchgRateInf block -->
                      <CdtrAgt>
                          <FinInstnId>
                              <BICFI>BANKEU11</BICFI>
                          </FinInstnId>
                      </CdtrAgt>
                      <CdtrAcct>
                          <Id>
                              <IBAN>DE89370400440532013000</IBAN>
                          </Id>
                      </CdtrAcct>
                  </CdtTrfTxInf>
              </PmtInf>
          </CstmrCdtTrfInitn>
      </Document>
    `;

    expect(() => parseXML(invalidXmlContent)).toThrow(
      "Missing <XchgRateInf> block.",
    );
  });
});
