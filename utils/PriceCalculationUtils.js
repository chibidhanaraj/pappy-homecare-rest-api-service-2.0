const Big = require("big.js");
const { DISTRIBUTION_TYPES } = require("../constants/constants");

const calculateLandedPrice = (price, marginPercentage) => {
  // costPrice = ( sellingPrice * 100 ) / ( 100 + percentageProfit).

  return Number(
    Big(price).times(100).div(Big(marginPercentage).plus(100)).toFixed(2)
  );
};

const calculateLandedPrices = (retailPrice, ...margins) => {
  let prices = {};
  let priceCount = margins.length || 0;

  (margins || []).reduce((acc, margin) => {
    return (prices[`price${priceCount--}`] = calculateLandedPrice(acc, margin));
  }, retailPrice); // {"price3": 100.00, "price2": 100.00, "price1": 100.00}
  return prices;
};

const ssAndDbrAndRetailer = (
  retailPrice,
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
    retailPrice,
    retailerMargin,
    distributorMargin,
    superStockistMargin,
    gst
  );

  return {
    distributionType: DISTRIBUTION_TYPES.SUPERSTOCKIST_DISTRIBUTOR_RETAILER,
    basePrice: price1,
    superStockistLandedPrice: price2,
    distributorLandedPrice: price3,
    retailerLandedPrice: price4,
  };
};

const dbrAndRetailer = (
  retailPrice,
  retailerMargin,
  distributorMargin,
  gst
) => {
  // Factory -> Distributor -> Retailer
  // Price 1 - Base Price from factory
  // Price 2 - Distributor
  // Price 3 - Retailer

  const { price1, price2, price3 } = calculateLandedPrices(
    retailPrice,
    retailerMargin,
    distributorMargin,
    gst
  );

  return {
    distributionType: DISTRIBUTION_TYPES.DISTRIBUTOR_RETAILER,
    basePrice: price1,
    distributorLandedPrice: price2,
    retailerLandedPrice: price3,
  };
};

const wholeSalerAndRetailer = (
  retailPrice,
  retailerMargin,
  wholeSalerMargin,
  gst
) => {
  // Factory -> WholeSaler -> Retailer
  // Price 1 - Base Price from factory
  // Price 2 - WholeSaler
  // Price 3 - Retailer

  const { price1, price2, price3 } = calculateLandedPrices(
    retailPrice,
    retailerMargin,
    wholeSalerMargin,
    gst
  );

  return {
    distributionType: DISTRIBUTION_TYPES.WHOLESALE_RETAILER,
    basePrice: price1,
    wholeSellerLandedPrice: price2,
    retailerLandedPrice: price3,
  };
};

const DirectRetailer = (retailPrice, retailerMargin, gst) => {
  // Factory -> Retailer
  // Price 1 - Base Price from factory
  // Price 2 - Retailer
  const { price1, price2 } = calculateLandedPrices(
    retailPrice,
    retailerMargin,
    gst
  );

  return {
    distributionType: DISTRIBUTION_TYPES.DIRECT_RETAILER,
    basePrice: price1,
    retailerPrice: price2,
  };
};

module.exports = {
  ssAndDbrAndRetailer,
  dbrAndRetailer,
  wholeSalerAndRetailer,
  DirectRetailer,
};
