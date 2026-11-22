const MenuitemModel = require("../../models/menuitemModel");

const createMenuitems = async (menuItemsToInsert) => MenuitemModel.insertMany(menuItemsToInsert);

// Updates the price of several items of one menu in one round trip. Filtering by
// menuId stops a caller from touching items that belong to a different menu.
const editMenuitems = async (menuId, menuitemsToEdit) => {
  if (!menuitemsToEdit.length) {
    return null;
  }
  const updateOperations = menuitemsToEdit.map(({ _id, fooditemPrice }) => ({
    updateOne: {
      filter: { _id, menuId },
      update: { $set: { fooditemPrice, updatedTs: Date.now() } },
    },
  }));
  return MenuitemModel.bulkWrite(updateOperations);
};

const deleteMenuitems = async (menuId) => MenuitemModel.deleteMany({ menuId });

const getAllMenuitemsByMenuId = async (menuId) =>
  MenuitemModel.find({ menuId, isActive: true });

const getAllMenuitemsByFooditemIds = async (fooditemIdsArray) =>
  MenuitemModel.find({ fooditemId: { $in: fooditemIdsArray }, isActive: true });

module.exports = {
  createMenuitems,
  editMenuitems,
  deleteMenuitems,
  getAllMenuitemsByMenuId,
  getAllMenuitemsByFooditemIds,
};
