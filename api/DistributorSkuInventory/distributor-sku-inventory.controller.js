const mongoose = require('mongoose');
const Distributor = require('../Distributor/distributor.model');
const DistributorSkuInventory = require('./distributor-sku-inventory.model');
const ErrorResponse = require('../../utils/errorResponse');
const asyncHandler = require('../../middleware/asyncHandler');
const {
  STATUS,
  DISTRIBUTOR_CONTROLLER_CONSTANTS,
} = require('../../constants/controller.constants');
const { ERROR_TYPES } = require('../../constants/error.constant');
const {
  DISTRIBUTOR_INVENTORIES_AGGREGATE_QUERY,
  DISTRIBUTOR_INVENTORY_AGGREGATE_QUERY,
} = require('./distributor-sku-inventory.utils');
const { ACTIVITY_CONSTANTS } = require('../../constants/constants');
const DistributorSkuInventoryActivity = require('../DistributorSkuInventoryActivity/distributor-sku-inventory-activity.model');
const { get } = require('lodash');

// @desc      Get Distributor Inventory
// @route     GET /api/distributor/:distributorId/inventory
exports.getDistributorInventory = asyncHandler(async (req, res, next) => {
  const distributorId = req.params.distributorId;

  const query = [
    {
      $match: {
        _id: mongoose.Types.ObjectId(distributorId),
      },
    },
    ...DISTRIBUTOR_INVENTORIES_AGGREGATE_QUERY,
  ];

  const results = await Distributor.aggregate(query);

  res.status(200).json({
    status: STATUS.OK,
    message: DISTRIBUTOR_CONTROLLER_CONSTANTS.FETCH_SUCCESS,
    error: '',
    distributor: results[0],
  });
});

// @desc      Create Distributor New Sku
// @route     POST /api/distributor/:distributorId/inventory/
exports.createDistributorNewSku = asyncHandler(async (req, res, next) => {
  const distributorId = req.params.distributorId;

  const { sku, current_inventory_level } = req.body;

  const newDistributorSku = new DistributorSkuInventory({
    distributor: distributorId,
    sku,
    current_inventory_level,
  });

  const exisitingDistributorSku = await DistributorSkuInventory.findOne({
    distributor: distributorId,
    sku,
  }).exec();

  if (exisitingDistributorSku) {
    return next(
      new ErrorResponse(
        DISTRIBUTOR_CONTROLLER_CONSTANTS.DISTRIBUTOR_DUPLICATE_SKU,
        404,
        ERROR_TYPES.NOT_FOUND
      )
    );
  }

  const savedDistributorSku = await newDistributorSku.save();

  const newActivity = new DistributorSkuInventoryActivity({
    distributor: distributorId,
    sku,
    quantity: current_inventory_level,
    comment: ACTIVITY_CONSTANTS.ADD_OPENING_STOCK,
    created_by: get(req, 'user.id', null),
  });

  await newActivity.save();

  const query = [
    {
      $match: {
        _id: mongoose.Types.ObjectId(savedDistributorSku._id),
      },
    },
    ...DISTRIBUTOR_INVENTORY_AGGREGATE_QUERY,
  ];

  const results = await DistributorSkuInventory.aggregate(query);

  res.status(200).json({
    status: STATUS.OK,
    message: DISTRIBUTOR_CONTROLLER_CONSTANTS.FETCH_SUCCESS,
    error: '',
    distributorInventory: results[0],
  });
});

// @desc      Update Distributor
// @route     PATCH /api/distributor/:distributorId/inventory/:id
exports.updateDistributorInventory = asyncHandler(async (req, res, next) => {
  const inventoryId = req.params.id;

  const receivedUpdateProperties = Object.keys(req.body);
  const allowedUpdateProperties = ['current_inventory_level'];

  const isValidUpdateOperation = receivedUpdateProperties.every((key) =>
    allowedUpdateProperties.includes(key)
  );

  if (!isValidUpdateOperation) {
    return next(new ErrorResponse(`Invalid Updates for ${inventoryId}`));
  }

  const distributorInventory = await DistributorSkuInventory.findById(
    inventoryId
  ).exec();

  if (!distributorInventory) {
    return next(
      new ErrorResponse(
        DISTRIBUTOR_CONTROLLER_CONSTANTS.DISTRIBUTOR_SKU_FOUND,
        404,
        ERROR_TYPES.NOT_FOUND
      )
    );
  }

  const dataToUpdate = {
    ...req.body,
  };

  await DistributorSkuInventory.findOneAndUpdate(
    { _id: inventoryId },
    { $set: dataToUpdate },
    {
      new: true,
      runValidators: true,
      upsert: true,
    },

    async (err, inventory) => {
      if (err || !inventory) {
        return next(
          new ErrorResponse(
            DISTRIBUTOR_CONTROLLER_CONSTANTS.DISTRIBUTOR_SKU_FOUND,
            404,
            ERROR_TYPES.NOT_FOUND
          )
        );
      }

      const query = [
        {
          $match: {
            _id: mongoose.Types.ObjectId(inventory._id),
          },
        },
        ...DISTRIBUTOR_INVENTORY_AGGREGATE_QUERY,
      ];

      const results = await DistributorSkuInventory.aggregate(query);

      res.status(200).json({
        status: STATUS.OK,
        message: DISTRIBUTOR_CONTROLLER_CONSTANTS.UPDATE_SUCCESS,
        error: '',
        distributorInventory: results[0],
      });
    }
  );
});
