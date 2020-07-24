const { calculateSkuPrice } = require('../utils/SkuPriceCalculation');
const { cloneDeep, find } = require('lodash');
const { getRecordFromPayload } = require('../utils/CommonUtils');
const ProductModel = require('../api/model/ProductModel');

const normalizeFragranceData = (fragrances, fragranceId) => {
  const fragrance = getRecordFromPayload(fragrances, fragranceId);

  if (!fragrance) {
    return {};
  }

  return {
    id: fragrance.id,
    name: fragrance.fragranceName,
  };
};

const normalizeQuantityData = (quantities, quantityId) => {
  const quantity = getRecordFromPayload(quantities, quantityId);

  if (!quantity) {
    return {};
  }

  return {
    id: quantity.id,
    unit: quantity.unit,
    quantity: quantity.quantity,
  };
};

const buildSkuPayload = async (skuData) => {
  const sku = cloneDeep(skuData);
  const skuPrices = calculateSkuPrice(sku);
  sku.id = sku._id;

  const { fragranceId, quantityId, productId } = sku;

  const product = await ProductModel.findById(productId, (error, doc) => {
    if (error || !doc) {
      return {};
    }

    return doc;
  });

  const skuFragrance = normalizeFragranceData(product.fragrances, fragranceId);

  const skuQuantity = normalizeQuantityData(product.quantities, quantityId);

  delete sku._id;
  delete sku.__v;
  delete sku.productId;
  delete sku.fragranceId;
  delete sku.quantityId;
  delete sku.skuCode;

  return {
    ...sku,
    product: {
      productType: product.productType,
      brandName: product.brandName,
      name: product.name,
      id: product.id,
    },
    skuFragrance,
    skuQuantity,
    skuPrices,
  };
};

const buildAllSkusPayload = async (skus) => {
  let responses = [];
  await skus.reduce(async (allSkus, sku) => {
    await allSkus;
    const newSku = await buildSkuPayload(sku);
    responses.push(newSku);
  }, Promise.resolve());
  return Promise.all(responses);
};

module.exports = {
  buildSkuPayload,
  buildAllSkusPayload,
};
