const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// create District Schema & model
const DistrictSchema = new Schema({
  _id: mongoose.Schema.Types.ObjectId,
  districtName: {
    type: String,
    required: true,
  },
  districtCode: {
    type: String,
    required: true,
  },
  zoneId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Zone",
  },
  areas: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Area",
    },
  ],
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
});

// Cascade delete district when a zone is deleted
DistrictSchema.pre("remove", async function (next) {
  console.log(
    `District Id: ${this._id} is being removed from Zone Collection, and respective Areas and beat areas are being destroyed`
  );
  Promise.all([
    await this.model("Zone").findOneAndUpdate(
      { _id: this.zoneId },
      {
        $pull: {
          districts: this._id,
          areas: { $in: this.areas }, //remove the matching areas from zones
          beatAreas: { $in: this.beatAreas }, //remove the matching beatAreas from zones
        },
      }
    ),
    await this.model("Area").deleteMany({ districtId: this._id }),
    await this.model("BeatArea").deleteMany({ districtId: this._id }),
    await this.model("Retailer").updateMany(
      { districtId: this._id },
      { $set: { districtId: null, areaId: null, beatAreaId: null } },
      { multi: true }
    ),

    // await this.model("Distributor").updateMany(
    //   { _id: { $in: this.distributors } },
    //   {
    //     $pull: {
    //       zones: this.zoneId,
    //       districts: this._id,
    //       areas: { $in: this.areas }, //remove the matching areas from distributor
    //     },
    //   },
    //   { multi: true }
    // ),
  ]);

  next();
});

// Ensure virtual fields are serialised.
DistrictSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

const DistrictModel = mongoose.model("District", DistrictSchema);

module.exports = DistrictModel;
