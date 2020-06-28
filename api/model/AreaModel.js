const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// create Area Schema & model
const AreaSchema = new Schema(
  {
    areaName: {
      type: String,
      required: true,
    },
    areaCode: {
      type: String,
      required: true,
    },
    zoneId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Zone",
    },
    districtId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "District",
    },
    beatAreas: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BeatArea",
      },
    ],
    distributors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Distributor",
      },
    ],
    retailers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Retailer",
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

AreaSchema.virtual("zone", {
  ref: "Zone",
  localField: "zoneId",
  foreignField: "_id",
  justOne: true,
});

AreaSchema.virtual("district", {
  ref: "District",
  localField: "districtId",
  foreignField: "_id",
  justOne: true,
});

// Cascade delete district when a zone is deleted
AreaSchema.pre("remove", async function (next) {
  console.log(
    `Area Id: ${this._id} is being removed from Zone Collection & District Collection and the respective beat areas are being destroyed`
  );
  await Promise.all([
    await this.model("Zone").findOneAndUpdate(
      { _id: this.zoneId },
      { $pull: { areas: this._id, beatAreas: { $in: this.beatAreas } } }
    ),
    await this.model("District").findOneAndUpdate(
      { _id: this.districtId },
      {
        $pull: {
          areas: this._id,
          beatAreas: { $in: this.beatAreas },
        },
      }
    ),
    await this.model("BeatArea").deleteMany({ areaId: this._id }),
    await this.model("Retailer").updateMany(
      { areaId: this._id },
      { $set: { areaId: null, beatAreaId: null } },
      { multi: true }
    ),
  ]);

  next();
});

// Ensure virtual fields are serialised.
AreaSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

const AreaModel = mongoose.model("Area", AreaSchema);

module.exports = AreaModel;
