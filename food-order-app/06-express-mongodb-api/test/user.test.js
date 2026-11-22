const { expect } = require("chai");
const { app, request, runtimeFlags, createUser, bearer, uniqueName, newObjectId, PASSWORD } = require("./helpers");
const UserModel = require("../app/models/userModel");

describe("User APIs", () => {
  let admin;
  let customer;

  before(async () => {
    admin = await createUser({ isAdmin: true });
    customer = await createUser();
  });

  describe("POST /api/v1/users (register)", () => {
    const payload = () => {
      const username = uniqueName("reg");
      return { username, fullname: "Reg User", email: `${username}@example.com`, password: PASSWORD };
    };

    it("registers a user and never returns the password", async () => {
      const body = payload();
      const res = await request(app).post("/api/v1/users").send(body);

      expect(res.status).to.equal(201);
      expect(res.body.message).to.equal("User is successfully registered");
      expect(res.body.data.username).to.equal(body.username);
      expect(res.body.data).to.not.have.property("password");
    });

    it("stores a bcrypt hash, not the plaintext password", async () => {
      const body = payload();
      await request(app).post("/api/v1/users").send(body);

      const stored = await UserModel.findOne({ username: body.username });
      expect(stored.password).to.not.equal(body.password);
      expect(stored.password).to.match(/^\$2[aby]\$/);
    });

    it("rejects a duplicate username with 409", async () => {
      const body = payload();
      await request(app).post("/api/v1/users").send(body);
      const res = await request(app).post("/api/v1/users").send(body);

      expect(res.status).to.equal(409);
      expect(res.body.message).to.equal("User already exists");
    });

    it("rejects missing fields, short passwords and bad emails with 400", async () => {
      const missing = await request(app).post("/api/v1/users").send({ username: uniqueName("x") });
      expect(missing.status).to.equal(400);

      const shortPassword = await request(app)
        .post("/api/v1/users")
        .send({ ...payload(), password: "short" });
      expect(shortPassword.status).to.equal(400);

      const badEmail = await request(app)
        .post("/api/v1/users")
        .send({ ...payload(), email: "not-an-email" });
      expect(badEmail.status).to.equal(400);
    });

    it("ignores isAdmin when admin sign-up is disabled", async () => {
      runtimeFlags.allowAdminSignup = false;
      try {
        const body = { ...payload(), isAdmin: true };
        const res = await request(app).post("/api/v1/users").send(body);

        expect(res.status).to.equal(201);
        expect(res.body.data.isAdmin).to.equal(false);
      } finally {
        runtimeFlags.allowAdminSignup = true;
      }
    });
  });

  describe("POST /api/v1/users/login", () => {
    it("logs in with valid credentials and returns a session token", async () => {
      const res = await request(app)
        .post("/api/v1/users/login")
        .send({ username: customer.username, password: customer.password });

      expect(res.status).to.equal(200);
      expect(res.body.message).to.equal("User logged in successfully");
      expect(res.body.data.sessionToken).to.be.a("string");
      expect(res.body.data).to.not.have.property("password");
    });

    it("gives the same 401 for a wrong password and an unknown user", async () => {
      const wrongPassword = await request(app)
        .post("/api/v1/users/login")
        .send({ username: customer.username, password: "wrong-password" });
      const unknownUser = await request(app)
        .post("/api/v1/users/login")
        .send({ username: uniqueName("ghost"), password: PASSWORD });

      expect(wrongPassword.status).to.equal(401);
      expect(unknownUser.status).to.equal(401);
      expect(wrongPassword.body.message).to.equal("Invalid username or password");
      expect(unknownUser.body.message).to.equal(wrongPassword.body.message);
    });

    it("rejects non-string credentials with 400", async () => {
      const res = await request(app)
        .post("/api/v1/users/login")
        .send({ username: { $ne: "" }, password: { $ne: "" } });
      expect(res.status).to.equal(400);
    });
  });

  describe("GET /api/v1/users", () => {
    it("lets an admin list users without password fields", async () => {
      const res = await request(app).get("/api/v1/users").set(bearer(admin.token));

      expect(res.status).to.equal(200);
      expect(res.body.users).to.be.an("array").that.is.not.empty;
      res.body.users.forEach((user) => {
        expect(user.username).to.be.a("string");
        expect(user.fullname).to.be.a("string");
        expect(user.isAdmin).to.be.a("boolean");
        expect(user).to.not.have.property("password");
      });
    });

    it("returns 403 for a non-admin and 401 without a token", async () => {
      const forbidden = await request(app).get("/api/v1/users").set(bearer(customer.token));
      expect(forbidden.status).to.equal(403);

      const anonymous = await request(app).get("/api/v1/users");
      expect(anonymous.status).to.equal(401);
    });

    it("rejects a malformed or forged token with 401", async () => {
      const res = await request(app).get("/api/v1/users").set(bearer("not.a.token"));
      expect(res.status).to.equal(401);
    });
  });

  describe("GET /api/v1/users/:id", () => {
    it("lets a user read their own record", async () => {
      const res = await request(app).get(`/api/v1/users/${customer.id}`).set(bearer(customer.token));
      expect(res.status).to.equal(200);
      expect(res.body.username).to.equal(customer.username);
      expect(res.body).to.not.have.property("password");
    });

    it("blocks reading someone else's record unless admin", async () => {
      const denied = await request(app).get(`/api/v1/users/${admin.id}`).set(bearer(customer.token));
      expect(denied.status).to.equal(403);

      const allowed = await request(app).get(`/api/v1/users/${customer.id}`).set(bearer(admin.token));
      expect(allowed.status).to.equal(200);
    });

    it("returns 404 for an unknown id (admin)", async () => {
      const res = await request(app).get(`/api/v1/users/${newObjectId()}`).set(bearer(admin.token));
      expect(res.status).to.equal(404);
    });
  });

  describe("PUT /api/v1/users/:id", () => {
    it("updates the caller's own profile", async () => {
      const user = await createUser();
      const res = await request(app)
        .put(`/api/v1/users/${user.id}`)
        .set(bearer(user.token))
        .send({ fullname: "Renamed User" });
      expect(res.status).to.equal(200);

      const after = await request(app).get(`/api/v1/users/${user.id}`).set(bearer(user.token));
      expect(after.body.fullname).to.equal("Renamed User");
    });

    it("does not let a non-admin promote themselves", async () => {
      const user = await createUser();
      await request(app)
        .put(`/api/v1/users/${user.id}`)
        .set(bearer(user.token))
        .send({ fullname: "Still Customer", isAdmin: true });

      const after = await request(app).get(`/api/v1/users/${user.id}`).set(bearer(user.token));
      expect(after.body.isAdmin).to.equal(false);
    });

    it("blocks editing another user", async () => {
      const res = await request(app)
        .put(`/api/v1/users/${admin.id}`)
        .set(bearer(customer.token))
        .send({ fullname: "Hijacked" });
      expect(res.status).to.equal(403);
    });

    it("hashes a changed password and accepts it at login", async () => {
      const user = await createUser();
      const newPassword = "a-brand-new-password";
      const update = await request(app)
        .put(`/api/v1/users/${user.id}`)
        .set(bearer(user.token))
        .send({ password: newPassword });
      expect(update.status).to.equal(200);

      const oldLogin = await request(app)
        .post("/api/v1/users/login")
        .send({ username: user.username, password: user.password });
      expect(oldLogin.status).to.equal(401);

      const newLogin = await request(app)
        .post("/api/v1/users/login")
        .send({ username: user.username, password: newPassword });
      expect(newLogin.status).to.equal(200);
    });

    it("returns 400 when there is nothing valid to update", async () => {
      const res = await request(app)
        .put(`/api/v1/users/${customer.id}`)
        .set(bearer(customer.token))
        .send({});
      expect(res.status).to.equal(400);
    });
  });

  describe("PUT /api/v1/users/logout", () => {
    it("ends the session so the token stops working", async () => {
      const user = await createUser();

      const logout = await request(app).put("/api/v1/users/logout").set(bearer(user.token));
      expect(logout.status).to.equal(200);
      expect(logout.body.message).to.equal("User is successfully logged out.");

      const reuse = await request(app).get(`/api/v1/users/${user.id}`).set(bearer(user.token));
      expect(reuse.status).to.equal(401);
    });
  });

  describe("DELETE /api/v1/users/:id", () => {
    it("lets an admin deactivate a user, who can then no longer log in", async () => {
      const user = await createUser();

      const res = await request(app).delete(`/api/v1/users/${user.id}`).set(bearer(admin.token));
      expect(res.status).to.equal(200);

      const oldToken = await request(app).get(`/api/v1/users/${user.id}`).set(bearer(user.token));
      expect(oldToken.status).to.equal(401);

      const login = await request(app)
        .post("/api/v1/users/login")
        .send({ username: user.username, password: user.password });
      expect(login.status).to.equal(401);
    });

    it("is forbidden for non-admins and 404 for unknown ids", async () => {
      const forbidden = await request(app).delete(`/api/v1/users/${admin.id}`).set(bearer(customer.token));
      expect(forbidden.status).to.equal(403);

      const missing = await request(app).delete(`/api/v1/users/${newObjectId()}`).set(bearer(admin.token));
      expect(missing.status).to.equal(404);
    });
  });
});
