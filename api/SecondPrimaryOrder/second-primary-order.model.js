const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const CounterModel = require('../Counter/counter.model');
const { ORDER_STATUS } = require('../../constants/constants');

// Create Second Primary Order Schema & model
const SecondPrimaryOrderSchema = new Schema(
  {
    invoice_number: {
      type: String,
    },

    distributor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Distributor',
    },

    super_stockist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SuperStockist',
    },

    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    updated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    sku_items: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PrimaryOrderSkuItem',
      },
    ],

    note: {
      type: String,
    },

    status: {
      type: String,
      enum: [
        ORDER_STATUS.ORDERED,
        ORDER_STATUS.ORDER_APPROVED,
        ORDER_STATUS.ORDER_CANCELLED_BY_SUPER_STOCKIST,
        ORDER_STATUS.ORDER_CANCELLED_BY_DISTRIBUTOR,
        ORDER_STATUS.REACHED_DESTINATION,
      ],
      default: 'ORDERED',
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

SecondPrimaryOrderSchema.pre('save', function (next) {
  if (!this.isNew) {
    next();
    return;
  }

  const doc = this;
  const prefixCode = 'SE-PRIM-';
  CounterModel.findByIdAndUpdate(
    { _id: 'second-primary-order' },
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

const SecondPrimaryOrderModel = mongoose.model(
  'SecondPrimaryOrder',
  SecondPrimaryOrderSchema
);

module.exports = SecondPrimaryOrderModel;
