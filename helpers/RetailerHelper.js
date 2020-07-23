const { cloneDeep } = require('lodash');
const { CUSTOMER_CONSTANTS } = require('../constants/constants');
const DistributorModel = require('../api/model/DistributorModel');
const BeatAreaModel = require('../api/model/BeatAreaModel');
const AreaModel = require('../api/model/AreaModel');
const DistrictModel = require('../api/model/DistrictModel');
const ZoneModel = require('../api/model/ZoneModel');

const buildRetailerPayload = async (retailerData) => {
  const retailer = cloneDeep(retailerData);

  retailer.id = retailer._id;
  retailer.customerType = CUSTOMER_CONSTANTS.RETAILER;

  const distributor = await DistributorModel.findById(
    retailer.distributorId
  ).then((distributor) => {
    if (!distributor || Object.keys(distributor).length === 0) {
      return {};
    }
    return { name: distributor.name, id: distributor.id };
  });

  const beatArea = await BeatAreaModel.findById(retailer.beatAreaId).then(
    (beatArea) => {
      if (!beatArea || Object.keys(beatArea).length === 0) {
        return {};
      }
      return beatArea;
    }
  );

  const area = await AreaModel.findById(beatArea.areaId).then((area) => {
    if (!area || Object.keys(area).length === 0) {
      return {};
    }
    return area;
  });

  const district = await DistrictModel.findById(area.districtId).then(
    (district) => {
      if (!district || Object.keys(district).length === 0) {
        return {};
      }
      return district;
    }
  );

  const zone = await ZoneModel.findById(district.zoneId).then((zone) => {
    if (!zone || Object.keys(zone).length === 0) {
      return {};
    }
    return zone;
  });

  delete retailer._id;
  delete retailer.__v;
  delete retailer.distributorId;
  delete retailer.beatAreaId;

  return {
    ...retailer,
    distributor,
    beatArea: {
      name: beatArea.name,
      id: beatArea.id,
    },
    area: {
      name: area.name,
      id: area.id,
    },
    district: {
      name: district.name,
      id: district.id,
    },
    zone: {
      name: zone.name,
      id: zone.id,
    },
  };
};

const buildAllRetailersPayload = async (retailers) => {
  let responses = [];
  await retailers.reduce(async (allRetailers, retailer) => {
    await allRetailers;
    const newRetailer = await buildRetailerPayload(retailer);
    responses.push(newRetailer);
  }, Promise.resolve());
  return Promise.all(responses);
};

module.exports = {
  buildRetailerPayload,
  buildAllRetailersPayload,
};
