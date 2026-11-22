const { expect } = require("chai");
const { app, request, createUser, bearer, newObjectId } = require("./helpers");

describe("Order APIs", () => {
  let admin;
  let customer;
  let otherCustomer;
  let orderId;

  const orderBody = (overrides = {}) => ({
    restaurantId: newObjectId(),
    orderTotalPrice: 31.5,
    fooditems: [{ fooditemId: newObjectId(), price: 10.5, units: 3 }],
    shippingDetails: { address: "1 Order Street", phoneNo: 5551112222, emailId: "buyer@example.com" },
    ...overrides,
  });

  before(async () => {
    admin = await createUser({ isAdmin: true });
    customer = await createUser();
    otherCustomer = await createUser();
  });

  describe("POST /api/v1/orders", () => {
    it("requires authentication", async () => {
      const res = await request(app).post("/api/v1/orders").send(orderBody());
      expect(res.status).to.equal(401);
    });

    it("places an order for the authenticated user, ignoring any userId in the body", async () => {
      const res = await request(app)
        .post("/api/v1/orders")
        .set(bearer(customer.token))
        .send(orderBody({ userId: otherCustomer.id }));

      expect(res.status).to.equal(201);
      expect(res.body.message).to.equal("Order is successfully placed");
      orderId = res.body.data.orderId;

      const detail = await request(app)
        .get(`/api/v1/orders/${customer.id}/${orderId}`)
        .set(bearer(customer.token));
      expect(detail.status).to.equal(200);
      expect(detail.body.orderDetail.userId).to.equal(customer.id);
      expect(detail.body.orderDetail.status).to.equal("PROCESSING");
    });

    it("validates the body", async () => {
      const send = (body) => request(app).post("/api/v1/orders").set(bearer(customer.token)).send(body);

      expect((await send({})).status).to.equal(400);
      expect((await send(orderBody({ orderTotalPrice: "free" }))).status).to.equal(400);
      expect((await send(orderBody({ fooditems: [] }))).status).to.equal(400);
      expect((await send(orderBody({ shippingDetails: { address: "only address" } }))).status).to.equal(400);
    });
  });

  describe("GET order history", () => {
    it("shows a user their own orders", async () => {
      const res = await request(app).get(`/api/v1/orders/${customer.id}`).set(bearer(customer.token));
      expect(res.status).to.equal(200);
      expect(res.body.orderHistory.map((o) => o._id)).to.include(orderId);
    });

    it("blocks reading another user's orders, but allows an admin", async () => {
      const denied = await request(app).get(`/api/v1/orders/${customer.id}`).set(bearer(otherCustomer.token));
      expect(denied.status).to.equal(403);

      const deniedDetail = await request(app)
        .get(`/api/v1/orders/${customer.id}/${orderId}`)
        .set(bearer(otherCustomer.token));
      expect(deniedDetail.status).to.equal(403);

      const allowed = await request(app).get(`/api/v1/orders/${customer.id}`).set(bearer(admin.token));
      expect(allowed.status).to.equal(200);
    });

    it("returns 404 for an order that does not exist", async () => {
      const res = await request(app)
        .get(`/api/v1/orders/${customer.id}/${newObjectId()}`)
        .set(bearer(customer.token));
      expect(res.status).to.equal(404);
    });

    it("lets only an admin list every order", async () => {
      const denied = await request(app).get("/api/v1/orders").set(bearer(customer.token));
      expect(denied.status).to.equal(403);

      const res = await request(app).get("/api/v1/orders").set(bearer(admin.token));
      expect(res.status).to.equal(200);
      expect(res.body.orders.map((o) => o._id)).to.include(orderId);
    });
  });

  describe("PUT /api/v1/orders/:orderId", () => {
    it("lets an admin change the status", async () => {
      const res = await request(app)
        .put(`/api/v1/orders/${orderId}`)
        .set(bearer(admin.token))
        .send({ newStatus: "DELIVERED" });
      expect(res.status).to.equal(200);
      expect(res.body.message).to.equal("Order status is changed successfully.");

      const detail = await request(app)
        .get(`/api/v1/orders/${customer.id}/${orderId}`)
        .set(bearer(customer.token));
      expect(detail.body.orderDetail.status).to.equal("DELIVERED");
    });

    it("rejects non-admins, missing statuses and unknown orders", async () => {
      const forbidden = await request(app)
        .put(`/api/v1/orders/${orderId}`)
        .set(bearer(customer.token))
        .send({ newStatus: "CANCELLED" });
      expect(forbidden.status).to.equal(403);

      const invalid = await request(app).put(`/api/v1/orders/${orderId}`).set(bearer(admin.token)).send({});
      expect(invalid.status).to.equal(400);

      const missing = await request(app)
        .put(`/api/v1/orders/${newObjectId()}`)
        .set(bearer(admin.token))
        .send({ newStatus: "DELIVERED" });
      expect(missing.status).to.equal(404);
    });
  });
});
