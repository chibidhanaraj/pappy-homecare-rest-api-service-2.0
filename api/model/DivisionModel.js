const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// create Division Schema & model
const divisionSchema = new Schema({
  _id: mongoose.Schema.Types.ObjectId,
  divisionName: {
    type: String,
    required: true,
  },
  divisionCode: {
    type: String,
    required: true,
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
  beatAreas: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BeatArea",
    },
  ],
});

// Cascade delete district when a zone is deleted
divisionSchema.pre("remove", async function (next) {
  console.log(
    `Division Id: ${this._id} is being removed from Zone Collection & District Collection and the respective beat areas are being destroyed`
  );
  await this.model("Zone").findOneAndUpdate(
    { _id: this.zoneId },
    { $pull: { divisions: this._id, beatAreas: { $in: this.beatAreas } } }
  );
  await this.model("District").findOneAndUpdate(
    { _id: this.districtId },
    {
      $pull: {
        divisions: this._id,
        beatAreas: { $in: this.beatAreas },
      },
    }
  );
  await this.model("BeatArea").deleteMany({ divisionId: this._id });
  next();
});

// Ensure virtual fields are serialised.
divisionSchema.set("toJSON", {
  virtuals: true,
});

const DivisionModel = mongoose.model("Division", divisionSchema);

module.exports = DivisionModel;
