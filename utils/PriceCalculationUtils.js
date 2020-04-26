const Big = require("big.js");
const { customerTypesMargins } = require("../utils/CustomerTypeUtils");

const calculateLandedPrice = (price, marginPercentage) => {
  // costPrice = ( sellingPrice * 100 ) / ( 100 + percentageProfit).
  return Number(
    Big(price).times(100).div(Big(marginPercentage).plus(100)).toFixed(2)
  );
};

const calculateLandedPrices = (mrp, ...margins) => {
  let prices = {};
  let priceCount = margins.length || 0;

  (margins || []).reduce((acc, margin) => {
    return (prices[`price${priceCount--}`] = calculateLandedPrice(acc, margin));
  }, mrp); // {"price3": 100.00, "price2": 100.00, "price1": 100.00}
  return prices;
};

const typeAPrices = (
  mrp,
  retailerMargin,
  distributorMargin,
  superStockistMargin,
  gst
) => {
  // Factory -> Super Stockiest -> Distributor -> Retailer
  // Price 1 - Base Price from factory
  // Price 2 - Super Stockiest
  // Price 3 - Distributor
  // Price 4 - Retailer

  const { price1, price2, price3, price4 } = calculateLandedPrices(
    mrp,
    retailerMargin,
    distributorMargin,
    superStockistMargin,
    gst
  );

  return {
    distributionType: "A",
    basePrice: price1,
    superStockistPrice: price2,
    distributorPrice: price3,
    retailerPrice: price4,
  };
};

const typeBPrices = (mrp, retailerMargin, distributorMargin, gst) => {
  // Factory -> Distributor -> Retailer
  // Price 1 - Base Price from factory
  // Price 2 - Distributor
  // Price 3 - Retailer

  const { price1, price2, price3 } = calculateLandedPrices(
    mrp,
    retailerMargin,
    distributorMargin,
    gst
  );

  return {
    distributionType: "B",
    basePrice: price1,
    distributorPrice: price2,
    retailerPrice: price3,
  };
};

const typeCPrices = (mrp, retailerMargin, wholeSellerMargin, gst) => {
  // Factory -> WholeSeller -> Retailer
  // Price 1 - Base Price from factory
  // Price 2 - WholeSeller
  // Price 3 - Retailer

  const { price1, price2, price3 } = calculateLandedPrices(
    mrp,
    retailerMargin,
    wholeSellerMargin,
    gst
  );

  return {
    distributionType: "C",
    basePrice: price1,
    wholeSellerPrice: price2,
    retailerPrice: price3,
  };
};

const typeDPrices = (mrp, retailerMargin, gst) => {
  // Factory -> Retailer
  // Price 1 - Base Price from factory
  // Price 2 - Retailer
  const { price1, price2 } = calculateLandedPrices(mrp, retailerMargin, gst);

  return {
    distributionType: "D",
    basePrice: price1,
    retailerPrice: price2,
  };
};

const distributionTypesPrices = (customerTypes, mrp, gst, specialPrice) => {
  const {
    superStockistMargin,
    distributorMargin,
    wholeSellerMargin,
    retailerMargin,
  } = customerTypesMargins(customerTypes);

  // MRP, Retailer, Distributor, SS, GST - Arguments Order
  const distributionTypeA = typeAPrices(
    mrp,
    retailerMargin,
    distributorMargin,
    superStockistMargin,
    gst
  );

  const distributionTypeB = typeBPrices(
    mrp,
    retailerMargin,
    distributorMargin,
    gst
  );

  const distributionTypeC = typeCPrices(
    mrp,
    retailerMargin,
    wholeSellerMargin,
    gst
  );
  const distributionTypeD = typeDPrices(mrp, retailerMargin, gst);

  return [
    distributionTypeA,
    distributionTypeB,
    distributionTypeC,
    distributionTypeD,
  ];
};

module.exports = {
  distributionTypesPrices,
};
