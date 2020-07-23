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

const DistributorSchema = new Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,

    name: {
      type: String,
      required: [true, 'Please add the Distributor Name'],
    },

    distributionType: {
      type: String,
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
      ref: 'SuperStockist',
    },

    areas: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Area',
      },
    ],

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

DistributorSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

const DistributorModel = mongoose.model('Distributor', DistributorSchema);

module.exports = DistributorModel;
