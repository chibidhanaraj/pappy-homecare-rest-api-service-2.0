const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ContactSchema = new Schema({
  contactName: {
    type: String,
  },
  contactNumber: {
    type: Number,
  },
  emailAddress: {
    type: String,
  },
  primaryContact: {
    type: Boolean,
    required: true,
  },
});

const AddressSchema = new Schema({
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
  district: {
    type: String,
  },
  pincode: {
    type: Number,
  },
});

// create BeatArea Schema & model
const customerSchema = new Schema({
  _id: mongoose.Schema.Types.ObjectId,

  customerName: {
    type: String,
    required: true,
  },

  distributionType: [String],

  contact: [ContactSchema],

  gstNumber: {
    type: String,
    required: true,
    unique: true,
  },

  address: [AddressSchema],

  customerBeatAreas: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BeatArea",
    },
  ],
});

const CustomerModel = mongoose.model("Customer", customerSchema);

module.exports = CustomerModel;
