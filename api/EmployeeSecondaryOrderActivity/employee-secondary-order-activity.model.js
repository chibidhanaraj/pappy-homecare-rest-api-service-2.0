const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const locationSchema = new Schema(
  {
    // GeoJSON Point
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      index: '2dsphere',
    },
  },
  { _id: false }
);

// Employee Secondary Order Activity & model
const EmployeeSecondaryOrderActivitySchema = new Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    activity: {
      type: String,
    },

    retailer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Retailer',
    },

    super_stockist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SuperStockist',
    },

    distributor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Distributor',
    },

    secondary_order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SecondaryOrder',
    },

    retail_visit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RetailVisit',
    },

    location: locationSchema,
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

const EmployeeSecondaryOrderActivity = mongoose.model(
  'EmployeeSecondaryOrderActivity',
  EmployeeSecondaryOrderActivitySchema
);

module.exports = EmployeeSecondaryOrderActivity;
