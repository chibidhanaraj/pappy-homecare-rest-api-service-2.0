const AreaModel = require("../api/model/AreaModel");
const DistrictModel = require("../api/model/DistrictModel");
const ZoneModel = require("../api/model/ZoneModel");
const { cloneDeep } = require("lodash");

const normalizeBeatArea = async (beatAreaPayload) => {
  const beatArea = cloneDeep(beatAreaPayload);
  beatArea.id = beatAreaPayload._id;
  const area = await AreaModel.findById(beatArea.areaId).exec();
  const district = await DistrictModel.findById(area.districtId).exec();
  const zone = await ZoneModel.findById(district.zoneId).exec();

  delete beatArea._id;
  delete beatArea.__v;
  delete beatArea.areaId;

  return {
    ...beatArea,
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

const normalizeAllBeatAreas = async (beatAreas) => {
  let responses = [];
  await beatAreas.reduce(async (allBeatAreas, beatArea) => {
    await allBeatAreas;
    const newBeatArea = await normalizeBeatArea(beatArea);
    responses.push(newBeatArea);
  }, Promise.resolve());
  return Promise.all(responses);
};

module.exports = {
  normalizeBeatArea,
  normalizeAllBeatAreas,
};
