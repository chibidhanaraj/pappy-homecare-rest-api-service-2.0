const mongoose = require('mongoose');
const BeatModel = require('./beat.model');
const RetailerModel = require('../Retailer/retailer.model');
const ErrorResponse = require('../../utils/errorResponse');
const asyncHandler = require('../../middleware/asyncHandler');
const {
  STATUS,
  BEAT_CONTROLLER_CONSTANTS,
  AREA_CONTROLLER_CONSTANTS,
} = require('../../constants/controller.constants');
const { ERROR_TYPES } = require('../../constants/error.constant');
const { BEAT_AGGREGATE_QUERY } = require('./beat.utils');
const AreaModel = require('../Area/area.model');
const { toWordUpperFirstCase } = require('../../utils/CommonUtils');
const { get } = require('lodash');

// @desc      Get all beats
// @route     GET /api/beat/
exports.getAllBeats = asyncHandler(async (req, res, next) => {
  const query = [...BEAT_AGGREGATE_QUERY];

  const results = await BeatModel.aggregate(query);

  res.status(200).json({
    status: STATUS.OK,
    message: BEAT_CONTROLLER_CONSTANTS.FETCH_SUCCESS,
    error: '',
    count: results.length,
    beats: results,
  });
});

// @desc      Post beat
// @route     POST /api/beat/
exports.createBeat = asyncHandler(async (req, res, next) => {
  const transformedName = toWordUpperFirstCase(req.body.name);

  // Check for already created beat
  const createdBeat = await BeatModel.findOne({
    name: transformedName,
    area: req.body.area,
  });

  if (createdBeat) {
    return next(
      new ErrorResponse(
        BEAT_CONTROLLER_CONSTANTS.BEAT_DUPLICATE_NAME.replace(
          '{{name}}',
          transformedName
        ),
        400,
        ERROR_TYPES.DUPLICATE_NAME
      )
    );
  }

  const newBeat = new BeatModel({
    name: transformedName,
    created_by: get(req, 'user.id', null),
    area: req.body.area,
  });

  const savedBeatDocument = await newBeat.save();

  const query = [
    {
      $match: {
        _id: mongoose.Types.ObjectId(savedBeatDocument.id),
      },
    },
    ...BEAT_AGGREGATE_QUERY,
  ];

  const results = await BeatModel.aggregate(query);

  res.status(201).json({
    status: STATUS.OK,
    message: BEAT_CONTROLLER_CONSTANTS.CREATE_SUCCESS,
    error: '',
    beat: results[0],
  });
});

// @desc      Post beat
// @route     PATCH /api/beat/:id
exports.updateBeat = asyncHandler(async (req, res, next) => {
  const beatId = req.params.id;
  // Match for Updates
  const receivedUpdateProperties = Object.keys(req.body);
  const allowedUpdateProperties = ['name', 'area'];

  const isValidUpdateOperation = receivedUpdateProperties.every((key) =>
    allowedUpdateProperties.includes(key)
  );

  if (!isValidUpdateOperation) {
    return next(new ErrorResponse(`Invalid Updates for ${beatId}`));
  }

  const beat = await BeatModel.findById(beatId).exec();

  // Check whether the beat already exists
  if (!beat) {
    return next(
      new ErrorResponse(
        BEAT_CONTROLLER_CONSTANTS.BEAT_NOT_FOUND,
        404,
        ERROR_TYPES.NOT_FOUND
      )
    );
  }

  const dataToUpdate = {};

  // Check for duplicates
  if (req.body.name) {
    const transformedName = toWordUpperFirstCase(req.body.name);

    const existingBeat = await BeatModel.findOne({
      name: transformedName,
    });

    if (existingBeat) {
      return next(
        new ErrorResponse(
          BEAT_CONTROLLER_CONSTANTS.BEAT_DUPLICATE_NAME.replace(
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

  if (req.body.area) {
    const reqArea = await AreaModel.findById(req.body.area).exec();

    // Check whether the area already exists
    if (!reqArea) {
      return next(
        new ErrorResponse(
          AREA_CONTROLLER_CONSTANTS.AREA_NOT_FOUND,
          404,
          ERROR_TYPES.NOT_FOUND
        )
      );
    }

    dataToUpdate.area = req.body.area;
  }

  await BeatModel.findOneAndUpdate(
    { _id: beatId },
    dataToUpdate,
    {
      new: true,
      runValidators: true,
      upsert: true,
    },
    async (err, beat) => {
      if (err || !beat) {
        return next(
          new ErrorResponse(
            BEAT_CONTROLLER_CONSTANTS.BEAT_NOT_FOUND,
            404,
            ERROR_TYPES.NOT_FOUND
          )
        );
      }

      const query = [
        {
          $match: {
            _id: mongoose.Types.ObjectId(beat.id),
          },
        },
        ...BEAT_AGGREGATE_QUERY,
      ];

      const results = await BeatModel.aggregate(query);
      res.status(200).json({
        status: STATUS.OK,
        message: BEAT_CONTROLLER_CONSTANTS.UPDATE_SUCCESS,
        error: '',
        beat: results[0],
      });
    }
  );
});

// @desc      Post beat
// @route     DELETE /api/beat/:id
exports.deleteBeat = asyncHandler(async (req, res, next) => {
  const beatId = req.params.id;

  await BeatModel.findOne({ _id: beatId }, async (error, beat) => {
    if (error || !beat) {
      return next(
        new ErrorResponse(
          BEAT_CONTROLLER_CONSTANTS.BEAT_NOT_FOUND,
          404,
          ERROR_TYPES.NOT_FOUND
        )
      );
    }

    const isBeatMappedToRetailer = await RetailerModel.exists({
      beat: beatId,
    });

    if (isBeatMappedToRetailer) {
      return next(
        new ErrorResponse(
          BEAT_CONTROLLER_CONSTANTS.DELETE_FAILED,
          405,
          ERROR_TYPES.INVALID_OPERATION
        )
      );
    }

    await beat.remove().then(() => {
      res.status(200).json({
        status: STATUS.OK,
        message: BEAT_CONTROLLER_CONSTANTS.DELETE_SUCCESS,
        error: '',
        beat: {},
      });
    });
  });
});
