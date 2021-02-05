const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create Zone Schema & model
const ZoneSchema = new Schema(
  {
    name: {
      type: String,
      require: true,
      unique: true,
      trim: true,
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

const Zone = mongoose.model('Zone', ZoneSchema);

module.exports = Zone;
