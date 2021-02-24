const ZoneModel = require('../Zone/zone.model');
const DistrictModel = require('../District/district.model');
const AreaModel = require('../Area/area.model');
const BeatModel = require('../Beat/beat.model');
const ErrorResponse = require('../../utils/errorResponse');
const asyncHandler = require('../../middleware/asyncHandler');
const {
  STATUS,
  TERRITORY_CONTROLLER_CONSTANTS,
} = require('../../constants/controller.constants');
const { ERROR_TYPES } = require('../../constants/error.constant');
const { ZONE_AGGREGATE_QUERY } = require('../Zone/zone.utils');
const { DISTRICT_AGGREGATE_QUERY } = require('../District/district.utils');
const { AREA_AGGREGATE_QUERY } = require('../Area/area.utils');
const { BEAT_AGGREGATE_QUERY } = require('../Beat/beat.utils');

// @desc      Get territory
// @route     GET /api/territory/
exports.getAllTerritories = asyncHandler(async (req, res, next) => {
  const response = {
    status: STATUS.OK,
    message: TERRITORY_CONTROLLER_CONSTANTS.FETCH_SUCCESS,
    error: '',
  };
  const fields = req.query.select.split(',');

  if (!req.query.select || !fields.length) {
    return next(
      new ErrorResponse(
        TERRITORY_CONTROLLER_CONSTANTS.EMPTY_SELECT_PARAM,
        400,
        ERROR_TYPES.INVALID_OPERATION
      )
    );
  }

  if (fields.includes('zones')) {
    response.zones = await ZoneModel.aggregate([ZONE_AGGREGATE_QUERY]);
  }

  if (fields.includes('districts')) {
    response.districts = await DistrictModel.aggregate([
      DISTRICT_AGGREGATE_QUERY,
    ]);
  }

  if (fields.includes('areas')) {
    response.areas = await AreaModel.aggregate([AREA_AGGREGATE_QUERY]);
  }

  if (fields.includes('beats')) {
    response.beats = await BeatModel.aggregate([BEAT_AGGREGATE_QUERY]);
  }

  res.status(200).json(response);
});
