const DistrictModel = require('../api/model/DistrictModel');
const AreaModel = require('../api/model/AreaModel');
const BeatAreaModel = require('../api/model/BeatAreaModel');
const { cloneDeep } = require('lodash');
const RetailerModel = require('../api/model/RetailerModel');
const DistributorModel = require('../api/model/DistributorModel');
const SuperStockistModel = require('../api/model/SuperStockistModel');

const normalizeZone = async (zonePayload) => {
  const zone = cloneDeep(zonePayload);
  let districtIds = [];
  let areaIds = [];

  zone.id = zonePayload._id;

  const districtsCount = await DistrictModel.find({ zoneId: zone._id }).then(
    (docs) => {
      docs.forEach((doc) => {
        districtIds.push(doc._id);
      });
      return docs.length;
    }
  );

  const areasCount = await AreaModel.find({
    districtId: { $in: districtIds },
  }).then((docs) => {
    docs.forEach((doc) => {
      areaIds.push(doc._id);
    });
    return docs.length;
  });

  const beatAreasCount = await BeatAreaModel.find({
    areaId: { $in: areaIds },
  }).then((docs) => {
    return docs.length;
  });

  delete zone._id;
  delete zone.__v;

  return {
    ...zone,
    districtsCount,
    areasCount,
    beatAreasCount,
  };
};

const normalizeAllZones = async (zones) => {
  let responses = [];
  await zones.reduce(async (allZones, zone) => {
    await allZones;
    const newZone = await normalizeZone(zone);
    responses.push(newZone);
  }, Promise.resolve());
  return Promise.all(responses);
};

const updateDependancyCollections = async (zoneId) => {
  let districtIds = [];
  let areaIds = [];
  let beatAreaIds = [];

  await DistrictModel.find({ zoneId })
    .then((docs) => {
      docs.forEach((doc) => {
        districtIds.push(doc._id);
      });
      return AreaModel.find({
        districtId: { $in: districtIds },
      });
    })
    .then((docs) => {
      docs.forEach((doc) => {
        areaIds.push(doc._id);
      });

      return BeatAreaModel.find({
        areaId: { $in: areaIds },
      });
    })
    .then((docs) => {
      docs.forEach((doc) => {
        beatAreaIds.push(doc._id);
      });

      return RetailerModel.updateMany(
        { beatAreaId: { $in: beatAreaIds } },
        { $set: { distributorId: null, beatAreaId: null } },
        { multi: true }
      );
    })
    .then((el) => {
      return DistributorModel.updateMany(
        { areas: { $in: areaIds } },
        { $set: { areaId: null, superStockistId: null } },
        { multi: true }
      );
    })
    .then((el) => {
      return SuperStockistModel.updateMany(
        { districts: { $in: districtIds } },
        { $set: { districtId: null } },
        { multi: true }
      );
    })
    .then(async (docs) => {
      return Promise.all([
        await BeatAreaModel.deleteMany({
          _id: { $in: beatAreaIds },
        }),
        await AreaModel.deleteMany({ _id: { $in: areaIds } }),
        await DistrictModel.deleteMany({ _id: { $in: districtIds } }),
      ]);
    });
};

module.exports = {
  normalizeZone,
  normalizeAllZones,
  updateDependancyCollections,
};
