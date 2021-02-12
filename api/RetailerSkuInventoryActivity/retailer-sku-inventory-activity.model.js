const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Retailer Sku Inventory Activity Schema & model
const RetailerSkuInventoryActivitySchema = new Schema(
  {
    retailer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Retailer',
    },

    super_stockist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SuperStockist',
    },

    distributor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Distributor',
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

    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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

const RetailerSkuInventoryActivity = mongoose.model(
  'RetailerSkuInventoryActivity',
  RetailerSkuInventoryActivitySchema
);

module.exports = RetailerSkuInventoryActivity;
