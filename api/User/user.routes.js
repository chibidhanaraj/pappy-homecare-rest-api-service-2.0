const express = require('express');
const router = express.Router();

const {
  getAllUsers,
  getAllUsersAttendance,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require('./user.controller');

const EmployeeDailySalesReportRoutes = require('../EmployeeDailySalesReport/employee-daily-sales-report.routes');

/* Redirect to Employee Daily Sales Report Router */
router.use('/:userId/daily-sales-report', EmployeeDailySalesReportRoutes);

router.route('/').get(getAllUsers).post(createUser);

router.route('/attendance/').get(getAllUsersAttendance);

router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
