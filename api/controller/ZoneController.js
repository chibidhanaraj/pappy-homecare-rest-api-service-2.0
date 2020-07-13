const mongoose = require("mongoose");
const ZoneModel = require("../model/ZoneModel");
const ErrorResponse = require("../../utils/errorResponse");
const asyncHandler = require("../../middleware/asyncHandler");
const {
  toUpperCase,
  toSentenceCase,
  removeFalsy,
} = require("../../utils/CommonUtils");
const {
  STATUS,
  ZONE_CONTROLLER_CONSTANTS,
} = require("../../constants/controller.constants");
const { ERROR_TYPES } = require("../../constants/error.constant");

// @desc      Get all zones
// @route     GET /api/zone
exports.getAllZones = asyncHandler(async (req, res, next) => {
  const zones = await ZoneModel.find().exec();

  res.status(200).json({
    status: STATUS.OK,
    message: ZONE_CONTROLLER_CONSTANTS.FETCH_SUCCESS,
    error: "",
    zones,
  });
});

// @desc      Get zone
// @route     GET /api/zone/:id
exports.getZone = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const zone = await ZoneModel.findById(id).exec();

  if (!zone) {
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
    message: ZONE_CONTROLLER_CONSTANTS.FETCH_SUCCESS,
    error: "",
    zone,
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
        ZONE_CONTROLLER_CONSTANTS.ZONE_DUPLICATE_NAME.replace("{{name}}", name),
        400,
        ERROR_TYPES.DUPLICATE_NAME
      )
    );
  }

  const zone = new ZoneModel({
    name,
    zoneCode,
    createdBy: req.user.id || "",
    updatedBy: req.user.id || "",
  });

  const savedDocument = await zone.save();
  res.status(201).json({
    status: STATUS.OK,
    message: ZONE_CONTROLLER_CONSTANTS.CREATE_SUCCESS,
    error: "",
    zone: savedDocument,
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
  const allowedUpdateProperties = ["name"];

  const isValidUpdateOperation = receivedUpdateProperties.every((key) =>
    allowedUpdateProperties.includes(key)
  );

  if (!isValidUpdateOperation) {
    return next(new ErrorResponse(`Invalid Updates for ${zoneId}`));
  }

  const name = toSentenceCase(req.body.name);
  const zoneCode = toUpperCase(name);

  if (zoneCode !== zone.zoneCode) {
    // Check for already created zone
    const createdZone = await ZoneModel.findOne({
      zoneCode,
    });

    if (createdZone) {
      return next(
        new ErrorResponse(
          ZONE_CONTROLLER_CONSTANTS.ZONE_DUPLICATE_NAME.replace(
            "{{name}}",
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
    updatedBy: req.user.id || "",
  };

  const updatedZone = await ZoneModel.findByIdAndUpdate(zoneId, dataToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: STATUS.OK,
    message: ZONE_CONTROLLER_CONSTANTS.UPDATE_SUCCESS,
    error: "",
    zone: updatedZone,
  });
});

exports.deleteZone = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const zone = await ZoneModel.findById(id).exec();

  if (!zone) {
    return next(
      new ErrorResponse(
        ZONE_CONTROLLER_CONSTANTS.ZONE_NOT_FOUND,
        404,
        ERROR_TYPES.NOT_FOUND
      )
    );
  }

  await zone.remove();

  res.status(200).json({
    status: STATUS.OK,
    message: ZONE_CONTROLLER_CONSTANTS.DELETE_SUCCESS,
    error: "",
    zone: {},
  });
});
