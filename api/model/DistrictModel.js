const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// create District Schema & model
const districtSchema = new Schema({
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
  divisions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Division",
    },
  ],
  beatAreas: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BeatArea",
    },
  ],
});

// Cascade delete district when a zone is deleted
districtSchema.pre("remove", async function (next) {
  console.log(
    `District Id: ${this._id} is being removed from Zone Collection, and respective divisions and beat areas are being destroyed`
  );
  await this.model("Zone").findOneAndUpdate(
    { _id: this.zoneId },
    { $pull: { districts: this._id } }
  );
  await this.model("Division").deleteMany({ districtId: this._id });
  await this.model("BeatArea").deleteMany({ districtId: this._id });
  next();
});

// Ensure virtual fields are serialised.
districtSchema.set("toJSON", {
  virtuals: true,
});

const DistrictModel = mongoose.model("District", districtSchema);

module.exports = DistrictModel;
