const menus = require("../service/menuService");
const { notFound, sendJson } = require("../http");

const fetchAllMenusHandler = (req, res) => {
  sendJson(res, 200, menus.getAllMenus());
};

const fetchMenuByIdHandler = (req, res, id) => {
  const item = menus.getMenuById(id);
  if (!item) throw notFound("Menu", id);
  sendJson(res, 200, item);
};

module.exports = { fetchAllMenusHandler, fetchMenuByIdHandler };
