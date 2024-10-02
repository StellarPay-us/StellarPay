const request = require("supertest");
const { server, closeServer } = require("../src/server");
const fs = require("fs").promises;
const path = require("path");
const pain00100112Json = require("../../../../resources/files/messages/pain.001.001.12.json");

describe("Test Gateway Server", () => {
  let jsonData;

  beforeEach(() => {
    jsonData = JSON.parse(JSON.stringify(pain00100112Json));
  });

  afterAll(async () => {
    await closeServer();
  });

  it("should respond to the root path with 404 since no route is defined", async () => {
    const res = await request(server).get("/");
    expect(res.statusCode).toEqual(404);
  });

  it("should return 201 for a valid XML message", async () => {
    const xmlPath = path.join(
      __dirname,
      "../../../../resources/files/messages",
      "pain.001.001.12.xml",
    );
    const xmlContent = await fs.readFile(xmlPath, "utf-8");

    const response = await request(server)
      .post("/messages")
      .send(xmlContent)
      .set("Content-Type", "application/xml");

    expect(response.status).toBe(201);
    expect(response.text).toBe("Message received and processed");
  });

  it("should return 201 for a valid JSON object", async () => {
    const response = await request(server)
      .post("/messages")
      .send(jsonData)
      .set("Content-Type", "application/json");

    expect(response.status).toBe(201);
    expect(response.text).toBe("Message received and processed");
  });

  it("should return 400 for an invalid XML message", async () => {
    const xmlPath = path.join(
      __dirname,
      "../../../../resources/files/messages",
      "errorMessage.xml",
    );
    const xmlContent = await fs.readFile(xmlPath, "utf-8");

    const response = await request(server)
      .post("/messages")
      .send(xmlContent)
      .set("Content-Type", "application/xml");

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual("Invalid XML message");
    expect(response.body.errors.length).toBeGreaterThan(0);
  });

  it("should return 400 for an invalid JSON object", async () => {
    delete jsonData.message.msg_id;

    const response = await request(server)
      .post("/messages")
      .send(jsonData)
      .set("Content-Type", "application/json");

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(
      "Invalid JSON or XML format: Missing or invalid 'msg_id'",
    );
  });
});
