const RetailerModel = require('../model/RetailerModel');
const ErrorResponse = require('../../utils/errorResponse');
const asyncHandler = require('../../middleware/asyncHandler');
const { toSentenceCase } = require('../../utils/CommonUtils');
const {
  buildAllRetailersPayload,
  buildRetailerPayload,
} = require('../../helpers/RetailerHelper');
const {
  STATUS,
  RETAILER_CONTROLLER_CONSTANTS,
} = require('../../constants/controller.constants');
const { ERROR_TYPES } = require('../../constants/error.constant');

// @desc GET Retailer
// @route GET /api/retailer
exports.getAllRetailers = asyncHandler(async (req, res, next) => {
  const retailers = await RetailerModel.find().lean().exec();

  res.status(200).json({
    status: STATUS.OK,
    message: RETAILER_CONTROLLER_CONSTANTS.FETCH_SUCCESS,
    error: '',
    retailers: await buildAllRetailersPayload(retailers),
  });
});

// @desc     Get  Retailer
// @route    GET /api/retailer/:retailerId
exports.getRetailer = asyncHandler(async (req, res, next) => {
  const retailerId = req.params.id;
  const retailer = await RetailerModel.findById(retailerId).exec();

  if (!retailer) {
    return next(
      new ErrorResponse(
        RETAILER_CONTROLLER_CONSTANTS.RETAILER_NOT_FOUND,
        404,
        ERROR_TYPES.NOT_FOUND
      )
    );
  }

  res.status(200).json({
    status: STATUS.OK,
    message: RETAILER_CONTROLLER_CONSTANTS.FETCH_SUCCESS,
    error: '',
    retailer: await buildRetailerPayload(retailer.toObject()),
  });
});

// @desc      Post  Retailer
// @route     POST /api/retailer/
exports.createRetailer = asyncHandler(async (req, res, next) => {
  const name = toSentenceCase(req.body.name);
  const retailerType = req.body.retailerType;
  const gstNumber = req.body.gstNumber;
  const contact = req.body.contact;
  const additionalContacts = req.body.additionalContacts;
  const address = req.body.address;
  const zoneId = req.body.zoneId ? req.body.zoneId : null;
  const districtId = req.body.districtId ? req.body.districtId : null;
  const areaId = req.body.areaId ? req.body.areaId : null;
  const beatAreaId = req.body.beatAreaId ? req.body.beatAreaId : null;
  const distributorId = req.body.distributorId ? req.body.distributorId : null;
  const distributionType = req.body.distributionType;

  const retailer = new RetailerModel({
    name,
    retailerType,
    contact,
    additionalContacts,
    address,
    gstNumber,
    beatAreaId,
    distributorId,
    createdBy: req.user.id || '',
    updatedBy: req.user.id || '',
    distributionType,
  });

  const savedRetailerDocument = await retailer.save();

  res.status(201).json({
    status: STATUS.OK,
    message: RETAILER_CONTROLLER_CONSTANTS.CREATE_SUCCESS,
    error: '',
    retailer: await buildRetailerPayload(savedRetailerDocument.toObject()),
  });
});

// @desc      Update  Retailer
// @route     PATCH /api/retailer/:retailerId
exports.updateRetailer = asyncHandler(async (req, res, next) => {
  const retailerId = req.params.id;
  req.body.name = toSentenceCase(req.body.name);
  req.body.distributorId = req.body.distributorId || null;
  req.body.beatAreaId = req.body.beatAreaId || null;

  const receivedUpdateProperties = Object.keys(req.body);
  const allowedUpdateProperties = [
    'name',
    'retailerType',
    'contact',
    'additionalContacts',
    'address',
    'gstNumber',
    'beatAreaId',
    'distributorId',
    'distributionType',
  ];

  const isValidUpdateOperation = receivedUpdateProperties.every((key) =>
    allowedUpdateProperties.includes(key)
  );

  if (!isValidUpdateOperation) {
    return next(new ErrorResponse(`Invalid Updates for ${retailerId}`));
  }

  const retailer = await RetailerModel.findById(retailerId).exec();

  if (!retailer) {
    return next(
      new ErrorResponse(
        RETAILER_CONTROLLER_CONSTANTS.RETAILER_NOT_FOUND,
        404,
        ERROR_TYPES.NOT_FOUND
      )
    );
  }

  const dataToUpdate = {
    ...req.body,
    updatedBy: req.user.id || '',
  };

  await RetailerModel.findOneAndUpdate(
    { _id: retailerId },
    dataToUpdate,
    {
      new: true,
      runValidators: true,
      upsert: true,
    },
    async (err, retailer) => {
      if (err || !retailer) {
        return next(
          new ErrorResponse(
            RETAILER_CONTROLLER_CONSTANTS.RETAILER_NOT_FOUND,
            404,
            ERROR_TYPES.NOT_FOUND
          )
        );
      }
      res.status(200).json({
        status: STATUS.OK,
        message: RETAILER_CONTROLLER_CONSTANTS.UPDATE_SUCCESS,
        error: '',
        retailer: await buildRetailerPayload(retailer.toObject()),
      });
    }
  );
});

// @desc      Delete Retailer
// @route     delete /api/retailer/:retailerId
exports.deleteRetailer = asyncHandler(async (req, res, next) => {
  const retailerId = req.params.id;
  await RetailerModel.findOne({ _id: retailerId }, async (error, retailer) => {
    if (error || !retailer) {
      new ErrorResponse(
        RETAILER_CONTROLLER_CONSTANTS.RETAILER_NOT_FOUND,
        404,
        ERROR_TYPES.NOT_FOUND
      );
    }

    await retailer.remove().then((el) => {
      res.status(200).json({
        status: STATUS.OK,
        message: RETAILER_CONTROLLER_CONSTANTS.DELETE_SUCCESS,
        error: '',
        retailer: {},
      });
    });
  });
});
