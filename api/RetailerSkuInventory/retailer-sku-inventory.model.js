const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Retailer Sku Inventory Schema & model
const RetailerSkuInventorySchema = new Schema(
  {
    retailer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Retailer',
    },

    sku: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sku',
    },

    current_inventory_level: {
      type: Number,
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

const RetailerSkuInventory = mongoose.model(
  'RetailerSkuInventory',
  RetailerSkuInventorySchema
);

module.exports = RetailerSkuInventory;
