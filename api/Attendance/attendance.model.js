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

// create Attendance Schema & model
const AttendanceSchema = new Schema(
  {
    attendance_date: {
      type: Date,
    },

    is_present: {
      type: Boolean,
    },

    start_time: {
      type: Date,
    },

    start_location: locationSchema,

    end_time: {
      type: Date,
    },

    end_location: locationSchema,

    leave_reason: {
      type: String,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    work_duration: {
      type: String,
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

const Attendance = mongoose.model('Attendance', AttendanceSchema);

module.exports = Attendance;
