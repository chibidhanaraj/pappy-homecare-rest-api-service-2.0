const mongoose = require('mongoose');
const DistributorModel = require('./distributor.model');
const RetailerModel = require('../Retailer/retailer.model');
const ErrorResponse = require('../../utils/ErrorResponse');
const asyncHandler = require('../../middleware/asyncHandler');
const {
  STATUS,
  DISTRIBUTOR_CONTROLLER_CONSTANTS,
} = require('../../constants/controller.constants');
const { ERROR_TYPES } = require('../../constants/error.constant');
const {
  DISTRIBUTOR_AGGREGATE_QUERY,
  getUpdatedData,
} = require('./distributor.utils');
const { toWordUpperFirstCase } = require('../../utils/CommonUtils');
const { get } = require('lodash');

// @desc      Get all Distributors
// @route     GET /api/distributor/
exports.getAllDistributors = asyncHandler(async (req, res, next) => {
  const query = [...DISTRIBUTOR_AGGREGATE_QUERY];

  const results = await DistributorModel.aggregate(query);

  res.status(200).json({
    status: STATUS.OK,
    message: DISTRIBUTOR_CONTROLLER_CONSTANTS.FETCH_SUCCESS,
    error: '',
    count: results.length,
    distributors: results,
  });
});

// @desc      Post Distributor
// @route     POST /api/distributor/
exports.createDistributor = asyncHandler(async (req, res, next) => {
  const {
    name,
    contact,
    additional_contacts,
    other_brands_dealing_experience,
    address,
    gstin,
    appointed_areas,
    distribution_type,
    delivery_vehicles_count,
    existing_retailers_count,
    super_stockist,
  } = req.body;

  const exisitingDistributor = await DistributorModel.findOne({
    'contact.contact_number': contact.contact_number,
  });

  if (exisitingDistributor) {
    return next(
      new ErrorResponse(
        DISTRIBUTOR_CONTROLLER_CONSTANTS.DISTRIBUTOR_DUPLICATE_NAME,
        400,
        ERROR_TYPES.DUPLICATE_NAME
      )
    );
  }

  const newDistributor = new DistributorModel({
    name: toWordUpperFirstCase(name),
    created_by: get(req, 'user.id', null),
    contact,
    additional_contacts,
    other_brands_dealing_experience,
    address,
    gstin,
    appointed_areas,
    distribution_type,
    delivery_vehicles_count,
    existing_retailers_count,
    super_stockist,
  });

  const savedDistributorDocument = await newDistributor.save();

  const query = [
    {
      $match: {
        _id: mongoose.Types.ObjectId(savedDistributorDocument.id),
      },
    },
    ...DISTRIBUTOR_AGGREGATE_QUERY,
  ];

  const results = await DistributorModel.aggregate(query);

  res.status(201).json({
    status: STATUS.OK,
    message: DISTRIBUTOR_CONTROLLER_CONSTANTS.CREATE_SUCCESS,
    error: '',
    distributor: results[0],
  });
});

// @desc      Update Distributor
// @route     PATCH /api/distributor/:superstockistId
exports.updateDistributor = asyncHandler(async (req, res, next) => {
  const distributorId = req.params.id;

  const receivedUpdateProperties = Object.keys(req.body);
  const allowedUpdateProperties = [
    'name',
    'contact',
    'additional_contacts',
    'other_brands_dealing_experience',
    'address',
    'gstin',
    'appointed_areas',
    'is_appointment_confirmed_by_company',
    'super_stockist',
    'distribution_type',
    'delivery_vehicles_count',
    'existing_retailers_count',
  ];

  const isValidUpdateOperation = receivedUpdateProperties.every((key) =>
    allowedUpdateProperties.includes(key)
  );

  if (!isValidUpdateOperation) {
    return next(new ErrorResponse(`Invalid Updates for ${distributorId}`));
  }

  const distributor = await DistributorModel.findById(distributorId).exec();

  if (!distributor) {
    return next(
      new ErrorResponse(
        DISTRIBUTOR_CONTROLLER_CONSTANTS.DISTRIBUTOR_NOT_FOUND,
        404,
        ERROR_TYPES.NOT_FOUND
      )
    );
  }

  if (
    req.body.contact &&
    req.body.contact.contact_number &&
    !isEqual(
      req.body.contact.contact_number,
      distributor.contact.contact_number
    )
  ) {
    const exisitingDistributor = await DistributorModel.findOne({
      'contact.contact_number': req.body.contact.contact_number,
    });

    if (exisitingDistributor) {
      return next(
        new ErrorResponse(
          'Cannot change Mobile Number',
          400,
          ERROR_TYPES.DUPLICATE_NAME
        )
      );
    }
  }

  const updatedDistributor = getUpdatedData(req, distributor);

  await DistributorModel.findOneAndUpdate(
    { _id: distributorId },
    { $set: updatedDistributor },
    {
      new: true,
      runValidators: true,
      upsert: true,
    },

    async (err, distributor) => {
      if (err || !distributor) {
        return next(
          new ErrorResponse(
            DISTRIBUTOR_CONTROLLER_CONSTANTS.DISTRIBUTOR_NOT_FOUND,
            404,
            ERROR_TYPES.NOT_FOUND
          )
        );
      }

      const query = [
        {
          $match: {
            _id: mongoose.Types.ObjectId(distributor.id),
          },
        },
        ...DISTRIBUTOR_AGGREGATE_QUERY,
      ];

      const results = await DistributorModel.aggregate(query);

      res.status(200).json({
        status: STATUS.OK,
        message: DISTRIBUTOR_CONTROLLER_CONSTANTS.UPDATE_SUCCESS,
        error: '',
        distributor: results[0],
      });
    }
  );
});

// @desc      Delete Distributor
// @route     delete /api/distributor/:superstockistId
exports.deleteDistributor = asyncHandler(async (req, res, next) => {
  const distributorId = req.params.id;
  await DistributorModel.findOne(
    { _id: distributorId },
    async (error, distributor) => {
      if (error || !distributor) {
        const errorResponse = new ErrorResponse(
          DISTRIBUTOR_CONTROLLER_CONSTANTS.DISTRIBUTOR_NOT_FOUND,
          404,
          ERROR_TYPES.NOT_FOUND
        );
        errorResponse();
      }

      const isDbrMappedToRetailer = await RetailerModel.exists({
        distributor: distributorId,
      });

      if (isDbrMappedToRetailer) {
        return next(
          new ErrorResponse(
            DISTRIBUTOR_CONTROLLER_CONSTANTS.DELETE_FAILED,
            405,
            ERROR_TYPES.INVALID_OPERATION
          )
        );
      }

      await distributor.remove().then(() => {
        res.status(200).json({
          status: STATUS.OK,
          message: DISTRIBUTOR_CONTROLLER_CONSTANTS.DELETE_SUCCESS,
          error: '',
          distributor: {},
        });
      });
    }
  );
});
