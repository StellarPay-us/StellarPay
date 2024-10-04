const request = require("supertest");
const { server, closeServer } = require("../src/server");

describe("Test Receiver Server", () => {
  afterAll(async () => {
    await closeServer();
  });

  it("should respond to the root path with 404 since no route is defined", async () => {
    const res = await request(server).get("/");
    expect(res.statusCode).toEqual(404);
  });
});
