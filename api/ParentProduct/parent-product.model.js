const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create Parent Product Schema & model
const ParentProductSchema = new Schema(
  {
    brand: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ['LIQUID', 'POWDER', 'SOAP', 'SCRUBBER', 'OTHERS'],
      default: 'LIQUID',
    },

    product_quantity: {
      type: String,
      default: '0',
    },

    product_quantity_unit: {
      type: String,
      enum: ['ml', 'l', 'kg', 'g'],
      default: 'ml',
    },

    pieces_per_carton: {
      type: String,
      required: true,
      default: 1,
    },

    sgst: {
      type: String,
      default: '0',
    },

    cgst: {
      type: String,
      default: '0',
    },

    igst: {
      type: String,
      default: '0',
    },

    super_stockist_margin: {
      type: String,
      default: '0',
    },

    distributor_margin: {
      type: String,
      default: '0',
    },

    retailer_margin: {
      type: String,
      default: '0',
    },

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
