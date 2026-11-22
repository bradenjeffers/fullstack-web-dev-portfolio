const { loadJson } = require("./dataLoader");

class Categories {
  constructor() {
    this.categories = loadJson("categories.json");
  }

  getAllCategories() {
    return this.categories;
  }

  getCategoryById(id) {
    return this.categories.find((category) => String(category.id) === String(id));
  }

  getCategoryByName(name) {
    return this.categories.find((category) => category.name.toLowerCase() === name.toLowerCase());
  }
}

module.exports = new Categories();
