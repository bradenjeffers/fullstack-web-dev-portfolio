const { loadJson } = require("./dataLoader");

class Cuisines {
  constructor() {
    this.cuisines = loadJson("cuisines.json");
  }

  getAllCuisines() {
    return this.cuisines;
  }

  getCuisineById(id) {
    return this.cuisines.find((cuisine) => String(cuisine.id) === String(id));
  }

  getCuisineByName(name) {
    return this.cuisines.find((cuisine) => cuisine.name.toLowerCase() === name.toLowerCase());
  }
}

module.exports = new Cuisines();
