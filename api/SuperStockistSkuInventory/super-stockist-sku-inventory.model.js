const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create SuperStockist Sku Inventory Schema & model
const SuperStockistSkuInventorySchema = new Schema(
  {
    super_stockist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SuperStockist',
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

const SuperStockistSkuInventory = mongoose.model(
  'SuperStockistSkuInventory',
  SuperStockistSkuInventorySchema
);

module.exports = SuperStockistSkuInventory;
