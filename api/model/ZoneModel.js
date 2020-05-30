const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// create Zone Schema & model
const ZoneSchema = new Schema({
  _id: mongoose.Schema.Types.ObjectId,
  zoneName: {
    type: String,
    required: true,
  },
  zoneCode: {
    type: String,
    required: true,
    unique: true,
  },
  districts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "District",
    },
  ],
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
ZoneSchema.pre("remove", async function (next) {
  console.log(`Districts & Divisions being removed for Zone Id: ${this._id}`);
  await this.model("District").deleteMany({ zoneId: this._id });
  await this.model("Division").deleteMany({ zoneId: this._id });
  await this.model("BeatArea").deleteMany({ zoneId: this._id });
  next();
});

// Ensure virtual fields are serialised.
ZoneSchema.set("toJSON", {
  virtuals: true,
});

const ZoneModel = mongoose.model("Zone", ZoneSchema);

module.exports = ZoneModel;
