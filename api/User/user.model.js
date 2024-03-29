const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    user_name: {
      type: String,
      required: true,
      unique: true,
    },

    mobile_number: {
      type: Number,
      required: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    allowed_apps: [
      {
        type: String,
      },
    ],

    restrict_by_territory: {
      type: Boolean,
      default: true,
    },

    assigned_beats: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Beat',
      },
    ],

    role: {
      type: String,
      enum: [
        'ADMIN',
        'BACKOFFICE_ADMIN',
        'REGIONAL_SALES_MANAGER',
        'AREA_SALES_MANAGER',
        'SALES_OFFICER',
        'TERRITORY_SALES_INCHARGE',
      ],
      default: 'ADMIN',
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    is_inactive: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: { createdAt: true, updatedAt: true },
  }
);

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

UserSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

const UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;
