const mongoose = require('mongoose');
const SecondPrimaryOrderModel = require('./second-primary-order.model');
const SecondPrimaryOrderSkuItemModel = require('../SecondPrimaryOrderSkuItem/second-primary-order-sku-item.model');
const ErrorResponse = require('../../utils/errorResponse');
const asyncHandler = require('../../middleware/asyncHandler');
const {
  STATUS,
  SECOND_PRIMARY_ORDER_CONTROLLER_CONSTANTS,
} = require('../../constants/controller.constants');
const { ERROR_TYPES } = require('../../constants/error.constant');
const { ORDER_STATUS } = require('../../constants/constants');
const { get } = require('lodash');
const {
  SECOND_PRIMARY_ORDERS_AGGREGATE_QUERY,
  SECOND_PRIMARY_ORDER_AGGREGATE_QUERY,
} = require('./second-primary-order.utils');
const {
  incrementDistributorInventoryLevels,
} = require('../Distributor/distributor.utils');

// @desc      Get all secondPrimaryOrder
// @route     GET /api/order/second-primary-order
exports.getAllSecondPrimaryOrders = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const matchQuery = {};

  if (req.query.invoice_number) {
    matchQuery.invoice_number = {
      $regex: req.query.invoice_number,
    };
  }

  if (req.query.super_stockist) {
    matchQuery.super_stockist = mongoose.Types.ObjectId(
      req.query.super_stockist
    );
  }

  if (req.query.distributor) {
    matchQuery.distributor = mongoose.Types.ObjectId(req.query.distributor);
  }

  if (req.query.status) {
    matchQuery.status = req.query.status;
  }

  const filterByCustomerName = [];

  if (req.query.customerName) {
    filterByCustomerName.push({
      $match: {
        $or: [
          { 'super_stockist.name': req.query.customerName },
          { 'distributor.name': req.query.customerName },
        ],
      },
    });
  }

  const query = [
    {
      $match: matchQuery,
    },
    ...SECOND_PRIMARY_ORDERS_AGGREGATE_QUERY,
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

  const results = await SecondPrimaryOrderModel.aggregate(query);
  const [queryResults] = results;

  if (results.length === 0 || queryResults.paginatedResults.length === 0) {
    return res.status(200).json({
      status: STATUS.OK,
      message: 'Fetched Successfully',
      error: '',
      count: 0,
      pagination: {},
      secondPrimaryOrders: [],
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
    secondPrimaryOrders: queryResults.paginatedResults,
  });
});

// @desc      Get secondPrimaryOrder
// @route     GET /api/order/second-primary-order/:id
exports.getSecondPrimaryOrder = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const order = await SecondPrimaryOrderModel.findById(id).exec();

  if (!order) {
    return next(
      new ErrorResponse(
        SECOND_PRIMARY_ORDER_CONTROLLER_CONSTANTS.SECOND_PRIMARY_ORDER_NOT_FOUND,
        404,
        ERROR_TYPES.NOT_FOUND
      )
    );
  }

  const query = [
    {
      $match: {
        _id: mongoose.Types.ObjectId(order.id),
      },
    },
    ...SECOND_PRIMARY_ORDER_AGGREGATE_QUERY,
  ];

  const results = await SecondPrimaryOrderModel.aggregate(query);

  res.status(200).json({
    status: STATUS.OK,
    message: SECOND_PRIMARY_ORDER_CONTROLLER_CONSTANTS.FETCH_SUCCESS,
    error: '',
    secondPrimaryOrder: results[0],
  });
});

// @desc      Post secondPrimaryOrder
// @route     POST /api/order/second-primary-order
exports.createSecondPrimaryOrder = asyncHandler(async (req, res, next) => {
  const {
    super_stockist,
    distributor,
    created_by: orderTakenBy,
    sku_items,
    note,
  } = req.body;

  const secondPrimaryOrder = new SecondPrimaryOrderModel({
    super_stockist,
    distributor,
    note,
    created_by: orderTakenBy || get(req, 'user.id', null),
  });

  const savedSecondPrimaryOrderDocument = await secondPrimaryOrder.save();

  /* SecondPrimary Order Sku Items */
  const SecondPrimaryOrderSkuItems = sku_items.map((skuItem) => {
    return {
      ...skuItem,
      second_primary_order: savedSecondPrimaryOrderDocument.id,
    };
  });

  const createdSecondPrimaryOrderSkus = await SecondPrimaryOrderSkuItemModel.create(
    SecondPrimaryOrderSkuItems
  );

  const createdSecondPrimaryOrderSkuIds = createdSecondPrimaryOrderSkus.reduce(
    (ids, sku) => {
      return [...ids, sku.id];
    },
    []
  );

  await SecondPrimaryOrderModel.findOneAndUpdate(
    { _id: savedSecondPrimaryOrderDocument.id },
    { sku_items: createdSecondPrimaryOrderSkuIds },
    {
      new: true,
      runValidators: true,
      upsert: true,
    }
  ).exec(async (error, secondPrimaryOrder) => {
    if (error) {
      return next(
        new ErrorResponse('Error on Creation', 404, ERROR_TYPES.NOT_FOUND)
      );
    } else {
      const query = [
        {
          $match: {
            _id: mongoose.Types.ObjectId(secondPrimaryOrder.id),
          },
        },
        ...SECOND_PRIMARY_ORDER_AGGREGATE_QUERY,
      ];

      const secondPrimaryOrders = await SecondPrimaryOrderModel.aggregate(
        query
      );

      res.status(200).json({
        status: STATUS.OK,
        message: SECOND_PRIMARY_ORDER_CONTROLLER_CONSTANTS.CREATE_SUCCESS,
        error: '',
        secondPrimaryOrder: secondPrimaryOrders[0],
      });
    }
  });
});

// @desc      Update secondPrimaryOrder
// @route     PATCH /api/order/second-primary-order/:id
exports.updateSecondPrimaryOrder = asyncHandler(async (req, res, next) => {
  const secondPrimaryOrderId = req.params.id;
  const secondPrimaryOrder = await SecondPrimaryOrderModel.findById(
    secondPrimaryOrderId
  ).exec();

  if (!secondPrimaryOrder) {
    return next(
      new ErrorResponse(
        SECOND_PRIMARY_ORDER_CONTROLLER_CONSTANTS.SECOND_PRIMARY_ORDER_NOT_FOUND,
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

  await SecondPrimaryOrderModel.findOneAndUpdate(
    { _id: secondPrimaryOrderId },
    { $set: dataToUpdate },
    {
      new: true,
      runValidators: true,
      upsert: true,
    }
  ).exec(async (error, secondPrimaryOrder) => {
    if (error) {
      return next(
        new ErrorResponse(
          SECOND_PRIMARY_ORDER_CONTROLLER_CONSTANTS.SECOND_PRIMARY_ORDER_UPDATE_FAILED,
          404,
          ERROR_TYPES.NOT_FOUND
        )
      );
    } else {
      const query = [
        {
          $match: {
            _id: mongoose.Types.ObjectId(secondPrimaryOrder.id),
          },
        },
        ...SECOND_PRIMARY_ORDER_AGGREGATE_QUERY,
      ];

      const [order] = await SecondPrimaryOrderModel.aggregate(query);

      if (order.status === ORDER_STATUS.REACHED_DESTINATION) {
        await incrementDistributorInventoryLevels({
          distributorId: order.distributor.id,
          skus: order.sku_items,
          secondprimaryOrderId: order.id,
        });
      }

      res.status(200).json({
        status: STATUS.OK,
        message: SECOND_PRIMARY_ORDER_CONTROLLER_CONSTANTS.UPDATE_SUCCESS,
        error: '',
        secondPrimaryOrder: order,
      });
    }
  });
});

// @desc      Delete secondPrimaryOrder
// @route     DELETE /api/order/second-primary-order/:id
exports.deleteSecondPrimaryOrder = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const order = await SecondPrimaryOrderModel.findById(id).exec();

  if (!order) {
    return next(
      new ErrorResponse(
        SECOND_PRIMARY_ORDER_CONTROLLER_CONSTANTS.SECOND_PRIMARY_ORDER_NOT_FOUND,
        404,
        ERROR_TYPES.NOT_FOUND
      )
    );
  }

  await order.remove();

  res.status(200).json({
    status: STATUS.OK,
    message: SECOND_PRIMARY_ORDER_CONTROLLER_CONSTANTS.DELETE_SUCCESS,
    error: '',
    secondPrimaryOrder: {},
  });
});
