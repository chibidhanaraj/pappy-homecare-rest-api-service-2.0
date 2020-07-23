const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create Area Schema & model
const AreaSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    areaCode: {
      type: String,
      required: true,
    },

    districtId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'District',
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
AreaSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

const AreaModel = mongoose.model('Area', AreaSchema);

module.exports = AreaModel;
