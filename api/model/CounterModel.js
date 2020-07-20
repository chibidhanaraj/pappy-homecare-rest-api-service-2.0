const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CounterSchema = Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

CounterSchema.index({ _id: 1, seq: 1 }, { unique: true });

const CounterModel = mongoose.model("counter", CounterSchema);

module.exports = CounterModel;
