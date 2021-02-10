const mongoose = require('mongoose');
const { ORDER_STATUS } = require('../../constants/constants');
const Schema = mongoose.Schema;
const CounterModel = require('../Counter/counter.model');

// Create Secondary Order Schema & model
const SecondaryOrderSchema = new Schema(
  {
    invoice_number: {
      type: String,
    },

    retailer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Retailer',
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
        ORDER_STATUS.ORDER_CANCELLED_BY_RETAILER,
        ORDER_STATUS.ORDER_CANCELLED_BY_DISTRIBUTOR,
        ORDER_STATUS.REACHED_DESTINATION,
      ],
      default: ORDER_STATUS.ORDERED,
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

SecondaryOrderSchema.pre('save', function (next) {
  if (!this.isNew) {
    next();
    return;
  }

  const doc = this;
  const prefixCode = 'SE-';
  CounterModel.findByIdAndUpdate(
    { _id: 'secondary-order' },
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

const SecondaryOrderModel = mongoose.model(
  'SecondaryOrder',
  SecondaryOrderSchema
);

module.exports = SecondaryOrderModel;
