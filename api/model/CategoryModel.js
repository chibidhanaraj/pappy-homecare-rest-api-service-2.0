const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// create category Schema & model
const CategorySchema = new Schema({
  _id: mongoose.Schema.Types.ObjectId,
  categoryName: {
    type: String,
    required: true,
  },
  categoryCode: {
    type: String,
    required: true,
  },
});

const CategoryModel = mongoose.model("Category", CategorySchema);

module.exports = CategoryModel;
