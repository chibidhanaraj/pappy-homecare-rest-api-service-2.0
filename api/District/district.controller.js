const mongoose = require('mongoose');
const DistrictModel = require('./district.model');
const AreaModel = require('../Area/area.model');
const SuperStockistModel = require('../SuperStockist/super-stockist.model');
const ErrorResponse = require('../../utils/errorResponse');
const asyncHandler = require('../../middleware/asyncHandler');
const { toWordUpperFirstCase } = require('../../utils/CommonUtils');
const {
  STATUS,
  DISTRICT_CONTROLLER_CONSTANTS,
  ZONE_CONTROLLER_CONSTANTS,
} = require('../../constants/controller.constants');
const { ERROR_TYPES } = require('../../constants/error.constant');
const { DISTRICT_AGGREGATE_QUERY } = require('./district.utils');
const { get } = require('lodash');
const Zone = require('../Zone/zone.model');

// @desc      Get all districts
// @route     GET /api/district/
exports.getAllDistricts = asyncHandler(async (req, res, next) => {
  const query = [...DISTRICT_AGGREGATE_QUERY];

  const results = await DistrictModel.aggregate(query);

  res.status(200).json({
    status: STATUS.OK,
    message: DISTRICT_CONTROLLER_CONSTANTS.FETCH_SUCCESS,
    error: '',
    count: results.length,
    districts: results,
  });
});

// @desc      Post district
// @route     POST /api/district/
exports.createDistrict = asyncHandler(async (req, res, next) => {
  const transformedName = toWordUpperFirstCase(req.body.name);

  // Check for already created district
  const createdDistrict = await DistrictModel.findOne({
    name: toWordUpperFirstCase(transformedName),
  });

  if (createdDistrict) {
    return next(
      new ErrorResponse(
        DISTRICT_CONTROLLER_CONSTANTS.DISTRICT_DUPLICATE_NAME.replace(
          '{{name}}',
          transformedName
        ),
        400,
        ERROR_TYPES.DUPLICATE_NAME
      )
    );
  }

  const newDistrict = new DistrictModel({
    name: transformedName,
    created_by: get(req, 'user.id', null),
    zone: req.body.zone,
  });

  const savedDistrictDocument = await newDistrict.save();

  const query = [
    {
      $match: {
        _id: mongoose.Types.ObjectId(savedDistrictDocument.id),
      },
    },
    ...DISTRICT_AGGREGATE_QUERY,
  ];

  const results = await DistrictModel.aggregate(query);

  res.status(201).json({
    status: STATUS.OK,
    message: DISTRICT_CONTROLLER_CONSTANTS.CREATE_SUCCESS,
    error: '',
    district: results[0],
  });
});

// @desc      Post district
// @route     PATCH /api/district/:id
exports.updateDistrict = asyncHandler(async (req, res, next) => {
  const districtId = req.params.id;
  // Match for Updates
  const receivedUpdateProperties = Object.keys(req.body);
  const allowedUpdateProperties = ['name', 'zone'];

  const isValidUpdateOperation = receivedUpdateProperties.every((key) =>
    allowedUpdateProperties.includes(key)
  );

  if (!isValidUpdateOperation) {
    return next(new ErrorResponse(`Invalid Updates for ${districtId}`));
  }

  const district = await DistrictModel.findById(districtId).exec();

  // Check whether the district already exists
  if (!district) {
    return next(
      new ErrorResponse(
        DISTRICT_CONTROLLER_CONSTANTS.DISTRICT_NOT_FOUND,
        404,
        ERROR_TYPES.NOT_FOUND
      )
    );
  }

  const dataToUpdate = {};

  // Check for duplicates
  if (req.body.name) {
    const transformedName = toWordUpperFirstCase(req.body.name);

    const existingDistrict = await DistrictModel.findOne({
      name: transformedName,
    });

    if (existingDistrict) {
      return next(
        new ErrorResponse(
          DISTRICT_CONTROLLER_CONSTANTS.DISTRICT_DUPLICATE_NAME.replace(
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

  if (req.body.zone) {
    const reqZone = await Zone.findById(req.body.zone).exec();

    // Check whether the zone already exists
    if (!reqZone) {
      return next(
        new ErrorResponse(
          ZONE_CONTROLLER_CONSTANTS.ZONE_NOT_FOUND,
          404,
          ERROR_TYPES.NOT_FOUND
        )
      );
    }

    dataToUpdate.zone = req.body.zone;
  }

  dataToUpdate.updated_by = get(req, 'user.id', null);

  await DistrictModel.findOneAndUpdate(
    { _id: districtId },
    { $set: dataToUpdate },
    {
      new: true,
      runValidators: true,
      upsert: true,
    },
    async (err, district) => {
      if (err || !district) {
        return next(
          new ErrorResponse(
            DISTRICT_CONTROLLER_CONSTANTS.DISTRICT_NOT_FOUND,
            404,
            ERROR_TYPES.NOT_FOUND
          )
        );
      }

      const query = [
        {
          $match: {
            _id: mongoose.Types.ObjectId(district.id),
          },
        },
        ...DISTRICT_AGGREGATE_QUERY,
      ];

      const results = await DistrictModel.aggregate(query);
      res.status(200).json({
        status: STATUS.OK,
        message: DISTRICT_CONTROLLER_CONSTANTS.UPDATE_SUCCESS,
        error: '',
        district: results[0],
      });
    }
  );
});

// @desc      Post district
// @route     DELETE /api/district/:id
exports.deleteDistrict = asyncHandler(async (req, res, next) => {
  const districtId = req.params.id;

  await DistrictModel.findOne({ _id: districtId }, async (error, district) => {
    if (error || !district) {
      return next(
        new ErrorResponse(
          DISTRICT_CONTROLLER_CONSTANTS.DISTRICT_NOT_FOUND,
          404,
          ERROR_TYPES.NOT_FOUND
        )
      );
    }

    const isDistrictMapped = await AreaModel.exists({
      district: districtId,
    });

    if (isDistrictMapped) {
      return next(
        new ErrorResponse(
          DISTRICT_CONTROLLER_CONSTANTS.DELETE_FAILED,
          405,
          ERROR_TYPES.INVALID_OPERATION
        )
      );
    }

    const isDistrictMappedToSs = await SuperStockistModel.exists({
      appointed_districts: { $in: districtId },
    });

    if (isDistrictMappedToSs) {
      return next(
        new ErrorResponse(
          DISTRICT_CONTROLLER_CONSTANTS.DELETE_FAILED,
          405,
          ERROR_TYPES.INVALID_OPERATION
        )
      );
    }

    await district.remove().then(() => {
      res.status(200).json({
        status: STATUS.OK,
        message: DISTRICT_CONTROLLER_CONSTANTS.DELETE_SUCCESS,
        error: '',
        district: {},
      });
    });
  });
});
