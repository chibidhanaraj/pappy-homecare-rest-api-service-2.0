const mongoose = require('mongoose');
const SuperStockistModel = require('../model/SuperStockistModel');
const ErrorResponse = require('../../utils/errorResponse');
const asyncHandler = require('../../middleware/asyncHandler');
const { toSentenceCase } = require('../../utils/CommonUtils');
const {
  STATUS,
  SUPER_STOCKIST_CONTROLLER_CONSTANTS,
} = require('../../constants/controller.constants');
const { ERROR_TYPES } = require('../../constants/error.constant');
const {
  normalizeSuperStockist,
  normalizeAllSuperStockists,
} = require('../../helpers/SuperStockistHelper');
const DistributorModel = require('../model/DistributorModel');

// @desc GET Super Stockists
// @route GET /api/superstockist
exports.getAllSuperStockists = asyncHandler(async (req, res) => {
  const superStockists = await SuperStockistModel.find().lean().exec();

  res.status(200).json({
    status: STATUS.OK,
    message: SUPER_STOCKIST_CONTROLLER_CONSTANTS.FETCH_SUCCESS,
    error: '',
    superStockists: await normalizeAllSuperStockists(superStockists),
  });
});

// @desc      Get Super Stockist
// @route     GET /api/superstockist/:superstockistId
exports.getSuperStockist = asyncHandler(async (req, res, next) => {
  const superStockistId = req.params.id;
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

  res.status(200).json({
    status: STATUS.OK,
    message: SUPER_STOCKIST_CONTROLLER_CONSTANTS.FETCH_SUCCESS,
    error: '',
    superStockist: await normalizeSuperStockist(superStockist.toObject()),
  });
});

// @desc      Post Super Stockist
// @route     POST /api/superstockist/
exports.createSuperStockist = asyncHandler(async (req, res, next) => {
  const name = toSentenceCase(req.body.name);
  const contact = req.body.contact;
  const additionalContacts = req.body.additionalContacts;
  const address = req.body.address;
  const gstNumber = req.body.gstNumber;
  const existingDistributorsCount = req.body.existingDistributorsCount;
  const currentBrandsDealing = req.body.currentBrandsDealing;
  const districts = req.body.districts || [];

  const superStockist = new SuperStockistModel({
    _id: new mongoose.Types.ObjectId(),
    name,
    contact,
    additionalContacts,
    address,
    gstNumber,
    existingDistributorsCount,
    currentBrandsDealing,
    districts,
    createdBy: req.user.id || '',
    updatedBy: req.user.id || '',
  });

  const savedSuperStockistDocument = await superStockist.save();

  res.status(201).json({
    status: STATUS.OK,
    message: SUPER_STOCKIST_CONTROLLER_CONSTANTS.CREATE_SUCCESS,
    error: '',
    superStockist: await normalizeSuperStockist(
      savedSuperStockistDocument.toObject()
    ),
  });
});

// @desc      Update Super Stockist
// @route     PATCH /api/superstockist/:superstockistId
exports.updateSuperStockist = asyncHandler(async (req, res, next) => {
  const superStockistId = req.params.id;

  const receivedUpdateProperties = Object.keys(req.body);
  const allowedUpdateProperties = [
    'name',
    'contact',
    'additionalContacts',
    'address',
    'gstNumber',
    'existingDistributorsCount',
    'currentBrandsDealing',
    'districts',
    'distributionType',
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

  req.body.name = toSentenceCase(req.body.name);

  const dataToUpdate = {
    updatedBy: req.user.id || '',
    ...req.body,
  };

  await SuperStockistModel.findOneAndUpdate(
    { _id: superStockistId },
    dataToUpdate,
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
      res.status(200).json({
        status: STATUS.OK,
        message: SUPER_STOCKIST_CONTROLLER_CONSTANTS.UPDATE_SUCCESS,
        error: '',
        superStockist: await normalizeSuperStockist(superStockist.toObject()),
      });
    }
  );
});

// @desc      Delete Super Stockist
// @route     delete /api/superstockist/:superstockistId
exports.deleteSuperStockist = asyncHandler(async (req, res) => {
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

      await Promise.all([
        await DistributorModel.updateMany(
          { superStockistId },
          { $set: { superStockistId: null } },
          { multi: true }
        ),
        await superStockist.remove(),
      ]).then((el) => {
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
