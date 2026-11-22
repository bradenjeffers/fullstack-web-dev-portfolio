const describeCrud = require("./crudSuite");
const { uniqueName } = require("./helpers");

describeCrud({
  name: "Cuisine",
  path: "/api/v1/cuisines",
  makePayload: () => ({
    name: uniqueName("cuisine"),
    description: "Test cuisine description",
    image: "https://example.com/cuisine.jpg",
  }),
  edit: { description: "Updated description" },
});
