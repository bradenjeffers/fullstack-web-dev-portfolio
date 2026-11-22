const categories = require("../service/categoryService");
const { notFound, sendJson } = require("../http");

const fetchAllCategoriesHandler = (req, res) => {
  sendJson(res, 200, categories.getAllCategories());
};

const fetchCategoryByIdHandler = (req, res, id) => {
  const item = categories.getCategoryById(id);
  if (!item) throw notFound("Category", id);
  sendJson(res, 200, item);
};

module.exports = { fetchAllCategoriesHandler, fetchCategoryByIdHandler };
