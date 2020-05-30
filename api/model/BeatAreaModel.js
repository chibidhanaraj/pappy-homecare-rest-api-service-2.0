const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// create BeatArea Schema & model
const beatAreaSchema = new Schema({
  _id: mongoose.Schema.Types.ObjectId,
  beatAreaName: {
    type: String,
    required: true,
  },
  beatAreaCode: {
    type: String,
    required: true,
  },
  divisionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Division",
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
  assignedCustomers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },
  ],
});

// Cascade delete district when a zone is deleted
beatAreaSchema.pre("remove", async function (next) {
  console.log(
    `BeatArea Id: ${this._id} is being removed from Zone Collection & District Collection & Division Collection`
  );
  await this.model("Zone").findOneAndUpdate(
    { _id: this.zoneId },
    { $pull: { beatAreas: this._id } }
  );
  await this.model("District").findOneAndUpdate(
    { _id: this.districtId },
    { $pull: { beatAreas: this._id } }
  );
  await this.model("Division").findOneAndUpdate(
    { _id: this.divisionId },
    { $pull: { beatAreas: this._id } }
  );
  next();
});

// Ensure virtual fields are serialised.
beatAreaSchema.set("toJSON", {
  virtuals: true,
});

const DivisionModel = mongoose.model("BeatArea", beatAreaSchema);

module.exports = DivisionModel;
