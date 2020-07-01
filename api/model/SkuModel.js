const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// create Product Schema & model
const SkuSchema = new Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,

    name: {
      type: String,
      required: true,
    },

    skuCode: {
      type: String,
      required: true,
      unique: true,
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Product",
    },

    fragranceId: {
      type: mongoose.Schema.Types.ObjectId,
    },

    quantityId: {
      type: mongoose.Schema.Types.ObjectId,
    },

    piecesPerCarton: {
      type: Number,
    },

    mrp: {
      type: Number,
      required: true,
    },

    specialPrice: {
      type: Number,
    },

    sgst: {
      type: Number,
    },

    cgst: {
      type: Number,
    },

    igst: {
      type: Number,
    },

    superStockistMargin: {
      type: Number,
    },

    distributorMargin: {
      type: Number,
    },

    retailerMargin: {
      type: Number,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

SkuSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

const SkuModel = mongoose.model("Sku", SkuSchema);

module.exports = SkuModel;
