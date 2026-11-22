const asyncHandler = require("express-async-handler");
const fooditemRepository = require("../database/repositories/fooditemRepository");
const HttpError = require("../helpers/httpError");
const { pickDefined } = require("../helpers/pick");
const { requireFields } = require("../helpers/validate");

const FIELDS = ["name", "description", "image", "categoryId", "cuisineId", "isVeg"];

const createFooditem = asyncHandler(async (req, res) => {
  requireFields(req.body, FIELDS);
  const created = await fooditemRepository.createFooditem(req.body);
  res.status(201).json({ message: "Fooditem created successfully", data: created });
});

const editFooditem = asyncHandler(async (req, res) => {
  if (Object.keys(pickDefined(req.body, FIELDS)).length === 0) {
    throw new HttpError(400, "No valid fields provided to update");
  }
  const updated = await fooditemRepository.editFooditem(req.params.id, req.body);
  if (!updated) {
    throw new HttpError(404, "Fooditem not found");
  }
  res.status(200).json({ message: "Fooditem is successfully edited", data: updated });
});

const deleteFooditem = asyncHandler(async (req, res) => {
  const deleted = await fooditemRepository.deleteFooditem(req.params.id);
  if (!deleted) {
    throw new HttpError(404, "Fooditem not found");
  }
  res.status(200).json({ message: "Fooditem is successfully deleted" });
});

const getFooditem = asyncHandler(async (req, res) => {
  const found = await fooditemRepository.getFooditem(req.params.id);
  if (!found) {
    throw new HttpError(404, "Fooditem not found");
  }
  res.status(200).json({ data: found, message: "Successfully fetched fooditem details." });
});

const getAllFooditems = asyncHandler(async (req, res) => {
  const all = await fooditemRepository.getAllFooditems();
  res.status(200).json({ data: all, message: "Successfully fetched all fooditems." });
});

module.exports = {
  createFooditem,
  editFooditem,
  deleteFooditem,
  getFooditem,
  getAllFooditems,
};
