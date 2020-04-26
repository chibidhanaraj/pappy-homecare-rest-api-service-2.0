const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// create Customer type model and schema
const productPriceSchema = new Schema({
  _id: mongoose.Schema.Types.ObjectId,
  distributionTypeA: {
    type: [
      {
        basePrice: Number,
        superStockistPrice: Number,
        distributorPrice: Number,
        retailerPrice: Number,
      },
    ],
  },
  distributionTypeB: {
    type: [
      {
        basePrice: Number,
        distributorPrice: Number,
        retailerPrice: Number,
      },
    ],
  },
  distributionTypeC: {
    type: [
      {
        basePrice: Number,
        wholeSellerPrice: Number,
        retailerPrice: Number,
      },
    ],
  },
  distributionTypeD: {
    type: [
      {
        basePrice: Number,
        retailerPrice: Number,
      },
    ],
  },
});

const ProductPriceModel = mongoose.model("ProductPrice", productPriceSchema);

module.exports = ProductPriceModel;
