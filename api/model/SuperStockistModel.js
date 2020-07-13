const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const contactSchema = new Schema(
  {
    contactPersonName: {
      type: String,
    },
    contactNumber: {
      type: String,
    },
    additionalContactNumber: {
      type: String,
    },
    emailAddress: {
      type: String,
    },
  },
  { _id: false }
);

const additionalContactSchema = new Schema(
  {
    contactPersonName: {
      type: String,
    },
    contactNumber: {
      type: String,
    },
    role: {
      type: String,
    },
  },
  { _id: false }
);

const currentBrandsDealingSchema = new Schema(
  {
    brandName: {
      type: String,
    },
    turnOverAmount: {
      type: String,
    },
    brandDealershipPeriod: {
      type: String,
    },
  },
  { _id: false }
);

const AddressSchema = new Schema(
  {
    doorNumber: {
      type: String,
    },
    addressOne: {
      type: String,
    },
    addressTwo: {
      type: String,
    },
    landmark: {
      type: String,
    },
    place: {
      type: String,
    },
  },
  { _id: false }
);

const SuperStockistSchema = new Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,

    name: {
      type: String,
      required: [true, "Please add the Super Stockist Name"],
    },

    existingDistributorsCount: {
      type: String,
    },

    contact: contactSchema,

    additionalContacts: [additionalContactSchema],

    currentBrandsDealing: [currentBrandsDealingSchema],

    address: AddressSchema,

    gstNumber: {
      type: String,
    },

    zones: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Zone",
      },
    ],

    districts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "District",
      },
    ],

    distributors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Distributor",
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: { createdAt: true, updatedAt: true },
  }
);

SuperStockistSchema.virtual("zonesPayload", {
  ref: "Zone",
  localField: "zones",
  foreignField: "_id",
});

SuperStockistSchema.virtual("districtsPayload", {
  ref: "District",
  localField: "districts",
  foreignField: "_id",
});

// Cascade delete Super Stockist
SuperStockistSchema.pre("remove", async function (next) {
  await Promise.all([
    await this.model("Zone").updateMany(
      { _id: { $in: this.zones } },
      {
        $pull: {
          superStockists: this._id,
        },
      },
      { multi: true }
    ),
    await this.model("District").updateMany(
      { _id: { $in: this.districts } },
      {
        $pull: {
          superStockists: this._id,
        },
      },
      { multi: true }
    ),
    await this.model("Distributor").updateMany(
      { superStockistId: this._id },
      { $set: { superStockistId: null } },
      { multi: true }
    ),
  ]);

  next();
});

// Ensure virtual fields are serialised.
SuperStockistSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

const SuperStockistModel = mongoose.model("SuperStockist", SuperStockistSchema);

module.exports = SuperStockistModel;
