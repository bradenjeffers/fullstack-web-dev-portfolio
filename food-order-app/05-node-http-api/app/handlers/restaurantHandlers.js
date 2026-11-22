const restaurants = require("../service/restaurantService");
const cuisines = require("../service/cuisineService");
const categories = require("../service/categoryService");
const { HttpError, notFound, sendJson } = require("../http");

const fetchAllRestaurantsHandler = (req, res) => {
  sendJson(res, 200, restaurants.getAllRestaurants());
};

const fetchRestaurantByIdHandler = (req, res, id) => {
  const restaurant = restaurants.getRestaurantById(id);
  if (!restaurant) throw notFound("Restaurant", id);
  sendJson(res, 200, restaurant);
};

// ?cuisine=Italian and/or ?category=Pizza (names, case-insensitive).
// A known filter with no matching restaurants is a valid empty result; an unknown name is a 404.
const fetchRestaurantsByFilterHandler = (req, res, { cuisine, category }) => {
  const filter = {};

  if (cuisine !== undefined) {
    const match = cuisines.getCuisineByName(cuisine);
    if (!match) throw new HttpError(404, `Cuisine "${cuisine}" was not found`);
    filter.cuisineId = match.id;
  }
  if (category !== undefined) {
    const match = categories.getCategoryByName(category);
    if (!match) throw new HttpError(404, `Category "${category}" was not found`);
    filter.categoryId = match.id;
  }

  sendJson(res, 200, restaurants.getRestaurantsServing(filter));
};

module.exports = {
  fetchAllRestaurantsHandler,
  fetchRestaurantByIdHandler,
  fetchRestaurantsByFilterHandler,
};
