const MenuModel = require("../../models/menuModel");

const createMenu = async (restaurantId, description) =>
  MenuModel.create({ restaurantId, description });

// Returns the updated menu, or null if no active menu has that id.
const editMenu = async (menuId, description) => {
  const menuObject = await MenuModel.findOne({ _id: menuId, isActive: true });
  if (!menuObject) {
    return null;
  }
  if (description !== undefined) {
    menuObject.description = description;
  }
  menuObject.updatedTs = Date.now();
  return menuObject.save();
};

// Hard delete (menus are rebuilt wholesale, unlike the soft-deleted catalogue data).
const deleteMenu = async (menuId) => MenuModel.deleteOne({ _id: menuId });

const getMenuById = async (id) => MenuModel.findOne({ _id: id, isActive: true });

const getMenusByIds = async (idsArray) =>
  MenuModel.find({ _id: { $in: idsArray }, isActive: true });

const getMenuByRestaurant = async (restaurantId) =>
  MenuModel.findOne({ restaurantId, isActive: true });

module.exports = {
  createMenu,
  editMenu,
  deleteMenu,
  getMenuById,
  getMenusByIds,
  getMenuByRestaurant,
};
