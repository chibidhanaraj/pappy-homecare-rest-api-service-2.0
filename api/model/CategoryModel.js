const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FragranceSchema = new Schema({
  fragranceName: {
    type: String,
  },
});

const QuantitySchema = new Schema({
  quantity: {
    type: Number,
  },
  unit: {
    type: String,
    enum: ["mL", "L", "Kg", "g"],
    default: "g",
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
  },
  quantities: {
    type: [QuantitySchema],
  },
});

// Cascade delete district when a zone is deleted
CategorySchema.pre("remove", async function (next) {
  console.log(`Delete Category `);

  await this.model("Product").deleteMany({ category: this._id });
  next();
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
