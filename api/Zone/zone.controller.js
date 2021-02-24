const ZoneModel = require('./zone.model');
const DistrictModel = require('../District/district.model');
const ErrorResponse = require('../../utils/errorResponse');
const asyncHandler = require('../../middleware/asyncHandler');
const {
  STATUS,
  ZONE_CONTROLLER_CONSTANTS,
} = require('../../constants/controller.constants');
const { ERROR_TYPES } = require('../../constants/error.constant');
const { ZONE_AGGREGATE_QUERY } = require('./zone.utils');
const { get } = require('lodash');
const { toWordUpperFirstCase } = require('../../utils/CommonUtils');

// @desc      Get all zones
// @route     GET /api/zone
exports.getAllZones = asyncHandler(async (req, res, next) => {
  const query = [...ZONE_AGGREGATE_QUERY];

  const results = await ZoneModel.aggregate(query);

  res.status(200).json({
    status: STATUS.OK,
    message: ZONE_CONTROLLER_CONSTANTS.FETCH_SUCCESS,
    error: '',
    count: results.length,
    zones: results,
  });
});

// @desc      Post Zone
// @route     POST /api/zone/
exports.createZone = asyncHandler(async (req, res, next) => {
  const transformedName = toWordUpperFirstCase(req.body.name);

  const createdZone = await ZoneModel.findOne({
    name: toWordUpperFirstCase(transformedName),
  });

  if (createdZone) {
    return next(
      new ErrorResponse(
        ZONE_CONTROLLER_CONSTANTS.ZONE_DUPLICATE_NAME.replace(
          '{{name}}',
          transformedName
        ),
        400,
        ERROR_TYPES.DUPLICATE_NAME
      )
    );
  }

  const newZone = new ZoneModel({
    name: transformedName,
    created_by: get(req, 'user.id', null),
  });

  const savedZoneDocument = await newZone.save();
  res.status(201).json({
    status: STATUS.OK,
    message: ZONE_CONTROLLER_CONSTANTS.CREATE_SUCCESS,
    error: '',
    zone: savedZoneDocument,
  });
});

// @desc      Update Zone
// @route     PATCH /api/zone/:id
exports.updateZone = asyncHandler(async (req, res, next) => {
  const zoneId = req.params.id;
  const zone = await ZoneModel.findById(zoneId).exec();

  if (!zone) {
    return next(
      new ErrorResponse(
        ZONE_CONTROLLER_CONSTANTS.ZONE_NOT_FOUND,
        404,
        ERROR_TYPES.NOT_FOUND
      )
    );
  }

  const receivedUpdateProperties = Object.keys(req.body);
  const allowedUpdateProperties = ['name'];

  const isValidUpdateOperation = receivedUpdateProperties.every((key) =>
    allowedUpdateProperties.includes(key)
  );

  if (!isValidUpdateOperation) {
    return next(new ErrorResponse(`Invalid Updates for ${zoneId}`));
  }

  const dataToUpdate = {};

  if (req.body.name) {
    const transformedName = toWordUpperFirstCase(req.body.name);

    const createdZone = await ZoneModel.findOne({
      name: transformedName,
    });

    if (createdZone) {
      return next(
        new ErrorResponse(
          ZONE_CONTROLLER_CONSTANTS.ZONE_DUPLICATE_NAME.replace(
            '{{name}}',
            transformedName
          ),
          400,
          ERROR_TYPES.DUPLICATE_NAME
        )
      );
    }

    dataToUpdate.name = transformedName;
  }

  dataToUpdate.updated_by = get(req, 'user.id', null);

  await ZoneModel.findOneAndUpdate(
    { _id: zoneId },
    { $set: dataToUpdate },
    {
      new: true,
      runValidators: true,
      upsert: true,
    },

    async (err, zone) => {
      if (err || !zone) {
        return next(
          new ErrorResponse(
            ZONE_CONTROLLER_CONSTANTS.ZONE_NOT_FOUND,
            404,
            ERROR_TYPES.NOT_FOUND
          )
        );
      }
      res.status(200).json({
        status: STATUS.OK,
        message: ZONE_CONTROLLER_CONSTANTS.UPDATE_SUCCESS,
        error: '',
        zone,
      });
    }
  );
});

// @desc      Delete Zone
// @route     DELETE /api/zone/:id
exports.deleteZone = asyncHandler(async (req, res, next) => {
  const zoneId = req.params.id;

  await ZoneModel.findOne({ _id: zoneId }, async (error, zone) => {
    if (error || !zone) {
      return next(
        new ErrorResponse(
          ZONE_CONTROLLER_CONSTANTS.ZONE_NOT_FOUND,
          404,
          ERROR_TYPES.NOT_FOUND
        )
      );
    }

    const isZoneMapped = await DistrictModel.exists({
      zone: zoneId,
    });

    if (isZoneMapped) {
      return next(
        new ErrorResponse(
          ZONE_CONTROLLER_CONSTANTS.DELETE_FAILED,
          405,
          ERROR_TYPES.INVALID_OPERATION
        )
      );
    }

    await zone.remove().then(() => {
      res.status(200).json({
        status: STATUS.OK,
        message: ZONE_CONTROLLER_CONSTANTS.DELETE_SUCCESS,
        error: '',
        zone: {},
      });
    });
  });
});
