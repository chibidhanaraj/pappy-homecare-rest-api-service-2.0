const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ContactSchema = new Schema(
  {
    contact_person_name: {
      type: String,
    },

    contact_number: {
      type: String,
    },

    additional_contact_number: {
      type: String,
    },

    email: {
      type: String,
    },
  },
  { _id: false }
);

const additionalContactSchema = new Schema(
  {
    contact_person_name: {
      type: String,
    },

    contact_number: {
      type: String,
    },

    designation: {
      type: String,
    },
  },
  { _id: false }
);

const AddressSchema = new Schema(
  {
    door_number: {
      type: String,
    },

    street_address: {
      type: String,
    },

    landmark: {
      type: String,
    },

    place: {
      type: String,
    },

    zip_code: {
      type: String,
    },
  },
  { _id: false }
);

// create Retailer Schema & model
const RetailerSchema = new Schema(
  {
    name: {
      type: String,
    },

    contact: ContactSchema,

    additional_contacts: [additionalContactSchema],

    address: AddressSchema,

    gstin: {
      type: String,
    },

    retail_type: {
      type: String,
      enum: [
        'SMALL_SHOP',
        'MEDIUM_SHOP',
        'LARGE_SHOP',
        'DEPARTMENTAL_STORE',
        'CHAIN_STORE',
      ],
    },

    beat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Beat',
    },

    distributor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Distributor',
    },

    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    updated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
    timestamps: { createdAt: true, updatedAt: true },
    versionKey: false,
  }
);

const Retailer = mongoose.model('Retailer', RetailerSchema);

module.exports = Retailer;
