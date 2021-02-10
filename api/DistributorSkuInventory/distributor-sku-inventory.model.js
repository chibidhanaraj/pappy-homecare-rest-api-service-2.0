const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Distributor Sku Inventory Schema & model
const DistributorSkuInventorySchema = new Schema(
  {
    distributor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Distributor',
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

const DistributorSkuInventory = mongoose.model(
  'DistributorSkuInventory',
  DistributorSkuInventorySchema
);

module.exports = DistributorSkuInventory;
