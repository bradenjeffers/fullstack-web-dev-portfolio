const asyncHandler = require("express-async-handler");
const cuisineRepository = require("../database/repositories/cuisineRepository");
const HttpError = require("../helpers/httpError");
const { pickDefined } = require("../helpers/pick");
const { requireFields } = require("../helpers/validate");

const FIELDS = ["name", "description", "image"];

const createCuisine = asyncHandler(async (req, res) => {
  requireFields(req.body, FIELDS);
  const created = await cuisineRepository.createCuisine(req.body);
  res.status(201).json({ message: "Cuisine created successfully", data: created });
});

const editCuisine = asyncHandler(async (req, res) => {
  if (Object.keys(pickDefined(req.body, FIELDS)).length === 0) {
    throw new HttpError(400, "No valid fields provided to update");
  }
  const updated = await cuisineRepository.editCuisine(req.params.id, req.body);
  if (!updated) {
    throw new HttpError(404, "Cuisine not found");
  }
  res.status(200).json({ message: "Cuisine is successfully edited", data: updated });
});

const deleteCuisine = asyncHandler(async (req, res) => {
  const deleted = await cuisineRepository.deleteCuisine(req.params.id);
  if (!deleted) {
    throw new HttpError(404, "Cuisine not found");
  }
  res.status(200).json({ message: "Cuisine is successfully deleted" });
});

const getCuisine = asyncHandler(async (req, res) => {
  const found = await cuisineRepository.getCuisine(req.params.id);
  if (!found) {
    throw new HttpError(404, "Cuisine not found");
  }
  res.status(200).json({ data: found, message: "Successfully fetched cuisine details." });
});

const getAllCuisines = asyncHandler(async (req, res) => {
  const all = await cuisineRepository.getAllCuisines();
  res.status(200).json({ data: all, message: "Successfully fetched all cuisines." });
});

module.exports = {
  createCuisine,
  editCuisine,
  deleteCuisine,
  getCuisine,
  getAllCuisines,
};
