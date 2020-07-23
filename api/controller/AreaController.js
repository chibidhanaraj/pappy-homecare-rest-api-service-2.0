const mongoose = require('mongoose');
const ZoneModel = require('../model/ZoneModel');
const DistrictModel = require('../model/DistrictModel');
const AreaModel = require('../model/AreaModel');
const BeatAreaModel = require('../model/BeatAreaModel');
const ErrorResponse = require('../../utils/errorResponse');
const asyncHandler = require('../../middleware/asyncHandler');
const { toUpperCase, toSentenceCase } = require('../../utils/CommonUtils');
const DistributorModel = require('../model/DistributorModel');
const {
  STATUS,
  AREA_CONTROLLER_CONSTANTS,
} = require('../../constants/controller.constants');
const { ERROR_TYPES } = require('../../constants/error.constant');
const {
  normalizeArea,
  normalizeAllAreas,
  updateRetailersBeatArea,
} = require('../../helpers/AreaHelper');

// @desc      Get all areas
// @route     GET /api/area
exports.getAllAreas = asyncHandler(async (req, res, next) => {
  const areas = await AreaModel.find().lean().exec();

  res.status(200).json({
    status: STATUS.OK,
    message: AREA_CONTROLLER_CONSTANTS.FETCH_SUCCESS,
    error: '',
    areas: await normalizeAllAreas(areas),
  });
});

// @desc      Get area
// @route     GET /api/area/:id
exports.getArea = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const area = await AreaModel.findById(id).exec();

  if (!area) {
    return next(
      new ErrorResponse(
        AREA_CONTROLLER_CONSTANTS.AREA_NOT_FOUND,
        404,
        ERROR_TYPES.NOT_FOUND
      )
    );
  }

  res.status(200).json({
    status: STATUS.OK,
    message: AREA_CONTROLLER_CONSTANTS.FETCH_SUCCESS,
    error: '',
    area: await normalizeArea(area.toObject()),
  });
});

// @desc      Post area
// @route     POST /api/area/
exports.createArea = asyncHandler(async (req, res, next) => {
  const name = toSentenceCase(req.body.name);
  const areaCode = toUpperCase(name);

  // Check for created area
  const createdArea = await AreaModel.findOne({
    areaCode,
  });

  if (createdArea) {
    return next(
      new ErrorResponse(
        AREA_CONTROLLER_CONSTANTS.AREA_DUPLICATE_NAME.replace('{{name}}', name),
        400,
        ERROR_TYPES.DUPLICATE_NAME
      )
    );
  }

  const area = new AreaModel({
    name,
    areaCode,
    districtId: req.body.districtId,
    createdBy: req.user.id || '',
    updatedBy: req.user.id || '',
  });

  const savedDocument = await area.save();

  res.status(201).json({
    status: STATUS.OK,
    message: AREA_CONTROLLER_CONSTANTS.CREATE_SUCCESS,
    error: '',
    area: await normalizeArea(savedDocument.toObject()),
  });
});

// @desc      Update area
// @route     PUT /api/area/
exports.updateArea = asyncHandler(async (req, res, next) => {
  const areaId = req.params.id;

  // Match for Updates
  const receivedUpdateProperties = Object.keys(req.body);
  const allowedUpdateProperties = ['name', 'districtId'];

  const isValidUpdateOperation = receivedUpdateProperties.every((key) =>
    allowedUpdateProperties.includes(key)
  );

  if (!isValidUpdateOperation) {
    return next(new ErrorResponse(`Invalid Updates for ${areaId}`));
  }

  const reqAreaName = toSentenceCase(req.body.name);
  const reqAreaCode = toUpperCase(reqAreaName);

  const area = await AreaModel.findById(areaId).exec();
  // Check whether the area already exists
  if (!area) {
    return next(
      new ErrorResponse(
        AREA_CONTROLLER_CONSTANTS.AREA_NOT_FOUND,
        404,
        ERROR_TYPES.NOT_FOUND
      )
    );
  }

  // Check for duplicates
  if (reqAreaCode !== area.areaCode) {
    const checkArea = await AreaModel.findOne({
      areaCode: reqAreaCode,
    });

    if (checkArea) {
      return next(
        new ErrorResponse(
          AREA_CONTROLLER_CONSTANTS.AREA_DUPLICATE_NAME.replace(
            '{{name}}',
            reqAreaName
          ),
          400,
          ERROR_TYPES.DUPLICATE_NAME
        )
      );
    }
  }

  const dataToUpdate = {
    ...req.body,
    reqAreaName,
    reqAreaCode,
    updatedBy: req.user.id || '',
  };

  await AreaModel.findOneAndUpdate(
    { _id: areaId },
    dataToUpdate,
    {
      new: true,
      runValidators: true,
      upsert: true,
    },
    async (err, area) => {
      if (err || !area) {
        return next(
          new ErrorResponse(
            AREA_CONTROLLER_CONSTANTS.AREA_NOT_FOUND,
            404,
            ERROR_TYPES.NOT_FOUND
          )
        );
      }
      res.status(200).json({
        status: STATUS.OK,
        message: AREA_CONTROLLER_CONSTANTS.UPDATE_SUCCESS,
        error: '',
        area: await normalizeArea(area.toObject()),
      });
    }
  );
});

// @desc      Delete area
// @route     DELETE /api/area/
exports.deleteArea = asyncHandler(async (req, res, next) => {
  const areaId = req.params.id;
  await AreaModel.findOne({ _id: areaId }, async (error, area) => {
    if (error || !area) {
      new ErrorResponse(
        AREA_CONTROLLER_CONSTANTS.AREA_NOT_FOUND,
        404,
        ERROR_TYPES.NOT_FOUND
      );
    }

    await Promise.all([
      await updateRetailersBeatArea(areaId),
      await DistributorModel.updateMany(
        { areaId },
        { $set: { areaId: null, superStockistId: null } },
        { multi: true }
      ),
      await area.remove(),
    ]).then((el) => {
      res.status(200).json({
        status: STATUS.OK,
        message: AREA_CONTROLLER_CONSTANTS.DELETE_SUCCESS,
        error: '',
        area: {},
      });
    });
  });
});
