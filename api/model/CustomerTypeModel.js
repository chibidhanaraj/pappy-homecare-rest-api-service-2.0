const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// create Customer type model and schema
const CustomerTypeSchema = new Schema({
  _id: mongoose.Schema.Types.ObjectId,
  customerTypeName: {
    type: String,
    unique: true,
  },
  customerTypeCode: {
    type: String,
  },
  marginPercentage: {
    type: Number,
  },
});

CustomerTypeSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

const CustomerTypeModel = mongoose.model("CustomerType", CustomerTypeSchema);

module.exports = CustomerTypeModel;
