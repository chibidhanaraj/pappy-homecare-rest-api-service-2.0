const express = require('express');
const { protect } = require('../../middleware/authHandler');
const router = express.Router({ mergeParams: true });
const {
  getAllRetailers,
  createRetailer,
  updateRetailer,
  deleteRetailer,
  getRetailerInventory,
} = require('./retailer.controller');

router.route('/').get(getAllRetailers).post(protect, createRetailer);

router.route('/:id').patch(protect, updateRetailer).delete(deleteRetailer);

router.route('/:id/inventory').get(getRetailerInventory);

module.exports = router;
