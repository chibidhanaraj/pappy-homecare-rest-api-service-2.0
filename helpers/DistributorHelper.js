const { cloneDeep, uniqBy } = require('lodash');
const { CUSTOMER_CONSTANTS } = require('../constants/constants');
const SuperStockistModel = require('../api/model/SuperStockistModel');
const AreaModel = require('../api/model/AreaModel');
const DistrictModel = require('../api/model/DistrictModel');
const ZoneModel = require('../api/model/ZoneModel');

const buildDistributorPayload = async (distributorData) => {
  const distributor = cloneDeep(distributorData);
  distributor.id = distributor._id;
  distributor.customerType = CUSTOMER_CONSTANTS.DISTRIBUTOR;
  let zoneIds = [];
  let districtIds = [];

  const areas = await Promise.all(
    distributor.areas.map(async (areaId) => {
      const area = await AreaModel.findById(areaId).exec();
      if (!area || Object.keys(area).length === 0) {
        return {};
      }
      districtIds.push(area.districtId);
      return {
        name: area.name,
        id: area.id,
      };
    })
  );

  const districts = await Promise.all(
    uniqBy(districtIds, (id) => id.toString()).map(async (districtId) => {
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

  const superStockist = await SuperStockistModel.findById(
    distributor.superStockistId
  ).then((superStockist) => {
    if (!superStockist || Object.keys(superStockist).length === 0) {
      return {};
    }
    return { name: superStockist.name, id: superStockist.id };
  });

  delete distributor._id;
  delete distributor.__v;
  delete distributor.superStockistId;

  return {
    ...distributor,
    areas: areas.filter((area) => Object.keys(area).length > 0),
    districts,
    zones,
    superStockist,
  };
};

const buildAllDistributorsPayload = async (distributors) => {
  let responses = [];
  await distributors.reduce(async (allDistributors, distributor) => {
    await allDistributors;
    const newDistributor = await buildDistributorPayload(distributor);
    responses.push(newDistributor);
  }, Promise.resolve());
  return Promise.all(responses);
};

module.exports = {
  buildDistributorPayload,
  buildAllDistributorsPayload,
};
