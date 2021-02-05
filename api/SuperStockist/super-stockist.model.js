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

const currentBrandsDealingSchema = new Schema(
  {
    brand_name: {
      type: String,
    },

    turn_over_amount: {
      type: String,
    },

    brand_dealing_time_period: {
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

// create Super Stockist Schema & model
const SuperStockistSchema = new Schema(
  {
    name: {
      type: String,
    },

    contact: ContactSchema,

    additional_contacts: [additionalContactSchema],

    other_brands_dealing_experience: [currentBrandsDealingSchema],

    address: AddressSchema,

    gstin: {
      type: String,
    },

    existing_distributors_count: {
      type: String,
      default: '0',
    },

    appointed_districts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'District',
      },
    ],

    is_appointment_confirmed_by_company: {
      type: Boolean,
      default: false,
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

const SuperStockist = mongoose.model('SuperStockist', SuperStockistSchema);

module.exports = SuperStockist;
