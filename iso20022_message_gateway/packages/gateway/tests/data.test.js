const fs = require("fs");
const path = require("path");
const { convertJSONToXML } = require("../src/utils/jsonToXML");
const { validateXML } = require("../../iso_processor/src/index");
const pain00100112Json = require("../../../../resources/files/messages/pain.001.001.12.json");

describe("Test Data Handling", () => {
  let jsonData;

  beforeEach(() => {
    jsonData = JSON.parse(JSON.stringify(pain00100112Json));
  });

  it("should convert a valid JSON object into valid XML format", async () => {
    const data = convertJSONToXML(jsonData);

    const xsdPath = path.join(
      __dirname,
      "../../../../resources/files/definitions",
      "pain.001.001.12.xsd",
    );

    const xsdContent = fs.readFileSync(xsdPath);
    const result = await validateXML(data, xsdContent);

    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it("should correctly handle missing 'msg_id' in the JSON object", () => {
    delete jsonData.message.msg_id;

    expect(() => {
      convertJSONToXML(jsonData);
    }).toThrowError("Missing or invalid 'msg_id'");
  });

  it("should correctly handle missing 'end_to_end_id' in the JSON object", () => {
    delete jsonData.transactions[0].end_to_end_id;

    expect(() => {
      convertJSONToXML(jsonData);
    }).toThrowError("Missing or invalid 'end_to_end_id'");
  });
});
