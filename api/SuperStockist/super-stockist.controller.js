const mongoose = require('mongoose');
const SuperStockistModel = require('./super-stockist.model');
const ErrorResponse = require('../../utils/errorResponse');
const asyncHandler = require('../../middleware/asyncHandler');
const {
  STATUS,
  SUPER_STOCKIST_CONTROLLER_CONSTANTS,
} = require('../../constants/controller.constants');
const { ERROR_TYPES } = require('../../constants/error.constant');
const {
  SUPER_STOCKIST_AGGREGATE_QUERY,
  SUPER_STOCKIST_INVENTORY_AGGREGATE_QUERY,
  getUpdatedData,
} = require('./super-stockist.utils');
const {
  toWordUpperFirstCase,
  convertIdsToObjectIds,
} = require('../../utils/CommonUtils');
const { get, isEqual } = require('lodash');

// @desc      Get all Super Stockists
// @route     GET /api/super-stockist/
exports.getAllSuperStockists = asyncHandler(async (req, res, next) => {
  const query = [...SUPER_STOCKIST_AGGREGATE_QUERY];

  if (req.query.districts) {
    const districts = convertIdsToObjectIds(req.query.districts);

    query.unshift({
      $match: {
        appointed_districts: { $in: districts },
      },
    });
  }

  const results = await SuperStockistModel.aggregate(query);

  res.status(200).json({
    status: STATUS.OK,
    message: SUPER_STOCKIST_CONTROLLER_CONSTANTS.FETCH_SUCCESS,
    error: '',
    count: results.length,
    superStockists: results,
  });
});

// @desc      Get Super Stockist Inventory
// @route     GET /api/super-stockist/:id/inventory
exports.getSuperStockistInventory = asyncHandler(async (req, res, next) => {
  const superStockistId = req.params.id;

  const query = [
    {
      $match: {
        _id: mongoose.Types.ObjectId(superStockistId),
      },
    },
    ...SUPER_STOCKIST_INVENTORY_AGGREGATE_QUERY,
  ];

  const results = await SuperStockistModel.aggregate(query);

  res.status(200).json({
    status: STATUS.OK,
    message: SUPER_STOCKIST_CONTROLLER_CONSTANTS.FETCH_SUCCESS,
    error: '',
    superStockist: results[0],
  });
});

// @desc      Post Super Stockist
// @route     POST /api/super-stockist/
exports.createSuperStockist = asyncHandler(async (req, res, next) => {
  const {
    name,
    contact,
    additional_contacts,
    other_brands_dealing_experience,
    address,
    gstin,
    appointed_districts,
    existing_distributors_count,
  } = req.body;

  const exisitingSuperStockist = await SuperStockistModel.findOne({
    'contact.contact_number': contact.contact_number,
  });

  if (exisitingSuperStockist) {
    return next(
      new ErrorResponse(
        SUPER_STOCKIST_CONTROLLER_CONSTANTS.SUPER_STOCKIST_DUPLICATE_NAME,
        400,
        ERROR_TYPES.DUPLICATE_NAME
      )
    );
  }

  const newSuperStockist = new SuperStockistModel({
    name: toWordUpperFirstCase(name),
    created_by: get(req, 'user.id', null),
    contact,
    additional_contacts,
    other_brands_dealing_experience,
    address,
    gstin,
    appointed_districts,
    existing_distributors_count,
  });

  const savedSuperStockistDocument = await newSuperStockist.save();

  const query = [
    {
      $match: {
        _id: mongoose.Types.ObjectId(savedSuperStockistDocument.id),
      },
    },
    ...SUPER_STOCKIST_AGGREGATE_QUERY,
  ];

  const results = await SuperStockistModel.aggregate(query);

  res.status(201).json({
    status: STATUS.OK,
    message: SUPER_STOCKIST_CONTROLLER_CONSTANTS.CREATE_SUCCESS,
    error: '',
    superStockist: results[0],
  });
});

// @desc      Update Super Stockist
// @route     PATCH /api/super-stockist/:superstockistId
exports.updateSuperStockist = asyncHandler(async (req, res, next) => {
  const superStockistId = req.params.id;

  const receivedUpdateProperties = Object.keys(req.body);
  const allowedUpdateProperties = [
    'name',
    'contact',
    'additional_contacts',
    'other_brands_dealing_experience',
    'address',
    'gstin',
    'appointed_districts',
    'existing_distributors_count',
    'is_appointment_confirmed_by_company',
  ];

  const isValidUpdateOperation = receivedUpdateProperties.every((key) =>
    allowedUpdateProperties.includes(key)
  );

  if (!isValidUpdateOperation) {
    return next(new ErrorResponse(`Invalid Updates for ${superStockistId}`));
  }

  const superStockist = await SuperStockistModel.findById(
    superStockistId
  ).exec();

  if (!superStockist) {
    return next(
      new ErrorResponse(
        SUPER_STOCKIST_CONTROLLER_CONSTANTS.SUPER_STOCKIST_NOT_FOUND,
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
      superStockist.contact.contact_number
    )
  ) {
    const exisitingSuperStockist = await SuperStockistModel.findOne({
      'contact.contact_number': req.body.contact.contact_number,
    });

    if (exisitingSuperStockist) {
      return next(
        new ErrorResponse(
          'Cannot change Mobile Number',
          400,
          ERROR_TYPES.DUPLICATE_NAME
        )
      );
    }
  }

  const updatedSuperStockist = getUpdatedData(req, superStockist);
  await SuperStockistModel.findOneAndUpdate(
    { _id: superStockistId },
    { $set: updatedSuperStockist },
    {
      new: true,
      runValidators: true,
      upsert: true,
    },

    async (err, superStockist) => {
      if (err || !superStockist) {
        return next(
          new ErrorResponse(
            SUPER_STOCKIST_CONTROLLER_CONSTANTS.SUPER_STOCKIST_NOT_FOUND,
            404,
            ERROR_TYPES.NOT_FOUND
          )
        );
      }

      const query = [
        {
          $match: {
            _id: mongoose.Types.ObjectId(superStockist.id),
          },
        },
        ...SUPER_STOCKIST_AGGREGATE_QUERY,
      ];

      const results = await SuperStockistModel.aggregate(query);

      res.status(200).json({
        status: STATUS.OK,
        message: SUPER_STOCKIST_CONTROLLER_CONSTANTS.UPDATE_SUCCESS,
        error: '',
        superStockist: results[0],
      });
    }
  );
});

// @desc      Delete Super Stockist
// @route     delete /api/super-stockist/:superstockistId
exports.deleteSuperStockist = asyncHandler(async (req, res, next) => {
  const superStockistId = req.params.id;
  await SuperStockistModel.findOne(
    { _id: superStockistId },
    async (error, superStockist) => {
      if (error || !superStockist) {
        const errorResponse = new ErrorResponse(
          SUPER_STOCKIST_CONTROLLER_CONSTANTS.SUPER_STOCKIST_NOT_FOUND,
          404,
          ERROR_TYPES.NOT_FOUND
        );
        errorResponse();
      }

      await superStockist.remove().then(() => {
        res.status(200).json({
          status: STATUS.OK,
          message: SUPER_STOCKIST_CONTROLLER_CONSTANTS.DELETE_SUCCESS,
          error: '',
          superStockist: {},
        });
      });
    }
  );
});
