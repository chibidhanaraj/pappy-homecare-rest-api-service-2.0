const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create District Schema & model
const DistrictSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    districtCode: {
      type: String,
      required: true,
    },

    zoneId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Zone',
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

// Ensure virtual fields are serialised.
DistrictSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

const DistrictModel = mongoose.model('District', DistrictSchema);

module.exports = DistrictModel;
