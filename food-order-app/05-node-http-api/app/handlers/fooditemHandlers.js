const fooditems = require("../service/fooditemService");
const { notFound, sendJson } = require("../http");

const fetchAllFooditemsHandler = (req, res) => {
  sendJson(res, 200, fooditems.getAllFooditems());
};

const fetchFooditemByIdHandler = (req, res, id) => {
  const item = fooditems.getFooditemById(id);
  if (!item) throw notFound("Fooditem", id);
  sendJson(res, 200, item);
};

module.exports = { fetchAllFooditemsHandler, fetchFooditemByIdHandler };
