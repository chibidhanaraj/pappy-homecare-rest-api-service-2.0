const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FragranceSchema = new Schema(
  {
    fragranceId: {
      type: String,
    },
    fragranceName: {
      type: String,
    },
  },
  { _id: false }
);

const SizeSchema = new Schema(
  {
    sizeValue: {
      type: String,
    },
  },
  { _id: false }
);

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
    type: [FragranceSchema],
    required: true,
  },
  sizes: {
    type: [SizeSchema],
    required: true,
  },
});

const CategoryModel = mongoose.model("Category", CategorySchema);

module.exports = CategoryModel;
