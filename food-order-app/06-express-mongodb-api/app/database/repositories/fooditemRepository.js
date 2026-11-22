const FooditemModel = require("../../models/fooditemModel");
const { pickDefined } = require("../../helpers/pick");

const EDITABLE_FIELDS = ["name", "description", "image", "categoryId", "cuisineId", "isVeg"];

const createFooditem = async (data) => FooditemModel.create(pickDefined(data, EDITABLE_FIELDS));

// Returns the updated document, or null if no active document has that id.
const editFooditem = async (fooditemId, newData) => {
  const fooditemObject = await FooditemModel.findOne({ _id: fooditemId, isActive: true });
  if (!fooditemObject) {
    return null;
  }
  fooditemObject.set({ ...pickDefined(newData, EDITABLE_FIELDS), updatedTs: Date.now() });
  return fooditemObject.save();
};

// Soft delete: the document is kept but flagged inactive.
const deleteFooditem = async (fooditemId) => {
  const fooditemObject = await FooditemModel.findOne({ _id: fooditemId, isActive: true });
  if (!fooditemObject) {
    return null;
  }
  fooditemObject.isActive = false;
  fooditemObject.updatedTs = Date.now();
  return fooditemObject.save();
};

const getFooditem = async (fooditemId) => FooditemModel.findOne({ _id: fooditemId, isActive: true });

const getAllFooditems = async () => FooditemModel.find({ isActive: true });

const getFooditemsByCuisineId = async (cuisineId) =>
  FooditemModel.find({ cuisineId, isActive: true });

const getFooditemsByCategoryId = async (categoryId) =>
  FooditemModel.find({ categoryId, isActive: true });

module.exports = {
  createFooditem,
  editFooditem,
  deleteFooditem,
  getFooditem,
  getAllFooditems,
  getFooditemsByCuisineId,
  getFooditemsByCategoryId,
};
