const mongoose = require("mongoose");

// Process Schema
const processSchema = new mongoose.Schema({
  processName: String,
  producedQty: Number,
  acceptedQty: Number,
  missingQty: Number,
  takenFromInventory: Number,
  rejectedQty: Number,
  finalFlowQty: Number,
  startDate: String,
  endDate: String,
  machineOrVendor: String,
  operator: String
});

// Production Schema
const productionTrackingSchema = new mongoose.Schema({

  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product"
  },

  partNumber: {
    type: String,
    required: true,
    trim: true
  },

  productName: {
    type: String,
    required: true,
    trim: true
  },

  totalQty: {
    type: Number,
    required: true
  },

  customer: {
  type: String,
  required: true
},

customerId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Customer",
  required: true
},

  poNo: String,
  routeCardNo: String,

  processes: [processSchema],

  producedQty: Number,

  dispatchedQty: {
    type: Number,
    default: 0
  },

  remainingStock: {
    type: Number,
    default: 0
  },

  status: {
    type: String,
    default: "In Progress"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model(
  "ProductionTracking",
  productionTrackingSchema
);