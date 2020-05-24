const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const contactSchema = new Schema(
  {
    contactPersonName: {
      type: String,
      required: [true, "Please add the Contact Person Name"],
    },
    contactNumber: {
      type: String,
      required: [true, "Please add the Contact Person Number"],
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
  },
  { _id: false }
);

const AddressSchema = new Schema(
  {
    doorNumber: {
      type: String,
    },
    streetAddress: {
      type: String,
    },
    landmark: {
      type: String,
    },
    place: {
      type: String,
    },
    pincode: {
      type: Number,
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

  contact: contactSchema,

  additionalContacts: [additionalContactSchema],

  address: AddressSchema,

  gstNumber: {
    type: String,
    required: [true, "Please add a GST number"],
    unique: true,
  },

  customerBeatAreas: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BeatArea",
    },
  ],
});

const DistributorModel = mongoose.model("Distributor", DistributorSchema);

module.exports = DistributorModel;
