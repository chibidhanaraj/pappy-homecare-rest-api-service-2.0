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
    sku_number: {
      type: String,
      required: true,
    },

    fragrance_name: {
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

    type: {
      type: 'String',
      default: 'single',
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
