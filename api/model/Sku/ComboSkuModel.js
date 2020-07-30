const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const skuSchema = new Schema(
  {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sku',
    },

    count: {
      type: String,
    },
  },
  { _id: false }
);

// create ComboSku Schema & model
const ComboSkuSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    comboSkuCode: {
      type: String,
      required: true,
      unique: true,
    },

    skus: [skuSchema],

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

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: { createdAt: true, updatedAt: true },
  }
);

ComboSkuSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

const ComboSkuModel = mongoose.model('ComboSku', ComboSkuSchema);

module.exports = ComboSkuModel;
