const CategoryModel = require("../../models/categoryModel");
const { pickDefined } = require("../../helpers/pick");

const EDITABLE_FIELDS = ["name", "description", "image"];

const createCategory = async (data) => CategoryModel.create(pickDefined(data, EDITABLE_FIELDS));

// Returns the updated document, or null if no active document has that id.
const editCategory = async (categoryId, newData) => {
  const categoryObject = await CategoryModel.findOne({ _id: categoryId, isActive: true });
  if (!categoryObject) {
    return null;
  }
  categoryObject.set({ ...pickDefined(newData, EDITABLE_FIELDS), updatedTs: Date.now() });
  return categoryObject.save();
};

// Soft delete: the document is kept but flagged inactive.
const deleteCategory = async (categoryId) => {
  const categoryObject = await CategoryModel.findOne({ _id: categoryId, isActive: true });
  if (!categoryObject) {
    return null;
  }
  categoryObject.isActive = false;
  categoryObject.updatedTs = Date.now();
  return categoryObject.save();
};

const getCategory = async (categoryId) => CategoryModel.findOne({ _id: categoryId, isActive: true });

const getAllCategories = async () => CategoryModel.find({ isActive: true });

// Returns the id of the active category with this name, or null.
const getCategoryIdByName = async (categoryName) => {
  const categoryObject = await CategoryModel.findOne({ name: categoryName, isActive: true });
  return categoryObject ? categoryObject._id : null;
};

module.exports = {
  createCategory,
  editCategory,
  deleteCategory,
  getCategory,
  getAllCategories,
  getCategoryIdByName,
};
