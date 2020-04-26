const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// create Product Schema & model
const ProductSchema = new Schema({
  _id: mongoose.Schema.Types.ObjectId,
  productName: {
    type: String,
    required: true,
  },
  productCode: {
    type: String,
    required: true,
    unique: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Category",
  },
  fragrance: {
    type: {
      fragranceName: String,
    },
  },
  size: {
    type: {
      sizeValue: String,
    },
  },
  perCaseQuantity: {
    type: String,
    required: true,
  },
  mrp: {
    type: Number,
    required: true,
  },
  specialPrice: {
    type: Number,
  },
  gst: {
    type: Number,
  },
});

const ProductModel = mongoose.model("Product", ProductSchema);

module.exports = ProductModel;
