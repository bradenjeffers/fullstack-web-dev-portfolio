const { expect } = require("chai");
const describeCrud = require("./crudSuite");
const { app, request, createUser, bearer, uniqueName, newObjectId } = require("./helpers");

const makeFooditem = (overrides = {}) => ({
  name: uniqueName("fooditem"),
  description: "Cheesy goodness",
  image: "https://example.com/pizza.jpg",
  isVeg: true,
  cuisineId: newObjectId(),
  categoryId: newObjectId(),
  ...overrides,
});

describeCrud({
  name: "Fooditem",
  path: "/api/v1/fooditems",
  makePayload: makeFooditem,
  edit: { description: "Now with extra cheese" },
});

describe("Fooditem specifics", () => {
  let admin;

  before(async () => {
    admin = await createUser({ isAdmin: true });
  });

  it("accepts isVeg: false (falsy but present)", async () => {
    const res = await request(app)
      .post("/api/v1/fooditems")
      .set(bearer(admin.token))
      .send(makeFooditem({ isVeg: false }));
    expect(res.status).to.equal(201);
    expect(res.body.data.isVeg).to.equal(false);
  });

  it("can switch isVeg to false on edit", async () => {
    const created = await request(app).post("/api/v1/fooditems").set(bearer(admin.token)).send(makeFooditem());
    const id = created.body.data._id;

    await request(app).put(`/api/v1/fooditems/${id}`).set(bearer(admin.token)).send({ isVeg: false });
    const after = await request(app).get(`/api/v1/fooditems/${id}`);
    expect(after.body.data.isVeg).to.equal(false);
  });

  it("rejects a category or cuisine id that is not a valid ObjectId", async () => {
    const res = await request(app)
      .post("/api/v1/fooditems")
      .set(bearer(admin.token))
      .send(makeFooditem({ categoryId: "not-an-id" }));
    expect(res.status).to.equal(400);
  });
});
