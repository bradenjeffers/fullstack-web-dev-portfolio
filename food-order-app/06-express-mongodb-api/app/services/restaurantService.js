const asyncHandler = require("express-async-handler");
const restaurantRepository = require("../database/repositories/restaurantRepository");
const HttpError = require("../helpers/httpError");
const { pickDefined } = require("../helpers/pick");
const { requireFields, requireString } = require("../helpers/validate");
const cuisineRepository = require("../database/repositories/cuisineRepository");
const categoryRepository = require("../database/repositories/categoryRepository");
const fooditemRepository = require("../database/repositories/fooditemRepository");
const menuitemRepository = require("../database/repositories/menuitemRepository");
const menuRepository = require("../database/repositories/menuRepository");

const FIELDS = ["name", "address", "contact", "image"];

const createRestaurant = asyncHandler(async (req, res) => {
  requireFields(req.body, FIELDS);
  const created = await restaurantRepository.createRestaurant(req.body);
  res.status(201).json({ message: "Restaurant created successfully", data: created });
});

const editRestaurant = asyncHandler(async (req, res) => {
  if (Object.keys(pickDefined(req.body, FIELDS)).length === 0) {
    throw new HttpError(400, "No valid fields provided to update");
  }
  const updated = await restaurantRepository.editRestaurant(req.params.id, req.body);
  if (!updated) {
    throw new HttpError(404, "Restaurant not found");
  }
  res.status(200).json({ message: "Restaurant is successfully edited", data: updated });
});

const deleteRestaurant = asyncHandler(async (req, res) => {
  const deleted = await restaurantRepository.deleteRestaurant(req.params.id);
  if (!deleted) {
    throw new HttpError(404, "Restaurant not found");
  }
  res.status(200).json({ message: "Restaurant is successfully deleted" });
});

const getRestaurant = asyncHandler(async (req, res) => {
  const found = await restaurantRepository.getRestaurant(req.params.id);
  if (!found) {
    throw new HttpError(404, "Restaurant not found");
  }
  res.status(200).json({ data: found, message: "Successfully fetched restaurant details." });
});

// Restaurants offering at least one food item of the given cuisine/category.
// Chain: name -> cuisine/category id -> food items -> menu items -> menus -> restaurants.
const findRestaurantsByFooditemFilter = async (lookupId, findFooditems) => {
  if (!lookupId) {
    return [];
  }
  const fooditems = await findFooditems(lookupId);
  const menuitems = await menuitemRepository.getAllMenuitemsByFooditemIds(
    fooditems.map((fooditem) => fooditem.id)
  );
  const menus = await menuRepository.getMenusByIds(menuitems.map((menuitem) => menuitem.menuId));
  return restaurantRepository.getRestaurantsByIds(menus.map((menu) => menu.restaurantId));
};

const getAllRestaurants = asyncHandler(async (req, res) => {
  const { cuisine, category } = req.query;
  let result;

  if (cuisine !== undefined) {
    const cuisineId = await cuisineRepository.getCuisineIdByName(requireString(cuisine, "cuisine"));
    result = await findRestaurantsByFooditemFilter(
      cuisineId,
      fooditemRepository.getFooditemsByCuisineId
    );
  } else if (category !== undefined) {
    const categoryId = await categoryRepository.getCategoryIdByName(requireString(category, "category"));
    result = await findRestaurantsByFooditemFilter(
      categoryId,
      fooditemRepository.getFooditemsByCategoryId
    );
  } else {
    result = await restaurantRepository.getAllRestaurants();
  }

  res.status(200).json({ data: result, message: "Successfully fetched restaurants details." });
});

module.exports = {
  createRestaurant,
  editRestaurant,
  deleteRestaurant,
  getRestaurant,
  getAllRestaurants,
};
