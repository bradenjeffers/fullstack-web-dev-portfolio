const { loadJson } = require("./dataLoader");
const fooditems = require("./fooditemService");
const menuitems = require("./menuitemService");
const menus = require("./menuService");

class Restaurants {
  constructor() {
    this.restaurants = loadJson("restaurants.json");
  }

  getAllRestaurants() {
    return this.restaurants;
  }

  getRestaurantById(id) {
    return this.restaurants.find((restaurant) => String(restaurant.id) === String(id));
  }

  // Restaurants have no cuisine/category of their own in the data; they are linked through
  // restaurant -> menu -> menu items -> food items. A restaurant matches when at least one
  // food item on its menu has the given cuisine and/or category.
  getRestaurantsServing({ cuisineId = null, categoryId = null } = {}) {
    const matchingFooditemIds = new Set(
      fooditems
        .getAllFooditems()
        .filter(
          (item) =>
            (cuisineId === null || item.cuisineId === cuisineId) &&
            (categoryId === null || item.categoryId === categoryId)
        )
        .map((item) => item.id)
    );

    const matchingMenuIds = new Set(
      menuitems
        .getAllMenuitems()
        .filter((menuitem) => matchingFooditemIds.has(menuitem.fooditemId))
        .map((menuitem) => menuitem.menuId)
    );

    const matchingRestaurantIds = new Set(
      menus
        .getAllMenus()
        .filter((menu) => matchingMenuIds.has(menu.id))
        .map((menu) => menu.restaurantId)
    );

    return this.restaurants.filter((restaurant) => matchingRestaurantIds.has(restaurant.id));
  }
}

module.exports = new Restaurants();
