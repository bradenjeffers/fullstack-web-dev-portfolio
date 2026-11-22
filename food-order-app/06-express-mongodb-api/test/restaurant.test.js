const describeCrud = require("./crudSuite");
const { uniqueName } = require("./helpers");

describeCrud({
  name: "Restaurant",
  path: "/api/v1/restaurants",
  makePayload: () => ({
    name: uniqueName("restaurant"),
    address: "1 Test Street",
    contact: 5551234567,
    image: "https://example.com/restaurant.jpg",
  }),
  edit: { address: "2 Updated Street" },
});
