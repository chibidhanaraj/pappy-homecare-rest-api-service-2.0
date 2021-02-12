const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Distributor Sku Inventory Activity Schema & model
const DistributorSkuInventoryActivitySchema = new Schema(
  {
    distributor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Distributor',
    },

    primary_order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PrimaryOrder',
    },

    second_primary_order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SecondPrimaryOrder',
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

const DistributorSkuInventoryActivity = mongoose.model(
  'DistributorSkuInventoryActivity',
  DistributorSkuInventoryActivitySchema
);

module.exports = DistributorSkuInventoryActivity;
