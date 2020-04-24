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
});

const ZoneModel = mongoose.model("Zone", ZoneSchema);

module.exports = ZoneModel;
