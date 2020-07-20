const mongoose = require("mongoose");
const SecondPrimaryOrderModel = require("../../model/Orders/SecondPrimaryOrderModel");
const ErrorResponse = require("../../../utils/errorResponse");
const asyncHandler = require("../../../middleware/asyncHandler");
const {
  STATUS,
  SECOND_PRIMARY_ORDER_CONTROLLER_CONSTANTS,
} = require("../../../constants/controller.constants");
const { ERROR_TYPES } = require("../../../constants/error.constant");
const { ORDER_STATUS } = require("../../../constants/constants");
const {
  normalizeOrderDetails,
  getCustomerDetails,
  normalizeOrderDetailsPayload,
} = require("../../../helpers/OrderHelper");

// @desc      Get all secondPrimaryOrders
// @route     GET /api/order/secondPrimary-order
exports.getAllSecondPrimaryOrders = asyncHandler(async (req, res, next) => {
  const orders = await SecondPrimaryOrderModel.find().lean().exec();

  res.status(200).json({
    status: STATUS.OK,
    message: SECOND_PRIMARY_ORDER_CONTROLLER_CONSTANTS.FETCH_SUCCESS,
    error: "",
    orders: await normalizeOrderDetailsPayload(orders),
  });
});

// @desc      Get secondPrimaryOrder
// @route     GET /api/order/secondPrimary-order/:id
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

  res.status(200).json({
    status: STATUS.OK,
    message: SECOND_PRIMARY_ORDER_CONTROLLER_CONSTANTS.FETCH_SUCCESS,
    error: "",
    order: await normalizeOrderDetails(order.toObject()),
  });
});

// @desc      Post secondPrimaryOrder
// @route     POST /api/order/secondPrimary-order
exports.createSecondPrimaryOrder = asyncHandler(async (req, res, next) => {
  const {
    customerId,
    customerType,
    distributionType,
    totalPrice,
    orderedItems,
    note,
  } = req.body;

  const secondPrimaryCustomer = await getCustomerDetails(
    customerId,
    customerType
  );

  if (!secondPrimaryCustomer) {
    return next(
      new ErrorResponse(
        SECOND_PRIMARY_ORDER_CONTROLLER_CONSTANTS.CUSTOMER_NOT_FOUND,
        404,
        ERROR_TYPES.NOT_FOUND
      )
    );
  }

  const secondPrimaryOrder = new SecondPrimaryOrderModel({
    customerId,
    customerType,
    distributionType,
    totalPrice,
    orderedItems,
    note: note || "",
    orderTakenBy: (req.user && req.user.id) || "",
    status: ORDER_STATUS.WAITING_FOR_APPROVAL,
  });

  const savedDocument = await secondPrimaryOrder.save();
  res.status(201).json({
    status: STATUS.OK,
    message: SECOND_PRIMARY_ORDER_CONTROLLER_CONSTANTS.CREATE_SUCCESS,
    error: "",
    order: await normalizeOrderDetails(savedDocument.toObject()),
  });
});

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
    error: "",
    order: {},
  });
});
