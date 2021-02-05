const express = require('express');
const { protect } = require('../../middleware/authHandler');
const router = express.Router({ mergeParams: true });
const {
  getAllAreas,
  createArea,
  updateArea,
  deleteArea,
} = require('./area.controller');

router.route('/').get(getAllAreas).post(protect, createArea);

router.route('/:id').patch(protect, updateArea).delete(deleteArea);

module.exports = router;
