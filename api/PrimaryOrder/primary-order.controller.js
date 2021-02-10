const mongoose = require('mongoose');
const PrimaryOrderModel = require('./primary-order.model');
const PrimaryOrderSkuItemModel = require('../PrimaryOrderSkuItem/primary-order-sku-item.model');
const ErrorResponse = require('../../utils/errorResponse');
const asyncHandler = require('../../middleware/asyncHandler');
const {
  STATUS,
  PRIMARY_ORDER_CONTROLLER_CONSTANTS,
} = require('../../constants/controller.constants');
const { ERROR_TYPES } = require('../../constants/error.constant');
const { ORDER_STATUS } = require('../../constants/constants');
const { get } = require('lodash');
const {
  PRIMARY_ORDERS_AGGREGATE_QUERY,
  updateCustomerInventory,
} = require('./primary-order.utils');

// @desc      Get all primaryOrders
// @route     GET /api/order/primary-order
exports.getAllPrimaryOrders = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const matchQuery = {};

  if (req.query.search) {
    matchQuery.invoice_number = { $regex: req.query.search };
  }

  const query = [
    {
      $match: matchQuery,
    },
    ...PRIMARY_ORDERS_AGGREGATE_QUERY,
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $facet: {
        paginatedResults: [{ $skip: startIndex }, { $limit: limit }],
        totalCount: [
          {
            $count: 'count',
          },
        ],
      },
    },
    {
      $unwind: '$totalCount',
    },
    {
      $project: { paginatedResults: 1, total: '$totalCount.count' },
    },
  ];

  const results = await PrimaryOrderModel.aggregate(query);
  const [queryResults] = results;

  if (results.length === 0 || queryResults.paginatedResults.length === 0) {
    return res.status(200).json({
      status: STATUS.OK,
      message: 'Fetched Successfully',
      error: '',
      count: 0,
      pagination: {},
      primaryOrders: [],
    });
  }

  // Pagination result
  const pagination = {};

  if (endIndex < queryResults.total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  res.status(200).json({
    status: STATUS.OK,
    message: 'Fetched Successfully',
    error: '',
    count: queryResults.paginatedResults.length,
    pagination: pagination,
    primaryOrders: queryResults.paginatedResults,
  });
});

// @desc      Get primaryOrder
// @route     GET /api/order/primary-order/:id
exports.getPrimaryOrder = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const order = await PrimaryOrderModel.findById(id).exec();

  if (!order) {
    return next(
      new ErrorResponse(
        PRIMARY_ORDER_CONTROLLER_CONSTANTS.PRIMARY_ORDER_NOT_FOUND,
        404,
        ERROR_TYPES.NOT_FOUND
      )
    );
  }

  res.status(200).json({
    status: STATUS.OK,
    message: PRIMARY_ORDER_CONTROLLER_CONSTANTS.FETCH_SUCCESS,
    error: '',
    primaryOrder: order,
  });
});

// @desc      Post primaryOrder
// @route     POST /api/order/primary-order
exports.createPrimaryOrder = asyncHandler(async (req, res, next) => {
  const {
    customer_type,
    super_stockist,
    distributor,
    created_by: orderTakenBy,
    sku_items,
    note,
  } = req.body;

  const primaryOrder = new PrimaryOrderModel({
    customer_type,
    super_stockist,
    distributor,
    note,
    created_by: orderTakenBy || get(req, 'user.id', null),
  });

  const savedPrimaryOrderDocument = await primaryOrder.save();

  /* Primary Order Sku Items */
  const PrimaryOrderSkuItems = sku_items.map((skuItem) => {
    return {
      ...skuItem,
      primary_order: savedPrimaryOrderDocument.id,
    };
  });

  const createdPrimaryOrderSkus = await PrimaryOrderSkuItemModel.create(
    PrimaryOrderSkuItems
  );

  const createdPrimaryOrderSkuIds = createdPrimaryOrderSkus.reduce(
    (ids, sku) => {
      return [...ids, sku.id];
    },
    []
  );

  await PrimaryOrderModel.findOneAndUpdate(
    { _id: savedPrimaryOrderDocument.id },
    { sku_items: createdPrimaryOrderSkuIds },
    {
      new: true,
      runValidators: true,
      upsert: true,
    }
  ).exec(async (error, primaryOrder) => {
    if (error) {
      return next(
        new ErrorResponse('Error on Creation', 404, ERROR_TYPES.NOT_FOUND)
      );
    } else {
      const query = [
        {
          $match: {
            _id: mongoose.Types.ObjectId(primaryOrder.id),
          },
        },
        ...PRIMARY_ORDERS_AGGREGATE_QUERY,
      ];

      const primaryOrders = await PrimaryOrderModel.aggregate(query);

      res.status(200).json({
        status: STATUS.OK,
        message: PRIMARY_ORDER_CONTROLLER_CONSTANTS.CREATE_SUCCESS,
        error: '',
        primaryOrder: primaryOrders[0],
      });
    }
  });
});

// @desc      Update primaryOrder
// @route     PATCH /api/order/primary-order/:id
exports.updatePrimaryOrder = asyncHandler(async (req, res, next) => {
  const primaryOrderId = req.params.id;
  const primaryOrder = await PrimaryOrderModel.findById(primaryOrderId).exec();

  if (!primaryOrder) {
    return next(
      new ErrorResponse(
        PRIMARY_ORDER_CONTROLLER_CONSTANTS.PRIMARY_ORDER_NOT_FOUND,
        404,
        ERROR_TYPES.NOT_FOUND
      )
    );
  }

  const receivedUpdateProperties = Object.keys(req.body);
  const allowedUpdateProperties = ['status'];

  const isValidUpdateOperation = receivedUpdateProperties.every((key) =>
    allowedUpdateProperties.includes(key)
  );

  if (!isValidUpdateOperation) {
    return next(new ErrorResponse(`Invalid Updates for ${zoneId}`));
  }

  const dataToUpdate = {};

  if (req.body.status) {
    dataToUpdate.status = req.body.status;
  }

  dataToUpdate.updated_by = get(req, 'user.id', null);

  await PrimaryOrderModel.findOneAndUpdate(
    { _id: primaryOrderId },
    { $set: dataToUpdate },
    {
      new: true,
      runValidators: true,
      upsert: true,
    }
  ).exec(async (error, primaryOrder) => {
    if (error) {
      return next(
        new ErrorResponse(
          PRIMARY_ORDER_CONTROLLER_CONSTANTS.PRIMARY_ORDER_UPDATE_FAILED,
          404,
          ERROR_TYPES.NOT_FOUND
        )
      );
    } else {
      const query = [
        {
          $match: {
            _id: mongoose.Types.ObjectId(primaryOrder.id),
          },
        },
        ...PRIMARY_ORDERS_AGGREGATE_QUERY,
      ];

      const [order] = await PrimaryOrderModel.aggregate(query);

      if (order.status === ORDER_STATUS.REACHED_DESTINATION) {
        await updateCustomerInventory(order);
      }

      res.status(200).json({
        status: STATUS.OK,
        message: PRIMARY_ORDER_CONTROLLER_CONSTANTS.UPDATE_SUCCESS,
        error: '',
        primaryOrder: order,
      });
    }
  });
});

// @desc      Delete primaryOrder
// @route     DELETE /api/order/primary-order/:id
exports.deletePrimaryOrder = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const order = await PrimaryOrderModel.findById(id).exec();

  if (!order) {
    return next(
      new ErrorResponse(
        PRIMARY_ORDER_CONTROLLER_CONSTANTS.PRIMARY_ORDER_NOT_FOUND,
        404,
        ERROR_TYPES.NOT_FOUND
      )
    );
  }

  await order.remove();

  res.status(200).json({
    status: STATUS.OK,
    message: PRIMARY_ORDER_CONTROLLER_CONSTANTS.DELETE_SUCCESS,
    error: '',
    primaryOrder: {},
  });
});
