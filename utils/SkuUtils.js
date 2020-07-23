const { calculateSkuPrice } = require('./SkuPriceCalculation');
const { cloneDeep } = require('lodash');

const buildSkuPayload = (skuData) => {
  const sku = cloneDeep(skuData);
  const skuPrices = calculateSkuPrice(sku);

  const { fragranceId, quantityId, product = {} } = sku;
  const { fragrances = [], quantities = [] } = product;

  const skuFragrance =
    fragranceId &&
    fragrances.find((fragrance) => {
      const { _id: id } = fragrance;

      return id.toString() === fragranceId.toString();
    });

  const skuQuantity =
    quantityId &&
    quantities.find((qty) => {
      const { _id: id } = qty;
      return id.toString() === quantityId.toString();
    });

  sku.id = sku._id;
  sku.product.id = sku.product._id;
  sku.fragranceId = sku.fragranceId || '';
  sku.fragranceName = (skuFragrance && skuFragrance.fragranceName) || '';
  sku.quantity = skuQuantity.quantity || '';
  sku.unit = skuQuantity.unit || '';

  delete sku._id;
  delete sku.__v;
  delete sku.product._id;
  delete sku.product.__v;
  delete sku.product.fragrances;
  delete sku.product.quantities;
  delete sku.product.productCode;
  delete sku.product.createdBy;
  delete sku.product.updatedBy;
  delete sku.product.createdAt;
  delete sku.product.updatedAt;

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
