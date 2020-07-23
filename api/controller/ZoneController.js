const ZoneModel = require('../model/ZoneModel');
const ErrorResponse = require('../../utils/errorResponse');
const asyncHandler = require('../../middleware/asyncHandler');
const { toUpperCase, toSentenceCase } = require('../../utils/CommonUtils');
const {
  STATUS,
  ZONE_CONTROLLER_CONSTANTS,
} = require('../../constants/controller.constants');
const { ERROR_TYPES } = require('../../constants/error.constant');
const {
  normalizeZone,
  normalizeAllZones,
  updateDependancyCollections,
} = require('../../helpers/ZoneHelper');

// @desc      Get all zones
// @route     GET /api/zone
exports.getAllZones = asyncHandler(async (req, res) => {
  const zones = await ZoneModel.find().lean().exec();

  res.status(200).json({
    status: STATUS.OK,
    message: ZONE_CONTROLLER_CONSTANTS.FETCH_SUCCESS,
    error: '',
    zones: await normalizeAllZones(zones),
  });
});

// @desc      Get zone
// @route     GET /api/zone/:id
exports.getZone = asyncHandler(async (req, res, next) => {
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

  return res.status(200).json({
    status: STATUS.OK,
    message: ZONE_CONTROLLER_CONSTANTS.FETCH_SUCCESS,
    error: '',
    zone: await normalizeZone(zone.toObject()),
  });
});

// @desc      Post zone
// @route     POST /api/zone/
exports.createZone = asyncHandler(async (req, res, next) => {
  const name = toSentenceCase(req.body.name);
  const zoneCode = toUpperCase(name);

  // Check for created zone
  const createdZone = await ZoneModel.findOne({
    zoneCode,
  });

  if (createdZone) {
    return next(
      new ErrorResponse(
        ZONE_CONTROLLER_CONSTANTS.ZONE_DUPLICATE_NAME.replace('{{name}}', name),
        400,
        ERROR_TYPES.DUPLICATE_NAME
      )
    );
  }

  const zone = new ZoneModel({
    name,
    zoneCode,
    createdBy: req.user.id || '',
    updatedBy: req.user.id || '',
  });

  const savedDocument = await zone.save();
  res.status(201).json({
    status: STATUS.OK,
    message: ZONE_CONTROLLER_CONSTANTS.CREATE_SUCCESS,
    error: '',
    zone: await normalizeZone(savedDocument.toObject()),
  });
});

// @desc      Update Zone
// @route     PATCH /api/zone/:id
exports.updateZone = asyncHandler(async (req, res, next) => {
  const zoneId = req.params.id;

  const receivedUpdateProperties = Object.keys(req.body);
  const allowedUpdateProperties = ['name'];

  const isValidUpdateOperation = receivedUpdateProperties.every((key) =>
    allowedUpdateProperties.includes(key)
  );

  if (!isValidUpdateOperation) {
    return next(new ErrorResponse(`Invalid Updates for ${zoneId}`));
  }

  const name = toSentenceCase(req.body.name);
  const zoneCode = toUpperCase(name);

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

  if (zoneCode !== zone.zoneCode) {
    // Check for already created zone
    const createdZone = await ZoneModel.findOne({
      zoneCode,
    });

    if (createdZone) {
      return next(
        new ErrorResponse(
          ZONE_CONTROLLER_CONSTANTS.ZONE_DUPLICATE_NAME.replace(
            '{{name}}',
            name
          ),
          400,
          ERROR_TYPES.DUPLICATE_NAME
        )
      );
    }
  }

  const dataToUpdate = {
    name,
    zoneCode,
    updatedBy: req.user.id || '',
  };

  const updatedZone = await ZoneModel.findByIdAndUpdate(zoneId, dataToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: STATUS.OK,
    message: ZONE_CONTROLLER_CONSTANTS.UPDATE_SUCCESS,
    error: '',
    zone: updatedZone,
  });
});

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

    await Promise.all([
      await updateDependancyCollections(zoneId),
      await zone.remove(),
    ]).then((el) => {
      res.status(200).json({
        status: STATUS.OK,
        message: ZONE_CONTROLLER_CONSTANTS.DELETE_SUCCESS,
        error: '',
        zone: {},
      });
    });
  });
});
