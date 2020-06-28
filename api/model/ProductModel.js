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
    default: "mL",
  },
});

// create product Schema & model
const ProductSchema = new Schema({
  _id: mongoose.Schema.Types.ObjectId,
  brandName: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  productCode: {
    type: String,
    required: true,
    unique: true,
  },
  productType: {
    type: String,
    enum: ["LIQUID", "POWDER", "SOAP", "SCRUBBER", "OTHERS"],
    default: "LIQUID",
  },
  fragrances: {
    type: [FragranceSchema],
  },
  quantities: {
    type: [QuantitySchema],
  },
});

// Cascade delete district when a zone is deleted
ProductSchema.pre("remove", async function (next) {
  console.log(`Delete Product and its Skus `);

  await this.model("Sku").deleteMany({ product: this._id });
  next();
});

ProductSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

const ProductModel = mongoose.model("Product", ProductSchema);

module.exports = ProductModel;
