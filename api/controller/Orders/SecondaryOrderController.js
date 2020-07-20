const mongoose = require("mongoose");
const SecondaryOrderModel = require("../../model/Orders/SecondaryOrderModel");
const ErrorResponse = require("../../../utils/errorResponse");
const asyncHandler = require("../../../middleware/asyncHandler");
const {
  STATUS,
  SECONDARY_ORDER_CONTROLLER_CONSTANTS,
} = require("../../../constants/controller.constants");
const { ERROR_TYPES } = require("../../../constants/error.constant");
const {
  ORDER_TYPES,
  ORDER_STATUS,
  CUSTOMER_CONSTANTS,
} = require("../../../constants/constants");
const {
  normalizeOrderDetails,
  getCustomerDetails,
  normalizeOrderDetailsPayload,
} = require("../../../helpers/OrderHelper");

// @desc      Get all secondaryOrders
// @route     GET /api/order/secondary-order
exports.getAllSecondaryOrders = asyncHandler(async (req, res, next) => {
  const orders = await SecondaryOrderModel.find().lean().exec();

  res.status(200).json({
    status: STATUS.OK,
    message: SECONDARY_ORDER_CONTROLLER_CONSTANTS.FETCH_SUCCESS,
    error: "",
    orders: await normalizeOrderDetailsPayload(orders),
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
    error: "",
    order: await normalizeOrderDetails(order.toObject()),
  });
});

// @desc      Post secondaryOrder
// @route     POST /api/order/secondary-order
exports.createSecondaryOrder = asyncHandler(async (req, res, next) => {
  const {
    customerId,
    customerType,
    distributionType,
    totalPrice,
    orderedItems,
    note,
  } = req.body;

  const secondaryCustomer = await getCustomerDetails(customerId, customerType);

  if (!secondaryCustomer) {
    return next(
      new ErrorResponse(
        SECONDARY_ORDER_CONTROLLER_CONSTANTS.CUSTOMER_NOT_FOUND,
        404,
        ERROR_TYPES.NOT_FOUND
      )
    );
  }

  const secondaryOrder = new SecondaryOrderModel({
    customerId,
    customerType: customerType || CUSTOMER_CONSTANTS.RETAILER,
    distributionType,
    totalPrice: totalPrice || "",
    orderedItems,
    note: note || "",
    orderTakenBy: (req.user && req.user.id) || "",
    status: ORDER_STATUS.WAITING_FOR_APPROVAL,
  });

  const savedDocument = await secondaryOrder.save();
  res.status(201).json({
    status: STATUS.OK,
    message: SECONDARY_ORDER_CONTROLLER_CONSTANTS.CREATE_SUCCESS,
    error: "",
    order: await normalizeOrderDetails(savedDocument.toObject()),
  });
});

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
    error: "",
    order: {},
  });
});
