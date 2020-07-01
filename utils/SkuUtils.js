const { calculateSkuPrice } = require("./SkuPriceCalculation");
const { cloneDeep } = require("lodash");

const buildSkuPayload = (skuData) => {
  const sku = cloneDeep(skuData);
  const skuPrices = calculateSkuPrice(sku);

  const { fragranceId, quantityId, product = {} } = sku;
  const { fragrances = [], quantities = [] } = product;

  const skuFragrance = fragrances.find((fragrance) => {
    const { _id: id } = fragrance;
    return id.toString() === fragranceId.toString();
  });

  const skuQuantity = quantities.find((qty) => {
    const { _id: id } = qty;
    return id.toString() === quantityId.toString();
  });

  sku.id = sku._id;
  sku.product.id = sku.product._id;
  sku.fragranceName = skuFragrance.fragranceName || "";
  sku.quantity = skuQuantity.quantity || "";
  sku.unit = skuQuantity.unit || "";

  delete sku._id;
  delete sku.__v;
  delete sku.product._id;
  delete sku.product.__v;
  delete sku.product.fragrances;
  delete sku.product.quantities;
  delete sku.product.productCode;

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
