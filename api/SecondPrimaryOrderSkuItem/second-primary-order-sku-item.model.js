const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Second Primary Order Schema & model
const SecondPrimaryOrderSkuItemSchema = new Schema(
  {
    second_primary_order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SecondPrimaryOrder',
    },

    sku: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sku',
    },

    ordered_quantity: {
      type: String,
    },

    final_quantity: {
      type: String,
    },

    margin: {
      type: String,
    },

    landed_cost: {
      type: String,
    },

    total_cost: {
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

const SecondPrimaryOrderSkuItemModel = mongoose.model(
  'SecondPrimaryOrderSkuItem',
  SecondPrimaryOrderSkuItemSchema
);

module.exports = SecondPrimaryOrderSkuItemModel;
