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

const DistributorSchema = new Schema({
  _id: mongoose.Schema.Types.ObjectId,

  distributorName: {
    type: String,
    required: [true, "Please add the Distributor Name"],
  },

  deliveryVehiclesCount: {
    type: String,
  },

  existingRetailersCount: {
    type: String,
  },

  contact: contactSchema,

  additionalContacts: [additionalContactSchema],

  currentBrandsDealing: [currentBrandsDealingSchema],

  address: AddressSchema,

  gstNumber: {
    type: String,
  },

  superStockistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SuperStockist",
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

  areas: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Area",
    },
  ],

  retailers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Retailer",
    },
  ],
});

// Cascade delete distributor
DistributorSchema.pre("remove", async function (next) {
  await Promise.all([
    await this.model("Zone").updateMany(
      { _id: { $in: this.zones } },
      {
        $pull: {
          distributors: this._id,
        },
      },
      { multi: true }
    ),
    await this.model("District").updateMany(
      { _id: { $in: this.districts } },
      {
        $pull: {
          distributors: this._id,
        },
      },
      { multi: true }
    ),
    await this.model("Area").updateMany(
      { _id: { $in: this.areas } },
      {
        $pull: {
          distributors: this._id,
        },
      },
      { multi: true }
    ),
    await this.model("Retailer").updateMany(
      { distributorId: this._id },
      { $set: { distributorId: null } },
      { multi: true }
    ),
  ]);
  next();
});

DistributorSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

const DistributorModel = mongoose.model("Distributor", DistributorSchema);

module.exports = DistributorModel;
