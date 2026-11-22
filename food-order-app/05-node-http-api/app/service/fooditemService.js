const { loadJson } = require("./dataLoader");

class Fooditems {
  constructor() {
    this.fooditems = loadJson("fooditems.json");
  }

  getAllFooditems() {
    return this.fooditems;
  }

  getFooditemById(id) {
    return this.fooditems.find((fooditem) => String(fooditem.id) === String(id));
  }

  getFooditemsByCuisineId(id) {
    return this.fooditems.filter((fooditem) => String(fooditem.cuisineId) === String(id));
  }

  getFooditemsByCategoryId(id) {
    return this.fooditems.filter((fooditem) => String(fooditem.categoryId) === String(id));
  }
}

module.exports = new Fooditems();
