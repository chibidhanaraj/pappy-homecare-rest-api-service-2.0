const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FragranceSchema = new Schema({
  fragranceName: {
    type: String,
  },
});

const SizeSchema = new Schema({
  sizeValue: {
    type: String,
  },
});

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
CategorySchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

const CategoryModel = mongoose.model("Category", CategorySchema);

module.exports = CategoryModel;
