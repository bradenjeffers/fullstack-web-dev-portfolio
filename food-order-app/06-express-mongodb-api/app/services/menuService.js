const asyncHandler = require("express-async-handler");
const menuRepository = require("../database/repositories/menuRepository");
const cuisineRepository = require("../database/repositories/cuisineRepository");
const categoryRepository = require("../database/repositories/categoryRepository");
const fooditemRepository = require("../database/repositories/fooditemRepository");
const menuitemRepository = require("../database/repositories/menuitemRepository");
const HttpError = require("../helpers/httpError");
const { requireFields, requireString } = require("../helpers/validate");

// Accepts the menu either as an array of
//   { fooditemId, fooditemName, fooditemImage, fooditemPrice }
// or as a map keyed by food item id: { "<fooditemId>": { fooditemName, ... } }.
const normaliseMenuItems = (menuForRestaurant) => {
  const entries = Array.isArray(menuForRestaurant)
    ? menuForRestaurant.map((item) => [item && item.fooditemId, item])
    : Object.entries(menuForRestaurant || {});

  if (entries.length === 0) {
    throw new HttpError(400, "menuForRestaurant must contain at least one item");
  }

  return entries.map(([fooditemId, item]) => {
    requireFields({ fooditemId, ...item }, [
      "fooditemId",
      "fooditemName",
      "fooditemImage",
      "fooditemPrice",
    ]);
    return {
      fooditemId,
      fooditemName: item.fooditemName,
      fooditemImage: item.fooditemImage,
      fooditemPrice: item.fooditemPrice,
    };
  });
};

const createMenu = asyncHandler(async (req, res) => {
  const { restaurantId, description, menuForRestaurant } = req.body;
  requireFields(req.body, ["restaurantId", "description", "menuForRestaurant"]);
  const items = normaliseMenuItems(menuForRestaurant);

  const savedMenu = await menuRepository.createMenu(restaurantId, description);
  try {
    await menuitemRepository.createMenuitems(
      items.map((item) => ({ ...item, menuId: savedMenu._id }))
    );
  } catch (err) {
    // No transactions here, so undo the menu by hand rather than leave it empty.
    await menuRepository.deleteMenu(savedMenu._id);
    throw err;
  }

  res.status(201).json({ message: "Menu created successfully" });
});

const editMenu = asyncHandler(async (req, res) => {
  const menuId = req.params.id;
  const { description, menuitemsWithNewPrices = [] } = req.body;

  if (!Array.isArray(menuitemsWithNewPrices)) {
    throw new HttpError(400, "menuitemsWithNewPrices must be an array");
  }
  menuitemsWithNewPrices.forEach((item) =>
    requireFields(item, ["_id", "fooditemPrice"])
  );

  const menu = await menuRepository.editMenu(menuId, description);
  if (!menu) {
    throw new HttpError(404, "Menu not found");
  }
  await menuitemRepository.editMenuitems(menuId, menuitemsWithNewPrices);

  res.status(200).json({ message: "Menuitems are successfully edited" });
});

const deleteMenu = asyncHandler(async (req, res) => {
  const menuId = req.params.id;
  const { deletedCount } = await menuRepository.deleteMenu(menuId);
  if (!deletedCount) {
    throw new HttpError(404, "Menu not found");
  }
  await menuitemRepository.deleteMenuitems(menuId);

  res.status(200).json({ message: "Menu is successfully deleted" });
});

// Puts the items whose food item matches the filter first; the relative order
// inside each group is unchanged.
const matchingFirst = (menuItems, matchingFooditems) => {
  const matchingIds = new Set(matchingFooditems.map((fooditem) => String(fooditem._id)));
  const matches = menuItems.filter((item) => matchingIds.has(String(item.fooditemId)));
  const others = menuItems.filter((item) => !matchingIds.has(String(item.fooditemId)));
  return [...matches, ...others];
};

// GET /menus/:id where :id is a restaurant id. Optional ?cuisine=<name> or
// ?category=<name> floats matching items to the top of the menu.
const getMenuByRestaurant = asyncHandler(async (req, res) => {
  const restaurantId = req.params.id;
  const menu = await menuRepository.getMenuByRestaurant(restaurantId);
  if (!menu) {
    throw new HttpError(404, `No menu found for restaurant ${restaurantId}`);
  }

  const menuItems = await menuitemRepository.getAllMenuitemsByMenuId(menu._id);
  let items = menuItems.map(({ _id, fooditemId, fooditemName, fooditemImage, fooditemPrice }) => ({
    _id,
    fooditemId,
    fooditemName,
    fooditemImage,
    fooditemPrice,
  }));

  const { cuisine, category } = req.query;
  if (cuisine !== undefined) {
    const cuisineId = await cuisineRepository.getCuisineIdByName(requireString(cuisine, "cuisine"));
    if (cuisineId) {
      items = matchingFirst(items, await fooditemRepository.getFooditemsByCuisineId(cuisineId));
    }
  } else if (category !== undefined) {
    const categoryId = await categoryRepository.getCategoryIdByName(requireString(category, "category"));
    if (categoryId) {
      items = matchingFirst(items, await fooditemRepository.getFooditemsByCategoryId(categoryId));
    }
  }

  res.status(200).json({
    data: { _id: menu._id, restaurantId: menu.restaurantId, menu: items },
    message: "Successfully fetched menu details.",
  });
});

module.exports = {
  createMenu,
  editMenu,
  deleteMenu,
  getMenuByRestaurant,
};
