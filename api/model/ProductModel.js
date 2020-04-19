const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// create category Schema & model
const ProductSchema = new Schema({
  _id: mongoose.Schema.Types.ObjectId,
  productName: {
    type: String,
    required: true,
  },
  productCode: {
    type: String,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Category",
  },
  fragrance: {
    type: String,
    required: true,
  },
  size: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  perCaseQuantity: {
    type: String,
    required: true,
  },
});

const ProductModel = mongoose.model("Product", ProductSchema);

module.exports = ProductModel;
