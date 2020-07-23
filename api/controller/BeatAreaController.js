const mongoose = require('mongoose');
const BeatAreaModel = require('../model/BeatAreaModel');
const RetailerModel = require('../model/RetailerModel');
const ErrorResponse = require('../../utils/errorResponse');
const asyncHandler = require('../../middleware/asyncHandler');
const { toUpperCase, toSentenceCase } = require('../../utils/CommonUtils');
const {
  STATUS,
  BEAT_AREA_CONTROLLER_CONSTANTS,
} = require('../../constants/controller.constants');
const { ERROR_TYPES } = require('../../constants/error.constant');
const {
  normalizeBeatArea,
  normalizeAllBeatAreas,
} = require('../../helpers/BeatAreaHelper');

// @desc      Get all beatAreas
// @route     GET /api/beatArea
exports.getAllBeatAreas = asyncHandler(async (req, res, next) => {
  const beatAreas = await BeatAreaModel.find().lean().exec();

  res.status(200).json({
    status: STATUS.OK,
    message: BEAT_AREA_CONTROLLER_CONSTANTS.FETCH_SUCCESS,
    error: '',
    beatAreas: await normalizeAllBeatAreas(beatAreas),
  });
});

// @desc      Get beatArea
// @route     GET /api/beatArea/:id
exports.getBeatArea = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const beatArea = await BeatAreaModel.findById(id).exec();

  if (!beatArea) {
    return next(
      new ErrorResponse(
        BEAT_AREA_CONTROLLER_CONSTANTS.BEAT_AREA_NOT_FOUND,
        404,
        ERROR_TYPES.NOT_FOUND
      )
    );
  }

  res.status(200).json({
    status: STATUS.OK,
    message: BEAT_AREA_CONTROLLER_CONSTANTS.FETCH_SUCCESS,
    error: '',
    beatArea: await normalizeBeatArea(beatArea.toObject()),
  });
});

// @desc      Post beatArea
// @route     POST /api/beatArea/
exports.createBeatArea = asyncHandler(async (req, res, next) => {
  const name = toSentenceCase(req.body.name);
  const beatAreaCode = toUpperCase(name);

  // Check for created beatArea
  const createdBeatArea = await BeatAreaModel.findOne({
    beatAreaCode,
  });

  if (createdBeatArea) {
    return next(
      new ErrorResponse(
        BEAT_AREA_CONTROLLER_CONSTANTS.BEAT_AREA_DUPLICATE_NAME.replace(
          '{{name}}',
          name
        ),
        400,
        ERROR_TYPES.DUPLICATE_NAME
      )
    );
  }

  const beatArea = new BeatAreaModel({
    name,
    beatAreaCode,
    areaId: req.body.areaId,
    createdBy: req.user.id || '',
    updatedBy: req.user.id || '',
  });

  const savedDocument = await beatArea.save();

  res.status(201).json({
    status: STATUS.OK,
    message: BEAT_AREA_CONTROLLER_CONSTANTS.CREATE_SUCCESS,
    error: '',
    beatArea: await normalizeBeatArea(savedDocument.toObject()),
  });
});

// @desc      Update beatArea
// @route     PATCH /api/beatArea/
exports.updateBeatArea = asyncHandler(async (req, res, next) => {
  const beatAreaId = req.params.id;
  // Match for Updates
  const receivedUpdateProperties = Object.keys(req.body);
  const allowedUpdateProperties = ['name', 'areaId'];

  const isValidUpdateOperation = receivedUpdateProperties.every((key) =>
    allowedUpdateProperties.includes(key)
  );

  if (!isValidUpdateOperation) {
    return next(new ErrorResponse(`Invalid Updates for ${beatAreaId}`));
  }

  const reqBeatAreaName = toSentenceCase(req.body.name);
  const reqBeatAreaCode = toUpperCase(reqBeatAreaName);

  // Check for created beatArea
  const beatArea = await BeatAreaModel.findById(beatAreaId).exec();

  if (!beatArea) {
    return next(
      new ErrorResponse(
        BEAT_AREA_CONTROLLER_CONSTANTS.BEAT_AREA_NOT_FOUND,
        404,
        ERROR_TYPES.NOT_FOUND
      )
    );
  }

  // Check for duplicates
  if (reqBeatAreaCode !== beatArea.beatAreaCode) {
    const checkBeatArea = await BeatAreaModel.findOne({
      beatAreaCode: reqBeatAreaCode,
    });

    if (checkBeatArea) {
      return next(
        new ErrorResponse(
          BEAT_AREA_CONTROLLER_CONSTANTS.BEAT_AREA_DUPLICATE_NAME.replace(
            '{{name}}',
            reqBeatAreaName
          ),
          400,
          ERROR_TYPES.DUPLICATE_NAME
        )
      );
    }
  }

  const dataToUpdate = {
    ...req.body,
    reqBeatAreaName,
    reqBeatAreaCode,
    updatedBy: req.user.id || '',
  };

  await BeatAreaModel.findOneAndUpdate(
    { _id: beatAreaId },
    dataToUpdate,
    {
      new: true,
      runValidators: true,
      upsert: true,
    },
    async (err, beatArea) => {
      if (err || !beatArea) {
        return next(
          new ErrorResponse(
            BEAT_AREA_CONTROLLER_CONSTANTS.BEAT_AREA_NOT_FOUND,
            404,
            ERROR_TYPES.NOT_FOUND
          )
        );
      }
      res.status(200).json({
        status: STATUS.OK,
        message: BEAT_AREA_CONTROLLER_CONSTANTS.UPDATE_SUCCESS,
        error: '',
        beatArea: await normalizeBeatArea(beatArea.toObject()),
      });
    }
  );
});

// @desc      Update beatArea
// @route     DELETE /api/beatArea/
exports.deleteBeatArea = asyncHandler(async (req, res, next) => {
  const beatAreaId = req.params.id;

  await BeatAreaModel.findOne({ _id: beatAreaId }, async (error, beatArea) => {
    if (error || !beatArea) {
      new ErrorResponse(
        BEAT_AREA_CONTROLLER_CONSTANTS.BEAT_AREA_NOT_FOUND,
        404,
        ERROR_TYPES.NOT_FOUND
      );
    }

    await Promise.all([
      await RetailerModel.updateMany(
        { beatAreaId },
        { $set: { distributorId: null, beatAreaId: null } },
        { multi: true }
      ),
      await beatArea.remove(),
    ]).then((el) => {
      res.status(200).json({
        status: STATUS.OK,
        message: BEAT_AREA_CONTROLLER_CONSTANTS.DELETE_SUCCESS,
        error: '',
        beatArea: {},
      });
    });
  });
});
