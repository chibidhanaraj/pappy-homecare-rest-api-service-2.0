const express = require('express');
const { protect } = require('../../middleware/authHandler');
const router = express.Router({ mergeParams: true });
const {
  getEmployeeDailySalesReport,
} = require('./employee-daily-sales-report.controller');

router.route('/').get(getEmployeeDailySalesReport);

module.exports = router;
