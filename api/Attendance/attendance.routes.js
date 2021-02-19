const express = require('express');
const { protect } = require('../../middleware/authHandler');
const router = express.Router({ mergeParams: true });
const {
  getAttendance,
  createAttendance,
  updateAttendance,
} = require('./attendance.controller');

router.route('/').get(protect, getAttendance).post(protect, createAttendance);

router.route('/:id').patch(updateAttendance);

module.exports = router;
