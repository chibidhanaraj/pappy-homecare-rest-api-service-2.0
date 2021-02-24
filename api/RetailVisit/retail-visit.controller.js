const mongoose = require('mongoose');
const Retailer = require('../Retailer/retailer.model');
const RetailVisit = require('./retail-visit.model');
const EmployeeActivity = require('../EmployeeSecondaryOrderActivity/employee-secondary-order-activity.model');
const {
  RETAILER_CONTROLLER_CONSTANTS,
  STATUS,
} = require('../../constants/controller.constants');
const asyncHandler = require('../../middleware/asyncHandler');
const ErrorResponse = require('../../utils/errorResponse');
const {
  RETAIL_VISIT_AGGREGATE_QUERY,
  RETAIL_VISITS_AGGREGATE_QUERY,
} = require('./retail-visit.utils');
const { get } = require('lodash');

// @desc      Get Retailer Visit
// @route     GET /api/retailer/:retailerId/retail-visit/
exports.getRetailVisits = asyncHandler(async (req, res) => {
  const retailerId = req.params.retailerId;

  const query = [
    {
      $match: {
        _id: mongoose.Types.ObjectId(retailerId),
      },
    },
    ...RETAIL_VISITS_AGGREGATE_QUERY,
  ];

  const results = await Retailer.aggregate(query);

  res.status(200).json({
    status: STATUS.OK,
    message: RETAILER_CONTROLLER_CONSTANTS.FETCH_SUCCESS,
    error: '',
    retailer: results[0],
  });
});

// @desc      POST Retailer Visit
// @route     POST /api/retailer/:retailerId/retail-visit/
exports.createRetailVisit = asyncHandler(async (req, res, next) => {
  const retailerId = req.params.retailerId;
  const { visit_result, feedback } = req.body;

  const savedRetailVisit = await RetailVisit.create({
    retailer: retailerId,
    visit_result,
    feedback,
    created_by: get(req, 'user.id', null),
  });

  await EmployeeActivity.create({
    employee: get(req, 'user.id', null),
    activity: visit_result,
    retailer: retailerId,
    location: {
      coordinates: get(req, 'body.current_user_location', []),
    },
    retail_visit: savedRetailVisit._id,
  });

  const query = [
    {
      $match: {
        _id: mongoose.Types.ObjectId(savedRetailVisit._id),
      },
    },
    ...RETAIL_VISIT_AGGREGATE_QUERY,
  ];

  const results = await RetailVisit.aggregate(query);

  res.status(201).json({
    status: STATUS.OK,
    message: RETAILER_CONTROLLER_CONSTANTS.RETAILER_VISIT_SUCCESSFUL,
    error: '',
    retailVisit: results[0],
  });
});
