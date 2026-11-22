const describeCrud = require("./crudSuite");
const { uniqueName } = require("./helpers");

describeCrud({
  name: "Category",
  path: "/api/v1/categories",
  makePayload: () => ({
    name: uniqueName("category"),
    description: "Test category description",
    image: "https://example.com/category.jpg",
  }),
  edit: { description: "Updated description" },
});
