const asyncHandler = require("express-async-handler");
const categoryRepository = require("../database/repositories/categoryRepository");
const HttpError = require("../helpers/httpError");
const { pickDefined } = require("../helpers/pick");
const { requireFields } = require("../helpers/validate");

const FIELDS = ["name", "description", "image"];

const createCategory = asyncHandler(async (req, res) => {
  requireFields(req.body, FIELDS);
  const created = await categoryRepository.createCategory(req.body);
  res.status(201).json({ message: "Category created successfully", data: created });
});

const editCategory = asyncHandler(async (req, res) => {
  if (Object.keys(pickDefined(req.body, FIELDS)).length === 0) {
    throw new HttpError(400, "No valid fields provided to update");
  }
  const updated = await categoryRepository.editCategory(req.params.id, req.body);
  if (!updated) {
    throw new HttpError(404, "Category not found");
  }
  res.status(200).json({ message: "Category is successfully edited", data: updated });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const deleted = await categoryRepository.deleteCategory(req.params.id);
  if (!deleted) {
    throw new HttpError(404, "Category not found");
  }
  res.status(200).json({ message: "Category is successfully deleted" });
});

const getCategory = asyncHandler(async (req, res) => {
  const found = await categoryRepository.getCategory(req.params.id);
  if (!found) {
    throw new HttpError(404, "Category not found");
  }
  res.status(200).json({ data: found, message: "Successfully fetched category details." });
});

const getAllCategories = asyncHandler(async (req, res) => {
  const all = await categoryRepository.getAllCategories();
  res.status(200).json({ data: all, message: "Successfully fetched all categories." });
});

module.exports = {
  createCategory,
  editCategory,
  deleteCategory,
  getCategory,
  getAllCategories,
};
