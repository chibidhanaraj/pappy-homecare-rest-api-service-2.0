const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const variationsSchema = new Schema(
  {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SkuSchema',
    },

    quantity: {
      type: String,
      default: '1',
    },
  },
  { _id: false }
);

// create Sku Schema & model
const SkuSchema = new Schema(
  {
    sku: {
      type: String,
    },

    name: {
      type: String,
    },

    mrp: {
      type: String,
      default: '0',
    },

    special_selling_price: {
      type: String,
    },

    parent_product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ParentProduct',
    },

    sku_type: {
      type: 'String',
      default: 'single',
    },

    pieces_per_carton: {
      type: String,
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

    child: [variationsSchema],

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

const Sku = mongoose.model('Sku', SkuSchema);

module.exports = Sku;
