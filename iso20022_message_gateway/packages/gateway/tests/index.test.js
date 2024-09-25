const request = require("supertest");
const app = require("../src/app");
const fs = require("fs").promises;
const path = require("path");
const messageService = require("../src/services/isoProcessor");

// Mocking the messageService.validateXML function
jest.mock("../src/services/isoProcessor");

describe("POST /messages", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // it("should return 201 for a valid XML message", async () => {
  //   const xmlPath = path.join(
  //     __dirname,
  //     "../../../../resources/files/messages",
  //     "pain.001.001.12.xml",
  //   );
  //   const xmlContent = await fs.readFile(xmlPath, "utf-8");

  //   // Mocking validateXML to return a valid response
  //   messageService.validateXML.mockResolvedValue({ valid: true, errors: [] });

  //   const response = await request(app)
  //     .post("/messages")
  //     .send(xmlContent)
  //     .set("Content-Type", "application/xml");

  //   expect(response.status).toBe(201);
  //   expect(response.text).toBe("Message received and processed");
  // });

  it("should return 400 for an invalid XML message", async () => {
    const xmlPath = path.join(
      __dirname,
      "../../../../resources/files/messages",
      "errorMessage.xml",
    );
    const xmlContent = await fs.readFile(xmlPath, "utf-8");

    // Mocking validateXML to return an invalid response
    messageService.validateXML.mockResolvedValue({
      valid: false,
      errors: ["Invalid XML structure"],
    });

    const response = await request(app)
      .post("/messages")
      .send(xmlContent)
      .set("Content-Type", "application/xml");

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "Invalid XML message",
      errors: ["Invalid XML structure"],
    });
  });

  it("should return 500 if an error occurs during processing", async () => {
    const xmlPath = path.join(
      __dirname,
      "../../../../resources/files/messages",
      "pain.001.001.12.xml",
    );
    const xmlContent = await fs.readFile(xmlPath, "utf-8");

    // Mocking validateXML to throw an error
    messageService.validateXML.mockRejectedValue(
      new Error("Something went wrong"),
    );

    const response = await request(app)
      .post("/messages")
      .send(xmlContent)
      .set("Content-Type", "application/xml");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      message: "An error occurred while processing the message",
      error: "Something went wrong",
    });
  });
});
