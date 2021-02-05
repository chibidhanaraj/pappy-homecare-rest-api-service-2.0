const express = require('express');
const { protect } = require('../../middleware/authHandler');
const router = express.Router({ mergeParams: true });
const {
  getAllDistricts,
  createDistrict,
  updateDistrict,
  deleteDistrict,
} = require('./district.controller');

router.route('/').get(getAllDistricts).post(protect, createDistrict);

router.route('/:id').patch(protect, updateDistrict).delete(deleteDistrict);

module.exports = router;
