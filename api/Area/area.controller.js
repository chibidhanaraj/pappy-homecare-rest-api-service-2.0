const mongoose = require('mongoose');
const AreaModel = require('./area.model');
const BeatModel = require('../Beat/beat.model');
const DistrictModel = require('../District/district.model');
const DistributorModel = require('../Distributor/distributor.model');
const ErrorResponse = require('../../utils/errorResponse');
const asyncHandler = require('../../middleware/asyncHandler');
const {
  STATUS,
  AREA_CONTROLLER_CONSTANTS,
  DISTRICT_CONTROLLER_CONSTANTS,
} = require('../../constants/controller.constants');
const { ERROR_TYPES } = require('../../constants/error.constant');
const { AREA_AGGREGATE_QUERY } = require('./area.utils');
const { toWordUpperFirstCase } = require('../../utils/CommonUtils');
const { get } = require('lodash');

// @desc      Get all areas
// @route     GET /api/area/
exports.getAllAreas = asyncHandler(async (req, res, next) => {
  const query = [...AREA_AGGREGATE_QUERY];

  const results = await AreaModel.aggregate(query);

  res.status(200).json({
    status: STATUS.OK,
    message: AREA_CONTROLLER_CONSTANTS.FETCH_SUCCESS,
    error: '',
    count: results.length,
    areas: results,
  });
});

// @desc      Post area
// @route     POST /api/area/
exports.createArea = asyncHandler(async (req, res, next) => {
  const transformedName = toWordUpperFirstCase(req.body.name);

  // Check for already created area
  const createdArea = await AreaModel.findOne({
    name: transformedName,
  });

  if (createdArea) {
    return next(
      new ErrorResponse(
        AREA_CONTROLLER_CONSTANTS.AREA_DUPLICATE_NAME.replace(
          '{{name}}',
          transformedName
        ),
        400,
        ERROR_TYPES.DUPLICATE_NAME
      )
    );
  }

  const newArea = new AreaModel({
    name: transformedName,
    created_by: get(req, 'user.id', null),
    district: req.body.district,
  });

  const savedAreaDocument = await newArea.save();

  const query = [
    {
      $match: {
        _id: mongoose.Types.ObjectId(savedAreaDocument.id),
      },
    },
    ...AREA_AGGREGATE_QUERY,
  ];

  const results = await AreaModel.aggregate(query);

  res.status(201).json({
    status: STATUS.OK,
    message: AREA_CONTROLLER_CONSTANTS.CREATE_SUCCESS,
    error: '',
    area: results[0],
  });
});

// @desc      Post area
// @route     PATCH /api/area/:id
exports.updateArea = asyncHandler(async (req, res, next) => {
  const areaId = req.params.id;
  // Match for Updates
  const receivedUpdateProperties = Object.keys(req.body);
  const allowedUpdateProperties = ['name', 'district'];

  const isValidUpdateOperation = receivedUpdateProperties.every((key) =>
    allowedUpdateProperties.includes(key)
  );

  if (!isValidUpdateOperation) {
    return next(new ErrorResponse(`Invalid Updates for ${areaId}`));
  }

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

  const dataToUpdate = {};

  // Check for duplicates
  if (req.body.name) {
    const transformedName = toWordUpperFirstCase(req.body.name);
    const existingArea = await AreaModel.findOne({
      name: transformedName,
    });

    if (existingArea) {
      return next(
        new ErrorResponse(
          AREA_CONTROLLER_CONSTANTS.AREA_DUPLICATE_NAME.replace(
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

  if (req.body.district) {
    const reqDistrict = await DistrictModel.findById(req.body.district).exec();

    // Check whether the district already exists
    if (!reqDistrict) {
      return next(
        new ErrorResponse(
          DISTRICT_CONTROLLER_CONSTANTS.DISTRICT_NOT_FOUND,
          404,
          ERROR_TYPES.NOT_FOUND
        )
      );
    }

    dataToUpdate.district = req.body.district;
  }

  dataToUpdate.updated_by = get(req, 'user.id', null);

  await AreaModel.findOneAndUpdate(
    { _id: areaId },
    { $set: dataToUpdate },
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

      const query = [
        {
          $match: {
            _id: mongoose.Types.ObjectId(area.id),
          },
        },
        ...AREA_AGGREGATE_QUERY,
      ];

      const results = await AreaModel.aggregate(query);
      res.status(200).json({
        status: STATUS.OK,
        message: AREA_CONTROLLER_CONSTANTS.UPDATE_SUCCESS,
        error: '',
        area: results[0],
      });
    }
  );
});

// @desc      Post area
// @route     DELETE /api/area/:id
exports.deleteArea = asyncHandler(async (req, res, next) => {
  const areaId = req.params.id;

  await AreaModel.findOne({ _id: areaId }, async (error, area) => {
    if (error || !area) {
      return next(
        new ErrorResponse(
          AREA_CONTROLLER_CONSTANTS.AREA_NOT_FOUND,
          404,
          ERROR_TYPES.NOT_FOUND
        )
      );
    }

    const isAreaMapped = await BeatModel.exists({
      area: areaId,
    });

    if (isAreaMapped) {
      return next(
        new ErrorResponse(
          AREA_CONTROLLER_CONSTANTS.DELETE_FAILED,
          405,
          ERROR_TYPES.INVALID_OPERATION
        )
      );
    }

    const isAreaMappedToDbr = await DistributorModel.exists({
      appointed_areas: { $in: areaId },
    });

    if (isAreaMappedToDbr) {
      return next(
        new ErrorResponse(
          AREA_CONTROLLER_CONSTANTS.DELETE_FAILED,
          405,
          ERROR_TYPES.INVALID_OPERATION
        )
      );
    }

    await area.remove().then(() => {
      res.status(200).json({
        status: STATUS.OK,
        message: AREA_CONTROLLER_CONSTANTS.DELETE_SUCCESS,
        error: '',
        area: {},
      });
    });
  });
});
