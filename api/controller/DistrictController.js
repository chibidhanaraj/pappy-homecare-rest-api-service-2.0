const DistrictModel = require('../model/DistrictModel');
const SuperStockistModel = require('../model/SuperStockistModel');
const ErrorResponse = require('../../utils/errorResponse');
const asyncHandler = require('../../middleware/asyncHandler');
const { toUpperCase, toSentenceCase } = require('../../utils/CommonUtils');
const {
  STATUS,
  DISTRICT_CONTROLLER_CONSTANTS,
} = require('../../constants/controller.constants');
const { ERROR_TYPES } = require('../../constants/error.constant');
const {
  normalizeDistrict,
  normalizeAllDistricts,
  updateDependancyCollections,
} = require('../../helpers/DistrictHelper');

// @desc      Get all districts
// @route     GET /api/district
exports.getAllDistricts = asyncHandler(async (req, res, next) => {
  const districts = await DistrictModel.find().lean().exec();

  res.status(200).json({
    status: STATUS.OK,
    message: DISTRICT_CONTROLLER_CONSTANTS.FETCH_SUCCESS,
    error: '',
    districts: await normalizeAllDistricts(districts),
  });
});

// @desc      Get district
// @route     GET /api/district/:id
exports.getDistrict = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const district = await DistrictModel.findById(id).exec();

  if (!district) {
    return next(
      new ErrorResponse(
        DISTRICT_CONTROLLER_CONSTANTS.DISTRICT_NOT_FOUND,
        404,
        ERROR_TYPES.NOT_FOUND
      )
    );
  }

  res.status(200).json({
    status: STATUS.OK,
    message: DISTRICT_CONTROLLER_CONSTANTS.FETCH_SUCCESS,
    error: '',
    district: await normalizeDistrict(district.toObject()),
  });
});

// @desc      Post district
// @route     POST /api/district/
exports.createDistrict = asyncHandler(async (req, res, next) => {
  const name = toSentenceCase(req.body.name);
  const districtCode = toUpperCase(name);

  // Check for already created district
  const createdDistrict = await DistrictModel.findOne({
    districtCode,
  });

  if (createdDistrict) {
    return next(
      new ErrorResponse(
        DISTRICT_CONTROLLER_CONSTANTS.DISTRICT_DUPLICATE_NAME.replace(
          '{{name}}',
          name
        ),
        400,
        ERROR_TYPES.DUPLICATE_NAME
      )
    );
  }

  const district = new DistrictModel({
    name,
    districtCode,
    zoneId: req.body.zoneId,
    createdBy: req.user.id || '',
    updatedBy: req.user.id || '',
  });

  const savedDocument = await district.save();

  res.status(201).json({
    status: STATUS.OK,
    message: DISTRICT_CONTROLLER_CONSTANTS.CREATE_SUCCESS,
    error: '',
    district: await normalizeDistrict(savedDocument.toObject()),
  });
});

exports.updateDistrict = asyncHandler(async (req, res, next) => {
  const districtId = req.params.id;
  // Match for Updates
  const receivedUpdateProperties = Object.keys(req.body);
  const allowedUpdateProperties = ['name', 'zoneId'];

  const isValidUpdateOperation = receivedUpdateProperties.every((key) =>
    allowedUpdateProperties.includes(key)
  );

  if (!isValidUpdateOperation) {
    return next(new ErrorResponse(`Invalid Updates for ${districtId}`));
  }

  const reqDistrictName = toSentenceCase(req.body.name);
  const reqDistrictCode = toUpperCase(reqDistrictName);

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

  // Check for duplicates
  if (reqDistrictCode !== district.districtCode) {
    const createdDistrict = await DistrictModel.findOne({
      districtCode: reqDistrictCode,
    });

    if (createdDistrict) {
      return next(
        new ErrorResponse(
          DISTRICT_CONTROLLER_CONSTANTS.DISTRICT_DUPLICATE_NAME.replace(
            '{{name}}',
            reqDistrictName
          ),
          400,
          ERROR_TYPES.DUPLICATE_NAME
        )
      );
    }
  }

  const dataToUpdate = {
    ...req.body,
    reqDistrictName,
    reqDistrictCode,
    updatedBy: req.user.id || '',
  };

  await DistrictModel.findOneAndUpdate(
    { _id: districtId },
    dataToUpdate,
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
      res.status(200).json({
        status: STATUS.OK,
        message: DISTRICT_CONTROLLER_CONSTANTS.UPDATE_SUCCESS,
        error: '',
        district: await normalizeDistrict(district.toObject()),
      });
    }
  );
});

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

    await Promise.all([
      await updateDependancyCollections(districtId),
      await SuperStockistModel.updateMany(
        { districtId },
        { $set: { districtId: null } },
        { multi: true }
      ),
      await district.remove(),
    ]).then((el) => {
      res.status(200).json({
        status: STATUS.OK,
        message: DISTRICT_CONTROLLER_CONSTANTS.DELETE_SUCCESS,
        error: '',
        district: {},
      });
    });
  });
});
