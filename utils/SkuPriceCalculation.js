const {
  ssAndDbrAndRetailer,
  dbrAndRetailer,
} = require("./PriceCalculationUtils");

const calculateSkuPrice = ({
  specialPrice,
  mrp,
  sgst,
  cgst,
  igst,
  superStockistMargin,
  distributorMargin,
  retailerMargin,
}) => {
  const retailPrice = specialPrice || mrp;
  const intraStateTax = sgst + cgst;
  const interStateTax = sgst + igst;

  // RetailPrice, Retailer, Distributor, SS, GST - Arguments Order
  const ssAndDbrAndRetailerLandedPrices = ssAndDbrAndRetailer(
    retailPrice,
    retailerMargin,
    distributorMargin,
    superStockistMargin,
    intraStateTax
  );

  const distributorAndRetailerLandedPrices = dbrAndRetailer(
    retailPrice,
    retailerMargin,
    distributorMargin,
    intraStateTax
  );

  return [ssAndDbrAndRetailerLandedPrices, distributorAndRetailerLandedPrices];
};

module.exports = {
  calculateSkuPrice,
};
