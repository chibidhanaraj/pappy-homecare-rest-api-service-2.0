const DistrictModel = require('../api/model/DistrictModel');
const ZoneModel = require('../api/model/ZoneModel');
const { uniqBy, cloneDeep } = require('lodash');
const DistributorModel = require('../api/model/DistributorModel');
const {
  DISTRIBUTION_TYPES,
  CUSTOMER_CONSTANTS,
} = require('../constants/constants');

const normalizeSuperStockist = async (superStockistPayload) => {
  const superStockist = cloneDeep(superStockistPayload);
  superStockist.id = superStockistPayload._id;
  superStockist.distributionType =
    DISTRIBUTION_TYPES.SUPERSTOCKIST_DISTRIBUTOR_RETAILER;
  superStockist.customerType = CUSTOMER_CONSTANTS.SUPER_STOCKIST;

  let zoneIds = [];
  const districts = await Promise.all(
    superStockist.districts.map(async (districtId) => {
      const district = await DistrictModel.findById(districtId).exec();
      if (!district || Object.keys(district).length === 0) {
        return {};
      }
      zoneIds.push(district.zoneId);
      return {
        name: district.name,
        id: district.id,
      };
    })
  );

  /* lodash uniqBy iterates each list and converts to string */
  const zones = await Promise.all(
    uniqBy(zoneIds, (id) => id.toString()).map(async (zoneId) => {
      const zone = await ZoneModel.findById(zoneId).exec();
      if (!zone || Object.keys(zone).length === 0) {
        return {};
      }

      return {
        name: zone.name,
        id: zone.id,
      };
    })
  );

  const distributorCount = await DistributorModel.find({
    superStockistId: superStockist._id,
  }).then((docs) => {
    return docs.length;
  });

  delete superStockist._id;
  delete superStockist.__v;

  return {
    ...superStockist,
    districts: districts.filter((district) => Object.keys(district).length > 0),
    zones,
    distributorCount,
  };
};

const normalizeAllSuperStockists = async (superStockists) => {
  let responses = [];
  await superStockists.reduce(async (allSuperStockists, superStockist) => {
    await allSuperStockists;
    const newSuperStockist = await normalizeSuperStockist(superStockist);
    responses.push(newSuperStockist);
  }, Promise.resolve());
  return Promise.all(responses);
};

module.exports = {
  normalizeSuperStockist,
  normalizeAllSuperStockists,
};
