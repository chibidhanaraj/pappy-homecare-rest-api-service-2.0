const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create Retail Visit Schema & model
const RetailVisitSchema = new Schema(
  {
    retailer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Retailer',
    },

    visit_result: {
      type: String,
    },

    feedback: {
      type: String,
      trim: true,
    },

    secondary_order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SecondaryOrder',
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

const RetailVisit = mongoose.model('RetailVisit', RetailVisitSchema);

module.exports = RetailVisit;
