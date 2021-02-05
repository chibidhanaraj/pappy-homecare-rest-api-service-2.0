const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const CounterModel = require('../Counter/counter.model');

const OrderItemsSchema = new Schema(
  {
    skuId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sku',
    },

    count: {
      type: Number,
      default: 0,
    },

    piecesPerCarton: {
      type: Number,
      default: 1,
    },

    skuPrice: {
      type: Number,
      default: 0,
    },

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
  },
  { _id: false }
);

// Create Primary Order Schema & model
const PrimaryOrderSchema = new Schema(
  {
    invoice_number: {
      type: String,
    },

    customer_type: {
      type: String,
    },

    super_stockist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SuperStockist',
    },

    distributor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Distributor',
    },

    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    updated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    orderedItems: [OrderItemsSchema],

    note: {
      type: String,
    },

    status: {
      type: String,
      enum: ['ORDER_TAKEN', 'APPROVED_BY_COMPANY', 'CANCELLED'],
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

PrimaryOrderSchema.pre('save', function (next) {
  if (!this.isNew) {
    next();
    return;
  }

  const doc = this;
  const prefixCode = 'PRIM-';
  CounterModel.findByIdAndUpdate(
    { _id: 'primary-order' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  )
    .then(function (counter) {
      doc.invoice_number = prefixCode.concat(counter.seq);
      next();
    })
    .catch(function (error) {
      console.error('counter error-> : ' + error);
      throw error;
    });
});

const PrimaryOrderModel = mongoose.model('PrimaryOrder', PrimaryOrderSchema);

module.exports = PrimaryOrderModel;
