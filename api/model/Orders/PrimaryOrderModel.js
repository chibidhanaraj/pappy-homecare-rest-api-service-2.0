const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const CounterModel = require("../CounterModel");

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

// Create Primary Order Schema & model
const PrimaryOrderSchema = new Schema(
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

PrimaryOrderSchema.pre("save", function (next) {
  if (!this.isNew) {
    next();
    return;
  }

  const doc = this;
  const prefixCode = "PR-";
  CounterModel.findByIdAndUpdate(
    { _id: "primaryOrder" },
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
PrimaryOrderSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

const PrimaryOrderModel = mongoose.model("PrimaryOrder", PrimaryOrderSchema);

module.exports = PrimaryOrderModel;
