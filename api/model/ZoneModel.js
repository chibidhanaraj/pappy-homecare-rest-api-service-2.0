const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create Zone Schema & model
const ZoneSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    zoneCode: {
      type: String,
      required: true,
      unique: true,
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
ZoneSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

const ZoneModel = mongoose.model('Zone', ZoneSchema);

module.exports = ZoneModel;
