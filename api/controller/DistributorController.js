const mongoose = require('mongoose');
const DistributorModel = require('../model/DistributorModel');
const ErrorResponse = require('../../utils/errorResponse');
const asyncHandler = require('../../middleware/asyncHandler');
const {
  toSentenceCase,
  areObjectIdEqualArrays,
} = require('../../utils/CommonUtils');
const {
  buildDistributorPayload,
  buildAllDistributorsPayload,
} = require('../../helpers/DistributorHelper');
const {
  STATUS,
  DISTRIBUTOR_CONTROLLER_CONSTANTS,
} = require('../../constants/controller.constants');
const { ERROR_TYPES } = require('../../constants/error.constant');
const RetailerModel = require('../model/RetailerModel');

// @desc GET Distributors
// @route GET /api/distributor
exports.getAllDistributors = asyncHandler(async (req, res, next) => {
  const distributors = await DistributorModel.find().lean().exec();

  res.status(200).json({
    status: STATUS.OK,
    message: DISTRIBUTOR_CONTROLLER_CONSTANTS.FETCH_SUCCESS,
    error: '',
    distributors: await buildAllDistributorsPayload(distributors),
  });
});

// @desc      Get Distributor
// @route     GET /api/distributor/:distributorId
exports.getDistributor = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const distributor = await DistributorModel.findById(id)
    .populate(
      'zonesPayload districtsPayload areasPayload superStockist',
      'name'
    )
    .exec();

  if (!distributor) {
    return next(
      new ErrorResponse(
        DISTRIBUTOR_CONTROLLER_CONSTANTS.DISTRIBUTOR_NOT_FOUND,
        404,
        ERROR_TYPES.NOT_FOUND
      )
    );
  }

  res.status(200).json({
    status: STATUS.OK,
    message: DISTRIBUTOR_CONTROLLER_CONSTANTS.FETCH_SUCCESS,
    error: '',
    distributor: await buildDistributorPayload(distributor.toObject()),
  });
});

// @desc      Post Distributor
// @route     POST /api/distributor/
exports.createDistributor = asyncHandler(async (req, res, next) => {
  const name = toSentenceCase(req.body.name);
  const contact = req.body.contact;
  const additionalContacts = req.body.additionalContacts;
  const address = req.body.address;
  const gstNumber = req.body.gstNumber;
  const deliveryVehiclesCount = req.body.deliveryVehiclesCount;
  const existingRetailersCount = req.body.existingRetailersCount;
  const currentBrandsDealing = req.body.currentBrandsDealing;
  const zones = req.body.zones || [];
  const districts = req.body.districts || [];
  const areas = req.body.areas;
  const superStockistId = req.body.superStockistId || null;
  const distributionType = req.body.distributionType;

  const distributor = new DistributorModel({
    _id: new mongoose.Types.ObjectId(),
    name,
    contact,
    additionalContacts,
    address,
    gstNumber,
    deliveryVehiclesCount,
    existingRetailersCount,
    currentBrandsDealing,
    areas,
    superStockistId,
    createdBy: req.user.id || '',
    updatedBy: req.user.id || '',
    distributionType,
  });

  const savedDistributorDocument = await distributor.save();

  res.status(201).json({
    status: STATUS.OK,
    message: DISTRIBUTOR_CONTROLLER_CONSTANTS.CREATE_SUCCESS,
    error: '',
    distributor: await buildDistributorPayload(
      savedDistributorDocument.toObject()
    ),
  });
});

// @desc      Update Distributor
// @route     PATCH /api/distributor/:distributorId
exports.updateDistributor = asyncHandler(async (req, res, next) => {
  const distributorId = req.params.id;
  req.body.name = toSentenceCase(req.body.name);

  const receivedUpdateProperties = Object.keys(req.body);
  const allowedUpdateProperties = [
    'name',
    'contact',
    'additionalContacts',
    'address',
    'gstNumber',
    'deliveryVehiclesCount',
    'existingRetailersCount',
    'currentBrandsDealing',
    'areas',
    'superStockistId',
    'distributionType',
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

  const dataToUpdate = {
    ...req.body,
    updatedBy: req.user.id || '',
  };

  await DistributorModel.findOneAndUpdate(
    { _id: distributorId },
    dataToUpdate,
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
      res.status(200).json({
        status: STATUS.OK,
        message: DISTRIBUTOR_CONTROLLER_CONSTANTS.UPDATE_SUCCESS,
        error: '',
        distributor: await buildDistributorPayload(distributor.toObject()),
      });
    }
  );
});

// @desc      Delete Distributor
// @route     delete /api/distributor/

exports.deleteDistributor = asyncHandler(async (req, res, next) => {
  const distributorId = req.params.id;
  await DistributorModel.findOne(
    { _id: distributorId },
    async (error, distributor) => {
      if (error || !distributor) {
        new ErrorResponse(
          DISTRIBUTOR_CONTROLLER_CONSTANTS.DISTRIBUTOR_NOT_FOUND,
          404,
          ERROR_TYPES.NOT_FOUND
        );
      }

      await Promise.all([
        await RetailerModel.updateMany(
          { distributorId },
          { $set: { distributorId: null } },
          { multi: true }
        ),
        await distributor.remove(),
      ]).then((el) => {
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
