const { calculateSkuPrice } = require("./SkuPriceCalculation");
const { cloneDeep } = require("lodash");

const buildSkuPayload = (skuData) => {
  const sku = cloneDeep(skuData);
  const skuPrices = calculateSkuPrice(sku);

  sku.id = sku._id;
  sku.product.id = sku.product._id;

  delete sku._id;
  delete sku.__v;
  delete sku.product._id;
  delete sku.product.__v;

  return {
    ...sku,
    skuPrices,
  };
};

const buildAllSkusPayload = (skus) => {
  return skus.reduce((allSkus, sku) => {
    return [...allSkus, buildSkuPayload(sku)];
  }, []);
};

module.exports = {
  buildSkuPayload,
  buildAllSkusPayload,
};
