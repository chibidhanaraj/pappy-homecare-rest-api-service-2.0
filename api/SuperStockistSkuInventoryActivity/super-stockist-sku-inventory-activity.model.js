const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create SuperStockist Sku Inventory Activity Schema & model
const SuperStockistSkuInventoryActivitySchema = new Schema(
  {
    super_stockist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SuperStockist',
    },

    primary_order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PrimaryOrder',
    },

    sku: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sku',
    },

    quantity: {
      type: Number,
    },

    comment: {
      type: String,
    },
  },
  {
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
    timestamps: { createdAt: true, updatedAt: true },
    versionKey: false,
  }
);

const SuperStockistSkuInventoryActivity = mongoose.model(
  'SuperStockistSkuInventoryActivity',
  SuperStockistSkuInventoryActivitySchema
);

module.exports = SuperStockistSkuInventoryActivity;
