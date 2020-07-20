const mongoose = require("mongoose");
const PrimaryOrderModel = require("../../model/Orders/PrimaryOrderModel");
const ErrorResponse = require("../../../utils/errorResponse");
const asyncHandler = require("../../../middleware/asyncHandler");
const {
  STATUS,
  PRIMARY_ORDER_CONTROLLER_CONSTANTS,
} = require("../../../constants/controller.constants");
const { ERROR_TYPES } = require("../../../constants/error.constant");
const { ORDER_STATUS } = require("../../../constants/constants");
const {
  normalizeOrderDetails,
  getCustomerDetails,
  normalizeOrderDetailsPayload,
} = require("../../../helpers/OrderHelper");

// @desc      Get all primaryOrders
// @route     GET /api/order/primary-order
exports.getAllPrimaryOrders = asyncHandler(async (req, res, next) => {
  const orders = await PrimaryOrderModel.find().lean().exec();

  res.status(200).json({
    status: STATUS.OK,
    message: PRIMARY_ORDER_CONTROLLER_CONSTANTS.FETCH_SUCCESS,
    error: "",
    orders: await normalizeOrderDetailsPayload(orders),
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
    error: "",
    order: await normalizeOrderDetails(order.toObject()),
  });
});

// @desc      Post primaryOrder
// @route     POST /api/order/primary-order
exports.createPrimaryOrder = asyncHandler(async (req, res, next) => {
  const {
    customerId,
    customerType,
    distributionType,
    totalPrice,
    orderedItems,
    note,
  } = req.body;

  const primaryCustomer = await getCustomerDetails(customerId, customerType);

  if (!primaryCustomer) {
    return next(
      new ErrorResponse(
        PRIMARY_ORDER_CONTROLLER_CONSTANTS.CUSTOMER_NOT_FOUND,
        404,
        ERROR_TYPES.NOT_FOUND
      )
    );
  }

  const primaryOrder = new PrimaryOrderModel({
    customerId,
    customerType,
    distributionType,
    totalPrice,
    orderedItems,
    note: note || "",
    orderTakenBy: (req.user && req.user.id) || "",
    status: ORDER_STATUS.WAITING_FOR_APPROVAL,
  });

  const savedDocument = await primaryOrder.save();
  res.status(201).json({
    status: STATUS.OK,
    message: PRIMARY_ORDER_CONTROLLER_CONSTANTS.CREATE_SUCCESS,
    error: "",
    order: await normalizeOrderDetails(savedDocument.toObject()),
  });
});

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
    error: "",
    order: {},
  });
});
