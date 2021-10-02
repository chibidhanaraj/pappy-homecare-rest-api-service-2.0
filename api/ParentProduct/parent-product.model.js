const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create Parent Product Schema & model
const ParentProductSchema = new Schema(
  {
    brand: {
      type: String,
    },

    name: {
      type: String,
    },

    carton_box_stock: {
      type: String,
      default: '0',
    },

    product_container_stock: {
      type: String,
      default: '0',
    } /* Bottles, Wrappers, Sheets */,

    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    updated_by: {
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

const ParentProduct = mongoose.model('ParentProduct', ParentProductSchema);

module.exports = ParentProduct;
