const asyncHandler = require("express-async-handler");
const orderRepository = require("../database/repositories/orderRepository");
const HttpError = require("../helpers/httpError");
const { requireFields, requireString } = require("../helpers/validate");

const isNonEmptyCollection = (value) =>
  Array.isArray(value) ? value.length > 0 : value && typeof value === "object" && Object.keys(value).length > 0;

const createOrder = asyncHandler(async (req, res) => {
  requireFields(req.body, ["restaurantId", "orderTotalPrice", "fooditems", "shippingDetails"]);
  const { orderTotalPrice, fooditems, shippingDetails } = req.body;

  if (typeof orderTotalPrice !== "number" || orderTotalPrice < 0) {
    throw new HttpError(400, "orderTotalPrice must be a non-negative number");
  }
  if (!isNonEmptyCollection(fooditems)) {
    throw new HttpError(400, "fooditems must contain at least one item");
  }
  requireFields(shippingDetails, ["address", "phoneNo", "emailId"]);

  const order = await orderRepository.createOrder(req.user._id, req.body);
  res.status(201).json({ message: "Order is successfully placed", data: { orderId: order._id } });
});

const orderHistoryOfUser = asyncHandler(async (req, res) => {
  const orderHistory = await orderRepository.orderHistoryOfUser(req.params.userId);
  res.status(200).json({ orderHistory });
});

const getOrderDetail = asyncHandler(async (req, res) => {
  const { userId, orderId } = req.params;
  const orderDetail = await orderRepository.getOrderDetail(userId, orderId);
  if (!orderDetail) {
    throw new HttpError(404, "Order not found for the user");
  }
  res.status(200).json({ orderDetail });
});

const orderHistoryOfAllUsers = asyncHandler(async (req, res) => {
  const orders = await orderRepository.orderHistoryOfAllUsers();
  res.status(200).json({ orders, message: "Successfully fetched orders of all the users." });
});

const changeOrderStatus = asyncHandler(async (req, res) => {
  const newStatus = requireString(req.body.newStatus, "newStatus");
  const order = await orderRepository.changeOrderStatus(req.params.orderId, newStatus);
  if (!order) {
    throw new HttpError(404, "No order with the given order id");
  }
  res.status(200).json({ message: "Order status is changed successfully." });
});

module.exports = {
  createOrder,
  orderHistoryOfAllUsers,
  orderHistoryOfUser,
  changeOrderStatus,
  getOrderDetail,
};
