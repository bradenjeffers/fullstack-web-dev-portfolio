const RestaurantModel = require("../../models/restaurantModel");
const { pickDefined } = require("../../helpers/pick");

const EDITABLE_FIELDS = ["name", "address", "contact", "image"];

const createRestaurant = async (data) => RestaurantModel.create(pickDefined(data, EDITABLE_FIELDS));

// Returns the updated document, or null if no active document has that id.
const editRestaurant = async (restaurantId, newData) => {
  const restaurantObject = await RestaurantModel.findOne({ _id: restaurantId, isActive: true });
  if (!restaurantObject) {
    return null;
  }
  restaurantObject.set({ ...pickDefined(newData, EDITABLE_FIELDS), updatedTs: Date.now() });
  return restaurantObject.save();
};

// Soft delete: the document is kept but flagged inactive.
const deleteRestaurant = async (restaurantId) => {
  const restaurantObject = await RestaurantModel.findOne({ _id: restaurantId, isActive: true });
  if (!restaurantObject) {
    return null;
  }
  restaurantObject.isActive = false;
  restaurantObject.updatedTs = Date.now();
  return restaurantObject.save();
};

const getRestaurant = async (restaurantId) => RestaurantModel.findOne({ _id: restaurantId, isActive: true });

const getAllRestaurants = async () => RestaurantModel.find({ isActive: true });

const getRestaurantsByIds = async (restaurantIds) =>
  RestaurantModel.find({ _id: { $in: restaurantIds }, isActive: true });

module.exports = {
  createRestaurant,
  editRestaurant,
  deleteRestaurant,
  getRestaurant,
  getAllRestaurants,
  getRestaurantsByIds,
};
