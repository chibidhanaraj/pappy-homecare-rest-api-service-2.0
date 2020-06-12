const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// create BeatArea Schema & model
const BeatAreaSchema = new Schema({
  _id: mongoose.Schema.Types.ObjectId,
  beatAreaName: {
    type: String,
    required: true,
  },
  beatAreaCode: {
    type: String,
    required: true,
  },
  areaId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Area",
  },
  districtId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "District",
  },
  zoneId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Zone",
  },
  retailers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Retailer",
    },
  ],
});

// Cascade delete beatAreasId in Zone, District, Area Models
BeatAreaSchema.pre("remove", async function (next) {
  console.log(
    `BeatArea Id: ${this._id} is being removed from Zone Collection & District Collection & Area Collection`
  );
  await this.model("Zone").findOneAndUpdate(
    { _id: this.zoneId },
    { $pull: { beatAreas: this._id } }
  );
  await this.model("District").findOneAndUpdate(
    { _id: this.districtId },
    { $pull: { beatAreas: this._id } }
  );
  await this.model("Area").findOneAndUpdate(
    { _id: this.areaId },
    { $pull: { beatAreas: this._id } }
  );
  await this.model("Retailer").updateMany(
    { beatAreaId: this._id },
    { $set: { beatAreadId: null } },
    { multi: true }
  );
  next();
});

// Ensure virtual fields are serialised.
BeatAreaSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

const AreaModel = mongoose.model("BeatArea", BeatAreaSchema);

module.exports = AreaModel;
