const mongoose = require("mongoose");
const CounterModel = require("../CounterModel");
const Schema = mongoose.Schema;

const OrderItemsSchema = new Schema(
  {
    skuId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sku",
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
      ref: "Product",
    },
  },
  { _id: false }
);

// Create SecondPrimary Order Schema & model
const SecondPrimaryOrderSchema = new Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
    },

    customerType: {
      type: String,
    },

    distributionType: {
      type: String,
    },

    totalPrice: {
      type: Number,
    },

    orderedItems: [OrderItemsSchema],

    note: {
      type: String,
    },

    orderTakenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    status: {
      type: String,
      enum: ["WAITING_FOR_APPROVAL", "APPROVED_BY_COMPANY", "CANCELLED"],
    },

    orderNumber: {
      type: String,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: { createdAt: true, updatedAt: false },
  }
);

SecondPrimaryOrderSchema.pre("save", function (next) {
  if (!this.isNew) {
    next();
    return;
  }

  const doc = this;
  const prefixCode = "SD-PR-";

  CounterModel.findByIdAndUpdate(
    { _id: "secondPrimaryOrder" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  )
    .then(function (counter) {
      doc.orderNumber = prefixCode.concat(counter.seq);
      next();
    })
    .catch(function (error) {
      console.error("counter error-> : " + error);
      throw error;
    });
});

// Ensure virtual fields are serialised.
SecondPrimaryOrderSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

const SecondPrimaryOrderModel = mongoose.model(
  "SecondPrimaryOrder",
  SecondPrimaryOrderSchema
);

module.exports = SecondPrimaryOrderModel;
