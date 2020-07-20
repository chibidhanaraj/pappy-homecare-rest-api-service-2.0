const mongoose = require("mongoose");
const { CUSTOMER_CONSTANTS } = require("../../constants/constants");
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

const RetailerSchema = new Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,

    name: {
      type: String,
      required: [true, "Please add the Retailer Name"],
    },

    retailerType: {
      type: String,
      enum: [
        "SMALL_SHOP",
        "MEDIUM_SHOP",
        "LARGE_SHOP",
        "DEPARTMENTAL_STORE",
        "CHAIN_STORE",
      ],
    },

    distributionType: {
      type: String,
    },

    contact: contactSchema,

    additionalContacts: [additionalContactSchema],

    address: AddressSchema,

    gstNumber: {
      type: String,
    },

    zoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Zone",
    },

    districtId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "District",
    },

    areaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Area",
    },

    beatAreaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BeatArea",
    },

    distributorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Distributor",
    },

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

RetailerSchema.virtual("customerType").get(function () {
  return CUSTOMER_CONSTANTS.RETAILER;
});

RetailerSchema.virtual("zone", {
  ref: "Zone",
  localField: "zoneId",
  foreignField: "_id",
  justOne: true,
});

RetailerSchema.virtual("district", {
  ref: "District",
  localField: "districtId",
  foreignField: "_id",
  justOne: true,
});

RetailerSchema.virtual("area", {
  ref: "Area",
  localField: "areaId",
  foreignField: "_id",
  justOne: true,
});

RetailerSchema.virtual("beatArea", {
  ref: "BeatArea",
  localField: "beatAreaId",
  foreignField: "_id",
  justOne: true,
});

RetailerSchema.virtual("distributor", {
  ref: "Distributor",
  localField: "distributorId",
  foreignField: "_id",
  justOne: true,
});

// Cascade delete retailerId in Zone, District, Area, BeatArea, Distributor Models
RetailerSchema.pre("remove", async function (next) {
  console.log(
    `Retailer Id: ${this._id} is being removed fromZone, District, Area, BeatArea, Distributor Collections`
  );
  await this.model("Zone").findOneAndUpdate(
    { _id: this.zoneId },
    { $pull: { retailers: this._id } }
  );
  await this.model("District").findOneAndUpdate(
    { _id: this.districtId },
    { $pull: { retailers: this._id } }
  );
  await this.model("Area").findOneAndUpdate(
    { _id: this.areaId },
    { $pull: { retailers: this._id } }
  );
  await this.model("BeatArea").findOneAndUpdate(
    { _id: this.beatAreaId },
    { $pull: { retailers: this._id } }
  );
  await this.model("Distributor").findOneAndUpdate(
    { _id: this.distributorId },
    { $pull: { retailers: this._id } }
  );
  next();
});

const RetailerModel = mongoose.model("Retailer", RetailerSchema);

module.exports = RetailerModel;
