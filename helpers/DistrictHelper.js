const { cloneDeep } = require('lodash');
const ZoneModel = require('../api/model/ZoneModel');
const AreaModel = require('../api/model/AreaModel');
const BeatAreaModel = require('../api/model/BeatAreaModel');
const SuperStockistModel = require('../api/model/SuperStockistModel');
const DistributorModel = require('../api/model/DistributorModel');
const RetailerModel = require('../api/model/RetailerModel');

const normalizeDistrict = async (districtPayload) => {
  const district = cloneDeep(districtPayload);
  const zone = await ZoneModel.findById(district.zoneId).exec();
  let areaIds = [];

  district.id = districtPayload._id;

  const areasCount = await AreaModel.find({ districtId: district._id }).then(
    (docs) => {
      docs.forEach((doc) => {
        areaIds.push(doc._id);
      });
      return docs.length;
    }
  );

  const beatAreasCount = await BeatAreaModel.find({
    areaId: { $in: areaIds },
  }).then((docs) => {
    return docs.length;
  });

  const superStockistsCount = await SuperStockistModel.find({
    districts: { $in: district._id },
  }).then((docs) => {
    return docs.length;
  });

  delete district._id;
  delete district.__v;
  delete district.zoneId;

  return {
    ...district,
    areasCount,
    beatAreasCount,
    zone: {
      name: zone.name,
      id: zone.id,
    },
    superStockistsCount,
  };
};

const normalizeAllDistricts = async (districts) => {
  let responses = [];
  await districts.reduce(async (allDistricts, district) => {
    await allDistricts;
    const newDistrict = await normalizeDistrict(district);
    responses.push(newDistrict);
  }, Promise.resolve());
  return Promise.all(responses);
};

const updateDependancyCollections = async (districtId) => {
  let areaIds = [];
  let beatAreaIds = [];

  await AreaModel.find({ districtId })
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
    .then(async (docs) => {
      return Promise.all([
        await BeatAreaModel.deleteMany({
          _id: { $in: beatAreaIds },
        }),
        await AreaModel.deleteMany({ districtId }),
      ]);
    });
};

module.exports = {
  normalizeDistrict,
  normalizeAllDistricts,
  updateDependancyCollections,
};
