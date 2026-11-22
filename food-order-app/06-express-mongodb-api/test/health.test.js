const { expect } = require("chai");
const { app, request } = require("./helpers");

describe("Health and routing", () => {
  it("GET /PING answers PONG", async () => {
    const res = await request(app).get("/PING");
    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal("PONG");
  });

  it("GET /health reports the database as connected", async () => {
    const res = await request(app).get("/health");
    expect(res.status).to.equal(200);
    expect(res.body.status).to.equal("ok");
    expect(res.body.database).to.equal("connected");
  });

  it("returns a JSON 404 for unknown routes", async () => {
    const res = await request(app).get("/api/v1/nope");
    expect(res.status).to.equal(404);
    expect(res.body.message).to.match(/Route not found/);
  });

  it("returns a JSON 400 for malformed JSON bodies", async () => {
    const res = await request(app)
      .post("/api/v1/users/login")
      .set("Content-Type", "application/json")
      .send("{not json");
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property("message");
  });
});
