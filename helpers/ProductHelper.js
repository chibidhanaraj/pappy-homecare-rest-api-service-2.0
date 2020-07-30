const ComboSkuModel = require('../api/model/Sku/ComboSkuModel');
const SkuModel = require('../api/model/Sku/SkuModel');

const deleteSkusAndCombos = async (productId) => {
  let skuIds = [];
  let comboSkuIds = [];

  await SkuModel.find({ productId })
    .then((docs) => {
      docs.forEach((doc) => {
        skuIds.push(doc._id);
      });
      return ComboSkuModel.find({ 'skus.id': { $in: skuIds } });
    })
    .then((docs) => {
      docs.forEach((doc) => {
        comboSkuIds.push(doc._id);
      });
      return docs;
    })
    .then((el) => {
      return ComboSkuModel.deleteMany(
        { _id: { $in: comboSkuIds } },
        { multi: true }
      );
    })
    .then((el) => {
      return SkuModel.deleteMany({ productId });
    });
};

const deleteSkusAndCombosOnPropertyUpdate = async (
  property,
  propertySkusToBeDeleted
) => {
  let skuIds = [];
  let comboSkuIds = [];

  await SkuModel.find({ [property]: { $in: propertySkusToBeDeleted } })
    .then((docs) => {
      docs.forEach((doc) => {
        skuIds.push(doc._id);
      });
      return ComboSkuModel.find({ 'skus.id': { $in: skuIds } });
    })
    .then((docs) => {
      docs.forEach((doc) => {
        comboSkuIds.push(doc._id);
      });
      return docs;
    })
    .then((el) => {
      return ComboSkuModel.deleteMany(
        { _id: { $in: comboSkuIds } },
        { multi: true }
      );
    })
    .then((el) => {
      return SkuModel.deleteMany({
        _id: { $in: skuIds },
      });
    });
};

module.exports = {
  deleteSkusAndCombos,
  deleteSkusAndCombosOnPropertyUpdate,
};
