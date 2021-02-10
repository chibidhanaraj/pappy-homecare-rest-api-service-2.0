const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create District Schema & model
const DistrictSchema = new Schema(
  {
    name: {
      type: String,
    },

    zone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Zone',
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

const DistrictModel = mongoose.model('District', DistrictSchema);

module.exports = DistrictModel;
