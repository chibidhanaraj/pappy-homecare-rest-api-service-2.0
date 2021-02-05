const express = require('express');
const { protect } = require('../../middleware/authHandler');
const router = express.Router({ mergeParams: true });
const {
  getAllZones,
  createZone,
  updateZone,
  deleteZone,
} = require('./zone.controller');

router.route('/').get(getAllZones).post(protect, createZone);

router.route('/:id').patch(protect, updateZone).delete(deleteZone);

module.exports = router;
