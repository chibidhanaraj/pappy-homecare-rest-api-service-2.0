const mongoose = require('mongoose');
const RetailerModel = require('./retailer.model');
const ErrorResponse = require('../../utils/ErrorResponse');
const asyncHandler = require('../../middleware/asyncHandler');
const {
  STATUS,
  RETAILER_CONTROLLER_CONSTANTS,
} = require('../../constants/controller.constants');
const { ERROR_TYPES } = require('../../constants/error.constant');
const {
  RETAILER_AGGREGATE_QUERY,
  getUpdatedData,
} = require('./retailer.utils');
const { toWordUpperFirstCase } = require('../../utils/CommonUtils');
const { get } = require('lodash');

// @desc      Get all Retailers
// @route     GET /api/retailer/
exports.getAllRetailers = asyncHandler(async (req, res, next) => {
  const query = [...RETAILER_AGGREGATE_QUERY];

  const results = await RetailerModel.aggregate(query);

  res.status(200).json({
    status: STATUS.OK,
    message: RETAILER_CONTROLLER_CONSTANTS.FETCH_SUCCESS,
    error: '',
    count: results.length,
    retailers: results,
  });
});

// @desc      Post Retailer
// @route     POST /api/retailer/
exports.createRetailer = asyncHandler(async (req, res, next) => {
  const {
    name,
    contact,
    additional_contacts,
    address,
    gstin,
    retail_type,
    beat,
    distributor,
  } = req.body;

  const exisitingRetailer = await RetailerModel.findOne({
    name: toWordUpperFirstCase(name),
    beat,
    'contact.contact_number': contact.contact_number,
  });

  if (exisitingRetailer) {
    return next(
      new ErrorResponse(
        RETAILER_CONTROLLER_CONSTANTS.RETAILER_DUPLICATE_NAME.replace(
          '{{name}}',
          name
        ),
        400,
        ERROR_TYPES.DUPLICATE_NAME
      )
    );
  }

  const newRetailer = new RetailerModel({
    name: toWordUpperFirstCase(name),
    created_by: get(req, 'user.id', null),
    contact,
    additional_contacts,
    address,
    gstin,
    retail_type,
    beat,
    distributor,
  });

  const savedRetailerDocument = await newRetailer.save();

  const query = [
    {
      $match: {
        _id: mongoose.Types.ObjectId(savedRetailerDocument.id),
      },
    },
    ...RETAILER_AGGREGATE_QUERY,
  ];

  const results = await RetailerModel.aggregate(query);

  res.status(201).json({
    status: STATUS.OK,
    message: RETAILER_CONTROLLER_CONSTANTS.CREATE_SUCCESS,
    error: '',
    retailer: results[0],
  });
});

// @desc      Update Retailer
// @route     PATCH /api/retailer/:retailerId
exports.updateRetailer = asyncHandler(async (req, res, next) => {
  const retailerId = req.params.id;

  const receivedUpdateProperties = Object.keys(req.body);
  const allowedUpdateProperties = [
    'name',
    'contact',
    'additional_contacts',
    'address',
    'gstin',
    'retail_type',
    'beat',
    'distributor',
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

  const dataToUpdate = getUpdatedData(req, retailer);

  await RetailerModel.findOneAndUpdate(
    { _id: retailerId },
    { $set: dataToUpdate },
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

      const query = [
        {
          $match: {
            _id: mongoose.Types.ObjectId(retailer.id),
          },
        },
        ...RETAILER_AGGREGATE_QUERY,
      ];

      const results = await RetailerModel.aggregate(query);

      res.status(200).json({
        status: STATUS.OK,
        message: RETAILER_CONTROLLER_CONSTANTS.UPDATE_SUCCESS,
        error: '',
        retailer: results[0],
      });
    }
  );
});

// @desc      Delete Retailer
// @route     delete /api/retailer/:retailerId
exports.deleteRetailer = asyncHandler(async (req, res) => {
  const retailerId = req.params.id;
  await RetailerModel.findOne({ _id: retailerId }, async (error, retailer) => {
    if (error || !retailer) {
      const errorResponse = new ErrorResponse(
        RETAILER_CONTROLLER_CONSTANTS.RETAILER_NOT_FOUND,
        404,
        ERROR_TYPES.NOT_FOUND
      );
      errorResponse();
    }

    await retailer.remove().then(() => {
      res.status(200).json({
        status: STATUS.OK,
        message: RETAILER_CONTROLLER_CONSTANTS.DELETE_SUCCESS,
        error: '',
        retailer: {},
      });
    });
  });
});
