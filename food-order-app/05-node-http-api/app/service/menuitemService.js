const { loadJson } = require("./dataLoader");
const menus = require("./menuService");
const fooditems = require("./fooditemService");

class Menuitems {
  constructor() {
    this.menuitems = loadJson("menuitems.json");
  }

  getAllMenuitems() {
    return this.menuitems;
  }

  getMenuitemById(id) {
    return this.menuitems.find((menuitem) => String(menuitem.id) === String(id));
  }

  getAllMenuitemsByFooditemId(fooditemId) {
    return this.menuitems.filter((menuitem) => String(menuitem.fooditemId) === String(fooditemId));
  }

  // Returns the menu of a restaurant as display rows, or null if the restaurant has no menu.
  // When categoryId and/or cuisineId are given, matching dishes are moved to the front
  // (nothing is removed) so the UI can highlight what the customer asked for.
  getAllMenuitemsByRestaurantId(restaurantId, { categoryId = null, cuisineId = null } = {}) {
    const menu = menus.getMenuByRestaurantId(restaurantId);
    if (!menu) return null;

    const rows = this.menuitems
      .filter((menuitem) => menuitem.menuId === menu.id)
      .map((menuitem) => {
        const fooditem = fooditems.getFooditemById(menuitem.fooditemId);
        return {
          row: {
            "Menuitem Id": menuitem.id,
            "Fooditem Id": menuitem.fooditemId,
            "Fooditem Name": fooditem?.name,
            "Fooditem Image": fooditem?.image,
            "Fooditem Price": menuitem.fooditemPrice,
          },
          preferred:
            (categoryId === null || String(fooditem?.categoryId) === String(categoryId)) &&
            (cuisineId === null || String(fooditem?.cuisineId) === String(cuisineId)),
        };
      });

    const hasPreference = categoryId !== null || cuisineId !== null;
    if (!hasPreference) return rows.map((entry) => entry.row);

    // Array.prototype.sort is stable, so original order is kept within each group.
    return rows.sort((a, b) => Number(b.preferred) - Number(a.preferred)).map((entry) => entry.row);
  }
}

module.exports = new Menuitems();
