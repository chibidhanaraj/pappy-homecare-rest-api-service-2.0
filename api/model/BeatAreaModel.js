const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create BeatArea Schema & model
const BeatAreaSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    beatAreaCode: {
      type: String,
      required: true,
      unique: true,
    },

    areaId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Area',
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
BeatAreaSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

const AreaModel = mongoose.model('BeatArea', BeatAreaSchema);

module.exports = AreaModel;
