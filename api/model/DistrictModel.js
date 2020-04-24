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
});

const DistrictModel = mongoose.model("District", districtSchema);

module.exports = DistrictModel;
