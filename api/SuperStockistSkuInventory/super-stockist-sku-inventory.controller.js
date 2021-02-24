const mongoose = require('mongoose');
const SuperStockist = require('../SuperStockist/super-stockist.model');
const SuperStockistSkuInventory = require('./super-stockist-sku-inventory.model');
const ErrorResponse = require('../../utils/errorResponse');
const asyncHandler = require('../../middleware/asyncHandler');
const {
  STATUS,
  SUPER_STOCKIST_CONTROLLER_CONSTANTS,
} = require('../../constants/controller.constants');
const { ACTIVITY_CONSTANTS } = require('../../constants/constants');
const { ERROR_TYPES } = require('../../constants/error.constant');
const {
  SUPER_STOCKIST_INVENTORIES_AGGREGATE_QUERY,
  SUPER_STOCKIST_INVENTORY_AGGREGATE_QUERY,
} = require('./super-stockist-sku-inventory.utils');
const SuperStockistSkuInventoryActivity = require('../SuperStockistSkuInventoryActivity/super-stockist-sku-inventory-activity.model');
const { get } = require('lodash');

// @desc      Get SuperStockist Inventory
// @route     GET /api/superStockist/:superStockistId/inventory
exports.getSuperStockistInventory = asyncHandler(async (req, res, next) => {
  const superStockistId = req.params.superStockistId;

  const query = [
    {
      $match: {
        _id: mongoose.Types.ObjectId(superStockistId),
      },
    },
    ...SUPER_STOCKIST_INVENTORIES_AGGREGATE_QUERY,
  ];

  const results = await SuperStockist.aggregate(query);

  res.status(200).json({
    status: STATUS.OK,
    message: SUPER_STOCKIST_CONTROLLER_CONSTANTS.FETCH_SUCCESS,
    error: '',
    superStockist: results[0],
  });
});

// @desc      Create SuperStockist New Sku
// @route     POST /api/superStockist/:superStockistId/inventory/
exports.createSuperStockistNewSku = asyncHandler(async (req, res, next) => {
  const superStockistId = req.params.superStockistId;

  const { sku, current_inventory_level } = req.body;

  const newSuperStockistSku = new SuperStockistSkuInventory({
    super_stockist: superStockistId,
    sku,
    current_inventory_level,
  });

  const exisitingSuperStockistSku = await SuperStockistSkuInventory.findOne({
    super_stockist: superStockistId,
    sku,
  }).exec();

  if (exisitingSuperStockistSku) {
    return next(
      new ErrorResponse(
        SUPER_STOCKIST_CONTROLLER_CONSTANTS.SUPER_STOCKIST_DUPLICATE_SKU,
        404,
        ERROR_TYPES.NOT_FOUND
      )
    );
  }

  const savedSuperStockistSku = await newSuperStockistSku.save();

  const newActivity = new SuperStockistSkuInventoryActivity({
    super_stockist: superStockistId,
    sku,
    quantity: current_inventory_level,
    comment: ACTIVITY_CONSTANTS.ADD_OPENING_STOCK,
    created_by: get(req, 'user.id', null),
  });

  await newActivity.save();

  const query = [
    {
      $match: {
        _id: mongoose.Types.ObjectId(savedSuperStockistSku._id),
      },
    },
    ...SUPER_STOCKIST_INVENTORY_AGGREGATE_QUERY,
  ];

  const results = await SuperStockistSkuInventory.aggregate(query);

  res.status(200).json({
    status: STATUS.OK,
    message: SUPER_STOCKIST_CONTROLLER_CONSTANTS.FETCH_SUCCESS,
    error: '',
    superStockistInventory: results[0],
  });
});

// @desc      Update SuperStockist
// @route     PATCH /api/superStockist/:superStockistId/inventory/:id
exports.updateSuperStockistInventory = asyncHandler(async (req, res, next) => {
  const inventoryId = req.params.id;

  const receivedUpdateProperties = Object.keys(req.body);
  const allowedUpdateProperties = ['current_inventory_level'];

  const isValidUpdateOperation = receivedUpdateProperties.every((key) =>
    allowedUpdateProperties.includes(key)
  );

  if (!isValidUpdateOperation) {
    return next(new ErrorResponse(`Invalid Updates for ${inventoryId}`));
  }

  const superStockistInventory = await SuperStockistSkuInventory.findById(
    inventoryId
  ).exec();

  if (!superStockistInventory) {
    return next(
      new ErrorResponse(
        SUPER_STOCKIST_CONTROLLER_CONSTANTS.SUPER_STOCKIST_SKU_FOUND,
        404,
        ERROR_TYPES.NOT_FOUND
      )
    );
  }

  const dataToUpdate = {
    ...req.body,
  };

  await SuperStockistSkuInventory.findOneAndUpdate(
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
            SUPER_STOCKIST_CONTROLLER_CONSTANTS.SUPER_STOCKIST_SKU_FOUND,
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
        ...SUPER_STOCKIST_INVENTORY_AGGREGATE_QUERY,
      ];

      const results = await SuperStockistSkuInventory.aggregate(query);

      res.status(200).json({
        status: STATUS.OK,
        message: SUPER_STOCKIST_CONTROLLER_CONSTANTS.UPDATE_SUCCESS,
        error: '',
        superStockistInventory: results[0],
      });
    }
  );
});
