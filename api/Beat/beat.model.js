const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create Beat Schema & model
const BeatSchema = new Schema(
  {
    name: {
      type: String,
    },

    area: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Area',
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

const BeatModel = mongoose.model('Beat', BeatSchema);

module.exports = BeatModel;
