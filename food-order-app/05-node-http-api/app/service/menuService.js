const { loadJson } = require("./dataLoader");

class Menus {
  constructor() {
    this.menus = loadJson("menus.json");
  }

  getAllMenus() {
    return this.menus;
  }

  getMenuById(id) {
    return this.menus.find((menu) => String(menu.id) === String(id));
  }

  getMenuByRestaurantId(restaurantId) {
    return this.menus.find((menu) => String(menu.restaurantId) === String(restaurantId));
  }
}

module.exports = new Menus();
