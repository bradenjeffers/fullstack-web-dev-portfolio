const menuitems = require("../service/menuitemService");
const cuisines = require("../service/cuisineService");
const categories = require("../service/categoryService");
const { HttpError, notFound, sendJson } = require("../http");

const fetchAllMenuitemsHandler = (req, res) => {
  sendJson(res, 200, menuitems.getAllMenuitems());
};

const fetchMenuitemByIdHandler = (req, res, id) => {
  const menuitem = menuitems.getMenuitemById(id);
  if (!menuitem) throw notFound("Menuitem", id);
  sendJson(res, 200, menuitem);
};

// ?restaurantId=1[&categoryId=..][&cuisineId=..] - the restaurant's menu, with matching dishes first.
const fetchMenuitemByRestaurantIdHandler = (req, res, { restaurantId, categoryId, cuisineId }) => {
  if (categoryId !== undefined && !categories.getCategoryById(categoryId)) {
    throw notFound("Category", categoryId);
  }
  if (cuisineId !== undefined && !cuisines.getCuisineById(cuisineId)) {
    throw notFound("Cuisine", cuisineId);
  }

  const rows = menuitems.getAllMenuitemsByRestaurantId(restaurantId, {
    categoryId: categoryId ?? null,
    cuisineId: cuisineId ?? null,
  });
  if (!rows) throw new HttpError(404, `No menu found for restaurant with id ${restaurantId}`);
  sendJson(res, 200, rows);
};

module.exports = {
  fetchAllMenuitemsHandler,
  fetchMenuitemByIdHandler,
  fetchMenuitemByRestaurantIdHandler,
};
