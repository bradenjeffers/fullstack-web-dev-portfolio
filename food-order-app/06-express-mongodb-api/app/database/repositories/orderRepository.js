const OrderModel = require("../../models/orderModel");

// The user id comes from the authenticated session, never from the request body.
const createOrder = async (userId, orderData) =>
  OrderModel.create({
    userId,
    restaurantId: orderData.restaurantId,
    status: "PROCESSING",
    orderTotalPrice: orderData.orderTotalPrice,
    fooditems: orderData.fooditems,
    shippingDetails: orderData.shippingDetails,
  });

const orderHistoryOfUser = async (userId) => OrderModel.find({ userId, isActive: true });

// Returns the order, or null if this user has no active order with that id.
const getOrderDetail = async (userId, orderId) =>
  OrderModel.findOne({ _id: orderId, userId, isActive: true });

const orderHistoryOfAllUsers = async () => OrderModel.find({ isActive: true });

// Returns the updated order, or null if there is no active order with that id.
const changeOrderStatus = async (orderId, newStatus) => {
  const orderDetails = await OrderModel.findOne({ _id: orderId, isActive: true });
  if (!orderDetails) {
    return null;
  }
  orderDetails.status = newStatus;
  orderDetails.updatedTs = Date.now();
  return orderDetails.save();
};

module.exports = {
  createOrder,
  orderHistoryOfUser,
  orderHistoryOfAllUsers,
  changeOrderStatus,
  getOrderDetail,
};
