const express = require('express');
const { protect } = require('../../middleware/authHandler');
const router = express.Router({ mergeParams: true });
const {
  getRetailVisits,
  createRetailVisit,
} = require('./retail-visit.controller');

router.route('/').get(getRetailVisits).post(protect, createRetailVisit);

module.exports = router;
