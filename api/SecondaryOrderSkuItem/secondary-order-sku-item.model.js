const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Secondary Order Schema & model
const SecondaryOrderSkuItemSchema = new Schema(
  {
    secondary_order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SecondaryOrder',
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

const SecondaryOrderSkuItemModel = mongoose.model(
  'SecondaryOrderSkuItem',
  SecondaryOrderSkuItemSchema
);

module.exports = SecondaryOrderSkuItemModel;
