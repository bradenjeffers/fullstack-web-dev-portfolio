const mongoose = require("mongoose");

const orderSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  status: {
    type: String,
    default: "PROCESSING",
  },
  orderTotalPrice: {
    type: Number,
    required: true,
  },
  fooditems: {
    type: Object,
    required: true
  },

  shippingDetails: {
    type: Object,
    required: true
  },

  isActive: {
    type: Boolean,
    default: true,
  },
  createdTs: {
    type: Date,
    default: Date.now,
  },
  updatedTs: {
    type: Date,
    default: Date.now,
  },
});

const OrderModel = mongoose.model("Orders", orderSchema);

module.exports = OrderModel;
