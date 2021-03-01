const mongoose = require('mongoose');
const { ACTIVITY_CONSTANTS } = require('../../constants/constants');
const {
  STATUS,
  USER_CONTROLLER_CONSTANTS,
} = require('../../constants/controller.constants');
const asyncHandler = require('../../middleware/asyncHandler');
const ErrorResponse = require('../../utils/errorResponse');
const UserModel = require('../EmployeeSecondaryOrderActivity/employee-secondary-order-activity.model');
const EmployeeSecondaryOrderActivityModel = require('../EmployeeSecondaryOrderActivity/employee-secondary-order-activity.model');
const {
  EMPLOYEE_DAILY_SALES_REPORT_AGGREGATE_QUERY,
} = require('./employee-daily-sales-report.utils');

// @desc      Get employeeDailySalesReport
// @route     GET /api/v1/user/:userId/daily-sales-report/
exports.getEmployeeDailySalesReport = asyncHandler(async (req, res, next) => {
  const userId = req.params.userId;

  const matchQuery = {};

  if (req.query.fromDate && req.query.toDate) {
    matchQuery.createdAt = {
      $gte: new Date(req.query.fromDate),
      $lte: new Date(req.query.toDate),
    };
  }

  const query = [
    {
      $match: {
        ...matchQuery,
        employee: mongoose.Types.ObjectId(userId),
      },
    },
    ...EMPLOYEE_DAILY_SALES_REPORT_AGGREGATE_QUERY,
  ];

  const results = await EmployeeSecondaryOrderActivityModel.aggregate(query);

  res.status(200).json({
    status: STATUS.OK,
    message: USER_CONTROLLER_CONSTANTS.FETCH_SUCCESS,
    error: '',
    employeeDailySalesReport: {
      id: userId,
      total_secondary_calls: results.length,

      total_secondary_productive_calls: results.filter(
        (result) => result.activity === ACTIVITY_CONSTANTS.NEW_SECONDARY_ORDER
      ).length,

      secondary_activities: [...results],
    },
  });
});
