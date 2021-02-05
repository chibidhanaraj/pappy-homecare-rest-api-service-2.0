const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create Area Schema & model
const AreaSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    district: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'District',
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

const AreaModel = mongoose.model('Area', AreaSchema);

module.exports = AreaModel;
