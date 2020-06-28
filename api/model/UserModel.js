const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = new Schema({
  _id: mongoose.Schema.Types.ObjectId,

  name: {
    type: String,
    required: [true, "Please add a name"],
  },

  mobileNumber: {
    type: Number,
    required: [true, "Please add a mobile number"],
  },

  password: {
    type: String,
    required: [true, "Please add a password"],
    minlength: 6,
    select: false,
  },

  role: {
    type: String,
    enum: [
      "ADMIN",
      "BACKOFFICE_ADMIN",
      "REGIONAL_SALES_MANAGER",
      "AREA_SALES_MANAGER",
      "SALES_OFFICER",
      "TERRITORY_SALES_INCHARGE",
    ],
    default: "BACKOFFICE_ADMIN",
  },

  isReportingToAdmin: {
    type: Boolean,
    default: false,
  },

  reportingTo: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  reporters: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  zones: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Zone",
    },
  ],

  districts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "District",
    },
  ],

  areas: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Area",
    },
  ],
});

// Encrypt password using bcrypt
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
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

UserSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

const UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;
