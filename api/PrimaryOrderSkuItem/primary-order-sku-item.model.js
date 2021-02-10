const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Primary Order Schema & model
const PrimaryOrderSkuItemSchema = new Schema(
  {
    primary_order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PrimaryOrder',
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

    pieces_per_carton: {
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

const PrimaryOrderSkuItemModel = mongoose.model(
  'PrimaryOrderSkuItem',
  PrimaryOrderSkuItemSchema
);

module.exports = PrimaryOrderSkuItemModel;
