const { calculateSkuPrice } = require('../utils/SkuPriceCalculation');
const { cloneDeep } = require('lodash');
const SkuModel = require('../api/model/Sku/SkuModel');
const { SKU_TYPES } = require('../constants/constants');
const { getRecordFromPayload } = require('../utils/CommonUtils');

const normalizedSkus = (skusPayload, skus) => {
  if (skusPayload.length === 0) {
    return [];
  }

  return skusPayload.map((sku) => {
    return {
      name: sku.name,
      id: sku.id,
      mrp: sku.mrp,
      productId: sku.productId,
      count: getRecordFromPayload(skus, sku.id).count || 0,
    };
  });
};

const buildComboSkuPayload = async (comboSkuData) => {
  const comboSku = cloneDeep(comboSkuData);
  const comboSkuPrices = calculateSkuPrice(comboSku);
  comboSku.id = comboSku._id;

  const skuIds = comboSku.skus.map((sku) => sku.id);

  const skusPayload = await SkuModel.find(
    { _id: { $in: skuIds } },
    (error, docs) => {
      if (error || !docs.length) {
        return [];
      }

      return docs;
    }
  );

  delete comboSku._id;
  delete comboSku.__v;
  delete comboSku.comboSkuCode;

  return {
    ...comboSku,
    skus: normalizedSkus(skusPayload, comboSku.skus),
    skuPrices: comboSkuPrices,
    skuType: SKU_TYPES.COMBO_SKU,
  };
};

const buildAllComboSkusPayload = async (comboSkus) => {
  let responses = [];
  await comboSkus.reduce(async (allComboSkus, comboSku) => {
    await allComboSkus;
    const newComboSku = await buildComboSkuPayload(comboSku);
    responses.push(newComboSku);
  }, Promise.resolve());
  return Promise.all(responses);
};

module.exports = {
  buildComboSkuPayload,
  buildAllComboSkusPayload,
};
