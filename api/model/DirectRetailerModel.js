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
    districtId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "District",
    },
  },
  { _id: false }
);

const DirectRetailerSchema = new Schema({
  _id: mongoose.Schema.Types.ObjectId,

  directRetailerName: {
    type: String,
    required: [true, "Please add the Direct Retailer Name"],
  },

  contact: contactSchema,

  additionalContacts: [additionalContactSchema],

  address: AddressSchema,

  gstNumber: {
    type: String,
  },
});

DirectRetailerSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

const DirectRetailerModel = mongoose.model(
  "DirectRetailer",
  DirectRetailerSchema
);

module.exports = DirectRetailerModel;
