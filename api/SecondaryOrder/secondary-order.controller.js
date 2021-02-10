const mongoose = require('mongoose');
const SecondaryOrderModel = require('./secondary-order.model');
const SecondaryOrderSkuItemModel = require('../SecondaryOrderSkuItem/secondary-order-sku-item.model');
const ErrorResponse = require('../../utils/errorResponse');
const asyncHandler = require('../../middleware/asyncHandler');
const {
  STATUS,
  SECONDARY_ORDER_CONTROLLER_CONSTANTS,
} = require('../../constants/controller.constants');
const { ERROR_TYPES } = require('../../constants/error.constant');
const { ORDER_STATUS } = require('../../constants/constants');
const { get } = require('lodash');
const { SECONDARY_ORDERS_AGGREGATE_QUERY } = require('./secondary-order.utils');
const {
  incrementRetailerInventoryLevels,
} = require('../Retailer/retailer.utils');

// @desc      Get all secondaryOrder
// @route     GET /api/order/secondary-order
exports.getAllSecondaryOrders = asyncHandler(async (req, res, next) => {
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
    ...SECONDARY_ORDERS_AGGREGATE_QUERY,
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

  const results = await SecondaryOrderModel.aggregate(query);
  const [queryResults] = results;

  if (results.length === 0 || queryResults.paginatedResults.length === 0) {
    return res.status(200).json({
      status: STATUS.OK,
      message: 'Fetched Successfully',
      error: '',
      count: 0,
      pagination: {},
      secondaryOrders: [],
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
    secondaryOrders: queryResults.paginatedResults,
  });
});

// @desc      Get secondaryOrder
// @route     GET /api/order/secondary-order/:id
exports.getSecondaryOrder = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const order = await SecondaryOrderModel.findById(id).exec();

  if (!order) {
    return next(
      new ErrorResponse(
        SECONDARY_ORDER_CONTROLLER_CONSTANTS.SECONDARY_ORDER_NOT_FOUND,
        404,
        ERROR_TYPES.NOT_FOUND
      )
    );
  }

  res.status(200).json({
    status: STATUS.OK,
    message: SECONDARY_ORDER_CONTROLLER_CONSTANTS.FETCH_SUCCESS,
    error: '',
    secondaryOrder: order,
  });
});

// @desc      Post secondaryOrder
// @route     POST /api/order/secondary-order
exports.createSecondaryOrder = asyncHandler(async (req, res, next) => {
  const {
    retailer,
    distributor,
    created_by: orderTakenBy,
    sku_items,
    note,
  } = req.body;

  const secondaryOrder = new SecondaryOrderModel({
    retailer,
    distributor,
    note,
    created_by: orderTakenBy || get(req, 'user.id', null),
  });

  const savedSecondaryOrderDocument = await secondaryOrder.save();

  /* Secondary Order Sku Items */
  const SecondaryOrderSkuItems = sku_items.map((skuItem) => {
    return {
      ...skuItem,
      secondary_order: savedSecondaryOrderDocument.id,
    };
  });

  const createdSecondaryOrderSkus = await SecondaryOrderSkuItemModel.create(
    SecondaryOrderSkuItems
  );

  const createdSecondaryOrderSkuIds = createdSecondaryOrderSkus.reduce(
    (ids, sku) => {
      return [...ids, sku.id];
    },
    []
  );

  await SecondaryOrderModel.findOneAndUpdate(
    { _id: savedSecondaryOrderDocument.id },
    { sku_items: createdSecondaryOrderSkuIds },
    {
      new: true,
      runValidators: true,
      upsert: true,
    }
  ).exec(async (error, secondaryOrder) => {
    if (error) {
      return next(
        new ErrorResponse('Error on Creation', 404, ERROR_TYPES.NOT_FOUND)
      );
    } else {
      const query = [
        {
          $match: {
            _id: mongoose.Types.ObjectId(secondaryOrder.id),
          },
        },
        ...SECONDARY_ORDERS_AGGREGATE_QUERY,
      ];

      const secondaryOrders = await SecondaryOrderModel.aggregate(query);

      res.status(200).json({
        status: STATUS.OK,
        message: SECONDARY_ORDER_CONTROLLER_CONSTANTS.CREATE_SUCCESS,
        error: '',
        secondaryOrder: secondaryOrders[0],
      });
    }
  });
});

// @desc      Update secondaryOrder
// @route     PATCH /api/order/secondary-order/:id
exports.updateSecondaryOrder = asyncHandler(async (req, res, next) => {
  const secondaryOrderId = req.params.id;
  const secondaryOrder = await SecondaryOrderModel.findById(
    secondaryOrderId
  ).exec();

  if (!secondaryOrder) {
    return next(
      new ErrorResponse(
        SECONDARY_ORDER_CONTROLLER_CONSTANTS.SECONDARY_ORDER_NOT_FOUND,
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

  await SecondaryOrderModel.findOneAndUpdate(
    { _id: secondaryOrderId },
    { $set: dataToUpdate },
    {
      new: true,
      runValidators: true,
      upsert: true,
    }
  ).exec(async (error, secondaryOrder) => {
    if (error) {
      return next(
        new ErrorResponse(
          SECONDARY_ORDER_CONTROLLER_CONSTANTS.SECONDARY_ORDER_UPDATE_FAILED,
          404,
          ERROR_TYPES.NOT_FOUND
        )
      );
    } else {
      const query = [
        {
          $match: {
            _id: mongoose.Types.ObjectId(secondaryOrder.id),
          },
        },
        ...SECONDARY_ORDERS_AGGREGATE_QUERY,
      ];

      const [order] = await SecondaryOrderModel.aggregate(query);

      if (order.status === ORDER_STATUS.REACHED_DESTINATION) {
        await incrementRetailerInventoryLevels(order);
      }

      res.status(200).json({
        status: STATUS.OK,
        message: SECONDARY_ORDER_CONTROLLER_CONSTANTS.UPDATE_SUCCESS,
        error: '',
        secondaryOrder: order,
      });
    }
  });
});

// @desc      Delete secondaryOrder
// @route     DELETE /api/order/secondary-order/:id
exports.deleteSecondaryOrder = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const order = await SecondaryOrderModel.findById(id).exec();

  if (!order) {
    return next(
      new ErrorResponse(
        SECONDARY_ORDER_CONTROLLER_CONSTANTS.SECONDARY_ORDER_NOT_FOUND,
        404,
        ERROR_TYPES.NOT_FOUND
      )
    );
  }

  await order.remove();

  res.status(200).json({
    status: STATUS.OK,
    message: SECONDARY_ORDER_CONTROLLER_CONSTANTS.DELETE_SUCCESS,
    error: '',
    secondaryOrder: {},
  });
});
