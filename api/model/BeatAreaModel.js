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

const DivisionModel = mongoose.model("BeatArea", beatAreaSchema);

module.exports = DivisionModel;
