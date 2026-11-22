const { expect } = require("chai");
const { app, request, createUser, bearer, uniqueName, newObjectId } = require("./helpers");

describe("Menu APIs", () => {
  let admin;
  let customer;
  let cuisine;
  let restaurant;
  let fooditems;
  let menuId;

  const post = async (path, token, body) => {
    const res = await request(app).post(path).set(bearer(token)).send(body);
    expect(res.status, JSON.stringify(res.body)).to.equal(201);
    return res.body.data;
  };

  before(async () => {
    admin = await createUser({ isAdmin: true });
    customer = await createUser();

    cuisine = await post("/api/v1/cuisines", admin.token, {
      name: uniqueName("cuisine"),
      description: "Menu test cuisine",
      image: "https://example.com/c.jpg",
    });
    restaurant = await post("/api/v1/restaurants", admin.token, {
      name: uniqueName("restaurant"),
      address: "1 Menu Street",
      contact: 5550000000,
      image: "https://example.com/r.jpg",
    });

    // One food item in the cuisine, one outside it.
    fooditems = [
      await post("/api/v1/fooditems", admin.token, {
        name: uniqueName("other"), description: "d", image: "i", isVeg: true,
        cuisineId: newObjectId(), categoryId: newObjectId(),
      }),
      await post("/api/v1/fooditems", admin.token, {
        name: uniqueName("matching"), description: "d", image: "i", isVeg: false,
        cuisineId: cuisine._id, categoryId: newObjectId(),
      }),
    ];
  });

  const menuBody = () => ({
    restaurantId: restaurant._id,
    description: "Lunch menu",
    menuForRestaurant: fooditems.map((item, index) => ({
      fooditemId: item._id,
      fooditemName: item.name,
      fooditemImage: item.image,
      fooditemPrice: 10 + index,
    })),
  });

  it("rejects an incomplete menu with 400 and creates nothing", async () => {
    const res = await request(app)
      .post("/api/v1/menus")
      .set(bearer(admin.token))
      .send({ ...menuBody(), menuForRestaurant: [{ fooditemId: fooditems[0]._id }] });
    expect(res.status).to.equal(400);

    const lookup = await request(app).get(`/api/v1/menus/${restaurant._id}`);
    expect(lookup.status).to.equal(404);
  });

  it("is admin-only to create", async () => {
    const res = await request(app).post("/api/v1/menus").set(bearer(customer.token)).send(menuBody());
    expect(res.status).to.equal(403);
  });

  it("creates a menu and returns it by restaurant id", async () => {
    const created = await request(app).post("/api/v1/menus").set(bearer(admin.token)).send(menuBody());
    expect(created.status).to.equal(201);
    expect(created.body.message).to.equal("Menu created successfully");

    const res = await request(app).get(`/api/v1/menus/${restaurant._id}`);
    expect(res.status).to.equal(200);
    expect(res.body.data.restaurantId).to.equal(restaurant._id);
    expect(res.body.data.menu).to.have.length(2);
    menuId = res.body.data._id;
  });

  it("floats items of the requested cuisine to the top", async () => {
    const plain = await request(app).get(`/api/v1/menus/${restaurant._id}`);
    expect(plain.body.data.menu[0].fooditemId).to.equal(fooditems[0]._id);

    const sorted = await request(app).get(
      `/api/v1/menus/${restaurant._id}?cuisine=${encodeURIComponent(cuisine.name)}`
    );
    expect(sorted.status).to.equal(200);
    expect(sorted.body.data.menu[0].fooditemId).to.equal(fooditems[1]._id);
  });

  it("filters restaurants by cuisine", async () => {
    const res = await request(app).get(`/api/v1/restaurants?cuisine=${encodeURIComponent(cuisine.name)}`);
    expect(res.status).to.equal(200);
    expect(res.body.data.map((r) => r._id)).to.include(restaurant._id);

    const none = await request(app).get("/api/v1/restaurants?cuisine=no-such-cuisine");
    expect(none.status).to.equal(200);
    expect(none.body.data).to.deep.equal([]);
  });

  it("updates menu item prices", async () => {
    const current = await request(app).get(`/api/v1/menus/${restaurant._id}`);
    const item = current.body.data.menu[0];

    const res = await request(app)
      .put(`/api/v1/menus/${menuId}`)
      .set(bearer(admin.token))
      .send({ description: "Dinner menu", menuitemsWithNewPrices: [{ _id: item._id, fooditemPrice: 99 }] });
    expect(res.status).to.equal(200);

    const after = await request(app).get(`/api/v1/menus/${restaurant._id}`);
    const updated = after.body.data.menu.find((entry) => entry._id === item._id);
    expect(updated.fooditemPrice).to.equal(99);
  });

  it("returns 404 when editing an unknown menu", async () => {
    const res = await request(app)
      .put(`/api/v1/menus/${newObjectId()}`)
      .set(bearer(admin.token))
      .send({ description: "x" });
    expect(res.status).to.equal(404);
  });

  it("deletes a menu and its items", async () => {
    const res = await request(app).delete(`/api/v1/menus/${menuId}`).set(bearer(admin.token));
    expect(res.status).to.equal(200);

    const after = await request(app).get(`/api/v1/menus/${restaurant._id}`);
    expect(after.status).to.equal(404);

    const again = await request(app).delete(`/api/v1/menus/${menuId}`).set(bearer(admin.token));
    expect(again.status).to.equal(404);
  });
});
