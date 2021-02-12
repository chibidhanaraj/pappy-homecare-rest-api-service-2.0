const mongoose = require('mongoose');
const Retailer = require('../Retailer/retailer.model');
const RetailerSkuInventory = require('./retailer-sku-inventory.model');
const RetailerSkuInventoryActivity = require('../RetailerSkuInventoryActivity/retailer-sku-inventory-activity.model');
const ErrorResponse = require('../../utils/ErrorResponse');
const asyncHandler = require('../../middleware/asyncHandler');
const {
  STATUS,
  RETAILER_CONTROLLER_CONSTANTS,
} = require('../../constants/controller.constants');
const { ERROR_TYPES } = require('../../constants/error.constant');
const {
  RETAILER_INVENTORIES_AGGREGATE_QUERY,
  RETAILER_INVENTORY_AGGREGATE_QUERY,
} = require('./retailer-sku-inventory.utils');
const { ACTIVITY_CONSTANTS } = require('../../constants/constants');
const { get } = require('lodash');

// @desc      Get Retailer Inventory
// @route     GET /api/retailer/:id/inventory
exports.getRetailerInventory = asyncHandler(async (req, res) => {
  const retailerId = req.params.retailerId;

  const query = [
    {
      $match: {
        _id: mongoose.Types.ObjectId(retailerId),
      },
    },
    ...RETAILER_INVENTORIES_AGGREGATE_QUERY,
  ];

  const results = await Retailer.aggregate(query);

  res.status(200).json({
    status: STATUS.OK,
    message: RETAILER_CONTROLLER_CONSTANTS.FETCH_SUCCESS,
    error: '',
    retailer: results[0],
  });
});

// @desc      Create Retailer New Sku
// @route     POST /api/retailer/:retailerId/inventory/
exports.createRetailerNewSku = asyncHandler(async (req, res, next) => {
  const retailerId = req.params.retailerId;

  const { sku, current_inventory_level } = req.body;

  const newRetailerSku = new RetailerSkuInventory({
    retailer: retailerId,
    sku,
    current_inventory_level,
  });

  const exisitingRetailerSku = await RetailerSkuInventory.findOne({
    retailer: retailerId,
    sku,
  }).exec();

  if (exisitingRetailerSku) {
    return next(
      new ErrorResponse(
        RETAILER_CONTROLLER_CONSTANTS.RETAILER_DUPLICATE_SKU,
        404,
        ERROR_TYPES.NOT_FOUND
      )
    );
  }

  const savedRetailerSku = await newRetailerSku.save();

  const newActivity = new RetailerSkuInventoryActivity({
    retailer: retailerId,
    sku,
    quantity: current_inventory_level,
    comment: ACTIVITY_CONSTANTS.ADD_OPENING_STOCK,
    created_by: get(req, 'user.id', null),
  });

  await newActivity.save();

  const query = [
    {
      $match: {
        _id: mongoose.Types.ObjectId(savedRetailerSku._id),
      },
    },
    ...RETAILER_INVENTORY_AGGREGATE_QUERY,
  ];

  const results = await RetailerSkuInventory.aggregate(query);

  res.status(200).json({
    status: STATUS.OK,
    message: RETAILER_CONTROLLER_CONSTANTS.FETCH_SUCCESS,
    error: '',
    retailerInventory: results[0],
  });
});

// @desc      Update Retailer
// @route     PATCH /api/retailer/:retailerId/inventory/:id
exports.updateRetailerInventory = asyncHandler(async (req, res, next) => {
  const inventoryId = req.params.id;

  const receivedUpdateProperties = Object.keys(req.body);
  const allowedUpdateProperties = ['current_inventory_level'];

  const isValidUpdateOperation = receivedUpdateProperties.every((key) =>
    allowedUpdateProperties.includes(key)
  );

  if (!isValidUpdateOperation) {
    return next(new ErrorResponse(`Invalid Updates for ${inventoryId}`));
  }

  const retailerInventory = await RetailerSkuInventory.findById(
    inventoryId
  ).exec();

  if (!retailerInventory) {
    return next(
      new ErrorResponse(
        RETAILER_CONTROLLER_CONSTANTS.RETAILER_SKU_FOUND,
        404,
        ERROR_TYPES.NOT_FOUND
      )
    );
  }

  const dataToUpdate = {
    ...req.body,
  };

  await RetailerSkuInventory.findOneAndUpdate(
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
            RETAILER_CONTROLLER_CONSTANTS.RETAILER_SKU_FOUND,
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
        ...RETAILER_INVENTORY_AGGREGATE_QUERY,
      ];

      const results = await RetailerSkuInventory.aggregate(query);

      res.status(200).json({
        status: STATUS.OK,
        message: RETAILER_CONTROLLER_CONSTANTS.UPDATE_SUCCESS,
        error: '',
        retailerInventory: results[0],
      });
    }
  );
});
