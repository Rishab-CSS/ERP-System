const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  partNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },

  partName: {
    type: String,
    required: true,
    trim: true
  }

}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);