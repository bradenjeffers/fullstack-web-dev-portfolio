const { expect } = require("chai");
const { app, request, createUser, bearer, newObjectId } = require("./helpers");

// Shared behaviour of the four catalogue resources (categories, cuisines,
// restaurants, food items): admin-only writes, public reads, soft delete.
//   name         e.g. "Category"          (used in response messages)
//   path         e.g. "/api/v1/categories"
//   makePayload  () => a valid create body
//   editPayload  a partial body that changes a field, and the field to check
function describeCrud({ name, path, makePayload, edit }) {
  describe(`${name} APIs`, () => {
    let admin;
    let customer;

    before(async () => {
      admin = await createUser({ isAdmin: true });
      customer = await createUser();
    });

    const create = async (payload = makePayload()) => {
      const res = await request(app).post(path).set(bearer(admin.token)).send(payload);
      expect(res.status, JSON.stringify(res.body)).to.equal(201);
      return res.body.data;
    };

    describe(`POST ${path}`, () => {
      it("creates an item for an admin", async () => {
        const res = await request(app).post(path).set(bearer(admin.token)).send(makePayload());

        expect(res.status).to.equal(201);
        expect(res.body.message).to.equal(`${name} created successfully`);
        expect(res.body.data._id).to.be.a("string");
      });

      it("returns 401 without a token", async () => {
        const res = await request(app).post(path).send(makePayload());
        expect(res.status).to.equal(401);
      });

      it("returns 403 for a non-admin", async () => {
        const res = await request(app).post(path).set(bearer(customer.token)).send(makePayload());
        expect(res.status).to.equal(403);
      });

      it("returns 400 and names the missing fields", async () => {
        const res = await request(app).post(path).set(bearer(admin.token)).send({});
        expect(res.status).to.equal(400);
        expect(res.body.message).to.match(/Missing required fields/);
      });
    });

    describe(`GET ${path}`, () => {
      it("lists active items without authentication", async () => {
        const created = await create();
        const res = await request(app).get(path).expect("Content-Type", /json/);

        expect(res.status).to.equal(200);
        expect(res.body.data).to.be.an("array");
        expect(res.body.data.map((item) => item._id)).to.include(created._id);
        res.body.data.forEach((item) => {
          expect(item.name).to.be.a("string");
          expect(item.image).to.be.a("string");
        });
      });
    });

    describe(`GET ${path}/:id`, () => {
      it("returns one item", async () => {
        const created = await create();
        const res = await request(app).get(`${path}/${created._id}`);

        expect(res.status).to.equal(200);
        expect(res.body.data._id).to.equal(created._id);
      });

      it("returns 404 for an unknown id", async () => {
        const res = await request(app).get(`${path}/${newObjectId()}`);
        expect(res.status).to.equal(404);
        expect(res.body.message).to.equal(`${name} not found`);
      });

      it("returns 400 for a malformed id", async () => {
        const res = await request(app).get(`${path}/not-an-id`);
        expect(res.status).to.equal(400);
      });
    });

    describe(`PUT ${path}/:id`, () => {
      it("updates only the fields that were sent", async () => {
        const payload = makePayload();
        const created = await create(payload);

        const res = await request(app)
          .put(`${path}/${created._id}`)
          .set(bearer(admin.token))
          .send(edit);
        expect(res.status).to.equal(200);
        expect(res.body.message).to.equal(`${name} is successfully edited`);

        const after = await request(app).get(`${path}/${created._id}`);
        Object.entries(edit).forEach(([field, value]) => expect(after.body.data[field]).to.equal(value));
        expect(after.body.data.name).to.equal(edit.name || payload.name);
      });

      it("returns 400 when nothing valid is sent", async () => {
        const created = await create();
        const res = await request(app)
          .put(`${path}/${created._id}`)
          .set(bearer(admin.token))
          .send({ unrelated: "x" });
        expect(res.status).to.equal(400);
      });

      it("returns 404 for an unknown id and 403 for a non-admin", async () => {
        const missing = await request(app).put(`${path}/${newObjectId()}`).set(bearer(admin.token)).send(edit);
        expect(missing.status).to.equal(404);

        const created = await create();
        const forbidden = await request(app).put(`${path}/${created._id}`).set(bearer(customer.token)).send(edit);
        expect(forbidden.status).to.equal(403);
      });
    });

    describe(`DELETE ${path}/:id`, () => {
      it("soft-deletes the item so it is no longer returned", async () => {
        const created = await create();

        const res = await request(app).delete(`${path}/${created._id}`).set(bearer(admin.token));
        expect(res.status).to.equal(200);
        expect(res.body.message).to.equal(`${name} is successfully deleted`);

        const fetched = await request(app).get(`${path}/${created._id}`);
        expect(fetched.status).to.equal(404);

        const again = await request(app).delete(`${path}/${created._id}`).set(bearer(admin.token));
        expect(again.status).to.equal(404);
      });

      it("returns 403 for a non-admin", async () => {
        const created = await create();
        const res = await request(app).delete(`${path}/${created._id}`).set(bearer(customer.token));
        expect(res.status).to.equal(403);
      });
    });
  });
}

module.exports = describeCrud;
