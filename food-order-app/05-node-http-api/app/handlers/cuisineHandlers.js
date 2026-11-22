const cuisines = require("../service/cuisineService");
const { notFound, sendJson } = require("../http");

const fetchAllCuisinesHandler = (req, res) => {
  sendJson(res, 200, cuisines.getAllCuisines());
};

const fetchCuisineByIdHandler = (req, res, id) => {
  const item = cuisines.getCuisineById(id);
  if (!item) throw notFound("Cuisine", id);
  sendJson(res, 200, item);
};

module.exports = { fetchAllCuisinesHandler, fetchCuisineByIdHandler };
