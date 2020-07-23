const BeatAreaModel = require('../api/model/BeatAreaModel');
const DistrictModel = require('../api/model/DistrictModel');
const ZoneModel = require('../api/model/ZoneModel');
const { cloneDeep } = require('lodash');
const RetailerModel = require('../api/model/RetailerModel');

const normalizeArea = async (areaPayload) => {
  const area = cloneDeep(areaPayload);
  const beatAreasCount = await BeatAreaModel.countDocuments({
    areaId: area._id,
  }).exec();

  const district = await DistrictModel.findById(area.districtId).exec();
  const zone = await ZoneModel.findById(district.zoneId).exec();
  area.id = areaPayload._id;

  delete area._id;
  delete area.__v;
  delete area.districtId;

  return {
    ...area,
    beatAreasCount,
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

const normalizeAllAreas = async (areas) => {
  let responses = [];
  await areas.reduce(async (allAreas, area) => {
    await allAreas;
    const newArea = await normalizeArea(area);
    responses.push(newArea);
  }, Promise.resolve());
  return Promise.all(responses);
};

const updateRetailersBeatArea = async (areaId) => {
  let beatAreaIds = [];

  await BeatAreaModel.find({ areaId })
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
      return BeatAreaModel.deleteMany({ areaId });
    });
};

module.exports = {
  normalizeArea,
  normalizeAllAreas,
  updateRetailersBeatArea,
};
