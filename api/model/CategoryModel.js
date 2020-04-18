const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// create category Schema & model
const CategorySchema = new Schema({
  _id: mongoose.Schema.Types.ObjectId,
  brandName: {
    type: String,
    required: true,
  },
  categoryName: {
    type: String,
    required: true,
  },
  categoryCode: {
    type: String,
    required: true,
    unique: true,
  },
  categoryType: {
    type: String,
    required: true,
  },
  fragrances: {
    type: [String],
    required: true,
  },
  volumesInLitres: {
    type: [String],
    default: [],
  },
  weightInKgs: {
    type: [String],
    default: [],
  },
});

const CategoryModel = mongoose.model("Category", CategorySchema);

module.exports = CategoryModel;
