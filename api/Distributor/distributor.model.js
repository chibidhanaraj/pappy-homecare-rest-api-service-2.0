const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const contactSchema = new Schema(
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

// create Distributor Schema & model
const DistributorSchema = new Schema(
  {
    name: {
      type: String,
    },

    contact: contactSchema,

    additional_contacts: [additionalContactSchema],

    other_brands_dealing_experience: [currentBrandsDealingSchema],

    address: AddressSchema,

    gstin: {
      type: String,
    },

    appointed_areas: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Area',
      },
    ],

    distribution_type: {
      type: String,
      enum: ['PRIMARY_DISTRIBUTOR', 'SECOND_PRIMARY_DISTRIBUTOR'],
      default: 'PRIMARY_DISTRIBUTOR',
    },

    delivery_vehicles_count: {
      type: String,
    },

    existing_retailers_count: {
      type: String,
    },

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

const Distributor = mongoose.model('Distributor', DistributorSchema);

module.exports = Distributor;
