const Big = require("big.js");

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

const calculateLandedPricesForTypeA = (
  mrp,
  retailerMargin,
  distributorMargin,
  superStockiestMargin,
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
    superStockiestMargin,
    gst
  );

  return {
    basePrice: price1,
    superStockiestPrice: price2,
    distributorPrice: price3,
    retailerPrice: price4,
  };
};

const calculateLandedPricesForTypeB = (
  mrp,
  retailerMargin,
  distributorMargin,
  gst
) => {
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
    basePrice: price1,
    distributorPrice: price2,
    retailerPrice: price3,
  };
};

const calculateLandedPricesForTypeC = (
  mrp,
  retailerMargin,
  wholeSellerMargin,
  gst
) => {
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
    basePrice: price1,
    wholeSellerPrice: price2,
    retailerPrice: price3,
  };
};

const calculateLandedPricesForTypeD = (mrp, retailerMargin, gst) => {
  // Factory -> Retailer
  // Price 1 - Base Price from factory
  // Price 2 - Retailer
  const { price1, price2 } = calculateLandedPrices(mrp, retailerMargin, gst);

  return {
    basePrice: price1,
    retailerPrice: price2,
  };
};

module.exports = {
  calculateLandedPrice,
  calculateLandedPricesForTypeA,
  calculateLandedPricesForTypeB,
  calculateLandedPricesForTypeC,
  calculateLandedPricesForTypeD,
};
