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

const DivisionModel = mongoose.model("Division", divisionSchema);

module.exports = DivisionModel;
