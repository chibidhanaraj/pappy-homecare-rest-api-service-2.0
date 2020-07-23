const mongoose = require('mongoose');
const { CUSTOMER_CONSTANTS } = require('../../constants/constants');
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
    name: {
      type: String,
      required: [true, 'Please add the Retailer Name'],
    },

    retailerType: {
      type: String,
      enum: [
        'SMALL_SHOP',
        'MEDIUM_SHOP',
        'LARGE_SHOP',
        'DEPARTMENTAL_STORE',
        'CHAIN_STORE',
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

    beatAreaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BeatArea',
    },

    distributorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Distributor',
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: { createdAt: true, updatedAt: true },
  }
);

RetailerSchema.virtual('customerType').get(function () {
  return CUSTOMER_CONSTANTS.RETAILER;
});

const RetailerModel = mongoose.model('Retailer', RetailerSchema);

module.exports = RetailerModel;
