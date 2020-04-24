const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// create Customer type model and schema
const customerTypeSchema = new Schema({
  _id: mongoose.Schema.Types.ObjectId,
  customerTypeName: {
    type: String,
    unique: true,
  },
  customerTypeCode: {
    type: String,
    unique: true,
  },
});

const CustomerTypeModel = mongoose.model("CustomerType", customerTypeSchema);

module.exports = CustomerTypeModel;
