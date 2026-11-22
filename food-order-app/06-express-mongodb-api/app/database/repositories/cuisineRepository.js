const CuisineModel = require("../../models/cuisineModel");
const { pickDefined } = require("../../helpers/pick");

const EDITABLE_FIELDS = ["name", "description", "image"];

const createCuisine = async (data) => CuisineModel.create(pickDefined(data, EDITABLE_FIELDS));

// Returns the updated document, or null if no active document has that id.
const editCuisine = async (cuisineId, newData) => {
  const cuisineObject = await CuisineModel.findOne({ _id: cuisineId, isActive: true });
  if (!cuisineObject) {
    return null;
  }
  cuisineObject.set({ ...pickDefined(newData, EDITABLE_FIELDS), updatedTs: Date.now() });
  return cuisineObject.save();
};

// Soft delete: the document is kept but flagged inactive.
const deleteCuisine = async (cuisineId) => {
  const cuisineObject = await CuisineModel.findOne({ _id: cuisineId, isActive: true });
  if (!cuisineObject) {
    return null;
  }
  cuisineObject.isActive = false;
  cuisineObject.updatedTs = Date.now();
  return cuisineObject.save();
};

const getCuisine = async (cuisineId) => CuisineModel.findOne({ _id: cuisineId, isActive: true });

const getAllCuisines = async () => CuisineModel.find({ isActive: true });

// Returns the id of the active cuisine with this name, or null.
const getCuisineIdByName = async (cuisineName) => {
  const cuisineObject = await CuisineModel.findOne({ name: cuisineName, isActive: true });
  return cuisineObject ? cuisineObject._id : null;
};

module.exports = {
  createCuisine,
  editCuisine,
  deleteCuisine,
  getCuisine,
  getAllCuisines,
  getCuisineIdByName,
};
